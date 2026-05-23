'use server'

import { createClient } from '@/lib/supabase/server'
import {
  CreateMeetingData,
  UpdateMeetingData,
  Meeting,
  MeetingStatus,
  MeetingQueryOptions,
  MeetingListResponse
} from '@/lib/types/meeting'
import { validateCreateMeeting, validateUpdateMeeting, validatePaginationOptions } from '@/lib/validations/meeting'

/**
 * 会議を1件作成
 */
export async function createMeeting(data: CreateMeetingData): Promise<{ meeting?: Meeting; error?: string }> {
  // バリデーション
  const validationErrors = validateCreateMeeting(data)
  if (validationErrors.length > 0) {
    return { error: validationErrors.join(', ') }
  }

  const supabase = await createClient()

  // 現在のユーザーを取得
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return { error: '認証されていません' }
  }

  // 会議を作成
  const { data: meeting, error: meetingError } = await supabase
    .from('meetings')
    .insert({
      user_id: user.id,
      title: data.title,
      description: data.description ?? null,
      language: data.language ?? 'ja',
      status: 'draft'
    })
    .select()
    .single()

  if (meetingError) {
    return { error: '会議の作成に失敗しました' }
  }

  return { meeting: mapToMeeting(meeting) }
}

/**
 * 会議を1件取得
 */
export async function getMeeting(id: string): Promise<{ meeting?: Meeting; error?: string }> {
  const supabase = await createClient()

  // 現在のユーザーを取得
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return { error: '認証されていません' }
  }

  // 会議を取得
  const { data: meeting, error: meetingError } = await supabase
    .from('meetings')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (meetingError) {
    if (meetingError.code === 'PGRST116') {
      return { error: '会議が見つかりません' }
    }
    return { error: '会議の取得に失敗しました' }
  }

  return { meeting: mapToMeeting(meeting) }
}

/**
 * 会議一覧を取得（ページネーション・検索対応）
 */
export async function getMeetings(options: MeetingQueryOptions = {}): Promise<MeetingListResponse> {
  const supabase = await createClient()

  // 現在のユーザーを取得
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return {
      meetings: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
      hasMore: false
    }
  }

  // ページネーションオプションを検証
  const { page, limit } = validatePaginationOptions(options.page, options.limit)

  // クエリビルド
  let query = supabase
    .from('meetings')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)

  // 検索フィルター
  if (options.search) {
    query = query.or(`title.ilike.%${options.search}%,description.ilike.%${options.search}%`)
  }

  // ステータスフィルター
  if (options.status) {
    query = query.eq('status', options.status)
  }

  // ソート
  const sortBy = options.sortBy ?? 'createdAt'
  const sortOrder = options.sortOrder ?? 'desc'
  const dbSortField = sortBy === 'createdAt' ? 'created_at' : sortBy === 'updatedAt' ? 'updated_at' : 'title'
  query = query.order(dbSortField, { ascending: sortOrder === 'asc' })

  // ページネーション
  const from = (page - 1) * limit
  const to = from + limit - 1
  query = query.range(from, to)

  const { data: meetings, count } = await query

  if (!meetings) {
    return {
      meetings: [],
      total: 0,
      page,
      limit,
      totalPages: 0,
      hasMore: false
    }
  }

  const total = count ?? 0
  const totalPages = Math.ceil(total / limit)

  return {
    meetings: meetings.map(mapToMeeting),
    total,
    page,
    limit,
    totalPages,
    hasMore: page < totalPages
  }
}

/**
 * 会議を更新
 */
export async function updateMeeting(
  id: string,
  data: UpdateMeetingData
): Promise<{ meeting?: Meeting; error?: string }> {
  // バリデーション
  const validationErrors = validateUpdateMeeting(data)
  if (validationErrors.length > 0) {
    return { error: validationErrors.join(', ') }
  }

  const supabase = await createClient()

  // 現在のユーザーを取得
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return { error: '認証されていません' }
  }

  // 会議を更新
  const updateData: Record<string, unknown> = {}
  if (data.title !== undefined) updateData.title = data.title
  if (data.description !== undefined) updateData.description = data.description
  if (data.status !== undefined) updateData.status = data.status

  const { data: meeting, error: meetingError } = await supabase
    .from('meetings')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (meetingError) {
    if (meetingError.code === 'PGRST116') {
      return { error: '会議が見つかりません' }
    }
    return { error: '会議の更新に失敗しました' }
  }

  return { meeting: mapToMeeting(meeting) }
}

/**
 * 会議を削除
 */
export async function deleteMeeting(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  // 現在のユーザーを取得
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return { success: false, error: '認証されていません' }
  }

  // 会議を削除
  const { error: deleteError } = await supabase
    .from('meetings')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (deleteError) {
    return { success: false, error: '会議の削除に失敗しました' }
  }

  return { success: true }
}

/**
 * 会議数を取得
 */
export async function getMeetingCount(): Promise<number> {
  const supabase = await createClient()

  // 現在のユーザーを取得
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return 0
  }

  // 会議数を取得
  const { count } = await supabase
    .from('meetings')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  return count ?? 0
}

/**
 * DB から取得したデータを Meeting 型に変換
 */
function mapToMeeting(dbData: Record<string, unknown>): Meeting {
  return {
    id: dbData.id as string,
    userId: dbData.user_id as string,
    title: dbData.title as string,
    description: dbData.description as string | null,
    audioStoragePath: dbData.audio_storage_path as string | null,
    audioDuration: dbData.audio_duration as number | null,
    status: dbData.status as MeetingStatus,
    language: dbData.language as string,
    createdAt: new Date(dbData.created_at as string).toISOString(),
    updatedAt: new Date(dbData.updated_at as string).toISOString()
  }
}