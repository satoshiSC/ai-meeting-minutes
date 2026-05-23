import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * OAuth コールバックハンドラー
 * Google OAuth などの認証プロバイダーからのコールバックを処理
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/meetings'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // セッション取得成功
      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'

      if (isLocalEnv) {
        // 開発環境ではローカルホストにリダイレクト
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        // 本番環境では forwarded host を使用
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }

  // エラー時はログインページへ
  return NextResponse.redirect(`${origin}/login?error=認証に失敗しました`)
}