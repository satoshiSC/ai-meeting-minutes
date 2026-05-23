-- AI 議事録 SaaS の会議関連テーブル
-- migration: 001_create_meetings_tables

-- ==========================================
-- 会議テーブル
-- ==========================================
CREATE TABLE IF NOT EXISTS meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  audio_storage_path TEXT,
  audio_duration INTEGER, -- 秒単位
  audio_url TEXT, -- 公開URL（必要な場合）
  status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'recording', 'processing', 'completed', 'failed')),
  language VARCHAR(10) NOT NULL DEFAULT 'ja',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_meetings_user_id ON meetings(user_id);
CREATE INDEX idx_meetings_status ON meetings(status);
CREATE INDEX idx_meetings_created_at ON meetings(created_at DESC);
CREATE INDEX idx_meetings_user_created ON meetings(user_id, created_at DESC);

-- 全文検索用インデックス
CREATE INDEX idx_meetings_title_trgm ON meetings USING gin (title gin_trgm_ops);
CREATE INDEX idx_meetings_description_trgm ON meetings USING gin (description gin_trgm_ops);

-- 変更履歴自動更新トリガー
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_meetings_updated_at
  BEFORE UPDATE ON meetings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- 文字起こしテーブル
-- ==========================================
CREATE TABLE IF NOT EXISTS transcriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL UNIQUE REFERENCES meetings(id) ON DELETE CASCADE,
  full_text TEXT NOT NULL,
  segments JSONB NOT NULL DEFAULT '[]', -- [{ start: number, end: number, speaker_id: string, text: string }]
  language VARCHAR(10) NOT NULL DEFAULT 'ja',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_transcriptions_meeting_id ON transcriptions(meeting_id);

CREATE TRIGGER update_transcriptions_updated_at
  BEFORE UPDATE ON transcriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- 要約テーブル
-- ==========================================
CREATE TABLE IF NOT EXISTS summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL UNIQUE REFERENCES meetings(id) ON DELETE CASCADE,
  summary_text TEXT NOT NULL,
  action_items JSONB NOT NULL DEFAULT '[]', -- [{ id: string, text: string, assignee: string, due_date: string, completed: boolean }]
  key_points JSONB NOT NULL DEFAULT '[]', -- [{ text: string, importance: number }]
  model_used VARCHAR(50) NOT NULL DEFAULT 'gpt-4',
  tokens_used INTEGER NOT NULL DEFAULT 0,
  language VARCHAR(10) NOT NULL DEFAULT 'ja',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_summaries_meeting_id ON summaries(meeting_id);

CREATE TRIGGER update_summaries_updated_at
  BEFORE UPDATE ON summaries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- 参加者テーブル
-- ==========================================
CREATE TABLE IF NOT EXISTS participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  speaker_id TEXT, -- 音声認識の speaker_id
  name VARCHAR(100) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'participant' CHECK (role IN ('host', 'participant', 'observer')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(meeting_id, speaker_id)
);

CREATE INDEX idx_participants_meeting_id ON participants(meeting_id);

-- ==========================================
-- 共有テーブル
-- ==========================================
CREATE TABLE IF NOT EXISTS shared_meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  shared_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shared_with_email VARCHAR(255), -- ユーザー共有用
  share_token VARCHAR(255) UNIQUE, -- 公開リンク用
  permission VARCHAR(20) NOT NULL DEFAULT 'view' CHECK (permission IN ('view', 'comment', 'edit')),
  expires_at TIMESTAMPTZ, -- null=無期限
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_shared_meetings_meeting_id ON shared_meetings(meeting_id);
CREATE INDEX idx_shared_meetings_token ON shared_meetings(share_token);
CREATE INDEX idx_shared_meetings_email ON shared_meetings(shared_with_email);

-- ==========================================
-- Row Level Security (RLS) 設定
-- ==========================================

-- meetings テーブル
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ユーザーは自分の会議のみ閲覧可能"
  ON meetings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "ユーザーは自分の会議のみ作成可能"
  ON meetings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "ユーザーは自分の会議のみ更新可能"
  ON meetings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "ユーザーは自分の会議のみ削除可能"
  ON meetings FOR DELETE
  USING (auth.uid() = user_id);

-- transcriptions テーブル
ALTER TABLE transcriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ユーザーは自分の会議の文字起こしのみ閲覧可能"
  ON transcriptions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM meetings
      WHERE meetings.id = transcriptions.meeting_id
      AND meetings.user_id = auth.uid()
    )
  );

