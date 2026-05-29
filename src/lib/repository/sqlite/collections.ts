import { eq, and, desc } from 'drizzle-orm'
import { getSqliteDb } from '@/lib/db'
import { collections, collectionItems, userMediaItems, mediaItems } from '@/lib/db/schema'
import type { CollectionsRepository } from '../types'
import type { Collection, CollectionItem, UserMediaItem, MediaItem, MediaType, MediaStatus } from '@/types/media'

function parseCollectionRow(row: Record<string, unknown>): Collection {
  return {
    id: row.id as string,
    user_id: row.user_id as string,
    name: row.name as string,
    description: row.description as string | null,
    icon: row.icon as string | null,
    color: row.color as string | null,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  }
}

function parseMediaRow(row: Record<string, unknown>, mediaRow: Record<string, unknown>): UserMediaItem {
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
    media: {
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
    } as MediaItem,
  }
}

export class SqliteCollectionsRepository implements CollectionsRepository {
  async createCollection(userId: string, data: Parameters<CollectionsRepository['createCollection']>[1]): Promise<Collection> {
    const db = getSqliteDb()
    const now = new Date().toISOString()
    const id = crypto.randomUUID()

    db.insert(collections).values({
      id,
      user_id: userId,
      name: data.name,
      description: data.description,
      icon: data.icon,
      color: data.color,
      created_at: now,
      updated_at: now,
    }).run()

    const row = db.select().from(collections).where(eq(collections.id, id)).get() as Record<string, unknown>
    return parseCollectionRow(row)
  }

  async updateCollection(userId: string, collectionId: string, data: Parameters<CollectionsRepository['updateCollection']>[2]): Promise<Collection> {
    const db = getSqliteDb()
    const now = new Date().toISOString()

    db.update(collections)
      .set({ ...data, updated_at: now })
      .where(and(eq(collections.id, collectionId), eq(collections.user_id, userId)))
      .run()

    const row = db.select().from(collections).where(eq(collections.id, collectionId)).get() as Record<string, unknown>
    return parseCollectionRow(row)
  }

  async deleteCollection(userId: string, collectionId: string): Promise<void> {
    const db = getSqliteDb()
    db.delete(collections)
      .where(and(eq(collections.id, collectionId), eq(collections.user_id, userId)))
      .run()
  }

  async getCollections(userId: string): Promise<Collection[]> {
    const db = getSqliteDb()
    const rows = db.select().from(collections)
      .where(eq(collections.user_id, userId))
      .orderBy(desc(collections.created_at))
      .all() as Record<string, unknown>[]

    return rows.map(parseCollectionRow)
  }

  async getCollectionById(userId: string, collectionId: string): Promise<(Collection & { items?: UserMediaItem[] }) | null> {
    const db = getSqliteDb()
    const row = db.select().from(collections)
      .where(and(eq(collections.id, collectionId), eq(collections.user_id, userId)))
      .get() as Record<string, unknown> | undefined

    if (!row) return null

    const collection = parseCollectionRow(row)

    // Get items
    const itemRows = db
      .select()
      .from(collectionItems)
      .innerJoin(userMediaItems, eq(collectionItems.user_media_id, userMediaItems.id))
      .innerJoin(mediaItems, eq(userMediaItems.media_id, mediaItems.id))
      .where(eq(collectionItems.collection_id, collectionId))
      .all() as Record<string, Record<string, unknown>>[]

    const items = itemRows.map(r => parseMediaRow(r.user_media_items, r.media_items))

    return { ...collection, items }
  }

  async addMediaToCollection(userId: string, collectionId: string, userMediaId: string): Promise<CollectionItem> {
    const db = getSqliteDb()
    const now = new Date().toISOString()

    // Verify ownership
    const coll = db.select().from(collections)
      .where(and(eq(collections.id, collectionId), eq(collections.user_id, userId)))
      .get()
    if (!coll) throw new Error('Collection not found')

    db.insert(collectionItems).values({
      collection_id: collectionId,
      user_media_id: userMediaId,
      created_at: now,
    }).run()

    return {
      collection_id: collectionId,
      user_media_id: userMediaId,
      position: 0,
      created_at: now,
    }
  }

  async removeMediaFromCollection(userId: string, collectionId: string, userMediaId: string): Promise<void> {
    const db = getSqliteDb()

    // Verify ownership
    const coll = db.select().from(collections)
      .where(and(eq(collections.id, collectionId), eq(collections.user_id, userId)))
      .get()
    if (!coll) throw new Error('Collection not found')

    db.delete(collectionItems)
      .where(and(eq(collectionItems.collection_id, collectionId), eq(collectionItems.user_media_id, userMediaId)))
      .run()
  }

  async getCollectionIdsForMedia(userId: string, userMediaId: string): Promise<Set<string>> {
    const db = getSqliteDb()
    const rows = db.select({ collection_id: collectionItems.collection_id })
      .from(collectionItems)
      .where(eq(collectionItems.user_media_id, userMediaId))
      .all()

    return new Set(rows.map(r => r.collection_id))
  }

  async getMediaTitlesByIds(userId: string, mediaIds: string[]): Promise<Record<string, string>> {
    if (mediaIds.length === 0) return {}

    const db = getSqliteDb()
    const titles: Record<string, string> = {}

    for (const id of mediaIds) {
      const row = db
        .select({ id: userMediaItems.id, title: mediaItems.title })
        .from(userMediaItems)
        .innerJoin(mediaItems, eq(userMediaItems.media_id, mediaItems.id))
        .where(and(eq(userMediaItems.id, id), eq(userMediaItems.user_id, userId)))
        .get()

      if (row) {
        titles[row.id] = row.title
      }
    }

    return titles
  }
}
