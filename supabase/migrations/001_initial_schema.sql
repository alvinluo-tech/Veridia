-- Veridia Initial Schema
-- Supabase Postgres Migration

-- ============================================================
-- ENUM TYPES
-- ============================================================

CREATE TYPE media_type AS ENUM (
  'book',
  'movie',
  'tv',
  'article',
  'course',
  'podcast'
);

CREATE TYPE media_status AS ENUM (
  'planned',
  'in_progress',
  'completed',
  'paused',
  'dropped',
  'archived'
);

CREATE TYPE note_type AS ENUM (
  'note',
  'quote',
  'review',
  'reflection',
  'summary'
);

-- ============================================================
-- MEDIA ITEMS (public metadata about a book/movie/show)
-- ============================================================

CREATE TABLE media_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type media_type NOT NULL,
  title TEXT NOT NULL,
  original_title TEXT,
  description TEXT,
  cover_url TEXT,
  creators JSONB DEFAULT '[]'::jsonb,
  genres TEXT[] DEFAULT '{}',
  language TEXT,
  release_date DATE,
  external_source TEXT,
  external_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (external_source, external_id)
);

CREATE INDEX idx_media_items_type ON media_items(type);
CREATE INDEX idx_media_items_title ON media_items USING gin(title gin_trgm_ops);
CREATE INDEX idx_media_items_genres ON media_items USING gin(genres);

-- ============================================================
-- USER MEDIA ITEMS (user's relationship with a media item)
-- ============================================================

CREATE TABLE user_media_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  media_id UUID NOT NULL REFERENCES media_items(id) ON DELETE CASCADE,
  status media_status NOT NULL DEFAULT 'planned',
  priority INT DEFAULT 3,
  progress_current NUMERIC DEFAULT 0,
  progress_total NUMERIC,
  progress_unit TEXT,
  rating NUMERIC,
  personal_note TEXT,
  reason_to_consume TEXT,
  started_at DATE,
  completed_at DATE,
  last_interacted_at TIMESTAMPTZ,
  is_favorite BOOLEAN DEFAULT false,
  is_private BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, media_id)
);

CREATE INDEX idx_user_media_user_id ON user_media_items(user_id);
CREATE INDEX idx_user_media_status ON user_media_items(status);
CREATE INDEX idx_user_media_last_interacted ON user_media_items(last_interacted_at DESC);

-- ============================================================
-- MEDIA NOTES
-- ============================================================

CREATE TABLE media_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_media_id UUID NOT NULL REFERENCES user_media_items(id) ON DELETE CASCADE,
  type note_type NOT NULL DEFAULT 'note',
  content TEXT NOT NULL,
  location_label TEXT,
  page_number INT,
  timestamp_seconds INT,
  season_number INT,
  episode_number INT,
  ai_summary TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_media_notes_user_id ON media_notes(user_id);
CREATE INDEX idx_media_notes_user_media_id ON media_notes(user_media_id);

-- ============================================================
-- COLLECTIONS
-- ============================================================

CREATE TABLE collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_collections_user_id ON collections(user_id);

-- ============================================================
-- COLLECTION ITEMS (many-to-many)
-- ============================================================

CREATE TABLE collection_items (
  collection_id UUID REFERENCES collections(id) ON DELETE CASCADE,
  user_media_id UUID REFERENCES user_media_items(id) ON DELETE CASCADE,
  position INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (collection_id, user_media_id)
);

CREATE INDEX idx_collection_items_user_media ON collection_items(user_media_id);

-- ============================================================
-- ACTIVITY LOGS
-- ============================================================

CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_media_id UUID REFERENCES user_media_items(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  old_value JSONB,
  new_value JSONB,
  source TEXT DEFAULT 'web',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at DESC);

-- ============================================================
-- JARVIS TOOL LOGS
-- ============================================================

CREATE TABLE jarvis_tool_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tool_name TEXT NOT NULL,
  input JSONB,
  output JSONB,
  status TEXT NOT NULL DEFAULT 'success',
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_jarvis_tool_logs_user_id ON jarvis_tool_logs(user_id);

-- ============================================================
-- JARVIS API TOKENS
-- ============================================================

CREATE TABLE jarvis_api_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  token_hash TEXT NOT NULL,
  can_read BOOLEAN DEFAULT true,
  can_write BOOLEAN DEFAULT false,
  can_delete BOOLEAN DEFAULT false,
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_jarvis_api_tokens_user_id ON jarvis_api_tokens(user_id);
CREATE INDEX idx_jarvis_api_tokens_hash ON jarvis_api_tokens(token_hash);

-- ============================================================
-- RLS POLICIES
-- ============================================================

-- media_items: public read, service role write
ALTER TABLE media_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view media items"
  ON media_items FOR SELECT
  USING (true);

CREATE POLICY "Service role can insert media items"
  ON media_items FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can update media items"
  ON media_items FOR UPDATE
  USING (true);

-- user_media_items
ALTER TABLE user_media_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own media records"
  ON user_media_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own media records"
  ON user_media_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own media records"
  ON user_media_items FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own media records"
  ON user_media_items FOR DELETE
  USING (auth.uid() = user_id);

-- media_notes
ALTER TABLE media_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notes"
  ON media_notes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notes"
  ON media_notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notes"
  ON media_notes FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notes"
  ON media_notes FOR DELETE
  USING (auth.uid() = user_id);

-- collections
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own collections"
  ON collections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own collections"
  ON collections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own collections"
  ON collections FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own collections"
  ON collections FOR DELETE
  USING (auth.uid() = user_id);

-- collection_items (via collection ownership)
ALTER TABLE collection_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own collection items"
  ON collection_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM collections
      WHERE collections.id = collection_items.collection_id
      AND collections.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own collection items"
  ON collection_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM collections
      WHERE collections.id = collection_items.collection_id
      AND collections.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own collection items"
  ON collection_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM collections
      WHERE collections.id = collection_items.collection_id
      AND collections.user_id = auth.uid()
    )
  );

-- activity_logs
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own activity logs"
  ON activity_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activity logs"
  ON activity_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- jarvis_tool_logs
ALTER TABLE jarvis_tool_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own jarvis tool logs"
  ON jarvis_tool_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own jarvis tool logs"
  ON jarvis_tool_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- jarvis_api_tokens
ALTER TABLE jarvis_api_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own jarvis api tokens"
  ON jarvis_api_tokens FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own jarvis api tokens"
  ON jarvis_api_tokens FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own jarvis api tokens"
  ON jarvis_api_tokens FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own jarvis api tokens"
  ON jarvis_api_tokens FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_media_items_updated_at
  BEFORE UPDATE ON media_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_media_items_updated_at
  BEFORE UPDATE ON user_media_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_media_notes_updated_at
  BEFORE UPDATE ON media_notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_collections_updated_at
  BEFORE UPDATE ON collections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
