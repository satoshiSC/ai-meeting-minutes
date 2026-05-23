'use server'

import { createClient } from '@/lib/supabase/server'
import type { Transcription, TranscriptSegment } from '@/lib/types/transcription'

/**
 * 会議の文字起こしを取得
 */
export async function getTranscription(
  meetingId: string
): Promise<{ transcription?: Transcription; error?: string }> {
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return { error: '認証されていません' }
  }

  const { data, error } = await supabase
    .from('transcriptions')
    .select('*')
    .eq('meeting_id', meetingId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return {}
    }
    return { error: '文字起こしの取得に失敗しました' }
  }

  return {
    transcription: mapToTranscription(data)
  }
}

/**
 * 文字起こしを保存
 */
export async function saveTranscription(
  meetingId: string,
  fullText: string,
  segments: TranscriptSegment[],
  language: string = 'ja'
): Promise<{ transcription?: Transcription; error?: string }> {
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return { error: '認証されていません' }
  }

  const { data, error } = await supabase
    .from('transcriptions')
    .upsert({
      meeting_id: meetingId,
      full_text: fullText,
      segments: JSON.stringify(segments),
      language,
      updated_at: new Date().toISOString()
    }, { onConflict: 'meeting_id' })
    .select()
    .single()

  if (error) {
    return { error: '文字起こしの保存に失敗しました' }
  }

  return {
    transcription: mapToTranscription(data)
  }
}

/**
 * DB データを Transcription 型に変換
 */
function mapToTranscription(dbData: Record<string, unknown>): Transcription {
  const segments = typeof dbData.segments === 'string'
    ? JSON.parse(dbData.segments as string) as TranscriptSegment[]
    : dbData.segments as TranscriptSegment[]

  return {
    id: dbData.id as string,
    meetingId: dbData.meeting_id as string,
    fullText: dbData.full_text as string,
    segments,
    language: dbData.language as string,
    createdAt: new Date(dbData.created_at as string).toISOString(),
    updatedAt: new Date(dbData.updated_at as string).toISOString()
  }
}
