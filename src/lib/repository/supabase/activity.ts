import type { SupabaseClient } from '@supabase/supabase-js'
import type { ActivityRepository } from '../types'
import type { ActivityLog } from '@/types/media'
import * as activityDomain from '@/lib/domain/activity'

export class SupabaseActivityRepository implements ActivityRepository {
  constructor(private supabase: SupabaseClient) {}

  logActivity(userId: string, data: Parameters<ActivityRepository['logActivity']>[1]): Promise<ActivityLog> {
    return activityDomain.logActivity(this.supabase, userId, data)
  }

  getRecentActivity(userId: string, limit?: number): Promise<ActivityLog[]> {
    return activityDomain.getRecentActivity(this.supabase, userId, limit)
  }

  getActivityByRange(userId: string, startDate: string, endDate: string): Promise<ActivityLog[]> {
    return activityDomain.getActivityByRange(this.supabase, userId, startDate, endDate)
  }
}
