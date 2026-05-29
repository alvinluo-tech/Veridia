import type { MediaRepository, NotesRepository, CollectionsRepository, StatsRepository, ActivityRepository, JarvisRepository } from '../types'
import { SqliteMediaRepository } from './media'
import { SqliteNotesRepository } from './notes'
import { SqliteCollectionsRepository } from './collections'
import { SqliteStatsRepository } from './stats'
import { SqliteActivityRepository } from './activity'
import { SqliteJarvisRepository } from './jarvis'

export interface SqliteRepositories {
  media: MediaRepository
  notes: NotesRepository
  collections: CollectionsRepository
  stats: StatsRepository
  activity: ActivityRepository
  jarvis: JarvisRepository
}

export function createSqliteRepositories(): SqliteRepositories {
  return {
    media: new SqliteMediaRepository(),
    notes: new SqliteNotesRepository(),
    collections: new SqliteCollectionsRepository(),
    stats: new SqliteStatsRepository(),
    activity: new SqliteActivityRepository(),
    jarvis: new SqliteJarvisRepository(),
  }
}
