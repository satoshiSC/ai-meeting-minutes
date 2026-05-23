import { LoginForm } from '@/features/auth/components/login-form'
import Link from 'next/link'

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-center text-3xl font-bold tracking-tight text-gray-900">
          AI 議事録
        </h1>
        <p className="mt-2 text-center text-sm text-gray-600">
          会議をより効率的に
        </p>
      </div>

      <LoginForm />

      <p className="mt-8 text-center text-sm text-gray-600">
        アカウントをお持ちでない方は{' '}
        <Link
          href="/signup"
          className="font-medium text-indigo-600 hover:text-indigo-500"
        >
          新規登録
        </Link>
      </p>
    </div>
  )
}