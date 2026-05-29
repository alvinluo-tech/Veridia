import { sqliteTable, text, integer, real, primaryKey } from 'drizzle-orm/sqlite-core'

// ============================================================
// USERS (local auth only)
// ============================================================

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  display_name: text('display_name'),
  password_hash: text('password_hash').notNull(),
  created_at: text('created_at').notNull(),
  updated_at: text('updated_at').notNull(),
})

// ============================================================
// MEDIA ITEMS
// ============================================================

export const mediaItems = sqliteTable('media_items', {
  id: text('id').primaryKey(),
  type: text('type').notNull(), // book, movie, tv, article, course, podcast
  title: text('title').notNull(),
  original_title: text('original_title'),
  description: text('description'),
  cover_url: text('cover_url'),
  creators: text('creators').default('[]'), // JSON string
  genres: text('genres').default('[]'), // JSON array string
  language: text('language'),
  release_date: text('release_date'),
  external_source: text('external_source'),
  external_id: text('external_id'),
  metadata: text('metadata').default('{}'), // JSON string
  created_at: text('created_at').notNull(),
  updated_at: text('updated_at').notNull(),
})

// ============================================================
// USER MEDIA ITEMS
// ============================================================

export const userMediaItems = sqliteTable('user_media_items', {
  id: text('id').primaryKey(),
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  media_id: text('media_id').notNull().references(() => mediaItems.id, { onDelete: 'cascade' }),
  status: text('status').notNull().default('planned'),
  priority: integer('priority').default(3),
  progress_current: real('progress_current').default(0),
  progress_total: real('progress_total'),
  progress_unit: text('progress_unit'),
  rating: real('rating'),
  personal_note: text('personal_note'),
  reason_to_consume: text('reason_to_consume'),
  started_at: text('started_at'),
  completed_at: text('completed_at'),
  last_interacted_at: text('last_interacted_at'),
  is_favorite: integer('is_favorite', { mode: 'boolean' }).default(false),
  is_private: integer('is_private', { mode: 'boolean' }).default(true),
  created_at: text('created_at').notNull(),
  updated_at: text('updated_at').notNull(),
})

// ============================================================
// MEDIA NOTES
// ============================================================

export const mediaNotes = sqliteTable('media_notes', {
  id: text('id').primaryKey(),
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  user_media_id: text('user_media_id').notNull().references(() => userMediaItems.id, { onDelete: 'cascade' }),
  type: text('type').notNull().default('note'),
  content: text('content').notNull(),
  location_label: text('location_label'),
  page_number: integer('page_number'),
  timestamp_seconds: integer('timestamp_seconds'),
  season_number: integer('season_number'),
  episode_number: integer('episode_number'),
  ai_summary: text('ai_summary'),
  created_at: text('created_at').notNull(),
  updated_at: text('updated_at').notNull(),
})

// ============================================================
// COLLECTIONS
// ============================================================

export const collections = sqliteTable('collections', {
  id: text('id').primaryKey(),
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  icon: text('icon'),
  color: text('color'),
  created_at: text('created_at').notNull(),
  updated_at: text('updated_at').notNull(),
})

// ============================================================
// COLLECTION ITEMS
// ============================================================

export const collectionItems = sqliteTable('collection_items', {
  collection_id: text('collection_id').notNull().references(() => collections.id, { onDelete: 'cascade' }),
  user_media_id: text('user_media_id').notNull().references(() => userMediaItems.id, { onDelete: 'cascade' }),
  position: integer('position').default(0),
  created_at: text('created_at').notNull(),
}, (t) => ({
  pk: primaryKey({ columns: [t.collection_id, t.user_media_id] }),
}))

// ============================================================
// ACTIVITY LOGS
// ============================================================

export const activityLogs = sqliteTable('activity_logs', {
  id: text('id').primaryKey(),
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  user_media_id: text('user_media_id').references(() => userMediaItems.id, { onDelete: 'set null' }),
  action: text('action').notNull(),
  old_value: text('old_value'), // JSON string
  new_value: text('new_value'), // JSON string
  source: text('source').default('web'),
  created_at: text('created_at').notNull(),
})

// ============================================================
// JARVIS TOOL LOGS
// ============================================================

export const jarvisToolLogs = sqliteTable('jarvis_tool_logs', {
  id: text('id').primaryKey(),
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  tool_name: text('tool_name').notNull(),
  input: text('input'), // JSON string
  output: text('output'), // JSON string
  status: text('status').notNull().default('success'),
  error_message: text('error_message'),
  created_at: text('created_at').notNull(),
})

// ============================================================
// JARVIS API TOKENS
// ============================================================

export const jarvisApiTokens = sqliteTable('jarvis_api_tokens', {
  id: text('id').primaryKey(),
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  token_hash: text('token_hash').notNull(),
  can_read: integer('can_read', { mode: 'boolean' }).default(true),
  can_write: integer('can_write', { mode: 'boolean' }).default(false),
  can_delete: integer('can_delete', { mode: 'boolean' }).default(false),
  last_used_at: text('last_used_at'),
  expires_at: text('expires_at'),
  created_at: text('created_at').notNull(),
})
