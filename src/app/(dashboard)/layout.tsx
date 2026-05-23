import { UserMenu } from '@/features/auth/components/user-menu'
import Link from 'next/link'

/**
 * ダッシュボードレイアウト
 * 認証済みユーザー向けの共通レイアウト
 */
export default function DashboardLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-8">
            <Link href="/meetings" className="text-xl font-bold text-indigo-600">
              AI 議事録
            </Link>
            <nav className="hidden md:flex gap-6">
              <Link
                href="/meetings"
                className="text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                会議一覧
              </Link>
              <Link
                href="/meetings/new"
                className="text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                新規作成
              </Link>
              <Link
                href="/settings"
                className="text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                設定
              </Link>
            </nav>
          </div>
          <UserMenu />
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}