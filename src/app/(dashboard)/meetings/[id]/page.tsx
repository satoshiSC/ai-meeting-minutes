import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getMeeting } from '@/features/meetings/actions/meeting-actions'
import { DeleteMeetingDialog } from '@/features/meetings/components/delete-meeting-dialog'
import { TranscriptViewer } from '@/features/transcriptions/components/transcript-viewer'
import type { TranscriptSegment } from '@/features/transcriptions/components/transcript-viewer'

interface MeetingDetailPageProps {
  params: Promise<{ id: string }>
}

/**
 * 会議詳細ページ
 */
export default async function MeetingDetailPage({ params }: MeetingDetailPageProps) {
  const { id } = await params
  const { meeting, error } = await getMeeting(id)

  if (error || !meeting) {
    notFound()
  }

  const statusConfig: Record<string, { label: string; color: string }> = {
    draft: { label: '下書き', color: 'bg-gray-100 text-gray-800' },
    recording: { label: '録音中', color: 'bg-red-100 text-red-800' },
    processing: { label: '処理中', color: 'bg-yellow-100 text-yellow-800' },
    completed: { label: '完了', color: 'bg-green-100 text-green-800' },
    failed: { label: '失敗', color: 'bg-red-100 text-red-800' }
  }

  const status = statusConfig[meeting.status] ?? statusConfig.draft

  return (
    <div className="space-y-6">
      {/* ページヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Link
              href="/meetings"
              className="text-sm text-indigo-600 hover:text-indigo-500"
            >
              ← 会議一覧に戻る
            </Link>
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${status.color}`}>
              {status.label}
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-bold text-gray-900">{meeting.title}</h1>
        </div>
        <div className="flex gap-3">
          <Link
            href={`/meetings/${meeting.id}/edit`}
            className="rounded-md bg-white border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            編集
          </Link>
          <DeleteMeetingDialog
            meetingId={meeting.id}
            meetingTitle={meeting.title}
          />
        </div>
      </div>

      {/* 会議情報 */}
      <div className="rounded-lg bg-white shadow">
        <div className="px-6 py-5 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">会議情報</h2>
        </div>
        <div className="p-6 space-y-4">
          {meeting.description && (
            <div>
              <h3 className="text-sm font-medium text-gray-700">説明</h3>
              <p className="mt-1 text-sm text-gray-600 whitespace-pre-wrap">
                {meeting.description}
              </p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-700">作成日</h3>
              <p className="mt-1 text-sm text-gray-600">
                {new Date(meeting.createdAt).toLocaleDateString('ja-JP', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-700">更新日</h3>
              <p className="mt-1 text-sm text-gray-600">
                {new Date(meeting.updatedAt).toLocaleDateString('ja-JP', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
          {meeting.audioDuration && (
            <div>
              <h3 className="text-sm font-medium text-gray-700">音声の長さ</h3>
              <p className="mt-1 text-sm text-gray-600">
                {Math.floor(meeting.audioDuration / 60)}分{meeting.audioDuration % 60}秒
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 文字起こしセクション */}
      <div className="rounded-lg bg-white shadow">
        <div className="px-6 py-5 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">文字起こし</h2>
        </div>
        <div className="p-6">
          <TranscriptViewer segments={mockTranscriptSegments} />
        </div>
      </div>
    </div>
  )
}

// 仮データ
const mockTranscriptSegments: TranscriptSegment[] = [
  {
    id: '1',
    start: 0,
    end: 15,
    speakerId: 'speaker1',
    speakerName: '田中',
    text: '皆さん、おはようございます。本日はお忙しい中、第2四半期のプロジェクト進捗会議にお集まりいただき、ありがとうございます。'
  },
  {
    id: '2',
    start: 16,
    end: 35,
    speakerId: 'speaker2',
    speakerName: '鈴木',
    text: 'おはようございます。早速ですが、前回の議事録から確認させていただいてもよろしいでしょうか？'
  },
  {
    id: '3',
    start: 36,
    end: 58,
    speakerId: 'speaker1',
    speakerName: '田中',
    text: 'はい、お願いします。前回はお客さまからのフィードバックについて話し合いましたね。特にUI/UXの改善点について多くの意見をいただきました。'
  },
  {
    id: '4',
    start: 59,
    end: 82,
    speakerId: 'speaker3',
    speakerName: '佐藤',
    text: 'そうですね。私もメモを取りながら聞いていました。特にモバイルアプリの使いやすさについて、シニアユーザーの方々からご意見をいただいていたのが印象的でした。'
  },
  {
    id: '5',
    start: 83,
    end: 105,
    speakerId: 'speaker2',
    speakerName: '鈴木',
    text: 'はい、その点については開発チームですでに対応を検討しています。フォントサイズの調整や、ボタンの配置変更など、具体的な改善案をまとめています。'
  },
  {
    id: '6',
    start: 106,
    end: 130,
    speakerId: 'speaker1',
    speakerName: '田中',
    text: '素晴らしいですね。それでは、今回の会議のメイン議題である新機能のリリーススケジュールについて話し合いましょう。開発の進捗状況はいかがでしょうか？'
  },
  {
    id: '7',
    start: 131,
    end: 155,
    speakerId: 'speaker4',
    speakerName: '山本',
    text: '現時点では予定よりやや遅れ気味ですが、来週中にはキャッチアップできる見込みです。テスト工程を並行して進めているため、品質には問題ないと考えています。'
  },
  {
    id: '8',
    start: 156,
    end: 180,
    speakerId: 'speaker3',
    speakerName: '佐藤',
    text: 'マーケティングチームとしては、リリース時期が確定次第、プロモーション計画を詰めたいと考えています。来月初旬のリリースは可能そうですか？'
  },
  {
    id: '9',
    start: 181,
    end: 205,
    speakerId: 'speaker2',
    speakerName: '鈴木',
    text: '技術的には可能ですが、念のため1週間のバッファを見て、中旬リリースを目標にするのはいかがでしょうか？万が一の問題にも対応できますし。'
  },
  {
    id: '10',
    start: 206,
    end: 230,
    speakerId: 'speaker1',
    speakerName: '田中',
    text: '良い提案ですね。それでは来月15日をターゲットにしましょう。各チーム、その日程に向けて準備を進めてください。何か懸念点はありますか？'
  },
  {
    id: '11',
    start: 231,
    end: 255,
    speakerId: 'speaker4',
    speakerName: '山本',
    text: '開発チームからは特に問題ありません。ただし、本番環境へのデプロイ前に、セキュリティ監査を一度入れておきたいと考えています。'
  },
  {
    id: '12',
    start: 256,
    end: 280,
    speakerId: 'speaker3',
    speakerName: '佐藤',
    text: 'マーケティング側もその期間を考慮に入れて計画を立てます。監査にはどのくらいかかりそうですか？'
  },
  {
    id: '13',
    start: 281,
    end: 305,
    speakerId: 'speaker4',
    speakerName: '山本',
    text: '通常3〜4営業日見ています。今回は外部ベンダーに依頼するので、余裕を持って1週間で考えておきましょう。'
  },
  {
    id: '14',
    start: 306,
    end: 330,
    speakerId: 'speaker1',
    speakerName: '田中',
    text: 'わかりました。それでは次のアクションアイテムを確認しましょう。山本さん、セキュリティ監査の手配をお願いします。'
  },
  {
    id: '15',
    start: 331,
    end: 355,
    speakerId: 'speaker2',
    speakerName: '鈴木',
    text: 'はい、承知しました。今日中にベンダーへ連絡を入れます。佐藤さんはプロモーション資料の作成、よろしくお願いします。'
  },
  {
    id: '16',
    start: 356,
    end: 380,
    speakerId: 'speaker3',
    speakerName: '佐藤',
    text: 'もちろんです。すでにラフ案はできていますので、リリース日が確定次第、本格的に着手します。'
  },
  {
    id: '17',
    start: 381,
    end: 405,
    speakerId: 'speaker1',
    speakerName: '田中',
    text: 'ありがとうございます。それでは、次回会議は来週の同じ時間にしましょう。何か追加議題があれば、事前に共有してください。'
  },
  {
    id: '18',
    start: 406,
    end: 420,
    speakerId: 'speaker1',
    speakerName: '田中',
    text: '本日はありがとうございました。また来週よろしくお願いします。'
  }
]
