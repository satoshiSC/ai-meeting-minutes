-- Storage バケットと RLS ポリシー
-- migration: 002_storage_policies

-- ==========================================
-- Storage バケット作成
-- ==========================================
-- 注意: Supabase ダッシュボードからバケットを作成する場合はこのセクションは不要です
-- SQL で作成する場合は以下を実行してください

-- バケット作成（存在しない場合のみ）
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'audio-recordings',
  'audio-recordings',
  false,
  26214400, -- 25MB
  ARRAY['audio/mpeg', 'audio/wav', 'audio/x-m4a', 'audio/mp4']
)
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- Storage RLS ポリシー
-- ==========================================

-- audio-recordings バケットの RLS を有効化
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- ユーザーは自分のディレクトリのみ閲覧可能
CREATE POLICY "ユーザーは自分の音声ファイルのみ閲覧可能"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'audio-recordings'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- ユーザーは自分のディレクトリにのみアップロード可能
CREATE POLICY "ユーザーは自分のディレクトリにのみ音声ファイルをアップロード可能"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'audio-recordings'
  AND (storage.foldername(name))[1] = auth.uid()::text
  AND (
    name ~ '.*\.(mp3|wav|m4a)$' -- 拡張子チェック
  )
);

-- ユーザーは自分のファイルのみ更新可能
CREATE POLICY "ユーザーは自分の音声ファイルのみ更新可能"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'audio-recordings'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- ユーザーは自分のファイルのみ削除可能
CREATE POLICY "ユーザーは自分の音声ファイルのみ削除可能"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'audio-recordings'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- ==========================================
-- Storage 関数
-- ==========================================

-- ユーザーの音声ファイル一覧を取得する関数
CREATE OR REPLACE FUNCTION get_user_audio_files()
RETURNS TABLE (
  name text,
  metadata jsonb,
  created_at timestamptz,
  updated_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    storage.objects.name,
    storage.objects.metadata,
    storage.objects.created_at,
    storage.objects.updated_at
  FROM storage.objects
  WHERE storage.objects.bucket_id = 'audio-recordings'
    AND (storage.foldername(storage.objects.name))[1] = auth.uid()::text;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;