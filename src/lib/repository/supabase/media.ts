import type { SupabaseClient } from '@supabase/supabase-js'
import type { MediaRepository, SearchFilters } from '../types'
import type { MediaType, MediaStatus, UserMediaItem } from '@/types/media'
import * as mediaDomain from '@/lib/domain/media'

export class SupabaseMediaRepository implements MediaRepository {
  constructor(private supabase: SupabaseClient) {}

  searchUserMedia(userId: string, filters: SearchFilters): Promise<UserMediaItem[]> {
    return mediaDomain.searchUserMedia(this.supabase, userId, filters)
  }

  getUserMediaById(userId: string, userMediaId: string): Promise<UserMediaItem | null> {
    return mediaDomain.getUserMediaById(this.supabase, userId, userMediaId)
  }

  addMediaToLibrary(userId: string, mediaData: Parameters<MediaRepository['addMediaToLibrary']>[1], userData?: Parameters<MediaRepository['addMediaToLibrary']>[2]): Promise<UserMediaItem> {
    return mediaDomain.addMediaToLibrary(this.supabase, userId, mediaData, userData)
  }

  addManualMedia(userId: string, data: Parameters<MediaRepository['addManualMedia']>[1]): Promise<UserMediaItem> {
    return mediaDomain.addManualMedia(this.supabase, userId, data)
  }

  updateMediaStatus(userId: string, userMediaId: string, status: MediaStatus): Promise<UserMediaItem> {
    return mediaDomain.updateMediaStatus(this.supabase, userId, userMediaId, status)
  }

  updateMediaProgress(userId: string, userMediaId: string, progress: { current: number; total?: number; unit?: string }): Promise<UserMediaItem> {
    return mediaDomain.updateMediaProgress(this.supabase, userId, userMediaId, progress)
  }

  updateMediaRating(userId: string, userMediaId: string, rating: number | null): Promise<UserMediaItem> {
    return mediaDomain.updateMediaRating(this.supabase, userId, userMediaId, rating)
  }

  updateMediaPriority(userId: string, userMediaId: string, priority: number): Promise<UserMediaItem> {
    return mediaDomain.updateMediaPriority(this.supabase, userId, userMediaId, priority)
  }

  toggleFavorite(userId: string, userMediaId: string): Promise<UserMediaItem> {
    return mediaDomain.toggleFavorite(this.supabase, userId, userMediaId)
  }

  removeMediaFromLibrary(userId: string, userMediaId: string): Promise<void> {
    return mediaDomain.removeMediaFromLibrary(this.supabase, userId, userMediaId)
  }

  getCurrentMedia(userId: string, type?: MediaType): Promise<UserMediaItem[]> {
    return mediaDomain.getCurrentMedia(this.supabase, userId, type)
  }

  getStaleMedia(userId: string): Promise<UserMediaItem[]> {
    return mediaDomain.getStaleMedia(this.supabase, userId)
  }

  getRecentlyAddedMedia(userId: string, limit?: number): Promise<UserMediaItem[]> {
    return mediaDomain.getRecentlyAddedMedia(this.supabase, userId, limit)
  }

  findUserMediaByTitle(userId: string, title: string): Promise<UserMediaItem[]> {
    return mediaDomain.findUserMediaByTitle(this.supabase, userId, title)
  }
}
