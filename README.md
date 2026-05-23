# AI 議事録 SaaS

会議の音声から自動的に議事録を生成する AI 搭載 SaaS アプリケーション。

## 技術スタック

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **Backend**: Supabase (Auth, Database, Storage)
- **AI**: Groq API（無料）- Whisper（文字起こし）、Llama 3.3（要約）

## 認証機能

### 実装済み機能

- [x] メール/パスワード認証
- [x] Google OAuth 認証
- [x] セッション管理（ミドルウェア）
- [x] 認証ルート保護
- [x] ユーザープロフィール表示

### セットアップ方法

#### 1. 環境変数の設定

`.env.local.example` をコピーして `.env.local` を作成し、Supabase の認証情報を設定してください。

```bash
cp .env.local.example .env.local
```

```env
# Supabase プロジェクト設定
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Groq API キー（無料）
GROQ_API_KEY=your-groq-api-key
```

#### 2. Supabase プロジェクトの作成

1. [Supabase](https://supabase.com) でアカウントを作成
2. 新規プロジェクトを作成
3. Authentication → Providers で Google OAuth を有効化
4. 取得した URL とキーを `.env.local` に設定
5. `supabase/migrations/` 内のSQLをSupabase SQL Editorで実行

#### 3. Groq API キーの取得

1. [Groq Console](https://console.groq.com) でアカウントを作成（無料）
2. API Keys ページで新しいキーを作成
3. `.env.local` の `GROQ_API_KEY` に設定

#### 4. 開発サーバーの起動

```bash
npm install
npm run dev
```

[http://localhost:3000](http://localhost:3000) でアプリケーションにアクセスできます。

## ディレクトリ構成

```
src/
├── app/                          # App Router ページ
│   ├── (auth)/                   # 認証ページ（ログイン・サインアップ）
│   ├── (dashboard)/              # ダッシュボードページ（認証必要）
│   └── auth/                     # OAuth コールバック
├── features/                     # 機能別モジュール
│   ├── ai/                       # AI処理（文字起こし・要約）
│   ├── audio/                    # 音声ファイル管理
│   ├── summaries/                # 要約表示
│   ├── transcriptions/           # 文字起こし表示
│   └── auth/
│       ├── actions/              # Server Actions
│       ├── components/           # UI コンポーネント
│       └── hooks/                # カスタムフック
├── lib/                          # ユーティリティ
│   ├── supabase/                 # Supabase クライアント
│   ├── types/                    # TypeScript 型定義
│   └── validations/              # バリデーションロジック
└── middleware.ts                 # 認証ミドルウェア
```

## 認証フロー

### メール/パスワード認証

1. ユーザーがログインフォームに情報を入力
2. Server Action が Supabase Auth にリクエスト
3. セッションが作成され、ダッシュボードへリダイレクト

### Google OAuth 認証

1. ユーザーが「Google でログイン」をクリック
2. Server Action が OAuth 開始 URL を返す
3. ユーザーが Google で認証
4. `/auth/callback` にリダイレクトされ、セッションが作成
5. ダッシュボードへリダイレクト

## セキュリティ

- **Row Level Security (RLS)**: Supabase で RLS を有効化
- **Middleware**: 保護されたルートへのアクセスを検証
- **Server Actions**: サーバーサイドでのみ認証情報を処理
- **CSRF 保護**: Next.js のデフォルト保護を有効化

## 開発ルール

- TypeScript strict mode を有効化
- `any` 型の使用を禁止
- 1 ファイル 300 行以内を遵守
- Server Component を優先
- 日本語コメントを使用

## AI 機能

### 文字起こし

- Groq の Whisper Large V3 を使用（無料）
- 日本語に最適化
- タイムスタンプ付きセグメントで表示

### 要約

- Groq の Llama 3.3 70B を使用（無料）
- 会議の概要、重要ポイント、アクションアイテムを自動抽出

### 処理フロー

1. 会議を作成
2. 音声ファイルをアップロード
3. 「AI で文字起こし・要約する」ボタンをクリック
4. 自動的に文字起こし → 要約が生成される

## ライセンス

MIT