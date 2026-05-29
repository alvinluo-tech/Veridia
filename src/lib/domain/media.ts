import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  MediaType,
  MediaStatus,
  MediaItem,
  UserMediaItem,
  MediaSearchResult,
} from '@/types/media'

interface SearchFilters {
  type?: MediaType
  status?: MediaStatus
  query?: string
  genre?: string
  rating?: number
  limit?: number
  offset?: number
}

export async function searchUserMedia(
  supabase: SupabaseClient,
  userId: string,
  filters: SearchFilters
): Promise<UserMediaItem[]> {
  let query = supabase
    .from('user_media_items')
    .select('*, media:media_items(*)')
    .eq('user_id', userId)
    .order('last_interacted_at', { ascending: false, nullsFirst: false })

  if (filters.type) {
    query = query.eq('media.type', filters.type)
  }
  if (filters.status) {
    query = query.eq('status', filters.status)
  }
  if (filters.query) {
    query = query.or(
      `media.title.ilike.%${filters.query}%,media.original_title.ilike.%${filters.query}%`
    )
  }
  if (filters.limit) {
    query = query.range(
      filters.offset ?? 0,
      (filters.offset ?? 0) + filters.limit - 1
    )
  }

  const { data, error } = await query
  if (error) throw error
  return data as UserMediaItem[]
}

