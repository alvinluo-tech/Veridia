import type { SupabaseClient } from '@supabase/supabase-js'
import type { StatsRepository } from '../types'
import type { DashboardStats, MediaType } from '@/types/media'
import * as statsDomain from '@/lib/domain/stats'

export class SupabaseStatsRepository implements StatsRepository {
  constructor(private supabase: SupabaseClient) {}

  getDashboardStats(userId: string): Promise<DashboardStats> {
    return statsDomain.getDashboardStats(this.supabase, userId)
  }

  getMediaTypeDistribution(userId: string): Promise<Record<MediaType, number>> {
    return statsDomain.getMediaTypeDistribution(this.supabase, userId)
  }

  getTagDistribution(userId: string): Promise<{ tag: string; count: number }[]> {
    return statsDomain.getTagDistribution(this.supabase, userId)
  }

  getCompletionRate(userId: string): Promise<{ total: number; completed: number; rate: number }> {
    return statsDomain.getCompletionRate(this.supabase, userId)
  }
}
