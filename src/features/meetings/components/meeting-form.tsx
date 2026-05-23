'use client'

import { useState } from 'react'
import { createMeeting, updateMeeting } from '@/features/meetings/actions/meeting-actions'
import type { Meeting, CreateMeetingData, UpdateMeetingData } from '@/lib/types/meeting'

interface MeetingFormProps {
  meeting?: Meeting
  onSuccess?: () => void
}

export function MeetingForm({ meeting, onSuccess }: MeetingFormProps) {
  const [title, setTitle] = useState(meeting?.title ?? '')
  const [description, setDescription] = useState(meeting?.description ?? '')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const isEditing = !!meeting

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const data: CreateMeetingData | UpdateMeetingData = {
      title,
      description: description || undefined
    }

    const result = isEditing
      ? await updateMeeting(meeting.id, data as UpdateMeetingData)
      : await createMeeting(data as CreateMeetingData)

    if (result.error) {
      setError(result.error)
      setIsLoading(false)
    } else {
      onSuccess?.()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          会議タイトル <span className="text-red-500">*</span>
        </label>
        <input
          id="title"
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
          placeholder="例：週次チームミーティング"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          会議説明
        </label>
        <textarea
          id="description"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
          placeholder="会議の目的や議題などを入力してください"
        />
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? '保存中...' : isEditing ? '更新する' : '作成する'}
        </button>
      </div>
    </form>
  )
}