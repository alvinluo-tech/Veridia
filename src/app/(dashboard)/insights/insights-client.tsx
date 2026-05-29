'use client'
import type { DashboardStats, MediaType } from '@/types/media'
import { BarChart3, PieChart, Tag, Target, BookOpen, Film, Tv, Mic, FileText, GraduationCap } from 'lucide-react'

interface InsightsClientProps {
  stats: DashboardStats
  typeDistribution: Record<MediaType, number>
  tagDistribution: { tag: string; count: number }[]
  completionRate: { total: number; completed: number; rate: number }
}

const typeLabels: Record<MediaType, { label: string; icon: typeof BookOpen; color: string }> = {
  book: { label: 'Books', icon: BookOpen, color: 'bg-blue-500' },
  movie: { label: 'Movies', icon: Film, color: 'bg-purple-500' },
  tv: { label: 'TV Shows', icon: Tv, color: 'bg-pink-500' },
  article: { label: 'Articles', icon: FileText, color: 'bg-amber-500' },
  course: { label: 'Courses', icon: GraduationCap, color: 'bg-green-500' },
  podcast: { label: 'Podcasts', icon: Mic, color: 'bg-cyan-500' },
}

function formatPercent(value: number): string {
  return Math.round(value * 100) + '%'
}

export function InsightsClient({
  stats,
  typeDistribution,
  tagDistribution,
  completionRate,
}: InsightsClientProps) {
  const isEmpty = stats.total_items === 0
  const maxTagCount = tagDistribution.length > 0 ? tagDistribution[0].count : 1
  const totalTypeCount = Object.values(typeDistribution).reduce((a, b) => a + b, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Insights</h1>
        <p className="text-sm text-neutral-500">Your reading and watching patterns</p>
      </div>

      {isEmpty ? (
        <div className="rounded-xl border border-neutral-200 bg-white p-12 text-center">
          <BarChart3 className="mx-auto h-8 w-8 text-neutral-300" />
          <h3 className="mt-3 text-lg font-medium text-neutral-900">Not enough data yet</h3>
          <p className="mt-2 text-sm text-neutral-500">
            Add more items and track your progress to see insights.
          </p>
        </div>
      ) : (
        <>
          {/* Overview stats */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-neutral-200 bg-white p-5">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-neutral-400" />
                <span className="text-sm font-medium text-neutral-500">Completion Rate</span>
              </div>
              <div className="mt-1 text-2xl font-semibold text-indigo-600">
                {formatPercent(completionRate.rate)}
              </div>
              <p className="text-xs text-neutral-400">
                {completionRate.completed} of {completionRate.total} items
              </p>
            </div>
            <div className="rounded-xl border border-neutral-200 bg-white p-5">
              <div className="text-sm font-medium text-neutral-500">This Week</div>
              <div className="mt-1 text-2xl font-semibold text-green-600">
                {stats.completed_this_week}
              </div>
              <p className="text-xs text-neutral-400">items completed</p>
            </div>
            <div className="rounded-xl border border-neutral-200 bg-white p-5">
              <div className="text-sm font-medium text-neutral-500">This Month</div>
              <div className="mt-1 text-2xl font-semibold text-green-600">
                {stats.completed_this_month}
              </div>
              <p className="text-xs text-neutral-400">items completed</p>
            </div>
            <div className="rounded-xl border border-neutral-200 bg-white p-5">
              <div className="text-sm font-medium text-neutral-500">Stale Items</div>
              <div className="mt-1 text-2xl font-semibold text-amber-600">
                {stats.stale_count}
              </div>
              <p className="text-xs text-neutral-400">not touched in 2+ weeks</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Type Distribution */}
            <div className="rounded-xl border border-neutral-200 bg-white p-6">
              <div className="flex items-center gap-2 mb-4">
                <PieChart className="h-4 w-4 text-neutral-400" />
                <h3 className="text-sm font-medium text-neutral-900">Media Types</h3>
              </div>
              {totalTypeCount === 0 ? (
                <p className="text-sm text-neutral-400">No items yet</p>
              ) : (
                <div className="space-y-3">
                  {(Object.entries(typeDistribution) as [MediaType, number][])
                    .filter(([, count]) => count > 0)
                    .sort(([, a], [, b]) => b - a)
                    .map(([type, count]) => {
                      const info = typeLabels[type]
                      const Icon = info.icon
                      const percent = totalTypeCount > 0 ? count / totalTypeCount : 0
                      return (
                        <div key={type} className="space-y-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4 text-neutral-500" />
                              <span className="text-sm text-neutral-700">{info.label}</span>
                            </div>
                            <span className="text-sm font-medium text-neutral-900">
                              {count} ({formatPercent(percent)})
                            </span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-neutral-100">
                            <div
                              className={`h-full rounded-full ${info.color}`}
                              style={{ width: `${percent * 100}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                </div>
              )}
            </div>

            {/* Tag Distribution */}
            <div className="rounded-xl border border-neutral-200 bg-white p-6">
              <div className="flex items-center gap-2 mb-4">
                <Tag className="h-4 w-4 text-neutral-400" />
                <h3 className="text-sm font-medium text-neutral-900">Top Genres</h3>
              </div>
              {tagDistribution.length === 0 ? (
                <p className="text-sm text-neutral-400">No genres tagged yet</p>
              ) : (
                <div className="space-y-2">
                  {tagDistribution.slice(0, 10).map((item) => (
                    <div key={item.tag} className="flex items-center gap-3">
                      <div className="w-24 truncate text-sm text-neutral-600">{item.tag}</div>
                      <div className="flex-1">
                        <div className="h-2 overflow-hidden rounded-full bg-neutral-100">
                          <div
                            className="h-full rounded-full bg-indigo-500"
                            style={{ width: `${(item.count / maxTagCount) * 100}%` }}
                          />
                        </div>
                      </div>
                      <span className="w-8 text-right text-sm font-medium text-neutral-700">
                        {item.count}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Completion progress bar */}
          <div className="rounded-xl border border-neutral-200 bg-white p-6">
            <h3 className="text-sm font-medium text-neutral-900 mb-3">Overall Progress</h3>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="h-4 overflow-hidden rounded-full bg-neutral-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-green-500 transition-all"
                    style={{ width: `${completionRate.rate * 100}%` }}
                  />
                </div>
              </div>
              <span className="text-lg font-semibold text-neutral-900">
                {formatPercent(completionRate.rate)}
              </span>
            </div>
            <div className="mt-2 flex justify-between text-xs text-neutral-400">
              <span>{completionRate.completed} completed</span>
              <span>{completionRate.total - completionRate.completed} remaining</span>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
