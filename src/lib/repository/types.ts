import type {
  MediaType,
  MediaStatus,
  MediaItem,
  UserMediaItem,
  MediaNote,
  NoteType,
  Collection,
  CollectionItem,
  ActivityLog,
  DashboardStats,
} from '@/types/media'

export interface SearchFilters {
  type?: MediaType
  status?: MediaStatus
  query?: string
  genre?: string
  rating?: number
  limit?: number
  offset?: number
}

export interface MediaRepository {
  searchUserMedia(userId: string, filters: SearchFilters): Promise<UserMediaItem[]>
  getUserMediaById(userId: string, userMediaId: string): Promise<UserMediaItem | null>
  addMediaToLibrary(
    userId: string,
    mediaData: {
      type: MediaType
      title: string
      original_title?: string
      description?: string
      cover_url?: string
      creators?: { name: string; role: string }[]
      genres?: string[]
      language?: string
      release_date?: string
      external_source?: string
      external_id?: string
      metadata?: Record<string, unknown>
    },
    userData?: {
      status?: MediaStatus
      priority?: number
      reason_to_consume?: string
    }
  ): Promise<UserMediaItem>
  addManualMedia(
    userId: string,
    data: {
      type: MediaType
      title: string
      original_title?: string
      description?: string
      cover_url?: string
      creators?: { name: string; role: string }[]
      genres?: string[]
      language?: string
      release_date?: string
      metadata?: Record<string, unknown>
      status?: MediaStatus
      priority?: number
    }
  ): Promise<UserMediaItem>
  updateMediaStatus(userId: string, userMediaId: string, status: MediaStatus): Promise<UserMediaItem>
  updateMediaProgress(
    userId: string,
    userMediaId: string,
    progress: { current: number; total?: number; unit?: string }
  ): Promise<UserMediaItem>
  updateMediaRating(userId: string, userMediaId: string, rating: number | null): Promise<UserMediaItem>
  updateMediaPriority(userId: string, userMediaId: string, priority: number): Promise<UserMediaItem>
  toggleFavorite(userId: string, userMediaId: string): Promise<UserMediaItem>
  removeMediaFromLibrary(userId: string, userMediaId: string): Promise<void>
  getCurrentMedia(userId: string, type?: MediaType): Promise<UserMediaItem[]>
  getStaleMedia(userId: string): Promise<UserMediaItem[]>
  getRecentlyAddedMedia(userId: string, limit?: number): Promise<UserMediaItem[]>
  findUserMediaByTitle(userId: string, title: string): Promise<UserMediaItem[]>
}

export interface NotesRepository {
  addMediaNote(
    userId: string,
    data: {
      user_media_id: string
      type?: NoteType
      content: string
      location_label?: string
      page_number?: number
      timestamp_seconds?: number
      season_number?: number
      episode_number?: number
    }
  ): Promise<MediaNote>
  updateMediaNote(
    userId: string,
    noteId: string,
    data: {
      content?: string
      type?: NoteType
      location_label?: string
      page_number?: number
      timestamp_seconds?: number
      season_number?: number
      episode_number?: number
    }
  ): Promise<MediaNote>
  deleteMediaNote(userId: string, noteId: string): Promise<void>
  getNotesByUserMediaId(userId: string, userMediaId: string): Promise<MediaNote[]>
  getRecentNotes(userId: string, limit?: number): Promise<MediaNote[]>
  getNotesByType(userId: string, type: NoteType): Promise<MediaNote[]>
}

export interface CollectionsRepository {
  createCollection(
    userId: string,
    data: { name: string; description?: string; icon?: string; color?: string }
  ): Promise<Collection>
  updateCollection(
    userId: string,
    collectionId: string,
    data: { name?: string; description?: string; icon?: string; color?: string }
  ): Promise<Collection>
  deleteCollection(userId: string, collectionId: string): Promise<void>
  getCollections(userId: string): Promise<Collection[]>
  getCollectionById(userId: string, collectionId: string): Promise<(Collection & { items?: UserMediaItem[] }) | null>
  addMediaToCollection(userId: string, collectionId: string, userMediaId: string): Promise<CollectionItem>
  removeMediaFromCollection(userId: string, collectionId: string, userMediaId: string): Promise<void>
  getCollectionIdsForMedia(userId: string, userMediaId: string): Promise<Set<string>>
  getMediaTitlesByIds(userId: string, mediaIds: string[]): Promise<Record<string, string>>
}

export interface StatsRepository {
  getDashboardStats(userId: string): Promise<DashboardStats>
  getMediaTypeDistribution(userId: string): Promise<Record<MediaType, number>>
  getTagDistribution(userId: string): Promise<{ tag: string; count: number }[]>
  getCompletionRate(userId: string): Promise<{ total: number; completed: number; rate: number }>
}

export interface ActivityRepository {
  logActivity(
    userId: string,
    data: {
      action: string
      user_media_id?: string
      old_value?: Record<string, unknown>
      new_value?: Record<string, unknown>
      source?: string
    }
  ): Promise<ActivityLog>
  getRecentActivity(userId: string, limit?: number): Promise<ActivityLog[]>
  getActivityByRange(userId: string, startDate: string, endDate: string): Promise<ActivityLog[]>
}

export interface JarvisRepository {
  createToken(
    userId: string,
    data: {
      name: string
      tokenHash: string
      can_read?: boolean
      can_write?: boolean
      can_delete?: boolean
    }
  ): Promise<void>
  getTokens(userId: string): Promise<{
    id: string
    name: string
    can_read: boolean
    can_write: boolean
    can_delete: boolean
    last_used_at: string | null
    expires_at: string | null
    created_at: string
  }[]>
  deleteToken(userId: string, tokenId: string): Promise<void>
  verifyToken(tokenHash: string): Promise<{
    userId: string
    permissions: { can_read: boolean; can_write: boolean; can_delete: boolean }
    expires_at: string | null
  } | null>
  updateTokenLastUsed(tokenHash: string): Promise<void>
  logToolCall(
    userId: string,
    toolName: string,
    input: Record<string, unknown>,
    output: Record<string, unknown> | null,
    status?: 'success' | 'error',
    errorMessage?: string
  ): Promise<void>
  getToolLogs(userId: string, limit?: number): Promise<{
    id: string
    user_id: string
    tool_name: string
    input: Record<string, unknown> | null
    output: Record<string, unknown> | null
    status: string
    error_message: string | null
    created_at: string
  }[]>
}
