import type { MediaType, MediaStatus, NoteType } from './media'

export interface JarvisTokenPayload {
  userId: string
  permissions: {
    can_read: boolean
    can_write: boolean
    can_delete: boolean
  }
}

export interface JarvisApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
  }
}

export interface GetCurrentMediaInput {
  type?: MediaType
}

export interface AddMediaToLibraryInput {
  type: MediaType
  title: string
  status?: MediaStatus
  reason_to_consume?: string
  priority?: number
}

export interface UpdateMediaProgressInput {
  user_media_id?: string
  title?: string
  progress_current: number
  progress_total?: number
  progress_unit: string
  season_number?: number
  episode_number?: number
}

export interface UpdateMediaStatusInput {
  user_media_id?: string
  title?: string
  status: MediaStatus
}

export interface AddMediaNoteInput {
  user_media_id?: string
  title?: string
  type?: NoteType
  content: string
  page_number?: number
  timestamp_seconds?: number
  season_number?: number
  episode_number?: number
}

export interface GetMediaStatsInput {
  range: 'today' | 'week' | 'month' | 'year'
  type?: MediaType
}

export interface RecommendNextMediaInput {
  type?: MediaType
  mood?: string
  goal?: string
  time_available_minutes?: number
}
