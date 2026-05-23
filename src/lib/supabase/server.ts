import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * サーバー環境用の Supabase クライアント
 * サーバーコンポーネント・Server Actions で使用
 */
export async function createClient() {
  const cookieStore = await cookies()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase 環境変数が設定されていません')
  }

  return createServerClient(
    supabaseUrl ?? '',
    supabaseAnonKey ?? '',
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component では Cookie 設定ができない場合がある
            // その場合は次回のリクエストで設定される
          }
        }
      }
    }
  )
}
