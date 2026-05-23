# テストデータのセットアップ手順

## 1. Supabase プロジェクトの作成

1. [Supabase Dashboard](https://app.supabase.com) にアクセス
2. 「New Project」をクリック
3. プロジェクト名: `ai-meeting-minutes`
4. データベースパスワードを設定（必ず保存）
5. Region: Tokyo または任意のリージョン
6. 「Create new project」をクリック

## 2. 環境変数の設定

`.env.local` を編集：

```bash
# Supabase プロジェクト設定
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

上記の値は Supabase ダッシュボード > Settings > API で確認できます。

## 3. テーブル作成

Supabase ダッシュボード > SQL Editor で以下のファイルを順に実行：

1. `supabase/migrations/001_create_meetings_tables.sql` - 会議関連テーブル作成
2. `supabase/migrations/002_storage_policies.sql` - Storage 設定

## 4. テストアカウントの作成

### 方法A: Supabase ダッシュボードから作成

1. Supabase ダッシュボード > Authentication > Users へ移動
2. 「Invite user」または「Add user」をクリック
3. 以下の情報を入力：

| 項目 | 値 |
|------|-----|
| Email | `test@example.com` |
| Password | `password123` |
| Email confirm | ✅ 不要（確認済みにする） |

または、Sign-up ページから新規登録：

1. ブラウザで http://localhost:3000/signup にアクセス
2. 以下の情報を入力：
   - メールアドレス: `test@example.com`
   - パスワード: `password123`

### 方法B: Supabase SQL Editor から作成（ダッシュボードで確認するほうが簡単）

## 5. テスト会議データの投入

テストアカウント作成後、Supabase SQL Editor で以下を実行：

```sql
-- まず、作成したユーザーのIDを確認
SELECT id, email FROM auth.users;

-- 確認したユーザーIDを使って会議データを投入
INSERT INTO meetings (user_id, title, description, status, language, created_at) VALUES
('＜確認したユーザーID＞', '第2四半期 プロジェクト進捗会議', '各チームの進捗状況確認と今後のスケジュール調整', 'completed', 'ja', NOW() - INTERVAL '2 days'),
('＜確認したユーザーID＞', 'UI/UX改善ミーティング', 'ユーザーフィードバックに基づく改善点の議論', 'completed', 'ja', NOW() - INTERVAL '5 days'),
('＜確認したユーザーID＞', '週次チームミーティング', '今週のタスク確認と来週の計画', 'draft', 'ja', NOW() - INTERVAL '1 hour'),
('＜確認したユーザーID＞', '新機能要件定義', '次期バージョンの機能要件を定義する', 'processing', 'ja', NOW() - INTERVAL '1 day'),
('＜確認したユーザーID＞', 'セキュリティ監査キックオフ', '外部ベンダーとのセキュリティ監査の初回打ち合わせ', 'draft', 'ja', NOW());

-- 確認
SELECT * FROM meetings ORDER BY created_at DESC;
```

## 6. 動作確認

1. 開発サーバー起動: `npm run dev`
2. http://localhost:3000 にアクセス
3. 「ログイン」から `test@example.com` / `password123` でログイン
4. ダッシュボードが表示され、会議一覧が確認できることを確認

## トラブルシューティング

| 問題 | 解決方法 |
|------|----------|
| ログインできない | Supabase > Authentication > Settings で Email 認証が有効か確認 |
| 会議が表示されない | RLS ポリシーが正しく設定されているか確認 |
| 500エラー | 開発サーバーのターミナル出力を確認、環境変数が正しいか確認 |