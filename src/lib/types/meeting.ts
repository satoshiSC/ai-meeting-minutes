/**
 * 会議のステータス
 */
export type MeetingStatus = 'draft' | 'recording' | 'processing' | 'completed' | 'failed'

/**
 * 会議データ
 */
export interface Meeting {
  id: string
  userId: string
  title: string
  description: string | null
  audioStoragePath: string | null
  audioDuration: number | null
  status: MeetingStatus
  language: string
  createdAt: string
  updatedAt: string
}

/**
 * 会議作成用データ
 */
export interface CreateMeetingData {
  title: string
  description?: string
  language?: string
}

/**
 * 会議更新用データ
 */
export interface UpdateMeetingData {
  title?: string
  description?: string
  status?: MeetingStatus
}

/**
 * 会議検索・フィルタリングオプション
 */
export interface MeetingQueryOptions {
  page?: number
  limit?: number
  search?: string
  status?: MeetingStatus
  sortBy?: 'createdAt' | 'updatedAt' | 'title'
  sortOrder?: 'asc' | 'desc'
}

/**
 * 会議一覧レスポンス
 */
export interface MeetingListResponse {
  meetings: Meeting[]
  total: number
  page: number
  limit: number
  totalPages: number
  hasMore: boolean
}