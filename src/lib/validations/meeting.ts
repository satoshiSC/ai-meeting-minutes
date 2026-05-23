import { CreateMeetingData, UpdateMeetingData } from '@/lib/types/meeting'

/**
 * 会議タイトルのバリデーション
 */
function validateTitle(title: string): string | null {
  if (!title || title.trim() === '') {
    return '会議タイトルを入力してください'
  }

  if (title.length > 200) {
    return '会議タイトルは200文字以内で入力してください'
  }

  return null
}

/**
 * 会議説明のバリデーション
 */
function validateDescription(description: string | undefined): string | null {
  if (!description) {
    return null
  }

  if (description.length > 2000) {
    return '会議説明は2000文字以内で入力してください'
  }

  return null
}

/**
 * 会議作成フォームのバリデーション
 */
export function validateCreateMeeting(data: CreateMeetingData): string[] {
  const errors: string[] = []

  const titleError = validateTitle(data.title)
  if (titleError) {
    errors.push(titleError)
  }

  const descriptionError = validateDescription(data.description)
  if (descriptionError) {
    errors.push(descriptionError)
  }

  return errors
}

/**
 * 会議更新フォームのバリデーション
 */
export function validateUpdateMeeting(data: UpdateMeetingData): string[] {
  const errors: string[] = []

  if (data.title !== undefined) {
    const titleError = validateTitle(data.title)
    if (titleError) {
      errors.push(titleError)
    }
  }

  if (data.description !== undefined) {
    const descriptionError = validateDescription(data.description)
    if (descriptionError) {
      errors.push(descriptionError)
    }
  }

  return errors
}

/**
 * ページネーションオプションのバリデーション
 */
export function validatePaginationOptions(page?: number, limit?: number) {
  const validPage = page && page > 0 ? page : 1
  const validLimit = limit && limit > 0 && limit <= 100 ? limit : 20

  return { page: validPage, limit: validLimit }
}