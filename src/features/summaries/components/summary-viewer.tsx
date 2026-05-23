'use client'

import type { Summary } from '@/lib/types/transcription'

interface SummaryViewerProps {
  summary: Summary
}

/**
 * 要約ビューワーコンポーネント
 */
export function SummaryViewer({ summary }: SummaryViewerProps) {
  return (
    <div className="space-y-6">
      {/* 要約本文 */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">概要</h3>
        <p className="text-sm text-gray-900 whitespace-pre-wrap leading-relaxed">
          {summary.summaryText}
        </p>
      </div>

      {/* 重要ポイント */}
      {summary.keyPoints.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">重要ポイント</h3>
          <ul className="space-y-2">
            {summary.keyPoints.map((point, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-900">
                <span className="mt-1 flex-shrink-0 h-1.5 w-1.5 rounded-full bg-indigo-500" />
                {point}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* アクションアイテム */}
      {summary.actionItems.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">アクションアイテム</h3>
          <div className="space-y-3">
            {summary.actionItems.map((item) => (
              <div
                key={item.id}
                className="rounded-md border border-gray-200 p-3"
              >
                <p className="text-sm font-medium text-gray-900">{item.task}</p>
                <div className="mt-1 flex gap-4">
                  {item.assignee && (
                    <span className="text-xs text-gray-500">
                      担当: {item.assignee}
                    </span>
                  )}
                  {item.deadline && (
                    <span className="text-xs text-gray-500">
                      期限: {item.deadline}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
