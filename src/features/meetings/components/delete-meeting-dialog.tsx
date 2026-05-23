'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { deleteMeeting } from '@/features/meetings/actions/meeting-actions'

interface DeleteMeetingDialogProps {
  meetingId: string
  meetingTitle: string
}

export function DeleteMeetingDialog({
  meetingId,
  meetingTitle
}: DeleteMeetingDialogProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleOpen = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsOpen(true)
  }

  const handleClose = () => {
    if (!isLoading) {
      setIsOpen(false)
      setError(null)
    }
  }

  const handleDelete = async () => {
    setIsLoading(true)
    setError(null)

    const result = await deleteMeeting(meetingId)

    if (result.error) {
      setError(result.error)
      setIsLoading(false)
    } else {
      setIsOpen(false)
      router.push('/meetings')
    }
  }

  return (
    <>
      {/* 削除ボタン */}
      <button
        type="button"
        onClick={handleOpen}
        className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
      >
        削除
      </button>

      {/* 確認ダイアログ（Portal で document.body に描画） */}
      {isOpen && createPortal(
        <div
          className="fixed inset-0 z-50 overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex min-h-screen items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-black bg-opacity-25 transition-opacity"
              onClick={handleClose}
            />

            <div
              className="relative z-10 transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:p-6 sm:my-8 sm:w-full sm:max-w-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                  <svg
                    className="h-6 w-6 text-red-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                    />
                  </svg>
                </div>
                <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                  <h3 className="text-base font-semibold leading-6 text-gray-900">
                    会議を削除
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      「{meetingTitle}」を削除してもよろしいですか？
                      この操作は取り消せません。
                    </p>
                    {error && (
                      <p className="mt-2 text-sm text-red-600">{error}</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={handleDelete}
                  className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? '削除中...' : '削除する'}
                </button>
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={handleClose}
                  className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  キャンセル
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
