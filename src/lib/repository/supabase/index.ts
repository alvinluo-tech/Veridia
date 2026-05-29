import type { SupabaseClient } from '@supabase/supabase-js'
import type { MediaRepository, NotesRepository, CollectionsRepository, StatsRepository, ActivityRepository, JarvisRepository } from '../types'
import { SupabaseMediaRepository } from './media'
import { SupabaseNotesRepository } from './notes'
import { SupabaseCollectionsRepository } from './collections'
import { SupabaseStatsRepository } from './stats'
import { SupabaseActivityRepository } from './activity'
import { SupabaseJarvisRepository } from './jarvis'

export interface SupabaseRepositories {
  media: MediaRepository
  notes: NotesRepository
  collections: CollectionsRepository
  stats: StatsRepository
  activity: ActivityRepository
  jarvis: JarvisRepository
}

export function createSupabaseRepositories(supabase: SupabaseClient): SupabaseRepositories {
  return {
    media: new SupabaseMediaRepository(supabase),
    notes: new SupabaseNotesRepository(supabase),
    collections: new SupabaseCollectionsRepository(supabase),
    stats: new SupabaseStatsRepository(supabase),
    activity: new SupabaseActivityRepository(supabase),
    jarvis: new SupabaseJarvisRepository(supabase),
  }
}
