import { MeetingForm } from '@/features/meetings/components/meeting-form'

/**
 * 新規会議作成ページ
 */
export default async function NewMeetingPage() {
  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">新規会議を作成</h1>
        <p className="mt-1 text-sm text-gray-500">
          新しい会議の情報を入力してください
        </p>
      </div>

      <div className="rounded-lg bg-white shadow">
        <div className="px-6 py-5 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">会議情報</h2>
        </div>
        <div className="p-6">
          <MeetingForm />
        </div>
      </div>
    </div>
  )
}