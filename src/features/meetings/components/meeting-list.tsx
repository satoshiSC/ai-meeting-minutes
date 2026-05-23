import type { MeetingListResponse } from '@/lib/types/meeting'
import { MeetingCard } from './meeting-card'

interface MeetingListProps {
  data: MeetingListResponse
}

export function MeetingList({ data }: MeetingListProps) {
  if (data.meetings.length === 0) {
    return (
      <div className="text-center py-12">
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
            d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.868 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0118 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">会議がありません</h3>
        <p className="mt-1 text-sm text-gray-500">
          最初の会議を作成しましょう。
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        {data.meetings.map((meeting) => (
          <MeetingCard key={meeting.id} meeting={meeting} />
        ))}
      </div>

      {/* ページネーション */}
      {data.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 pt-4">
          <div className="text-sm text-gray-700">
            {data.total}件中 {(data.page - 1) * data.limit + 1} -{' '}
            {Math.min(data.page * data.limit, data.total)}件を表示
          </div>
          <div className="flex gap-2">
            {data.page > 1 && (
              <button
                className="rounded-md border border-gray-300 px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                前へ
              </button>
            )}
            {data.hasMore && (
              <button
                className="rounded-md border border-gray-300 px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                次へ
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
