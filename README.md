# AI 議事録 SaaS

会議の音声から自動的に議事録を生成する AI 搭載 SaaS アプリケーション。

## 技術スタック

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **Backend**: Supabase (Auth, Database, Storage)
- **AI**: OpenAI API (Whisper, GPT-4)

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
```

#### 2. Supabase プロジェクトの作成

1. [Supabase](https://supabase.com) でアカウントを作成
2. 新規プロジェクトを作成
3. Authentication → Providers で Google OAuth を有効化
4. 取得した URL とキーを `.env.local` に設定

#### 3. 開発サーバーの起動

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

## ライセンス

MIT