'use client'

import { useState, useMemo } from 'react'

/**
 * 文字起こしセグメント
 */
export interface TranscriptSegment {
  id: string
  start: number // 秒
  end: number // 秒
  speakerId: string
  speakerName: string
  text: string
}

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
  const [selectedSpeaker, setSelectedSpeaker] = useState<string | 'all'>('all')

  // スピーカー一覧
  const speakers = useMemo(() => {
    const speakerMap = new Map<string, string>()
    segments.forEach(seg => {
      speakerMap.set(seg.speakerId, seg.speakerName)
    })
    return Array.from(speakerMap.entries()).map(([id, name]) => ({ id, name }))
  }, [segments])

  // 検索・フィルター処理
  const filteredSegments = useMemo(() => {
    return segments.filter(seg => {
      // スピーカーフィルター
      if (selectedSpeaker !== 'all' && seg.speakerId !== selectedSpeaker) {
        return false
      }

      // 検索クエリ
      if (searchQuery.trim()) {
        return seg.text.toLowerCase().includes(searchQuery.toLowerCase())
      }

      return true
    })
  }, [segments, searchQuery, selectedSpeaker])

  // ハイライト表示用のテキスト生成
  const highlightText = (text: string) => {
    if (!searchQuery.trim()) return text

    const parts = text.split(new RegExp(`(${searchQuery})`, 'gi'))
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
      .map(seg => `[${formatTime(seg.start)}] ${seg.speakerName}: ${seg.text}`)
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
      .map(seg => `[${formatTime(seg.start)}] ${seg.speakerName}: ${seg.text}`)
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

        {/* スピーカーフィルター */}
        <select
          value={selectedSpeaker}
          onChange={(e) => setSelectedSpeaker(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="all">すべてのスピーカー</option>
          {speakers.map(speaker => (
            <option key={speaker.id} value={speaker.id}>
              {speaker.name}
            </option>
          ))}
        </select>

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
                    {/* 時刻 */}
                    <div className="flex-shrink-0 w-16 text-xs text-gray-500 font-mono pt-0.5">
                      {formatTime(segment.start)}
                    </div>

                    {/* 内容 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="font-medium text-gray-900 text-sm">
                          {segment.speakerName}
                        </span>
                        <span className="text-xs text-gray-400">
                          {segment.speakerId}
                        </span>
                      </div>
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