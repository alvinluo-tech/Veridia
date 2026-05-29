'use client'
import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { addFromSearchAction } from '@/app/actions/media'
import type { MediaType, MediaSearchResult, MediaStatus } from '@/types/media'
import { Search, X, BookOpen, Film, Tv, Loader2 } from 'lucide-react'

interface MediaSearchDialogProps {
  open: boolean
  onClose: () => void
}

const typeOptions: { value: MediaType; label: string; icon: typeof BookOpen }[] = [
  { value: 'book', label: 'Book', icon: BookOpen },
  { value: 'movie', label: 'Movie', icon: Film },
  { value: 'tv', label: 'TV Show', icon: Tv },
]

export function MediaSearchDialog({ open, onClose }: MediaSearchDialogProps) {
  const router = useRouter()
  const [type, setType] = useState<MediaType>('book')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<MediaSearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<MediaSearchResult | null>(null)
  const [status, setStatus] = useState<MediaStatus>('planned')
  const [adding, setAdding] = useState(false)

  const handleSearch = useCallback(async () => {
    if (query.trim().length < 2) return

    setLoading(true)
    setError(null)
    setResults([])

    try {
      const endpoint = type === 'book' ? '/api/metadata/books' : type === 'movie' ? '/api/metadata/movies' : '/api/metadata/tv'
      const res = await fetch(`${endpoint}?q=${encodeURIComponent(query)}`)
      const data = await res.json()

      if (data.success) {
        setResults(data.data)
      } else {
        setError(data.error?.message ?? 'Search failed')
      }
    } catch {
      setError('Failed to search. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [query, type])

  const handleAdd = async () => {
    if (!selected) return

    setAdding(true)
    try {
      await addFromSearchAction(selected, type, { status })
      onClose()
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add')
    } finally {
      setAdding(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="flex h-[80vh] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-neutral-900">Search & Add</h2>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-neutral-100">
            <X className="h-5 w-5 text-neutral-400" />
          </button>
        </div>

        {/* Search controls */}
        <div className="space-y-3 border-b border-neutral-200 px-6 py-4">
          {/* Type selector */}
          <div className="flex gap-2">
            {typeOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => { setType(opt.value); setResults([]); setSelected(null) }}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium ${
                  type === opt.value
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                <opt.icon className="h-4 w-4" />
                {opt.label}
              </button>
            ))}
          </div>

          {/* Search input */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder={`Search ${type === 'book' ? 'books' : type === 'movie' ? 'movies' : 'TV shows'}...`}
                className="w-full rounded-lg border border-neutral-200 py-2 pl-9 pr-3 text-sm focus:border-indigo-500 focus:outline-none"
                autoFocus
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={loading || query.trim().length < 2}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {error && (
            <div className="mb-3 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>
          )}

          {results.length === 0 && !loading && !error && (
            <div className="flex h-full items-center justify-center text-sm text-neutral-400">
              Search for {type === 'book' ? 'books' : type === 'movie' ? 'movies' : 'TV shows'} to add to your library
            </div>
          )}

          {results.length > 0 && !selected && (
            <div className="space-y-2">
              {results.map((result, i) => (
                <button
                  key={`${result.source}-${result.external_id}`}
                  onClick={() => setSelected(result)}
                  className="flex w-full gap-3 rounded-xl border border-neutral-200 p-3 text-left hover:border-indigo-300 hover:bg-indigo-50/50"
                >
                  <div className="h-16 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                    {result.cover_url ? (
                      <img src={result.cover_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-neutral-300">
                        {result.title[0]}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-neutral-900 truncate">{result.title}</h4>
                    {result.creators.length > 0 && (
                      <p className="text-xs text-neutral-500 truncate">
                        {result.creators.map(c => c.name).join(', ')}
                      </p>
                    )}
                    {result.description && (
                      <p className="mt-1 text-xs text-neutral-400 line-clamp-2">{result.description}</p>
                    )}
                    <div className="mt-1 flex items-center gap-2 text-xs text-neutral-400">
                      <span className="rounded bg-neutral-100 px-1.5 py-0.5">{result.source}</span>
                      {result.release_date && <span>{result.release_date.split('-')[0]}</span>}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {selected && (
            <div className="space-y-4">
              <div className="flex gap-4 rounded-xl border border-indigo-200 bg-indigo-50/50 p-4">
                <div className="h-24 w-18 flex-shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                  {selected.cover_url ? (
                    <img src={selected.cover_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-lg text-neutral-300">
                      {selected.title[0]}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-neutral-900">{selected.title}</h3>
                  {selected.creators.length > 0 && (
                    <p className="text-sm text-neutral-500">
                      {selected.creators.map(c => c.name).join(', ')}
                    </p>
                  )}
                  {selected.description && (
                    <p className="mt-1 text-xs text-neutral-400 line-clamp-3">{selected.description}</p>
                  )}
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="self-start rounded p-1 hover:bg-indigo-100"
                >
                  <X className="h-4 w-4 text-neutral-400" />
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as MediaStatus)}
                  className="mt-1 block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                >
                  <option value="planned">Planned</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {selected && (
          <div className="border-t border-neutral-200 px-6 py-4 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              disabled={adding}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {adding ? 'Adding...' : 'Add to Library'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
