'use client'
import Link from 'next/link'
import type { DashboardStats, UserMediaItem, ActivityLog, MediaNote } from '@/types/media'
import { MediaCard } from '@/components/media/media-card'
import { MediaStatusBadge } from '@/components/media/media-status-badge'
import { MediaTypeBadge } from '@/components/media/media-type-badge'
import { timeAgo } from '@/lib/utils/time'
import {
  BookOpen,
  Film,
  Tv,
  TrendingUp,
  Clock,
  AlertTriangle,
  StickyNote,
  ArrowRight,
  Activity,
} from 'lucide-react'

interface DashboardClientProps {
  stats: DashboardStats
  inProgress: UserMediaItem[]
  stale: UserMediaItem[]
  recent: UserMediaItem[]
  activity: ActivityLog[]
  notes: MediaNote[]
}

const statCards = [
  { key: 'total_items' as const, label: 'Total Items', icon: BookOpen, color: 'text-neutral-900' },
  { key: 'in_progress_count' as const, label: 'In Progress', icon: TrendingUp, color: 'text-indigo-600' },
  { key: 'completed_count' as const, label: 'Completed', icon: BookOpen, color: 'text-green-600' },
  { key: 'planned_count' as const, label: 'Planned', icon: Clock, color: 'text-amber-600' },
]

function formatAction(action: string): string {
  const map: Record<string, string> = {
    added: 'Added to library',
    status_changed: 'Changed status',
    progress_updated: 'Updated progress',
    rating_changed: 'Rated',
    note_added: 'Added a note',
    favorite_toggled: 'Toggled favorite',
    removed: 'Removed from library',
  }
  return map[action] ?? action
}

export function DashboardClient({
  stats,
  inProgress,
  stale,
  recent,
  activity,
  notes,
}: DashboardClientProps) {
  const isEmpty = stats.total_items === 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Dashboard</h1>
        <p className="text-sm text-neutral-500">Your personal input system</p>
      </div>

      {isEmpty ? (
        <div className="rounded-xl border border-neutral-200 bg-white p-6">
          <h2 className="text-lg font-medium text-neutral-900">Start building your personal input system</h2>
          <p className="mt-2 text-sm text-neutral-500">
            Veridia turns everything you read, watch, and learn into a structured personal library.
          </p>
          <Link
            href="/library"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Go to Library
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {statCards.map((card) => (
              <div key={card.key} className="rounded-xl border border-neutral-200 bg-white p-5">
                <div className="flex items-center gap-2">
                  <card.icon className="h-4 w-4 text-neutral-400" />
                  <span className="text-sm font-medium text-neutral-500">{card.label}</span>
                </div>
                <div className={`mt-1 text-2xl font-semibold ${card.color}`}>
                  {stats[card.key]}
                </div>
              </div>
            ))}
          </div>

          {/* Secondary stats */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-neutral-200 bg-white p-4">
              <div className="text-xs font-medium text-neutral-500">Completed this week</div>
              <div className="mt-1 text-xl font-semibold text-green-600">{stats.completed_this_week}</div>
            </div>
            <div className="rounded-xl border border-neutral-200 bg-white p-4">
              <div className="text-xs font-medium text-neutral-500">Completed this month</div>
              <div className="mt-1 text-xl font-semibold text-green-600">{stats.completed_this_month}</div>
            </div>
            <div className="rounded-xl border border-neutral-200 bg-white p-4">
              <div className="flex items-center gap-1">
                <div className="text-xs font-medium text-neutral-500">Total notes</div>
                <StickyNote className="h-3 w-3 text-neutral-400" />
              </div>
              <div className="mt-1 text-xl font-semibold text-neutral-900">{stats.notes_count}</div>
            </div>
          </div>

          {/* Continue section */}
          {inProgress.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-neutral-900">Continue</h2>
                <Link href="/library?status=in_progress" className="text-sm text-indigo-600 hover:text-indigo-700">
                  View all
                </Link>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {inProgress.slice(0, 3).map((item) => (
                  <MediaCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          )}

          {/* Stale items alert */}
          {stale.length > 0 && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <h3 className="text-sm font-medium text-amber-800">
                  {stale.length} item{stale.length > 1 ? 's' : ''} haven{'\''}t been touched in 2 weeks
                </h3>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {stale.slice(0, 5).map((item) => (
                  <Link
                    key={item.id}
                    href={`/library/${item.id}`}
                    className="rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-amber-700 shadow-sm hover:bg-amber-100"
                  >
                    {item.media?.title ?? 'Untitled'}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Two column layout */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Recent Activity */}
            <div className="rounded-xl border border-neutral-200 bg-white">
              <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-3">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-neutral-400" />
                  <h3 className="text-sm font-medium text-neutral-900">Recent Activity</h3>
                </div>
              </div>
              <div className="divide-y divide-neutral-100">
                {activity.length === 0 ? (
                  <div className="px-5 py-8 text-center text-sm text-neutral-400">
                    No activity yet
                  </div>
                ) : (
                  activity.slice(0, 8).map((log) => (
                    <div key={log.id} className="flex items-center justify-between px-5 py-3">
                      <div className="min-w-0">
                        <p className="text-sm text-neutral-700 truncate">
                          {formatAction(log.action)}
                        </p>
                        {log.source !== 'web' && (
                          <p className="text-xs text-neutral-400">via {log.source}</p>
                        )}
                      </div>
                      <span className="ml-4 flex-shrink-0 text-xs text-neutral-400">
                        {timeAgo(log.created_at)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recent Notes */}
            <div className="rounded-xl border border-neutral-200 bg-white">
              <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-3">
                <div className="flex items-center gap-2">
                  <StickyNote className="h-4 w-4 text-neutral-400" />
                  <h3 className="text-sm font-medium text-neutral-900">Recent Notes</h3>
                </div>
                <Link href="/notes" className="text-xs text-indigo-600 hover:text-indigo-700">
                  View all
                </Link>
              </div>
              <div className="divide-y divide-neutral-100">
                {notes.length === 0 ? (
                  <div className="px-5 py-8 text-center text-sm text-neutral-400">
                    No notes yet
                  </div>
                ) : (
                  notes.map((note) => (
                    <div key={note.id} className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-xs text-neutral-500">
                          {note.type}
                        </span>
                        <span className="text-xs text-neutral-400">{timeAgo(note.created_at)}</span>
                      </div>
                      <p className="mt-1 text-sm text-neutral-700 line-clamp-2">{note.content}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Recently Added */}
          {recent.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-neutral-900">Recently Added</h2>
                <Link href="/library" className="text-sm text-indigo-600 hover:text-indigo-700">
                  View all
                </Link>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                {recent.map((item) => (
                  <MediaCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
