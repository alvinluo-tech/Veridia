import { eq, and, desc, gte, lte } from 'drizzle-orm'
import { getSqliteDb } from '@/lib/db'
import { activityLogs } from '@/lib/db/schema'
import type { ActivityRepository } from '../types'
import type { ActivityLog } from '@/types/media'

function parseActivityRow(row: Record<string, unknown>): ActivityLog {
  return {
    id: row.id as string,
    user_id: row.user_id as string,
    user_media_id: row.user_media_id as string | null,
    action: row.action as string,
    old_value: row.old_value ? JSON.parse(row.old_value as string) : null,
    new_value: row.new_value ? JSON.parse(row.new_value as string) : null,
    source: row.source as string,
    created_at: row.created_at as string,
  }
}

export class SqliteActivityRepository implements ActivityRepository {
  async logActivity(userId: string, data: Parameters<ActivityRepository['logActivity']>[1]): Promise<ActivityLog> {
    const db = getSqliteDb()
    const now = new Date().toISOString()
    const id = crypto.randomUUID()

    db.insert(activityLogs).values({
      id,
      user_id: userId,
      user_media_id: data.user_media_id,
      action: data.action,
      old_value: data.old_value ? JSON.stringify(data.old_value) : null,
      new_value: data.new_value ? JSON.stringify(data.new_value) : null,
      source: data.source ?? 'web',
      created_at: now,
    }).run()

    const row = db.select().from(activityLogs).where(eq(activityLogs.id, id)).get() as Record<string, unknown>
    return parseActivityRow(row)
  }

  async getRecentActivity(userId: string, limit = 20): Promise<ActivityLog[]> {
    const db = getSqliteDb()
    const rows = db.select().from(activityLogs)
      .where(eq(activityLogs.user_id, userId))
      .orderBy(desc(activityLogs.created_at))
      .limit(limit)
      .all() as Record<string, unknown>[]

    return rows.map(parseActivityRow)
  }

  async getActivityByRange(userId: string, startDate: string, endDate: string): Promise<ActivityLog[]> {
    const db = getSqliteDb()
    const rows = db.select().from(activityLogs)
      .where(
        and(
          eq(activityLogs.user_id, userId),
          gte(activityLogs.created_at, startDate),
          lte(activityLogs.created_at, endDate)
        )
      )
      .orderBy(desc(activityLogs.created_at))
      .all() as Record<string, unknown>[]

    return rows.map(parseActivityRow)
  }
}
