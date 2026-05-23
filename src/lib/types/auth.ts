import type { User } from '@supabase/supabase-js'

/**
 * アプリケーションで使用するユーザー情報
 */
export interface UserProfile {
  id: string
  email: string
  fullName: string | null
  avatarUrl: string | null
}

/**
 * 認証セッション情報
 */
export interface AuthSession {
  user: User
  profile: UserProfile | null
}

/**
 * ログイン・サインアップフォームデータ
 */
export interface AuthFormData {
  email: string
  password: string
  fullName?: string
}

/**
 * 認証エラーレスポンス
 */
export interface AuthError {
  message: string
  status?: number
}