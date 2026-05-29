import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'

export function runMigrations(db: BetterSQLite3Database) {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      display_name TEXT,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `)

  db.run(`
    CREATE TABLE IF NOT EXISTS media_items (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      original_title TEXT,
      description TEXT,
      cover_url TEXT,
      creators TEXT DEFAULT '[]',
      genres TEXT DEFAULT '[]',
      language TEXT,
      release_date TEXT,
      external_source TEXT,
      external_id TEXT,
      metadata TEXT DEFAULT '{}',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE (external_source, external_id)
    )
  `)

  db.run(`
    CREATE TABLE IF NOT EXISTS user_media_items (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      media_id TEXT NOT NULL REFERENCES media_items(id) ON DELETE CASCADE,
      status TEXT NOT NULL DEFAULT 'planned',
      priority INTEGER DEFAULT 3,
      progress_current REAL DEFAULT 0,
      progress_total REAL,
      progress_unit TEXT,
      rating REAL,
      personal_note TEXT,
      reason_to_consume TEXT,
      started_at TEXT,
      completed_at TEXT,
      last_interacted_at TEXT,
      is_favorite INTEGER DEFAULT 0,
      is_private INTEGER DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE (user_id, media_id)
    )
  `)

  db.run(`
    CREATE TABLE IF NOT EXISTS media_notes (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      user_media_id TEXT NOT NULL REFERENCES user_media_items(id) ON DELETE CASCADE,
      type TEXT NOT NULL DEFAULT 'note',
      content TEXT NOT NULL,
      location_label TEXT,
      page_number INTEGER,
      timestamp_seconds INTEGER,
      season_number INTEGER,
      episode_number INTEGER,
      ai_summary TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `)

  db.run(`
    CREATE TABLE IF NOT EXISTS collections (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      description TEXT,
      icon TEXT,
      color TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `)

  db.run(`
    CREATE TABLE IF NOT EXISTS collection_items (
      collection_id TEXT NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
      user_media_id TEXT NOT NULL REFERENCES user_media_items(id) ON DELETE CASCADE,
      position INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      PRIMARY KEY (collection_id, user_media_id)
    )
  `)

  db.run(`
    CREATE TABLE IF NOT EXISTS activity_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      user_media_id TEXT REFERENCES user_media_items(id) ON DELETE SET NULL,
      action TEXT NOT NULL,
      old_value TEXT,
      new_value TEXT,
      source TEXT DEFAULT 'web',
      created_at TEXT NOT NULL
    )
  `)

  db.run(`
    CREATE TABLE IF NOT EXISTS jarvis_tool_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      tool_name TEXT NOT NULL,
      input TEXT,
      output TEXT,
      status TEXT NOT NULL DEFAULT 'success',
      error_message TEXT,
      created_at TEXT NOT NULL
    )
  `)

  db.run(`
    CREATE TABLE IF NOT EXISTS jarvis_api_tokens (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      token_hash TEXT NOT NULL,
      can_read INTEGER DEFAULT 1,
      can_write INTEGER DEFAULT 0,
      can_delete INTEGER DEFAULT 0,
      last_used_at TEXT,
      expires_at TEXT,
      created_at TEXT NOT NULL
    )
  `)

  // Indexes
  db.run(`CREATE INDEX IF NOT EXISTS idx_user_media_user_id ON user_media_items(user_id)`)
  db.run(`CREATE INDEX IF NOT EXISTS idx_user_media_status ON user_media_items(status)`)
  db.run(`CREATE INDEX IF NOT EXISTS idx_user_media_last_interacted ON user_media_items(last_interacted_at)`)
  db.run(`CREATE INDEX IF NOT EXISTS idx_media_notes_user_id ON media_notes(user_id)`)
  db.run(`CREATE INDEX IF NOT EXISTS idx_media_notes_user_media_id ON media_notes(user_media_id)`)
  db.run(`CREATE INDEX IF NOT EXISTS idx_collections_user_id ON collections(user_id)`)
  db.run(`CREATE INDEX IF NOT EXISTS idx_collection_items_user_media ON collection_items(user_media_id)`)
  db.run(`CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id)`)
  db.run(`CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at)`)
  db.run(`CREATE INDEX IF NOT EXISTS idx_jarvis_tool_logs_user_id ON jarvis_tool_logs(user_id)`)
  db.run(`CREATE INDEX IF NOT EXISTS idx_jarvis_api_tokens_user_id ON jarvis_api_tokens(user_id)`)
  db.run(`CREATE INDEX IF NOT EXISTS idx_jarvis_api_tokens_hash ON jarvis_api_tokens(token_hash)`)
}
