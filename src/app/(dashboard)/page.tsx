import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

/**
 * ダッシュボードページ
 * 認証済みユーザーのホーム画面
 */
export default async function DashboardPage() {
  const supabase = await createClient()

  // ユーザー情報を取得
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // 会議一覧を取得
  const { data: meetings } = await supabase
    .from('meetings')
    .select('id, title, status, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <div className="space-y-8">
      {/* ようこそメッセージ */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          ようこそ、{user.user_metadata?.full_name || user.email}さん
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          最後の会議から続きましょう
        </p>
      </div>

      {/* クイックアクション */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          href="/meetings/new"
          className="flex items-center gap-4 rounded-lg bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100">
            <svg
              className="h-6 w-6 text-indigo-600"
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
          </div>
          <div>
            <h3 className="font-medium text-gray-900">新しい会議</h3>
            <p className="text-sm text-gray-500">会議を新規作成</p>
          </div>
        </Link>

        <Link
          href="/meetings"
          className="flex items-center gap-4 rounded-lg bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <svg
              className="h-6 w-6 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25a2.25 2.25 0 01-2.25-2.25v-2.25z"
              />
            </svg>
          </div>
          <div>
            <h3 className="font-medium text-gray-900">会議一覧</h3>
            <p className="text-sm text-gray-500">過去の会議を確認</p>
          </div>
        </Link>
      </div>

      {/* 最近の会議 */}
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">最近の会議</h2>
          <Link
            href="/meetings"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            すべて見る →
          </Link>
        </div>

        <div className="mt-4 rounded-lg bg-white shadow">
          {meetings && meetings.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {meetings.map((meeting) => (
                <li key={meeting.id}>
                  <Link
                    href={`/meetings/${meeting.id}`}
                    className="block px-6 py-4 hover:bg-gray-50"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{meeting.title}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(meeting.created_at).toLocaleDateString('ja-JP')}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          meeting.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : meeting.status === 'processing'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {meeting.status === 'completed'
                          ? '完了'
                          : meeting.status === 'processing'
                          ? '処理中'
                          : meeting.status}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-500">まだ会議がありません</p>
              <Link
                href="/meetings/new"
                className="mt-4 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-500"
              >
                最初の会議を作成する
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}