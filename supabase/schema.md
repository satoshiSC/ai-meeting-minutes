# データベーススキーマ

## 概要

AI 議事録 SaaS の Supabase PostgreSQL データベーススキーマです。

## テーブル構成

### meetings（会議）
会議のメタデータを管理するメインテーブルです。

| カラム | 型 | 説明 |
|--------|-----|------|
| id | UUID | 会議ID（PK） |
| user_id | UUID | ユーザーID（FK → auth.users） |
| title | VARCHAR(200) | 会議タイトル |
| description | TEXT | 会議説明 |
| audio_storage_path | TEXT | 音声ファイルの Storage パス |
| audio_duration | INTEGER | 音声の長さ（秒） |
| audio_url | TEXT | 音声ファイルの公開URL |
| status | VARCHAR(50) | ステータス（draft/recording/processing/completed/failed） |
| language | VARCHAR(10) | 言語（ja/en など） |
| created_at | TIMESTAMPTZ | 作成日時 |
| updated_at | TIMESTAMPTZ | 更新日時 |

### transcriptions（文字起こし）
音声の文字起こしデータを管理します。

| カラム | 型 | 説明 |
|--------|-----|------|
| id | UUID | 文字起こしID（PK） |
| meeting_id | UUID | 会議ID（FK → meetings, UNIQUE） |
| full_text | TEXT | 全文起こしテキスト |
| segments | JSONB | セグメント情報 `[{ start, end, speaker_id, text }]` |
| language | VARCHAR(10) | 言語 |
| created_at | TIMESTAMPTZ | 作成日時 |
| updated_at | TIMESTAMPTZ | 更新日時 |

### summaries（要約）
AI による会議の要約データを管理します。

| カラム | 型 | 説明 |
|--------|-----|------|
| id | UUID | 要約ID（PK） |
| meeting_id | UUID | 会議ID（FK → meetings, UNIQUE） |
| summary_text | TEXT | 要約テキスト |
| action_items | JSONB | アクションアイテム `[{ id, text, assignee, due_date, completed }]` |
| key_points | JSONB | 重要なポイント `[{ text, importance }]` |
| model_used | VARCHAR(50) | 使用したAIモデル |
| tokens_used | INTEGER | 使用トークン数 |
| language | VARCHAR(10) | 言語 |
| created_at | TIMESTAMPTZ | 作成日時 |
| updated_at | TIMESTAMPTZ | 更新日時 |

### participants（参加者）
会議の参加者情報を管理します。

| カラム | 型 | 説明 |
|--------|-----|------|
| id | UUID | 参加者ID（PK） |
| meeting_id | UUID | 会議ID（FK → meetings） |
| speaker_id | TEXT | 音声認識のスピーカーID |
| name | VARCHAR(100) | 参加者名 |
| role | VARCHAR(50) | 役割（host/participant/observer） |
| created_at | TIMESTAMPTZ | 作成日時 |

### shared_meetings（共有）
会議の共有情報を管理します。

| カラム | 型 | 説明 |
|--------|-----|------|
| id | UUID | 共有ID（PK） |
| meeting_id | UUID | 会議ID（FK → meetings） |
| shared_by | UUID | 共有したユーザーID（FK → auth.users） |
| shared_with_email | VARCHAR(255) | 共有先のメールアドレス |
| share_token | VARCHAR(255) | 公開リンク用トークン（UNIQUE） |
| permission | VARCHAR(20) | 権限（view/comment/edit） |
| expires_at | TIMESTAMPTZ | 有効期限（null=無期限） |
| created_at | TIMESTAMPTZ | 作成日時 |

## インデックス

### meetings
- `idx_meetings_user_id` - ユーザーID 検索
- `idx_meetings_status` - ステータス検索
- `idx_meetings_created_at` - 作成日時ソート
- `idx_meetings_user_created` - ユーザー別・日時ソート
- `idx_meetings_title_trgm` - タイトル全文検索（trgm）
- `idx_meetings_description_trgm` - 説明全文検索（trgm）

### transcriptions
- `idx_transcriptions_meeting_id` - 会議ID 検索

### summaries
- `idx_summaries_meeting_id` - 会議ID 検索

### participants
- `idx_participants_meeting_id` - 会議ID 検索

### shared_meetings
- `idx_shared_meetings_meeting_id` - 会議ID 検索
- `idx_shared_meetings_token` - 共有トークン検索
- `idx_shared_meetings_email` - 共有先メール検索

## Row Level Security (RLS)

すべてのテーブルで RLS が有効化されており、ユーザーは自分のデータにのみアクセスできます。

### ポリシー概要

- **meetings**: ユーザーは自分の会議のみ操作可能
- **transcriptions**: ユーザーは自分の会議の文字起こしのみ操作可能
- **summaries**: ユーザーは自分の会議の要約のみ操作可能
- **participants**: ユーザーは自分の会議の参加者のみ操作可能
- **shared_meetings**: ユーザーは自分の共有リンクのみ操作可能

### 公開リンク

`shared_meetings` テーブルに有効な `share_token` が存在する場合、認証なしで会議を閲覧できます（公開リンク機能）。

## 拡張性

将来的な拡張を考慮して以下の設計としています：

1. **JSONB カラム**: `segments`, `action_items`, `key_points` などは柔軟なスキーマで保存
2. **ステータス管理**: `status` カラムで会議のライフサイクルを管理
3. **多言語対応**: `language` カラムで多言語サポート
4. **AIモデル追跡**: `model_used`, `tokens_used` でAIコスト管理
5. **共有機能**: `shared_meetings` で柔軟な共有設定

## 使用方法

### Migration の適用

Supabase ダッシュボードの SQL Editor で `001_create_meetings_tables.sql` を実行してください。

```sql
-- Supabase SQL Editor で実行
-- ファイル内容全体をコピー＆ペースト
```

### Storage バケット

音声ファイルを保存するために、Supabase Storage に `audio-recordings` バケットを作成してください。

バケット設定：
- 公開：非公開
- ファイルサイズ制限：100MB
- 許可される MIME タイプ：audio/*