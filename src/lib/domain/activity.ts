import type { SupabaseClient } from '@supabase/supabase-js'
import type { ActivityLog } from '@/types/media'

export async function logActivity(
  supabase: SupabaseClient,
  userId: string,
  data: {
    action: string
    user_media_id?: string
    old_value?: Record<string, unknown>
    new_value?: Record<string, unknown>
    source?: string
  }
): Promise<ActivityLog> {
  const { data: log, error } = await supabase
    .from('activity_logs')
    .insert({
      user_id: userId,
      user_media_id: data.user_media_id,
      action: data.action,
      old_value: data.old_value,
      new_value: data.new_value,
      source: data.source ?? 'web',
    })
    .select()
    .single()

  if (error) throw error
  return log as ActivityLog
}

export async function getRecentActivity(
  supabase: SupabaseClient,
  userId: string,
  limit = 20
): Promise<ActivityLog[]> {
  const { data, error } = await supabase
    .from('activity_logs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data as ActivityLog[]
}

export async function getActivityByRange(
  supabase: SupabaseClient,
  userId: string,
  startDate: string,
  endDate: string
): Promise<ActivityLog[]> {
  const { data, error } = await supabase
    .from('activity_logs')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', startDate)
    .lte('created_at', endDate)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as ActivityLog[]
}
