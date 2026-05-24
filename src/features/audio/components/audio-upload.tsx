'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { uploadAudioFile } from '@/features/audio/actions/audio-actions'
import { ALLOWED_EXTENSIONS, MAX_FILE_SIZE } from '@/features/audio/actions/audio-actions'

interface AudioUploadProps {
  meetingId: string
}

export function AudioUpload({ meetingId }: AudioUploadProps) {
  const router = useRouter()
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('audio/')) {
      setSelectedFile(file)
      setError(null)
    } else {
      setError('音声ファイルを選択してください')
    }
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setError(null)
    }
  }, [])

  const handleUpload = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    setUploadProgress(0)
    setError(null)

    const progressInterval = setInterval(() => {
      setUploadProgress(prev => Math.min(prev + 10, 90))
    }, 200)

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)

      const result = await uploadAudioFile(meetingId, formData)

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (result.error) {
        setError(result.error)
        setIsUploading(false)
        setTimeout(() => setUploadProgress(0), 1000)
        return
      }

      // 成功時は会議詳細ページに遷移
      setTimeout(() => {
        router.push(`/meetings/${meetingId}`)
        router.refresh()
      }, 500)
    } catch {
      clearInterval(progressInterval)
      setError('アップロード中にエラーが発生しました')
      setIsUploading(false)
      setTimeout(() => setUploadProgress(0), 1000)
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <div className="space-y-4">
      {/* ドラッグ＆ドロップエリア */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-colors duration-200
          ${isDragging
            ? 'border-indigo-500 bg-indigo-50'
            : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={ALLOWED_EXTENSIONS.map(ext => `.${ext}`).join(',')}
          onChange={handleFileSelect}
          className="hidden"
        />

        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 16.5V9.75m0 0l3 3.75m-3-3.75l-3 3.75M12 9.75V4.5m0 9.75a4.5 4.5 0 110-9 4.5 4.5 0 010 9zm-6 0a4.5 4.5 0 110-9 4.5 4.5 0 010 9z"
          />
        </svg>

        <p className="mt-4 text-sm font-medium text-gray-900">
          {isDragging ? 'ファイルをドロップしてください' : 'ファイルをドラッグ＆ドロップ'}
        </p>
        <p className="mt-1 text-sm text-gray-500">
          またはクリックしてファイルを選択
        </p>
        <p className="mt-2 text-xs text-gray-400">
          対応形式: {ALLOWED_EXTENSIONS.join(', ')} / 最大 {formatFileSize(MAX_FILE_SIZE)}
        </p>
      </div>

      {/* 選択されたファイル */}
      {selectedFile && (
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <svg
              className="h-8 w-8 text-indigo-500"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z"
              />
            </svg>
            <div>
              <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
              <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSelectedFile(null)}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* エラーメッセージ */}
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* 進捗バー */}
      {uploadProgress > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">アップロード中...</span>
            <span className="text-gray-600">{uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* アップロードボタン */}
      {selectedFile && (
        <button
          type="button"
          onClick={handleUpload}
          disabled={isUploading}
          className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUploading ? 'アップロード中...' : 'アップロード'}
        </button>
      )}
    </div>
  )
}