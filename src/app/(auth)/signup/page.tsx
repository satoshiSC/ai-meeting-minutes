import { SignupForm } from '@/features/auth/components/signup-form'
import Link from 'next/link'

export default function SignupPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-center text-3xl font-bold tracking-tight text-gray-900">
          AI 議事録
        </h1>
        <p className="mt-2 text-center text-sm text-gray-600">
          無料で始める
        </p>
      </div>

      <SignupForm />

      <p className="mt-8 text-center text-sm text-gray-600">
        既にアカウントをお持ちの方は{' '}
        <Link
          href="/login"
          className="font-medium text-indigo-600 hover:text-indigo-500"
        >
          ログイン
        </Link>
      </p>
    </div>
  )
}