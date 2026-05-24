'use client'

import { useState, useEffect, useRef } from 'react'
import { getAudioSignedUrl } from '@/features/audio/actions/audio-actions'

interface AudioPlayerProps {
  storagePath: string
}

/**
 * 音声ファイルプレイヤーコンポーネント
 * Supabase Storage から署名付きURLを取得して再生
 */
export function AudioPlayer({ storagePath }: AudioPlayerProps) {
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    let mounted = true

    async function loadAudioUrl() {
      const result = await getAudioSignedUrl(storagePath)

      if (!mounted) return

      if (result.error) {
        setError(result.error)
        setIsLoading(false)
        return
      }

      if (result.url) {
        setAudioUrl(result.url)
        setIsLoading(false)
      }
    }

    loadAudioUrl()

    return () => {
      mounted = false
    }
  }, [storagePath])

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration)
    }
  }

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleEnded = () => {
    setIsPlaying(false)
    setCurrentTime(0)
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <p className="text-sm text-red-800">{error}</p>
      </div>
    )
  }

  if (!audioUrl) {
    return (
      <div className="rounded-md bg-yellow-50 p-4">
        <p className="text-sm text-yellow-800">音声ファイルの読み込みに失敗しました</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        className="hidden"
      />

      {/* カスタムコントロール */}
      <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
        {/* 再生/一時停止 */}
        <button
          type="button"
          onClick={handlePlayPause}
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          {isPlaying ? (
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7.5 0A.75.75 0 0115 4.5h1.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H15a.75.75 0 01-.75-.75V5.25z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
            </svg>
          )}
        </button>

        {/* プログレスバー */}
        <div className="flex-1 space-y-1">
          <input
            type="range"
            min={0}
            max={duration || 0}
            value={currentTime}
            onChange={(e) => {
              const time = Number(e.target.value)
              setCurrentTime(time)
              if (audioRef.current) {
                audioRef.current.currentTime = time
              }
            }}
            className="w-full h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer accent-indigo-600"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}