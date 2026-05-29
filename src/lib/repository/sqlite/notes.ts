import { eq, and, desc } from 'drizzle-orm'
import { getSqliteDb } from '@/lib/db'
import { mediaNotes } from '@/lib/db/schema'
import type { NotesRepository } from '../types'
import type { MediaNote, NoteType } from '@/types/media'

function parseNoteRow(row: Record<string, unknown>): MediaNote {
  return {
    id: row.id as string,
    user_id: row.user_id as string,
    user_media_id: row.user_media_id as string,
    type: row.type as NoteType,
    content: row.content as string,
    location_label: row.location_label as string | null,
    page_number: row.page_number as number | null,
    timestamp_seconds: row.timestamp_seconds as number | null,
    season_number: row.season_number as number | null,
    episode_number: row.episode_number as number | null,
    ai_summary: row.ai_summary as string | null,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  }
}

export class SqliteNotesRepository implements NotesRepository {
  async addMediaNote(userId: string, data: Parameters<NotesRepository['addMediaNote']>[1]): Promise<MediaNote> {
    const db = getSqliteDb()
    const now = new Date().toISOString()
    const id = crypto.randomUUID()

    db.insert(mediaNotes).values({
      id,
      user_id: userId,
      user_media_id: data.user_media_id,
      type: data.type ?? 'note',
      content: data.content,
      location_label: data.location_label,
      page_number: data.page_number,
      timestamp_seconds: data.timestamp_seconds,
      season_number: data.season_number,
      episode_number: data.episode_number,
      created_at: now,
      updated_at: now,
    }).run()

    const row = db.select().from(mediaNotes).where(eq(mediaNotes.id, id)).get() as Record<string, unknown>
    return parseNoteRow(row)
  }

  async updateMediaNote(userId: string, noteId: string, data: Parameters<NotesRepository['updateMediaNote']>[2]): Promise<MediaNote> {
    const db = getSqliteDb()
    const now = new Date().toISOString()

    db.update(mediaNotes)
      .set({ ...data, updated_at: now })
      .where(and(eq(mediaNotes.id, noteId), eq(mediaNotes.user_id, userId)))
      .run()

    const row = db.select().from(mediaNotes).where(eq(mediaNotes.id, noteId)).get() as Record<string, unknown>
    return parseNoteRow(row)
  }

  async deleteMediaNote(userId: string, noteId: string): Promise<void> {
    const db = getSqliteDb()
    db.delete(mediaNotes)
      .where(and(eq(mediaNotes.id, noteId), eq(mediaNotes.user_id, userId)))
      .run()
  }

  async getNotesByUserMediaId(userId: string, userMediaId: string): Promise<MediaNote[]> {
    const db = getSqliteDb()
    const rows = db.select().from(mediaNotes)
      .where(and(eq(mediaNotes.user_id, userId), eq(mediaNotes.user_media_id, userMediaId)))
      .orderBy(desc(mediaNotes.created_at))
      .all() as Record<string, unknown>[]

    return rows.map(parseNoteRow)
  }

  async getRecentNotes(userId: string, limit = 10): Promise<MediaNote[]> {
    const db = getSqliteDb()
    const rows = db.select().from(mediaNotes)
      .where(eq(mediaNotes.user_id, userId))
      .orderBy(desc(mediaNotes.created_at))
      .limit(limit)
      .all() as Record<string, unknown>[]

    return rows.map(parseNoteRow)
  }

  async getNotesByType(userId: string, type: NoteType): Promise<MediaNote[]> {
    const db = getSqliteDb()
    const rows = db.select().from(mediaNotes)
      .where(and(eq(mediaNotes.user_id, userId), eq(mediaNotes.type, type)))
      .orderBy(desc(mediaNotes.created_at))
      .all() as Record<string, unknown>[]

    return rows.map(parseNoteRow)
  }
}
