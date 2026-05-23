'use client'

import { useRef, useState, useCallback } from 'react'
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
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleOpen = () => {
    setError(null)
    dialogRef.current?.showModal()
  }

  const handleClose = useCallback(() => {
    if (!isLoading) {
      dialogRef.current?.close()
      setError(null)
    }
  }, [isLoading])

  const handleDelete = async () => {
    setIsLoading(true)
    setError(null)

    const result = await deleteMeeting(meetingId)

    if (result.error) {
      setError(result.error)
      setIsLoading(false)
    } else {
      dialogRef.current?.close()
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

      {/* 確認ダイアログ（ネイティブ dialog 要素で画面中央に表示） */}
      <dialog
        ref={dialogRef}
        className="rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl sm:p-6 sm:w-full sm:max-w-lg backdrop:bg-black/25"
        onClick={(e) => {
          if (e.target === dialogRef.current) {
            handleClose()
          }
        }}
        onCancel={(e) => {
          if (isLoading) {
            e.preventDefault()
          }
        }}
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
      </dialog>
    </>
  )
}
