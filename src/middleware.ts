import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

/**
 * 認証が必要なルートのパターン
 */
const protectedRoutes = ['/meetings', '/settings']

/**
 * 認証済みユーザーがアクセスできないルート
 */
const authRoutes = ['/login', '/signup']

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // ユーザー情報を取得して認証状態を確認
  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // 認証ルート（ログイン・サインアップ）の処理
  if (authRoutes.includes(pathname)) {
    if (user) {
      return NextResponse.redirect(new URL('/meetings', request.url))
    }
    return response
  }

  // 保護されたルートの処理
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * 以下のパスでミドルウェアを実行：
     * - 保護されたルート
     * - 認証ルート
     * - API ルート
     */
    '/((?!_next/static|_next/image|favicon.ico).*)'
  ]
}
