'use server'

import { createClient } from '@/lib/supabase/server'
import { AuthFormData, AuthError } from '@/lib/types/auth'
import { redirect } from 'next/navigation'

/**
 * メール/パスワードでサインイン
 */
export async function signIn(formData: AuthFormData): Promise<{ success: boolean; error?: AuthError }> {
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email: formData.email,
    password: formData.password
  })

  if (error) {
    return {
      success: false,
      error: {
        message: error.message,
        status: error.status
      }
    }
  }

  return { success: true }
}

/**
 * メール/パスワードでサインアップ
 */
export async function signUp(formData: AuthFormData): Promise<{ success: boolean; error?: AuthError }> {
  const supabase = await createClient()

  const { error } = await supabase.auth.signUp({
    email: formData.email,
    password: formData.password,
    options: {
      data: {
        full_name: formData.fullName
      }
    }
  })

  if (error) {
    return {
      success: false,
      error: {
        message: error.message,
        status: error.status
      }
    }
  }

  return { success: true }
}

/**
 * Google プロバイダーでサインイン
 */
export async function signInWithGoogle(): Promise<{ url?: string; error?: AuthError }> {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
    }
  })

  if (error) {
    return {
      error: {
        message: error.message,
        status: error.status
      }
    }
  }

  if (data.url) {
    redirect(data.url)
  }

  return { error: { message: 'OAuth URL が取得できませんでした' } }
}

/**
 * サインアウト
 */
export async function signOut(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

/**
 * 現在のユーザー情報を取得
 */
export async function getCurrentUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return null
  }

  return {
    id: user.id,
    email: user.email || '',
    fullName: user.user_metadata?.full_name || null,
    avatarUrl: user.user_metadata?.avatar_url || null
  }
}