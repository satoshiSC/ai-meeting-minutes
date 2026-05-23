import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getMeeting } from '@/features/meetings/actions/meeting-actions'
import { AudioUpload } from '@/features/audio/components/audio-upload'

interface UploadPageProps {
  params: Promise<{ id: string }>
}

/**
 * 音声ファイルアップロードページ
 */
export default async function UploadPage({ params }: UploadPageProps) {
  const { id } = await params
  const { meeting, error } = await getMeeting(id)

  if (error || !meeting) {
    notFound()
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <Link
            href={`/meetings/${id}`}
            className="text-sm text-indigo-600 hover:text-indigo-500"
          >
            ← 会議詳細に戻る
          </Link>
        </div>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">音声ファイルをアップロード</h1>
        <p className="mt-1 text-sm text-gray-500">
          会議「{meeting.title}」の音声ファイルをアップロードしてください
        </p>
      </div>

      <div className="rounded-lg bg-white shadow">
        <div className="px-6 py-5 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">音声ファイル</h2>
        </div>
        <div className="p-6">
          <AudioUpload
            meetingId={meeting.id}
            onSuccess={() => {
              // リダイレクトまたはリフレッシュ
              window.location.href = `/meetings/${meeting.id}`
            }}
          />
        </div>
      </div>

      {/* サポート情報 */}
      <div className="mt-6 rounded-lg bg-blue-50 p-4">
        <h3 className="text-sm font-medium text-blue-900">サポートされている形式</h3>
        <ul className="mt-2 text-sm text-blue-800 space-y-1">
          <li>• MP3 (.mp3)</li>
          <li>• WAV (.wav)</li>
          <li>• M4A (.m4a)</li>
        </ul>
        <p className="mt-3 text-xs text-blue-700">
          最大ファイルサイズ: 25MB
        </p>
      </div>
    </div>
  )
}