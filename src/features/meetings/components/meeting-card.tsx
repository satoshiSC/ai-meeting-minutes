import Link from 'next/link'
import type { Meeting } from '@/lib/types/meeting'

interface MeetingCardProps {
  meeting: Meeting
}

const statusConfig: Record<string, { label: string; color: string }> = {
  draft: { label: '下書き', color: 'bg-gray-100 text-gray-800' },
  recording: { label: '録音中', color: 'bg-red-100 text-red-800' },
  processing: { label: '処理中', color: 'bg-yellow-100 text-yellow-800' },
  completed: { label: '完了', color: 'bg-green-100 text-green-800' },
  failed: { label: '失敗', color: 'bg-red-100 text-red-800' }
}

export function MeetingCard({ meeting }: MeetingCardProps) {
  const status = statusConfig[meeting.status] ?? statusConfig.draft

  return (
    <Link
      href={`/meetings/${meeting.id}`}
      className="block rounded-lg bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-medium text-gray-900 truncate">
            {meeting.title}
          </h3>
          {meeting.description && (
            <p className="mt-2 text-sm text-gray-500 line-clamp-2">
              {meeting.description}
            </p>
          )}
        </div>
        <span className={`ml-4 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${status.color}`}>
          {status.label}
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
        <time dateTime={meeting.createdAt}>
          {new Date(meeting.createdAt).toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })}
        </time>
        {meeting.audioDuration && (
          <span>{Math.floor(meeting.audioDuration / 60)}分</span>
        )}
      </div>
    </Link>
  )
}