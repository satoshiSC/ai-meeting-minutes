'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { Meeting, MeetingStatus } from '@/lib/types/meeting'

/**
 * 音声ファイルの許容形式
 */
export const ALLOWED_AUDIO_TYPES = ['audio/mpeg', 'audio/wav', 'audio/x-m4a', 'audio/mp4'] as const
export const ALLOWED_EXTENSIONS = ['mp3', 'wav', 'm4a'] as const

/**
 * 最大ファイルサイズ（25MB）
 */
export const MAX_FILE_SIZE = 25 * 1024 * 1024

/**
 * 音声ファイルのバリデーションエラー
 */
export interface AudioValidationError {
  type: 'invalid_type' | 'too_large' | 'upload_failed'
  message: string
}

/**
 * 音声ファイルをバリデーション
 */
function validateAudioFile(file: File): AudioValidationError | null {
  // ファイルサイズのチェック
  if (file.size > MAX_FILE_SIZE) {
    return {
      type: 'too_large',
      message: `ファイルサイズは${MAX_FILE_SIZE / (1024 * 1024)}MB以内である必要があります`
    }
  }

  // ファイル形式のチェック
  const extension = file.name.split('.').pop()?.toLowerCase()
  const isValidType = ALLOWED_AUDIO_TYPES.includes(file.type as typeof ALLOWED_AUDIO_TYPES[number])
  const isValidExtension = extension && ALLOWED_EXTENSIONS.includes(extension as typeof ALLOWED_EXTENSIONS[number])

  if (!isValidType && !isValidExtension) {
    return {
      type: 'invalid_type',
      message: `対応している形式は ${ALLOWED_EXTENSIONS.join(', ')} です`
    }
  }

  return null
}

/**
 * 音声ファイルをアップロード
 */
export async function uploadAudioFile(
  meetingId: string,
  formData: FormData
): Promise<{ success: boolean; meeting?: Meeting; error?: string }> {
  try {
    const supabase = await createClient()

    // 現在のユーザーを取得
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { success: false, error: '認証されていません' }
    }

    // 会議の存在確認と所有権チェック
    const { data: meeting, error: meetingError } = await supabase
      .from('meetings')
      .select('*')
      .eq('id', meetingId)
      .eq('user_id', user.id)
      .single()

    if (meetingError || !meeting) {
      return { success: false, error: '会議が見つかりません' }
    }

    // ファイルを取得
    const file = formData.get('file') as File
    if (!file || file.size === 0) {
      return { success: false, error: 'ファイルが選択されていません' }
    }

    // ファイルをバリデーション
    const validationError = validateAudioFile(file)
    if (validationError) {
      return { success: false, error: validationError.message }
    }

    // Storage パスを生成
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`
    const storagePath = `${user.id}/${meetingId}/${fileName}`

    // Supabase Storage にアップロード
    const { error: uploadError } = await supabase.storage
      .from('audio-recordings')
      .upload(storagePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      return { success: false, error: 'アップロードに失敗しました' }
    }

    // 会議の audio_storage_path を更新
    const { data: updatedMeeting, error: updateError } = await supabase
      .from('meetings')
      .update({
        audio_storage_path: storagePath,
        status: 'processing',
        updated_at: new Date().toISOString()
      })
      .eq('id', meetingId)
      .select()
      .single()

    if (updateError) {
      // アップロードしたファイルを削除
      await supabase.storage
        .from('audio-recordings')
        .remove([storagePath])

      return { success: false, error: '会議情報の更新に失敗しました' }
    }

    revalidatePath(`/meetings/${meetingId}`)
    revalidatePath('/meetings')

    return {
      success: true,
      meeting: mapToMeeting(updatedMeeting)
    }
  } catch {
    return {
      success: false,
      error: '予期せぬエラーが発生しました'
    }
  }
}

/**
 * 音声ファイルの署名付きURLを取得
 */
export async function getAudioSignedUrl(storagePath: string): Promise<{ url?: string; error?: string }> {
  const supabase = await createClient()

  // 現在のユーザーを取得
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return { error: '認証されていません' }
  }

  // ストレージから署名付きURLを取得（60分有効）
  const { data, error } = await supabase.storage
    .from('audio-recordings')
    .createSignedUrl(storagePath, 3600)

  if (error) {
    return { error: 'URLの取得に失敗しました' }
  }

  return { url: data.signedUrl }
}

/**
 * 音声ファイルを削除
 */
export async function deleteAudioFile(meetingId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  // 現在のユーザーを取得
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return { success: false, error: '認証されていません' }
  }

  // 会議情報を取得
  const { data: meeting, error: meetingError } = await supabase
    .from('meetings')
    .select('audio_storage_path')
    .eq('id', meetingId)
    .eq('user_id', user.id)
    .single()

  if (meetingError || !meeting?.audio_storage_path) {
    return { success: false, error: '会議が見つからないか、音声ファイルがありません' }
  }

  // ストレージからファイルを削除
  const { error: deleteError } = await supabase.storage
    .from('audio-recordings')
    .remove([meeting.audio_storage_path])

  if (deleteError) {
    return { success: false, error: 'ファイルの削除に失敗しました' }
  }

  // 会議の audio_storage_path をクリア
  const { error: updateError } = await supabase
    .from('meetings')
    .update({
      audio_storage_path: null,
      status: 'draft',
      updated_at: new Date().toISOString()
    })
    .eq('id', meetingId)

  if (updateError) {
    return { success: false, error: '会議情報の更新に失敗しました' }
  }

  return { success: true }
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