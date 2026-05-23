import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { signOut } from '@/features/auth/actions/auth-actions'

/**
 * 設定ページ
 */
export default async function SettingsPage() {
  const supabase = await createClient()

  // ユーザー情報を取得
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="space-y-6">
      {/* ページヘッダー */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">設定</h1>
        <p className="mt-1 text-sm text-gray-500">
          アカウント設定を管理します
        </p>
      </div>

      {/* プロフィールセクション */}
      <div className="rounded-lg bg-white shadow">
        <div className="px-6 py-5 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">プロフィール</h2>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              氏名
            </label>
            <p className="mt-1 text-sm text-gray-900">
              {user.user_metadata?.full_name || '未設定'}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              メールアドレス
            </label>
            <p className="mt-1 text-sm text-gray-900">
              {user.email}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              ユーザーID
            </label>
            <p className="mt-1 text-sm text-gray-500 font-mono">
              {user.id}
            </p>
          </div>
        </div>
      </div>

      {/* アカウントセクション */}
      <div className="rounded-lg bg-white shadow">
        <div className="px-6 py-5 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">アカウント</h2>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              登録日
            </label>
            <p className="mt-1 text-sm text-gray-900">
              {new Date(user.created_at).toLocaleDateString('ja-JP', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              最終ログイン
            </label>
            <p className="mt-1 text-sm text-gray-900">
              {user.last_sign_in_at
                ? new Date(user.last_sign_in_at).toLocaleDateString('ja-JP', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                : '不明'}
            </p>
          </div>
        </div>
      </div>

      {/* 危険ゾーン */}
      <div className="rounded-lg bg-white shadow border-2 border-red-200">
        <div className="px-6 py-5 border-b border-red-200">
          <h2 className="text-lg font-medium text-red-900">危険ゾーン</h2>
        </div>
        <div className="px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900">ログアウト</h3>
              <p className="mt-1 text-sm text-gray-500">
                現在のセッションを終了します。再度ログインする必要があります。
              </p>
            </div>
            <form action={signOut}>
              <button
                type="submit"
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                ログアウト
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}