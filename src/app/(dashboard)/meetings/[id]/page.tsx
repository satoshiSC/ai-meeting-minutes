import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getMeeting } from '@/features/meetings/actions/meeting-actions'
import { getTranscription } from '@/features/transcriptions/actions/transcription-actions'
import { getSummary } from '@/features/summaries/actions/summary-actions'
import { DeleteMeetingDialog } from '@/features/meetings/components/delete-meeting-dialog'
import { TranscriptViewer } from '@/features/transcriptions/components/transcript-viewer'
import { SummaryViewer } from '@/features/summaries/components/summary-viewer'
import { ProcessMeetingButton } from '@/features/ai/components/process-meeting-button'

interface MeetingDetailPageProps {
  params: Promise<{ id: string }>
}

/**
 * 会議詳細ページ
 */
export default async function MeetingDetailPage({ params }: MeetingDetailPageProps) {
  const { id } = await params
  const { meeting, error } = await getMeeting(id)

  if (error || !meeting) {
    notFound()
  }

  const [transcriptionResult, summaryResult] = await Promise.all([
    getTranscription(meeting.id),
    getSummary(meeting.id)
  ])

  const transcription = transcriptionResult.transcription
  const summary = summaryResult.summary

  const statusConfig: Record<string, { label: string; color: string }> = {
    draft: { label: '下書き', color: 'bg-gray-100 text-gray-800' },
    recording: { label: '録音中', color: 'bg-red-100 text-red-800' },
    processing: { label: '処理中', color: 'bg-yellow-100 text-yellow-800' },
    completed: { label: '完了', color: 'bg-green-100 text-green-800' },
    failed: { label: '失敗', color: 'bg-red-100 text-red-800' }
  }

  const status = statusConfig[meeting.status] ?? statusConfig.draft
  const hasAudio = !!meeting.audioStoragePath
  const canProcess = hasAudio && !transcription && meeting.status !== 'processing'

  return (
    <div className="space-y-6">
      {/* ページヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Link
              href="/meetings"
              className="text-sm text-indigo-600 hover:text-indigo-500"
            >
              ← 会議一覧に戻る
            </Link>
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${status.color}`}>
              {status.label}
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-bold text-gray-900">{meeting.title}</h1>
        </div>
        <div className="flex gap-3">
          <Link
            href={`/meetings/${meeting.id}/edit`}
            className="rounded-md bg-white border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            編集
          </Link>
          <DeleteMeetingDialog
            meetingId={meeting.id}
            meetingTitle={meeting.title}
          />
        </div>
      </div>

      {/* 会議情報 */}
      <div className="rounded-lg bg-white shadow">
        <div className="px-6 py-5 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">会議情報</h2>
        </div>
        <div className="p-6 space-y-4">
          {meeting.description && (
            <div>
              <h3 className="text-sm font-medium text-gray-700">説明</h3>
              <p className="mt-1 text-sm text-gray-600 whitespace-pre-wrap">
                {meeting.description}
              </p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-700">作成日</h3>
              <p className="mt-1 text-sm text-gray-600">
                {new Date(meeting.createdAt).toLocaleDateString('ja-JP', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-700">更新日</h3>
              <p className="mt-1 text-sm text-gray-600">
                {new Date(meeting.updatedAt).toLocaleDateString('ja-JP', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
          {meeting.audioDuration && (
            <div>
              <h3 className="text-sm font-medium text-gray-700">音声の長さ</h3>
              <p className="mt-1 text-sm text-gray-600">
                {Math.floor(meeting.audioDuration / 60)}分{meeting.audioDuration % 60}秒
              </p>
            </div>
          )}
        </div>
      </div>

      {/* AI処理セクション */}
      {canProcess && (
        <div className="rounded-lg bg-indigo-50 border border-indigo-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-indigo-900">
                音声ファイルがアップロードされています
              </h3>
              <p className="mt-1 text-sm text-indigo-700">
                AIで文字起こしと要約を生成できます
              </p>
            </div>
            <ProcessMeetingButton meetingId={meeting.id} />
          </div>
        </div>
      )}

      {/* 処理中の表示 */}
      {meeting.status === 'processing' && (
        <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-6">
          <div className="flex items-center gap-3">
            <svg className="animate-spin h-5 w-5 text-yellow-600" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-yellow-900">AI処理中</h3>
              <p className="text-sm text-yellow-700">文字起こしと要約を生成しています。しばらくお待ちください。</p>
            </div>
          </div>
        </div>
      )}

      {/* 失敗の表示 */}
      {meeting.status === 'failed' && !transcription && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-red-900">AI処理に失敗しました</h3>
              <p className="text-sm text-red-700">再度お試しください</p>
            </div>
            {hasAudio && <ProcessMeetingButton meetingId={meeting.id} />}
          </div>
        </div>
      )}

      {/* 要約セクション */}
      {summary && (
        <div className="rounded-lg bg-white shadow">
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">AI 要約</h2>
          </div>
          <div className="p-6">
            <SummaryViewer summary={summary} />
          </div>
        </div>
      )}

      {/* 文字起こしセクション */}
      {transcription && transcription.segments.length > 0 && (
        <div className="rounded-lg bg-white shadow">
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">文字起こし</h2>
          </div>
          <div className="p-6">
            <TranscriptViewer segments={transcription.segments} />
          </div>
        </div>
      )}

      {/* 音声未アップロードの案内 */}
      {!hasAudio && (
        <div className="rounded-lg bg-white shadow">
          <div className="p-6 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">音声ファイルがありません</h3>
            <p className="mt-1 text-sm text-gray-500">
              音声ファイルをアップロードすると、AIが自動で文字起こしと要約を生成します
            </p>
            <div className="mt-4">
              <Link
                href={`/meetings/${meeting.id}/upload`}
                className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
              >
                音声をアップロード
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
