export type MediaType = 'book' | 'movie' | 'tv' | 'article' | 'course' | 'podcast'

export type MediaStatus = 'planned' | 'in_progress' | 'completed' | 'paused' | 'dropped' | 'archived'

export type NoteType = 'note' | 'quote' | 'review' | 'reflection' | 'summary'

export interface MediaItem {
  id: string
  type: MediaType
  title: string
  original_title: string | null
  description: string | null
  cover_url: string | null
  creators: MediaCreator[]
  genres: string[]
  language: string | null
  release_date: string | null
  external_source: string | null
  external_id: string | null
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface MediaCreator {
  name: string
  role: string
}

export interface UserMediaItem {
  id: string
  user_id: string
  media_id: string
  status: MediaStatus
  priority: number
  progress_current: number
  progress_total: number | null
  progress_unit: string | null
  rating: number | null
  personal_note: string | null
  reason_to_consume: string | null
  started_at: string | null
  completed_at: string | null
  last_interacted_at: string | null
  is_favorite: boolean
  is_private: boolean
  created_at: string
  updated_at: string
  media?: MediaItem
}

export interface MediaNote {
  id: string
  user_id: string
  user_media_id: string
  type: NoteType
  content: string
  location_label: string | null
  page_number: number | null
  timestamp_seconds: number | null
  season_number: number | null
  episode_number: number | null
  ai_summary: string | null
  created_at: string
  updated_at: string
}

export interface Collection {
  id: string
  user_id: string
  name: string
  description: string | null
  icon: string | null
  color: string | null
  created_at: string
  updated_at: string
}

export interface CollectionItem {
  collection_id: string
  user_media_id: string
  position: number
  created_at: string
}

export interface ActivityLog {
  id: string
  user_id: string
  user_media_id: string | null
  action: string
  old_value: Record<string, unknown> | null
  new_value: Record<string, unknown> | null
  source: string
  created_at: string
}

export interface DashboardStats {
  total_items: number
  in_progress_count: number
  planned_count: number
  completed_count: number
  completed_this_week: number
  completed_this_month: number
  stale_count: number
  notes_count: number
}

export interface MediaSearchResult {
  source: string
  external_id: string
  title: string
  original_title?: string
  description?: string
  cover_url?: string
  creators: MediaCreator[]
  genres?: string[]
  language?: string
  release_date?: string
  metadata: Record<string, unknown>
}
