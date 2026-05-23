'use server'

import { createClient } from '@/lib/supabase/server'
import type { Summary, ActionItem } from '@/lib/types/transcription'

/**
 * 会議の要約を取得
 */
export async function getSummary(
  meetingId: string
): Promise<{ summary?: Summary; error?: string }> {
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return { error: '認証されていません' }
  }

  const { data, error } = await supabase
    .from('summaries')
    .select('*')
    .eq('meeting_id', meetingId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return {}
    }
    return { error: '要約の取得に失敗しました' }
  }

  return {
    summary: mapToSummary(data)
  }
}

/**
 * 要約を保存
 */
export async function saveSummary(
  meetingId: string,
  summaryText: string,
  actionItems: ActionItem[],
  keyPoints: string[]
): Promise<{ summary?: Summary; error?: string }> {
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return { error: '認証されていません' }
  }

  const { data, error } = await supabase
    .from('summaries')
    .upsert({
      meeting_id: meetingId,
      summary_text: summaryText,
      action_items: JSON.stringify(actionItems),
      key_points: JSON.stringify(keyPoints),
      updated_at: new Date().toISOString()
    }, { onConflict: 'meeting_id' })
    .select()
    .single()

  if (error) {
    return { error: '要約の保存に失敗しました' }
  }

  return {
    summary: mapToSummary(data)
  }
}

/**
 * DB データを Summary 型に変換
 */
function mapToSummary(dbData: Record<string, unknown>): Summary {
  const actionItems = typeof dbData.action_items === 'string'
    ? JSON.parse(dbData.action_items as string) as ActionItem[]
    : dbData.action_items as ActionItem[]

  const keyPoints = typeof dbData.key_points === 'string'
    ? JSON.parse(dbData.key_points as string) as string[]
    : dbData.key_points as string[]

  return {
    id: dbData.id as string,
    meetingId: dbData.meeting_id as string,
    summaryText: dbData.summary_text as string,
    actionItems,
    keyPoints,
    createdAt: new Date(dbData.created_at as string).toISOString(),
    updatedAt: new Date(dbData.updated_at as string).toISOString()
  }
}
