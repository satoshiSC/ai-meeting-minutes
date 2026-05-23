import { AuthFormData } from '@/lib/types/auth'

/**
 * メールアドレスのバリデーション
 */
function validateEmail(email: string): string | null {
  if (!email) {
    return 'メールアドレスを入力してください'
  }

  // 簡単なメール形式チェック
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return '有効なメールアドレスを入力してください'
  }

  return null
}

/**
 * パスワードのバリデーション
 */
function validatePassword(password: string): string | null {
  if (!password) {
    return 'パスワードを入力してください'
  }

  if (password.length < 8) {
    return 'パスワードは8文字以上で入力してください'
  }

  return null
}

/**
 * 氏名のバリデーション
 */
function validateFullName(fullName: string | undefined): string | null {
  if (!fullName) {
    return '氏名を入力してください'
  }

  if (fullName.length > 100) {
    return '氏名は100文字以内で入力してください'
  }

  return null
}

/**
 * ログインフォームのバリデーション
 */
export function validateLoginForm(data: Omit<AuthFormData, 'fullName'>): string[] {
  const errors: string[] = []

  const emailError = validateEmail(data.email)
  if (emailError) {
    errors.push(emailError)
  }

  const passwordError = validatePassword(data.password)
  if (passwordError) {
    errors.push(passwordError)
  }

  return errors
}

/**
 * サインアップフォームのバリデーション
 */
export function validateSignupForm(data: AuthFormData): string[] {
  const errors: string[] = []

  const fullNameError = validateFullName(data.fullName)
  if (fullNameError) {
    errors.push(fullNameError)
  }

  const emailError = validateEmail(data.email)
  if (emailError) {
    errors.push(emailError)
  }

  const passwordError = validatePassword(data.password)
  if (passwordError) {
    errors.push(passwordError)
  }

  return errors
}