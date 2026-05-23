import { Suspense } from 'react'
import Link from 'next/link'
import { getMeetings } from '@/features/meetings/actions/meeting-actions'
import { MeetingList } from '@/features/meetings/components/meeting-list'
import type { MeetingQueryOptions } from '@/lib/types/meeting'

interface MeetingsPageProps {
  searchParams: Promise<{
    page?: string
    search?: string
    status?: string
  }>
}

/**
 * 会議一覧ページ
 */
export default async function MeetingsPage({ searchParams }: MeetingsPageProps) {
  const params = await searchParams

  const options: MeetingQueryOptions = {
    page: params.page ? parseInt(params.page, 10) : 1,
    search: params.search,
    status: params.status as MeetingQueryOptions['status']
  }

  return (
    <div className="space-y-6">
      {/* ページヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">会議一覧</h1>
          <p className="mt-1 text-sm text-gray-500">
            これまでに作成した会議の一覧です
          </p>
        </div>
        <Link
          href="/meetings/new"
          className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
          新規作成
        </Link>
      </div>

      {/* 検索・フィルター */}
      <div className="rounded-lg bg-white p-4 shadow">
        <form className="flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              name="search"
              placeholder="会議タイトルまたは説明で検索..."
              defaultValue={params.search}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <select
            name="status"
            defaultValue={params.status}
            className="rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="">すべてのステータス</option>
            <option value="draft">下書き</option>
            <option value="recording">録音中</option>
            <option value="processing">処理中</option>
            <option value="completed">完了</option>
            <option value="failed">失敗</option>
          </select>
          <button
            type="submit"
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            検索
          </button>
        </form>
      </div>

      {/* 会議リスト */}
      <Suspense fallback={<div className="text-center py-12">読み込み中...</div>}>
        <MeetingListWrapper options={options} />
      </Suspense>
    </div>
  )
}

async function MeetingListWrapper({ options }: { options: MeetingQueryOptions }) {
  const data = await getMeetings(options)
  return <MeetingList data={data} />
}