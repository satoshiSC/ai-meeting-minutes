/**
 * 文字起こしセグメント
 */
export interface TranscriptSegment {
  id: string
  start: number
  end: number
  text: string
}

/**
 * 文字起こしデータ
 */
export interface Transcription {
  id: string
  meetingId: string
  fullText: string
  segments: TranscriptSegment[]
  language: string
  createdAt: string
  updatedAt: string
}

/**
 * 要約データ
 */
export interface Summary {
  id: string
  meetingId: string
  summaryText: string
  actionItems: ActionItem[]
  keyPoints: string[]
  createdAt: string
  updatedAt: string
}

/**
 * アクションアイテム
 */
export interface ActionItem {
  id: string
  task: string
  assignee: string | null
  deadline: string | null
}
