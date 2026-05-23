'use server'

import { createClient } from '@/lib/supabase/server'
import { getGroqClient } from '@/lib/groq/client'
import { saveTranscription } from '@/features/transcriptions/actions/transcription-actions'
import { saveSummary } from '@/features/summaries/actions/summary-actions'
import { revalidatePath } from 'next/cache'
import type { TranscriptSegment, ActionItem } from '@/lib/types/transcription'

/**
 * 音声ファイルを文字起こし（Whisper via Groq）
 */
async function transcribeAudio(
  audioBuffer: Buffer,
  fileName: string
): Promise<{ text: string; segments: TranscriptSegment[] }> {
  const groq = getGroqClient()

  const file = new File([audioBuffer], fileName, { type: 'audio/mpeg' })

  const response = await groq.audio.transcriptions.create({
    file,
    model: 'whisper-large-v3',
    language: 'ja',
    response_format: 'verbose_json',
  })

  const segments: TranscriptSegment[] = []

  if (response.segments) {
    for (const seg of response.segments) {
      segments.push({
        id: `seg-${seg.id}`,
        start: seg.start,
        end: seg.end,
        text: seg.text.trim()
      })
    }
  }

  return {
    text: response.text,
    segments
  }
}

/**
 * テキストから要約を生成（Llama via Groq）
 */
async function generateSummary(
  text: string
): Promise<{ summaryText: string; actionItems: ActionItem[]; keyPoints: string[] }> {
  const groq = getGroqClient()

  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: `あなたは会議の議事録を要約する専門家です。
以下の文字起こしテキストから、日本語で以下の情報を抽出してください。

必ず以下のJSON形式で回答してください（他のテキストは含めないでください）：
{
  "summary": "会議全体の要約（200〜400文字程度）",
  "keyPoints": ["重要なポイント1", "重要なポイント2", ...],
  "actionItems": [
    {
      "task": "タスクの内容",
      "assignee": "担当者名（不明な場合はnull）",
      "deadline": "期限（不明な場合はnull）"
    }
  ]
}`
      },
      {
        role: 'user',
        content: text
      }
    ],
    temperature: 0.3,
    max_tokens: 2000,
    response_format: { type: 'json_object' }
  })

  const content = response.choices[0]?.message?.content ?? '{}'

  const parsed = JSON.parse(content) as {
    summary?: string
    keyPoints?: string[]
    actionItems?: Array<{ task: string; assignee?: string | null; deadline?: string | null }>
  }

  const actionItems: ActionItem[] = (parsed.actionItems ?? []).map((item, index) => ({
    id: `action-${index + 1}`,
    task: item.task,
    assignee: item.assignee ?? null,
    deadline: item.deadline ?? null
  }))

  return {
    summaryText: parsed.summary ?? '要約を生成できませんでした',
    actionItems,
    keyPoints: parsed.keyPoints ?? []
  }
}

/**
 * 会議のAI処理を実行（文字起こし → 要約）
 */
export async function processMeeting(
  meetingId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return { success: false, error: '認証されていません' }
  }

  // 会議情報を取得
  const { data: meeting, error: meetingError } = await supabase
    .from('meetings')
    .select('*')
    .eq('id', meetingId)
    .eq('user_id', user.id)
    .single()

  if (meetingError || !meeting) {
    return { success: false, error: '会議が見つかりません' }
  }

  if (!meeting.audio_storage_path) {
    return { success: false, error: '音声ファイルがアップロードされていません' }
  }

  // ステータスを処理中に更新
  await supabase
    .from('meetings')
    .update({ status: 'processing', updated_at: new Date().toISOString() })
    .eq('id', meetingId)

  try {
    // 音声ファイルをダウンロード
    const { data: audioData, error: downloadError } = await supabase.storage
      .from('audio-recordings')
      .download(meeting.audio_storage_path)

    if (downloadError || !audioData) {
      throw new Error('音声ファイルのダウンロードに失敗しました')
    }

    const audioBuffer = Buffer.from(await audioData.arrayBuffer())
    const fileName = meeting.audio_storage_path.split('/').pop() ?? 'audio.mp3'

    // 文字起こし実行
    const { text, segments } = await transcribeAudio(audioBuffer, fileName)

    // 文字起こしを保存
    const transcriptionResult = await saveTranscription(meetingId, text, segments)
    if (transcriptionResult.error) {
      throw new Error(transcriptionResult.error)
    }

    // 要約を生成
    const { summaryText, actionItems, keyPoints } = await generateSummary(text)

    // 要約を保存
    const summaryResult = await saveSummary(meetingId, summaryText, actionItems, keyPoints)
    if (summaryResult.error) {
      throw new Error(summaryResult.error)
    }

    // ステータスを完了に更新
    await supabase
      .from('meetings')
      .update({ status: 'completed', updated_at: new Date().toISOString() })
      .eq('id', meetingId)

    revalidatePath(`/meetings/${meetingId}`)
    revalidatePath('/meetings')

    return { success: true }
  } catch (err) {
    // ステータスを失敗に更新
    await supabase
      .from('meetings')
      .update({ status: 'failed', updated_at: new Date().toISOString() })
      .eq('id', meetingId)

    const message = err instanceof Error ? err.message : 'AI処理中にエラーが発生しました'
    return { success: false, error: message }
  }
}
