'use client'

import { useState, useMemo } from 'react'
import type { TranscriptSegment } from '@/lib/types/transcription'

interface TranscriptViewerProps {
  segments: TranscriptSegment[]
}

/**
 * 時間をフォーマット（mm:ss）
 */
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

/**
 * 文字起こしビューワーコンポーネント
 */
export function TranscriptViewer({ segments }: TranscriptViewerProps) {
  const [searchQuery, setSearchQuery] = useState('')

  // 検索フィルター処理
  const filteredSegments = useMemo(() => {
    if (!searchQuery.trim()) return segments

    return segments.filter(seg =>
      seg.text.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [segments, searchQuery])

  // ハイライト表示用のテキスト生成
  const highlightText = (text: string) => {
    if (!searchQuery.trim()) return text

    const escaped = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const parts = text.split(new RegExp(`(${escaped})`, 'gi'))
    return parts.map((part, i) =>
      part.toLowerCase() === searchQuery.toLowerCase() ? (
        <mark key={i} className="bg-yellow-200 px-0.5 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    )
  }

  // コピー機能
  const copyToClipboard = async () => {
    const text = filteredSegments
      .map(seg => `[${formatTime(seg.start)}] ${seg.text}`)
      .join('\n')

    try {
      await navigator.clipboard.writeText(text)
      alert('クリップボードにコピーしました')
    } catch {
      alert('コピーに失敗しました')
    }
  }

  // 全文コピー
  const copyFullTranscript = async () => {
    const text = segments
      .map(seg => `[${formatTime(seg.start)}] ${seg.text}`)
      .join('\n')

    try {
      await navigator.clipboard.writeText(text)
      alert('クリップボードにコピーしました')
    } catch {
      alert('コピーに失敗しました')
    }
  }

  return (
    <div className="space-y-4">
      {/* コントロールバー */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        {/* 検索 */}
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="文字起こしを検索..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <svg
            className="absolute left-3 top-2.5 h-4 w-4 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
        </div>

        {/* コピーボタン */}
        <div className="flex gap-2">
          <button
            onClick={copyToClipboard}
            className="px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            表示部分をコピー
          </button>
          <button
            onClick={copyFullTranscript}
            className="px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            全体をコピー
          </button>
        </div>
      </div>

      {/* 結果数表示 */}
      <div className="text-sm text-gray-500">
        {filteredSegments.length} / {segments.length} セグメントを表示
        {searchQuery && `（「${searchQuery}」に一致）`}
      </div>

      {/* 文字起こしリスト */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="max-h-[600px] overflow-y-auto">
          {filteredSegments.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              該当する文字起こしが見つかりません
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredSegments.map((segment) => (
                <div
                  key={segment.id}
                  className="p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-16 text-xs text-gray-500 font-mono pt-0.5">
                      {formatTime(segment.start)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {highlightText(segment.text)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
