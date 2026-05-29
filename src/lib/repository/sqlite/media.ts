import { eq, and, like, desc, lt, sql } from 'drizzle-orm'
import { getSqliteDb } from '@/lib/db'
import { mediaItems, userMediaItems } from '@/lib/db/schema'
import type { MediaRepository, SearchFilters } from '../types'
import type { MediaType, MediaStatus, UserMediaItem, MediaItem } from '@/types/media'

function parseMediaRow(row: Record<string, unknown>, mediaRow: Record<string, unknown> | null): UserMediaItem {
  return {
    id: row.id as string,
    user_id: row.user_id as string,
    media_id: row.media_id as string,
    status: row.status as MediaStatus,
    priority: row.priority as number,
    progress_current: row.progress_current as number,
    progress_total: row.progress_total as number | null,
    progress_unit: row.progress_unit as string | null,
    rating: row.rating as number | null,
    personal_note: row.personal_note as string | null,
    reason_to_consume: row.reason_to_consume as string | null,
    started_at: row.started_at as string | null,
    completed_at: row.completed_at as string | null,
    last_interacted_at: row.last_interacted_at as string | null,
    is_favorite: Boolean(row.is_favorite),
    is_private: Boolean(row.is_private),
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
    media: mediaRow ? {
      id: mediaRow.id as string,
      type: mediaRow.type as MediaType,
      title: mediaRow.title as string,
      original_title: mediaRow.original_title as string | null,
      description: mediaRow.description as string | null,
      cover_url: mediaRow.cover_url as string | null,
      creators: JSON.parse(mediaRow.creators as string || '[]'),
      genres: JSON.parse(mediaRow.genres as string || '[]'),
      language: mediaRow.language as string | null,
      release_date: mediaRow.release_date as string | null,
      external_source: mediaRow.external_source as string | null,
      external_id: mediaRow.external_id as string | null,
      metadata: JSON.parse(mediaRow.metadata as string || '{}'),
      created_at: mediaRow.created_at as string,
      updated_at: mediaRow.updated_at as string,
    } as MediaItem : undefined,
  }
}

export class SqliteMediaRepository implements MediaRepository {
  async searchUserMedia(userId: string, filters: SearchFilters): Promise<UserMediaItem[]> {
    const db = getSqliteDb()
    const conditions = [eq(userMediaItems.user_id, userId)]

    if (filters.status) {
      conditions.push(eq(userMediaItems.status, filters.status))
    }

    if (filters.limit) {
      const rows = db
        .select()
        .from(userMediaItems)
        .innerJoin(mediaItems, eq(userMediaItems.media_id, mediaItems.id))
        .where(and(...conditions))
        .orderBy(desc(userMediaItems.last_interacted_at))
        .limit(filters.limit)
        .offset(filters.offset ?? 0)
        .all()

      return rows.map(r => {
        const umi = r.user_media_items as Record<string, unknown>
        const mi = r.media_items as Record<string, unknown>
        // Filter by type after join (Drizzle doesn't support filtering on joined table well)
        if (filters.type && mi.type !== filters.type) return null
        if (filters.query) {
          const q = filters.query.toLowerCase()
          const title = (mi.title as string || '').toLowerCase()
          const origTitle = (mi.original_title as string || '').toLowerCase()
          if (!title.includes(q) && !origTitle.includes(q)) return null
        }
        return parseMediaRow(umi, mi)
      }).filter(Boolean) as UserMediaItem[]
    }

    const rows = db
      .select()
      .from(userMediaItems)
      .innerJoin(mediaItems, eq(userMediaItems.media_id, mediaItems.id))
      .where(and(...conditions))
      .orderBy(desc(userMediaItems.last_interacted_at))
      .all()

    return rows.map(r => {
      const umi = r.user_media_items as Record<string, unknown>
      const mi = r.media_items as Record<string, unknown>
      if (filters.type && mi.type !== filters.type) return null
      if (filters.query) {
        const q = filters.query.toLowerCase()
        const title = (mi.title as string || '').toLowerCase()
        const origTitle = (mi.original_title as string || '').toLowerCase()
        if (!title.includes(q) && !origTitle.includes(q)) return null
      }
      return parseMediaRow(umi, mi)
    }).filter(Boolean) as UserMediaItem[]
  }

  async getUserMediaById(userId: string, userMediaId: string): Promise<UserMediaItem | null> {
    const db = getSqliteDb()
    const rows = db
      .select()
      .from(userMediaItems)
      .innerJoin(mediaItems, eq(userMediaItems.media_id, mediaItems.id))
      .where(and(eq(userMediaItems.id, userMediaId), eq(userMediaItems.user_id, userId)))
      .all()

    if (rows.length === 0) return null
    const r = rows[0] as Record<string, Record<string, unknown>>
    return parseMediaRow(r.user_media_items, r.media_items)
  }

