import type { SupabaseClient } from '@supabase/supabase-js'
import type { DashboardStats, MediaType } from '@/types/media'

export async function getDashboardStats(
  supabase: SupabaseClient,
  userId: string
): Promise<DashboardStats> {
  const now = new Date()
  const weekAgo = new Date(now)
  weekAgo.setDate(weekAgo.getDate() - 7)
  const monthAgo = new Date(now)
  monthAgo.setMonth(monthAgo.getMonth() - 1)
  const fourteenDaysAgo = new Date(now)
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)

  const [
    totalResult,
    inProgressResult,
    plannedResult,
    completedResult,
    completedWeekResult,
    completedMonthResult,
    staleResult,
    notesResult,
  ] = await Promise.all([
    supabase
      .from('user_media_items')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId),
    supabase
      .from('user_media_items')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'in_progress'),
    supabase
      .from('user_media_items')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'planned'),
    supabase
      .from('user_media_items')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'completed'),
    supabase
      .from('user_media_items')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'completed')
      .gte('completed_at', weekAgo.toISOString().split('T')[0]),
    supabase
      .from('user_media_items')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'completed')
      .gte('completed_at', monthAgo.toISOString().split('T')[0]),
    supabase
      .from('user_media_items')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'in_progress')
      .lt('last_interacted_at', fourteenDaysAgo.toISOString()),
    supabase
      .from('media_notes')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId),
  ])

  return {
    total_items: totalResult.count ?? 0,
    in_progress_count: inProgressResult.count ?? 0,
    planned_count: plannedResult.count ?? 0,
    completed_count: completedResult.count ?? 0,
    completed_this_week: completedWeekResult.count ?? 0,
    completed_this_month: completedMonthResult.count ?? 0,
    stale_count: staleResult.count ?? 0,
    notes_count: notesResult.count ?? 0,
  }
}

export async function getMediaTypeDistribution(
  supabase: SupabaseClient,
  userId: string
): Promise<Record<MediaType, number>> {
  const { data, error } = await supabase
    .from('user_media_items')
    .select('media:media_items(type)')
    .eq('user_id', userId)

  if (error) throw error

  const distribution: Record<string, number> = {
    book: 0,
    movie: 0,
    tv: 0,
    article: 0,
    course: 0,
    podcast: 0,
  }

  for (const item of data ?? []) {
    const media = item.media as unknown as { type: string } | null
    if (media?.type) {
      distribution[media.type] = (distribution[media.type] ?? 0) + 1
    }
  }

  return distribution as Record<MediaType, number>
}

export async function getTagDistribution(
  supabase: SupabaseClient,
  userId: string
): Promise<{ tag: string; count: number }[]> {
  const { data, error } = await supabase
    .from('user_media_items')
    .select('media:media_items(genres)')
    .eq('user_id', userId)

  if (error) throw error

  const tagCounts: Record<string, number> = {}
  for (const item of data ?? []) {
    const media = item.media as unknown as { genres: string[] } | null
    for (const genre of media?.genres ?? []) {
      tagCounts[genre] = (tagCounts[genre] ?? 0) + 1
    }
  }

  return Object.entries(tagCounts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
}

export async function getCompletionRate(
  supabase: SupabaseClient,
  userId: string
): Promise<{ total: number; completed: number; rate: number }> {
  const [totalResult, completedResult] = await Promise.all([
    supabase
      .from('user_media_items')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId),
    supabase
      .from('user_media_items')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'completed'),
  ])

  const total = totalResult.count ?? 0
  const completed = completedResult.count ?? 0

  return {
    total,
    completed,
    rate: total > 0 ? completed / total : 0,
  }
}
