-- 文字起こしテーブル
CREATE TABLE IF NOT EXISTS transcriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  full_text TEXT NOT NULL,
  segments JSONB NOT NULL DEFAULT '[]',
  language VARCHAR(10) NOT NULL DEFAULT 'ja',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(meeting_id)
);

-- 要約テーブル
CREATE TABLE IF NOT EXISTS summaries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  summary_text TEXT NOT NULL,
  action_items JSONB NOT NULL DEFAULT '[]',
  key_points JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(meeting_id)
);

-- RLS ポリシー（transcriptions）
ALTER TABLE transcriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ユーザーは自分の会議の文字起こしを閲覧できる"
  ON transcriptions FOR SELECT
  USING (
    meeting_id IN (
      SELECT id FROM meetings WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "ユーザーは自分の会議の文字起こしを作成できる"
  ON transcriptions FOR INSERT
  WITH CHECK (
    meeting_id IN (
      SELECT id FROM meetings WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "ユーザーは自分の会議の文字起こしを更新できる"
  ON transcriptions FOR UPDATE
  USING (
    meeting_id IN (
      SELECT id FROM meetings WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "ユーザーは自分の会議の文字起こしを削除できる"
  ON transcriptions FOR DELETE
  USING (
    meeting_id IN (
      SELECT id FROM meetings WHERE user_id = auth.uid()
    )
  );

-- RLS ポリシー（summaries）
ALTER TABLE summaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ユーザーは自分の会議の要約を閲覧できる"
  ON summaries FOR SELECT
  USING (
    meeting_id IN (
      SELECT id FROM meetings WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "ユーザーは自分の会議の要約を作成できる"
  ON summaries FOR INSERT
  WITH CHECK (
    meeting_id IN (
      SELECT id FROM meetings WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "ユーザーは自分の会議の要約を更新できる"
  ON summaries FOR UPDATE
  USING (
    meeting_id IN (
      SELECT id FROM meetings WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "ユーザーは自分の会議の要約を削除できる"
  ON summaries FOR DELETE
  USING (
    meeting_id IN (
      SELECT id FROM meetings WHERE user_id = auth.uid()
    )
  );

-- インデックス
CREATE INDEX IF NOT EXISTS idx_transcriptions_meeting_id ON transcriptions(meeting_id);
CREATE INDEX IF NOT EXISTS idx_summaries_meeting_id ON summaries(meeting_id);
