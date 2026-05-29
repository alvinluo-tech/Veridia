import { isLocalMode } from '@/lib/db'
import { createClient } from '@/lib/supabase/server'
import { createSupabaseRepositories } from './supabase'
import { createSqliteRepositories } from './sqlite'
import type { MediaRepository, NotesRepository, CollectionsRepository, StatsRepository, ActivityRepository, JarvisRepository } from './types'

export type { MediaRepository, NotesRepository, CollectionsRepository, StatsRepository, ActivityRepository, JarvisRepository }

export interface Repositories {
  media: MediaRepository
  notes: NotesRepository
  collections: CollectionsRepository
  stats: StatsRepository
  activity: ActivityRepository
  jarvis: JarvisRepository
}

export async function getRepository(): Promise<Repositories> {
  if (isLocalMode()) {
    return createSqliteRepositories()
  }

  const supabase = await createClient()
  return createSupabaseRepositories(supabase)
}