CREATE POLICY "ユーザーは自分の会議の文字起こしのみ作成可能"
  ON transcriptions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM meetings
      WHERE meetings.id = transcriptions.meeting_id
      AND meetings.user_id = auth.uid()
    )
  );

CREATE POLICY "ユーザーは自分の会議の文字起こしのみ更新可能"
  ON transcriptions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM meetings
      WHERE meetings.id = transcriptions.meeting_id
      AND meetings.user_id = auth.uid()
    )
  );

CREATE POLICY "ユーザーは自分の会議の文字起こしのみ削除可能"
  ON transcriptions FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM meetings
      WHERE meetings.id = transcriptions.meeting_id
      AND meetings.user_id = auth.uid()
    )
  );

-- summaries テーブル
ALTER TABLE summaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ユーザーは自分の会議の要約のみ閲覧可能"
  ON summaries FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM meetings
      WHERE meetings.id = summaries.meeting_id
      AND meetings.user_id = auth.uid()
    )
  );

CREATE POLICY "ユーザーは自分の会議の要約のみ作成可能"
  ON summaries FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM meetings
      WHERE meetings.id = summaries.meeting_id
      AND meetings.user_id = auth.uid()
    )
  );

CREATE POLICY "ユーザーは自分の会議の要約のみ更新可能"
  ON summaries FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM meetings
      WHERE meetings.id = summaries.meeting_id
      AND meetings.user_id = auth.uid()
    )
  );

CREATE POLICY "ユーザーは自分の会議の要約のみ削除可能"
  ON summaries FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM meetings
      WHERE meetings.id = summaries.meeting_id
      AND meetings.user_id = auth.uid()
    )
  );

-- participants テーブル
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ユーザーは自分の会議の参加者のみ閲覧可能"
  ON participants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM meetings
      WHERE meetings.id = participants.meeting_id
      AND meetings.user_id = auth.uid()
    )
  );

CREATE POLICY "ユーザーは自分の会議の参加者のみ作成可能"
  ON participants FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM meetings
      WHERE meetings.id = participants.meeting_id
      AND meetings.user_id = auth.uid()
    )
  );

CREATE POLICY "ユーザーは自分の会議の参加者のみ更新可能"
  ON participants FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM meetings
      WHERE meetings.id = participants.meeting_id
      AND meetings.user_id = auth.uid()
    )
  );

CREATE POLICY "ユーザーは自分の会議の参加者のみ削除可能"
  ON participants FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM meetings
      WHERE meetings.id = participants.meeting_id
      AND meetings.user_id = auth.uid()
    )
  );

-- shared_meetings テーブル
ALTER TABLE shared_meetings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ユーザーは自分の共有リンクのみ閲覧可能"
  ON shared_meetings FOR SELECT
  USING (
    shared_by = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM meetings
      WHERE meetings.id = shared_meetings.meeting_id
      AND meetings.user_id = auth.uid()
    )
  );

CREATE POLICY "ユーザーは自分の会議の共有リンクのみ作成可能"
  ON shared_meetings FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM meetings
      WHERE meetings.id = shared_meetings.meeting_id
      AND meetings.user_id = auth.uid()
    )
    AND shared_by = auth.uid()
  );

CREATE POLICY "ユーザーは自分の共有リンクのみ削除可能"
  ON shared_meetings FOR DELETE
  USING (
    shared_by = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM meetings
      WHERE meetings.id = shared_meetings.meeting_id
      AND meetings.user_id = auth.uid()
    )
  );

-- 公開リンク用のポリシー（認証なしで閲覧可能）
CREATE POLICY "公開リンクでの会議閲覧"
  ON meetings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM shared_meetings
      WHERE shared_meetings.meeting_id = meetings.id
      AND shared_meetings.share_token IS NOT NULL
      AND (shared_meetings.expires_at IS NULL OR shared_meetings.expires_at > NOW())
    )
  );

-- ==========================================
-- pg_trgm 拡張（全文検索用）
-- ==========================================
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ==========================================
-- 検索関数
-- ==========================================
CREATE OR REPLACE FUNCTION search_meetings(search_query TEXT, user_id_param UUID)
RETURNS SETOF meetings AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM meetings
  WHERE user_id = user_id_param
    AND (
      title ILIKE '%' || search_query || '%'
      OR description ILIKE '%' || search_query || '%'
    )
  ORDER BY created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- 統計情報更新
-- ==========================================
ANALYZE meetings;
ANALYZE transcriptions;
ANALYZE summaries;
ANALYZE participants;
ANALYZE shared_meetings;
