import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getMeeting } from '@/features/meetings/actions/meeting-actions'
import { MeetingForm } from '@/features/meetings/components/meeting-form'

interface EditMeetingPageProps {
  params: Promise<{ id: string }>
}

/**
 * 会議編集ページ
 */
export default async function EditMeetingPage({ params }: EditMeetingPageProps) {
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
        <h1 className="mt-2 text-2xl font-bold text-gray-900">会議を編集</h1>
        <p className="mt-1 text-sm text-gray-500">
          会議の情報を変更してください
        </p>
      </div>

      <div className="rounded-lg bg-white shadow">
        <div className="px-6 py-5 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">会議情報</h2>
        </div>
        <div className="p-6">
          <MeetingForm meeting={meeting} />
        </div>
      </div>
    </div>
  )
}