  async addMediaToLibrary(
    userId: string,
    mediaData: Parameters<MediaRepository['addMediaToLibrary']>[1],
    userData?: Parameters<MediaRepository['addMediaToLibrary']>[2]
  ): Promise<UserMediaItem> {
    const db = getSqliteDb()
    const now = new Date().toISOString()

    // Upsert or insert media item
    let mediaId: string
    if (mediaData.external_source && mediaData.external_id) {
      const existing = db.select().from(mediaItems)
        .where(and(eq(mediaItems.external_source, mediaData.external_source), eq(mediaItems.external_id, mediaData.external_id)))
        .all()

      if (existing.length > 0) {
        mediaId = existing[0].id
      } else {
        mediaId = crypto.randomUUID()
        db.insert(mediaItems).values({
          id: mediaId,
          type: mediaData.type,
          title: mediaData.title,
          original_title: mediaData.original_title,
          description: mediaData.description,
          cover_url: mediaData.cover_url,
          creators: JSON.stringify(mediaData.creators ?? []),
          genres: JSON.stringify(mediaData.genres ?? []),
          language: mediaData.language,
          release_date: mediaData.release_date,
          external_source: mediaData.external_source,
          external_id: mediaData.external_id,
          metadata: JSON.stringify(mediaData.metadata ?? {}),
          created_at: now,
          updated_at: now,
        }).run()
      }
    } else {
      mediaId = crypto.randomUUID()
      db.insert(mediaItems).values({
        id: mediaId,
        type: mediaData.type,
        title: mediaData.title,
        original_title: mediaData.original_title,
        description: mediaData.description,
        cover_url: mediaData.cover_url,
        creators: JSON.stringify(mediaData.creators ?? []),
        genres: JSON.stringify(mediaData.genres ?? []),
        language: mediaData.language,
        release_date: mediaData.release_date,
        external_source: 'manual',
        metadata: JSON.stringify(mediaData.metadata ?? {}),
        created_at: now,
        updated_at: now,
      }).run()
    }

    // Create user_media_items record
    const status = userData?.status ?? 'planned'
    const userMediaId = crypto.randomUUID()
    db.insert(userMediaItems).values({
      id: userMediaId,
      user_id: userId,
      media_id: mediaId,
      status,
      priority: userData?.priority ?? 3,
      reason_to_consume: userData?.reason_to_consume,
      started_at: status === 'in_progress' ? now.split('T')[0] : null,
      last_interacted_at: now,
      created_at: now,
      updated_at: now,
    }).run()

    return this.getUserMediaById(userId, userMediaId) as Promise<UserMediaItem>
  }

  async addManualMedia(userId: string, data: Parameters<MediaRepository['addManualMedia']>[1]): Promise<UserMediaItem> {
    return this.addMediaToLibrary(userId, {
      ...data,
      external_source: 'manual',
    }, {
      status: data.status,
      priority: data.priority,
    })
  }

  async updateMediaStatus(userId: string, userMediaId: string, status: MediaStatus): Promise<UserMediaItem> {
    const db = getSqliteDb()
    const now = new Date().toISOString()
    const updates: Record<string, unknown> = {
      status,
      last_interacted_at: now,
      updated_at: now,
    }

    if (status === 'in_progress') {
      updates.started_at = now.split('T')[0]
    } else if (status === 'completed') {
      updates.completed_at = now.split('T')[0]
    }

    db.update(userMediaItems)
      .set(updates)
      .where(and(eq(userMediaItems.id, userMediaId), eq(userMediaItems.user_id, userId)))
      .run()

    return this.getUserMediaById(userId, userMediaId) as Promise<UserMediaItem>
  }

  async updateMediaProgress(userId: string, userMediaId: string, progress: { current: number; total?: number; unit?: string }): Promise<UserMediaItem> {
    const db = getSqliteDb()
    const now = new Date().toISOString()
    const updates: Record<string, unknown> = {
      progress_current: progress.current,
      last_interacted_at: now,
      updated_at: now,
    }
    if (progress.total !== undefined) updates.progress_total = progress.total
    if (progress.unit) updates.progress_unit = progress.unit

    db.update(userMediaItems)
      .set(updates)
      .where(and(eq(userMediaItems.id, userMediaId), eq(userMediaItems.user_id, userId)))
      .run()

    return this.getUserMediaById(userId, userMediaId) as Promise<UserMediaItem>
  }

