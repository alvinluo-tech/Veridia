import type { SupabaseClient } from '@supabase/supabase-js'
import type { MediaNote, NoteType } from '@/types/media'

export async function addMediaNote(
  supabase: SupabaseClient,
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
): Promise<MediaNote> {
  const { data: note, error } = await supabase
    .from('media_notes')
    .insert({
      user_id: userId,
      user_media_id: data.user_media_id,
      type: data.type ?? 'note',
      content: data.content,
      location_label: data.location_label,
      page_number: data.page_number,
      timestamp_seconds: data.timestamp_seconds,
      season_number: data.season_number,
      episode_number: data.episode_number,
    })
    .select()
    .single()

  if (error) throw error
  return note as MediaNote
}

export async function updateMediaNote(
  supabase: SupabaseClient,
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
): Promise<MediaNote> {
  const { data: note, error } = await supabase
    .from('media_notes')
    .update(data)
    .eq('id', noteId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) throw error
  return note as MediaNote
}

export async function deleteMediaNote(
  supabase: SupabaseClient,
  userId: string,
  noteId: string
): Promise<void> {
  const { error } = await supabase
    .from('media_notes')
    .delete()
    .eq('id', noteId)
    .eq('user_id', userId)

  if (error) throw error
}

export async function getNotesByUserMediaId(
  supabase: SupabaseClient,
  userId: string,
  userMediaId: string
): Promise<MediaNote[]> {
  const { data, error } = await supabase
    .from('media_notes')
    .select('*')
    .eq('user_id', userId)
    .eq('user_media_id', userMediaId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as MediaNote[]
}

export async function getRecentNotes(
  supabase: SupabaseClient,
  userId: string,
  limit = 10
): Promise<MediaNote[]> {
  const { data, error } = await supabase
    .from('media_notes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data as MediaNote[]
}

export async function getNotesByType(
  supabase: SupabaseClient,
  userId: string,
  type: NoteType
): Promise<MediaNote[]> {
  const { data, error } = await supabase
    .from('media_notes')
    .select('*')
    .eq('user_id', userId)
    .eq('type', type)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as MediaNote[]
}
