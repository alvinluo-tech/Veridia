import type { SupabaseClient } from '@supabase/supabase-js'
import type { CollectionsRepository } from '../types'
import type { Collection, CollectionItem, UserMediaItem } from '@/types/media'
import * as collectionsDomain from '@/lib/domain/collections'

export class SupabaseCollectionsRepository implements CollectionsRepository {
  constructor(private supabase: SupabaseClient) {}

  createCollection(userId: string, data: Parameters<CollectionsRepository['createCollection']>[1]): Promise<Collection> {
    return collectionsDomain.createCollection(this.supabase, userId, data)
  }

  updateCollection(userId: string, collectionId: string, data: Parameters<CollectionsRepository['updateCollection']>[2]): Promise<Collection> {
    return collectionsDomain.updateCollection(this.supabase, userId, collectionId, data)
  }

  deleteCollection(userId: string, collectionId: string): Promise<void> {
    return collectionsDomain.deleteCollection(this.supabase, userId, collectionId)
  }

  getCollections(userId: string): Promise<Collection[]> {
    return collectionsDomain.getCollections(this.supabase, userId)
  }

  getCollectionById(userId: string, collectionId: string): Promise<(Collection & { items?: UserMediaItem[] }) | null> {
    return collectionsDomain.getCollectionById(this.supabase, userId, collectionId)
  }

  addMediaToCollection(userId: string, collectionId: string, userMediaId: string): Promise<CollectionItem> {
    return collectionsDomain.addMediaToCollection(this.supabase, userId, collectionId, userMediaId)
  }

  removeMediaFromCollection(userId: string, collectionId: string, userMediaId: string): Promise<void> {
    return collectionsDomain.removeMediaFromCollection(this.supabase, userId, collectionId, userMediaId)
  }

  async getCollectionIdsForMedia(userId: string, userMediaId: string): Promise<Set<string>> {
    const { data } = await this.supabase
      .from('collection_items')
      .select('collection_id')
      .eq('user_media_id', userMediaId)

    return new Set(data?.map(ci => ci.collection_id) ?? [])
  }

  async getMediaTitlesByIds(userId: string, mediaIds: string[]): Promise<Record<string, string>> {
    if (mediaIds.length === 0) return {}

    const { data } = await this.supabase
      .from('user_media_items')
      .select('id, media:media_items(title)')
      .in('id', mediaIds)
      .eq('user_id', userId)

    const titles: Record<string, string> = {}
    for (const item of data ?? []) {
      const media = item.media as unknown as { title: string } | null
      if (media?.title) {
        titles[item.id] = media.title
      }
    }
    return titles
  }
}
