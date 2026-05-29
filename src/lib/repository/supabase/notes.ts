import type { SupabaseClient } from '@supabase/supabase-js'
import type { NotesRepository } from '../types'
import type { MediaNote, NoteType } from '@/types/media'
import * as notesDomain from '@/lib/domain/notes'

export class SupabaseNotesRepository implements NotesRepository {
  constructor(private supabase: SupabaseClient) {}

  addMediaNote(userId: string, data: Parameters<NotesRepository['addMediaNote']>[1]): Promise<MediaNote> {
    return notesDomain.addMediaNote(this.supabase, userId, data)
  }

  updateMediaNote(userId: string, noteId: string, data: Parameters<NotesRepository['updateMediaNote']>[2]): Promise<MediaNote> {
    return notesDomain.updateMediaNote(this.supabase, userId, noteId, data)
  }

  deleteMediaNote(userId: string, noteId: string): Promise<void> {
    return notesDomain.deleteMediaNote(this.supabase, userId, noteId)
  }

  getNotesByUserMediaId(userId: string, userMediaId: string): Promise<MediaNote[]> {
    return notesDomain.getNotesByUserMediaId(this.supabase, userId, userMediaId)
  }

  getRecentNotes(userId: string, limit?: number): Promise<MediaNote[]> {
    return notesDomain.getRecentNotes(this.supabase, userId, limit)
  }

  getNotesByType(userId: string, type: NoteType): Promise<MediaNote[]> {
    return notesDomain.getNotesByType(this.supabase, userId, type)
  }
}