  async updateMediaRating(userId: string, userMediaId: string, rating: number | null): Promise<UserMediaItem> {
    const db = getSqliteDb()
    const now = new Date().toISOString()

    db.update(userMediaItems)
      .set({ rating, last_interacted_at: now, updated_at: now })
      .where(and(eq(userMediaItems.id, userMediaId), eq(userMediaItems.user_id, userId)))
      .run()

    return this.getUserMediaById(userId, userMediaId) as Promise<UserMediaItem>
  }

  async updateMediaPriority(userId: string, userMediaId: string, priority: number): Promise<UserMediaItem> {
    const db = getSqliteDb()
    const now = new Date().toISOString()

    db.update(userMediaItems)
      .set({ priority, updated_at: now })
      .where(and(eq(userMediaItems.id, userMediaId), eq(userMediaItems.user_id, userId)))
      .run()

    return this.getUserMediaById(userId, userMediaId) as Promise<UserMediaItem>
  }

  async toggleFavorite(userId: string, userMediaId: string): Promise<UserMediaItem> {
    const current = await this.getUserMediaById(userId, userMediaId)
    if (!current) throw new Error('Media not found')

    const db = getSqliteDb()
    const now = new Date().toISOString()

    db.update(userMediaItems)
      .set({ is_favorite: !current.is_favorite, updated_at: now })
      .where(and(eq(userMediaItems.id, userMediaId), eq(userMediaItems.user_id, userId)))
      .run()

    return this.getUserMediaById(userId, userMediaId) as Promise<UserMediaItem>
  }

  async removeMediaFromLibrary(userId: string, userMediaId: string): Promise<void> {
    const db = getSqliteDb()
    db.delete(userMediaItems)
      .where(and(eq(userMediaItems.id, userMediaId), eq(userMediaItems.user_id, userId)))
      .run()
  }

  async getCurrentMedia(userId: string, type?: MediaType): Promise<UserMediaItem[]> {
    const db = getSqliteDb()
    const rows = db
      .select()
      .from(userMediaItems)
      .innerJoin(mediaItems, eq(userMediaItems.media_id, mediaItems.id))
      .where(and(eq(userMediaItems.user_id, userId), eq(userMediaItems.status, 'in_progress')))
      .orderBy(desc(userMediaItems.last_interacted_at))
      .all()

    return rows.map(r => {
      const umi = r.user_media_items as Record<string, unknown>
      const mi = r.media_items as Record<string, unknown>
      if (type && mi.type !== type) return null
      return parseMediaRow(umi, mi)
    }).filter(Boolean) as UserMediaItem[]
  }

  async getStaleMedia(userId: string): Promise<UserMediaItem[]> {
    const db = getSqliteDb()
    const fourteenDaysAgo = new Date()
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)

    const rows = db
      .select()
      .from(userMediaItems)
      .innerJoin(mediaItems, eq(userMediaItems.media_id, mediaItems.id))
      .where(
        and(
          eq(userMediaItems.user_id, userId),
          eq(userMediaItems.status, 'in_progress'),
          lt(userMediaItems.last_interacted_at, fourteenDaysAgo.toISOString())
        )
      )
      .all()

    return rows.map(r => {
      const umi = r.user_media_items as Record<string, unknown>
      const mi = r.media_items as Record<string, unknown>
      return parseMediaRow(umi, mi)
    })
  }

  async getRecentlyAddedMedia(userId: string, limit = 10): Promise<UserMediaItem[]> {
    const db = getSqliteDb()
    const rows = db
      .select()
      .from(userMediaItems)
      .innerJoin(mediaItems, eq(userMediaItems.media_id, mediaItems.id))
      .where(eq(userMediaItems.user_id, userId))
      .orderBy(desc(userMediaItems.created_at))
      .limit(limit)
      .all()

    return rows.map(r => {
      const umi = r.user_media_items as Record<string, unknown>
      const mi = r.media_items as Record<string, unknown>
      return parseMediaRow(umi, mi)
    })
  }

  async findUserMediaByTitle(userId: string, title: string): Promise<UserMediaItem[]> {
    const db = getSqliteDb()
    const rows = db
      .select()
      .from(userMediaItems)
      .innerJoin(mediaItems, eq(userMediaItems.media_id, mediaItems.id))
      .where(and(eq(userMediaItems.user_id, userId), like(mediaItems.title, `%${title}%`)))
      .limit(5)
      .all()

    return rows.map(r => {
      const umi = r.user_media_items as Record<string, unknown>
      const mi = r.media_items as Record<string, unknown>
      return parseMediaRow(umi, mi)
    })
  }
}
