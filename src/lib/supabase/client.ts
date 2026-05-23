import { createBrowserClient } from '@supabase/ssr'

/**
 * ブラウザ環境用の Supabase クライアント
 * クライアントコンポーネントで使用
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase 環境変数が設定されていません')
  }

  return createBrowserClient(
    supabaseUrl ?? '',
    supabaseAnonKey ?? ''
  )
}
