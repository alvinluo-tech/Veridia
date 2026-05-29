'use client'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { MediaGrid } from '@/components/media/media-grid'
import { MediaList } from '@/components/media/media-list'
import { MediaSearchDialog } from '@/components/media/media-search-dialog'
import type { UserMediaItem, MediaType, MediaStatus } from '@/types/media'
import { LayoutGrid, List, Search, Plus, X } from 'lucide-react'
import Link from 'next/link'
import { useCallback, useState } from 'react'

interface LibraryPageClientProps {
  initialItems: UserMediaItem[]
  initialType?: string
  initialStatus?: string
  initialQuery?: string
  initialView: 'grid' | 'list'
}

const mediaTypes: { value: string; label: string }[] = [
  { value: '', label: 'All Types' },
  { value: 'book', label: 'Book' },
  { value: 'movie', label: 'Movie' },
  { value: 'tv', label: 'TV' },
  { value: 'article', label: 'Article' },
  { value: 'course', label: 'Course' },
  { value: 'podcast', label: 'Podcast' },
]

const mediaStatuses: { value: string; label: string }[] = [
  { value: '', label: 'All Status' },
  { value: 'planned', label: 'Planned' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'paused', label: 'Paused' },
  { value: 'dropped', label: 'Dropped' },
  { value: 'archived', label: 'Archived' },
]

export function LibraryPageClient({
  initialItems,
  initialType,
  initialStatus,
  initialQuery,
  initialView,
}: LibraryPageClientProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [searchDialogOpen, setSearchDialogOpen] = useState(false)

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(name, value)
      } else {
        params.delete(name)
      }
      return params.toString()
    },
    [searchParams]
  )

  const setFilter = (name: string, value: string) => {
    router.push(pathname + '?' + createQueryString(name, value))
  }

  const hasActiveFilters = initialType || initialStatus || initialQuery

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Library</h1>
          <p className="text-sm text-neutral-500">{initialItems.length} items</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSearchDialogOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
            Search & Add
          </button>
          <Link
            href="/library/add"
            className="flex items-center gap-2 rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
          >
            Manual Add
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search titles..."
            defaultValue={initialQuery}
            onChange={(e) => {
              const val = e.target.value
              clearTimeout((e.target as any)._debounce)
              ;(e.target as any)._debounce = setTimeout(() => setFilter('q', val), 300)
            }}
            className="w-full rounded-lg border border-neutral-200 bg-white py-2 pl-9 pr-3 text-sm placeholder-neutral-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          {initialQuery && (
            <button
              onClick={() => setFilter('q', '')}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 hover:bg-neutral-100"
            >
              <X className="h-3 w-3 text-neutral-400" />
            </button>
          )}
        </div>

        {/* Type filter */}
        <select
          value={initialType ?? ''}
          onChange={(e) => setFilter('type', e.target.value)}
          className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-700 focus:border-indigo-500 focus:outline-none"
        >
          {mediaTypes.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>

        {/* Status filter */}
        <select
          value={initialStatus ?? ''}
          onChange={(e) => setFilter('status', e.target.value)}
          className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-700 focus:border-indigo-500 focus:outline-none"
        >
          {mediaStatuses.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>

        {/* Clear filters */}
        {hasActiveFilters && (
          <button
            onClick={() => router.push(pathname)}
            className="flex items-center gap-1 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-500 hover:bg-neutral-50"
          >
            <X className="h-3 w-3" />
            Clear
          </button>
        )}

        {/* View toggle */}
        <div className="ml-auto flex items-center rounded-lg border border-neutral-200 bg-white">
          <button
            onClick={() => setFilter('view', 'grid')}
            className={`rounded-l-lg p-2 ${initialView === 'grid' ? 'bg-indigo-50 text-indigo-600' : 'text-neutral-400 hover:text-neutral-600'}`}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setFilter('view', 'list')}
            className={`rounded-r-lg p-2 ${initialView === 'list' ? 'bg-indigo-50 text-indigo-600' : 'text-neutral-400 hover:text-neutral-600'}`}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      {initialView === 'grid' ? (
        <MediaGrid items={initialItems} />
      ) : (
        <MediaList items={initialItems} />
      )}

      {/* Search Dialog */}
      <MediaSearchDialog
        open={searchDialogOpen}
        onClose={() => setSearchDialogOpen(false)}
      />
    </div>
  )
}
