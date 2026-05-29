import { eq, and, lt, gte, desc } from 'drizzle-orm'
import { getSqliteDb } from '@/lib/db'
import { userMediaItems, mediaItems, mediaNotes } from '@/lib/db/schema'
import type { StatsRepository } from '../types'
import type { DashboardStats, MediaType } from '@/types/media'

export class SqliteStatsRepository implements StatsRepository {
  async getDashboardStats(userId: string): Promise<DashboardStats> {
    const db = getSqliteDb()
    const now = new Date()
    const weekAgo = new Date(now)
    weekAgo.setDate(weekAgo.getDate() - 7)
    const monthAgo = new Date(now)
    monthAgo.setMonth(monthAgo.getMonth() - 1)
    const fourteenDaysAgo = new Date(now)
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)

    const allItems = db.select().from(userMediaItems).where(eq(userMediaItems.user_id, userId)).all()

    const total = allItems.length
    const inProgress = allItems.filter(i => i.status === 'in_progress').length
    const planned = allItems.filter(i => i.status === 'planned').length
    const completed = allItems.filter(i => i.status === 'completed').length

    const weekStr = weekAgo.toISOString().split('T')[0]
    const monthStr = monthAgo.toISOString().split('T')[0]
    const fourteenStr = fourteenDaysAgo.toISOString()

    const completedThisWeek = allItems.filter(i =>
      i.status === 'completed' && i.completed_at && i.completed_at >= weekStr
    ).length

    const completedThisMonth = allItems.filter(i =>
      i.status === 'completed' && i.completed_at && i.completed_at >= monthStr
    ).length

    const stale = allItems.filter(i =>
      i.status === 'in_progress' && i.last_interacted_at && i.last_interacted_at < fourteenStr
    ).length

    const notesCount = db.select().from(mediaNotes).where(eq(mediaNotes.user_id, userId)).all().length

    return {
      total_items: total,
      in_progress_count: inProgress,
      planned_count: planned,
      completed_count: completed,
      completed_this_week: completedThisWeek,
      completed_this_month: completedThisMonth,
      stale_count: stale,
      notes_count: notesCount,
    }
  }

  async getMediaTypeDistribution(userId: string): Promise<Record<MediaType, number>> {
    const db = getSqliteDb()
    const rows = db
      .select({ type: mediaItems.type })
      .from(userMediaItems)
      .innerJoin(mediaItems, eq(userMediaItems.media_id, mediaItems.id))
      .where(eq(userMediaItems.user_id, userId))
      .all()

    const distribution: Record<string, number> = {
      book: 0, movie: 0, tv: 0, article: 0, course: 0, podcast: 0,
    }

    for (const row of rows) {
      distribution[row.type] = (distribution[row.type] ?? 0) + 1
    }

    return distribution as Record<MediaType, number>
  }

  async getTagDistribution(userId: string): Promise<{ tag: string; count: number }[]> {
    const db = getSqliteDb()
    const rows = db
      .select({ genres: mediaItems.genres })
      .from(userMediaItems)
      .innerJoin(mediaItems, eq(userMediaItems.media_id, mediaItems.id))
      .where(eq(userMediaItems.user_id, userId))
      .all()

    const tagCounts: Record<string, number> = {}
    for (const row of rows) {
      const genres = JSON.parse(row.genres || '[]') as string[]
      for (const genre of genres) {
        tagCounts[genre] = (tagCounts[genre] ?? 0) + 1
      }
    }

    return Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
  }

  async getCompletionRate(userId: string): Promise<{ total: number; completed: number; rate: number }> {
    const db = getSqliteDb()
    const allItems = db.select().from(userMediaItems).where(eq(userMediaItems.user_id, userId)).all()

    const total = allItems.length
    const completed = allItems.filter(i => i.status === 'completed').length

    return {
      total,
      completed,
      rate: total > 0 ? completed / total : 0,
    }
  }
}
