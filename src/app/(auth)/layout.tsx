/**
 * 認証ページのレイアウト
 * 認証済みユーザーはダッシュボードへリダイレクト
 */
export default function AuthLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  )
}