export async function getUserMediaById(
  supabase: SupabaseClient,
  userId: string,
  userMediaId: string
): Promise<UserMediaItem | null> {
  const { data, error } = await supabase
    .from('user_media_items')
    .select('*, media:media_items(*)')
    .eq('id', userMediaId)
    .eq('user_id', userId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return data as UserMediaItem
}

export async function addMediaToLibrary(
  supabase: SupabaseClient,
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
): Promise<UserMediaItem> {
  // Upsert media item
  let mediaItem: MediaItem
  if (mediaData.external_source && mediaData.external_id) {
    const { data, error } = await supabase
      .from('media_items')
      .upsert(
        {
          type: mediaData.type,
          title: mediaData.title,
          original_title: mediaData.original_title,
          description: mediaData.description,
          cover_url: mediaData.cover_url,
          creators: mediaData.creators ?? [],
          genres: mediaData.genres ?? [],
          language: mediaData.language,
          release_date: mediaData.release_date,
          external_source: mediaData.external_source,
          external_id: mediaData.external_id,
          metadata: mediaData.metadata ?? {},
        },
        { onConflict: 'external_source,external_id' }
      )
      .select()
      .single()

    if (error) throw error
    mediaItem = data
  } else {
    const { data, error } = await supabase
      .from('media_items')
      .insert({
        type: mediaData.type,
        title: mediaData.title,
        original_title: mediaData.original_title,
        description: mediaData.description,
        cover_url: mediaData.cover_url,
        creators: mediaData.creators ?? [],
        genres: mediaData.genres ?? [],
        language: mediaData.language,
        release_date: mediaData.release_date,
        external_source: 'manual',
        metadata: mediaData.metadata ?? {},
      })
      .select()
      .single()

    if (error) throw error
    mediaItem = data
  }

  // Create user_media_items record
  const status = userData?.status ?? 'planned'
  const { data: userMedia, error: userMediaError } = await supabase
    .from('user_media_items')
    .insert({
      user_id: userId,
      media_id: mediaItem.id,
      status,
      priority: userData?.priority ?? 3,
      reason_to_consume: userData?.reason_to_consume,
      started_at: status === 'in_progress' ? new Date().toISOString().split('T')[0] : null,
      last_interacted_at: new Date().toISOString(),
    })
    .select('*, media:media_items(*)')
    .single()

  if (userMediaError) throw userMediaError
  return userMedia as UserMediaItem
}

export async function addManualMedia(
  supabase: SupabaseClient,
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
): Promise<UserMediaItem> {
  return addMediaToLibrary(supabase, userId, {
    ...data,
    external_source: 'manual',
  }, {
    status: data.status,
    priority: data.priority,
  })
}

export async function updateMediaStatus(
  supabase: SupabaseClient,
  userId: string,
  userMediaId: string,
  status: MediaStatus
): Promise<UserMediaItem> {
  const updates: Record<string, unknown> = {
    status,
    last_interacted_at: new Date().toISOString(),
  }

  if (status === 'in_progress') {
    updates.started_at = new Date().toISOString().split('T')[0]
  } else if (status === 'completed') {
    updates.completed_at = new Date().toISOString().split('T')[0]
  }

  const { data, error } = await supabase
    .from('user_media_items')
    .update(updates)
    .eq('id', userMediaId)
    .eq('user_id', userId)
    .select('*, media:media_items(*)')
    .single()

  if (error) throw error
  return data as UserMediaItem
}

export async function updateMediaProgress(
  supabase: SupabaseClient,
  userId: string,
  userMediaId: string,
  progress: {
    current: number
    total?: number
    unit?: string
  }
): Promise<UserMediaItem> {
  const updates: Record<string, unknown> = {
    progress_current: progress.current,
    last_interacted_at: new Date().toISOString(),
  }
  if (progress.total !== undefined) updates.progress_total = progress.total
  if (progress.unit) updates.progress_unit = progress.unit

  const { data, error } = await supabase
    .from('user_media_items')
    .update(updates)
    .eq('id', userMediaId)
    .eq('user_id', userId)
    .select('*, media:media_items(*)')
    .single()

  if (error) throw error
  return data as UserMediaItem
}

export async function updateMediaRating(
  supabase: SupabaseClient,
  userId: string,
  userMediaId: string,
  rating: number | null
): Promise<UserMediaItem> {
  const { data, error } = await supabase
    .from('user_media_items')
    .update({
      rating,
      last_interacted_at: new Date().toISOString(),
    })
    .eq('id', userMediaId)
    .eq('user_id', userId)
    .select('*, media:media_items(*)')
    .single()

  if (error) throw error
  return data as UserMediaItem
}

export async function updateMediaPriority(
  supabase: SupabaseClient,
  userId: string,
  userMediaId: string,
  priority: number
): Promise<UserMediaItem> {
  const { data, error } = await supabase
    .from('user_media_items')
    .update({ priority })
    .eq('id', userMediaId)
    .eq('user_id', userId)
    .select('*, media:media_items(*)')
    .single()

  if (error) throw error
  return data as UserMediaItem
}

export async function toggleFavorite(
  supabase: SupabaseClient,
  userId: string,
  userMediaId: string
): Promise<UserMediaItem> {
  // Get current state
  const current = await getUserMediaById(supabase, userId, userMediaId)
  if (!current) throw new Error('Media not found')

  const { data, error } = await supabase
    .from('user_media_items')
    .update({ is_favorite: !current.is_favorite })
    .eq('id', userMediaId)
    .eq('user_id', userId)
    .select('*, media:media_items(*)')
    .single()

  if (error) throw error
  return data as UserMediaItem
}

export async function removeMediaFromLibrary(
  supabase: SupabaseClient,
  userId: string,
  userMediaId: string
): Promise<void> {
  const { error } = await supabase
    .from('user_media_items')
    .delete()
    .eq('id', userMediaId)
    .eq('user_id', userId)

  if (error) throw error
}

export async function getCurrentMedia(
  supabase: SupabaseClient,
  userId: string,
  type?: MediaType
): Promise<UserMediaItem[]> {
  let query = supabase
    .from('user_media_items')
    .select('*, media:media_items(*)')
    .eq('user_id', userId)
    .eq('status', 'in_progress')
    .order('last_interacted_at', { ascending: false, nullsFirst: false })

  if (type) {
    query = query.eq('media.type', type)
  }

  const { data, error } = await query
  if (error) throw error
  return data as UserMediaItem[]
}

export async function getStaleMedia(
  supabase: SupabaseClient,
  userId: string
): Promise<UserMediaItem[]> {
  const fourteenDaysAgo = new Date()
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)

  const { data, error } = await supabase
    .from('user_media_items')
    .select('*, media:media_items(*)')
    .eq('user_id', userId)
    .eq('status', 'in_progress')
    .lt('last_interacted_at', fourteenDaysAgo.toISOString())
    .order('last_interacted_at', { ascending: true })

  if (error) throw error
  return data as UserMediaItem[]
}

export async function getRecentlyAddedMedia(
  supabase: SupabaseClient,
  userId: string,
  limit = 10
): Promise<UserMediaItem[]> {
  const { data, error } = await supabase
    .from('user_media_items')
    .select('*, media:media_items(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data as UserMediaItem[]
}

export async function findUserMediaByTitle(
  supabase: SupabaseClient,
  userId: string,
  title: string
): Promise<UserMediaItem[]> {
  const { data, error } = await supabase
    .from('user_media_items')
    .select('*, media:media_items(*)')
    .eq('user_id', userId)
    .ilike('media.title', `%${title}%`)
    .limit(5)

  if (error) throw error
  return data as UserMediaItem[]
}
