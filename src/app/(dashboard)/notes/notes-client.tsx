'use client'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import type { MediaNote, NoteType } from '@/types/media'
import { StickyNote, Quote, BookOpen, Lightbulb, FileText, X } from 'lucide-react'
import Link from 'next/link'
import { useCallback } from 'react'

interface NotesClientProps {
  notes: MediaNote[]
  mediaTitles: Record<string, string>
  activeType?: string
}

const noteTypeOptions: { value: string; label: string; icon: typeof StickyNote }[] = [
  { value: '', label: 'All Types', icon: StickyNote },
  { value: 'note', label: 'Notes', icon: FileText },
  { value: 'quote', label: 'Quotes', icon: Quote },
  { value: 'review', label: 'Reviews', icon: BookOpen },
  { value: 'reflection', label: 'Reflections', icon: Lightbulb },
  { value: 'summary', label: 'Summaries', icon: FileText },
]

function formatType(type: NoteType): { label: string; icon: typeof StickyNote; color: string } {
  const map: Record<NoteType, { label: string; icon: typeof StickyNote; color: string }> = {
    note: { label: 'Note', icon: FileText, color: 'bg-blue-50 text-blue-700' },
    quote: { label: 'Quote', icon: Quote, color: 'bg-purple-50 text-purple-700' },
    review: { label: 'Review', icon: BookOpen, color: 'bg-green-50 text-green-700' },
    reflection: { label: 'Reflection', icon: Lightbulb, color: 'bg-amber-50 text-amber-700' },
    summary: { label: 'Summary', icon: FileText, color: 'bg-neutral-100 text-neutral-700' },
  }
  return map[type] ?? map.note
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function NotesClient({ notes, mediaTitles, activeType }: NotesClientProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const setFilter = useCallback(
    (type: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (type) {
        params.set('type', type)
      } else {
        params.delete('type')
      }
      router.push(pathname + '?' + params.toString())
    },
    [router, pathname, searchParams]
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Notes</h1>
        <p className="text-sm text-neutral-500">{notes.length} notes</p>
      </div>

      {/* Type filter */}
      <div className="flex flex-wrap gap-2">
        {noteTypeOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium ${
              (activeType ?? '') === opt.value
                ? 'bg-indigo-50 text-indigo-700'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            <opt.icon className="h-4 w-4" />
            {opt.label}
          </button>
        ))}
        {activeType && (
          <button
            onClick={() => setFilter('')}
            className="flex items-center gap-1 rounded-lg border border-neutral-200 px-3 py-1.5 text-sm text-neutral-500 hover:bg-neutral-50"
          >
            <X className="h-3 w-3" />
            Clear
          </button>
        )}
      </div>

      {/* Notes list */}
      {notes.length === 0 ? (
        <div className="rounded-xl border border-neutral-200 bg-white p-12 text-center">
          <StickyNote className="mx-auto h-8 w-8 text-neutral-300" />
          <h3 className="mt-3 text-lg font-medium text-neutral-900">
            {activeType ? `No ${activeType}s yet` : 'No notes yet'}
          </h3>
          <p className="mt-2 text-sm text-neutral-500">
            Add notes, quotes, and reviews to your media items from the library.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => {
            const typeInfo = formatType(note.type)
            const TypeIcon = typeInfo.icon
            const mediaTitle = mediaTitles[note.user_media_id]

            return (
              <div
                key={note.id}
                className="rounded-xl border border-neutral-200 bg-white p-4 transition-colors hover:border-neutral-300"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium ${typeInfo.color}`}>
                        <TypeIcon className="h-3 w-3" />
                        {typeInfo.label}
                      </span>
                      {mediaTitle && (
                        <Link
                          href={`/library/${note.user_media_id}`}
                          className="text-xs text-indigo-600 hover:text-indigo-700 truncate"
                        >
                          {mediaTitle}
                        </Link>
                      )}
                    </div>
                    <p className="mt-2 text-sm text-neutral-700 whitespace-pre-wrap">{note.content}</p>
                    {(note.location_label || note.page_number || note.season_number) && (
                      <div className="mt-2 flex items-center gap-2 text-xs text-neutral-400">
                        {note.location_label && <span>{note.location_label}</span>}
                        {note.page_number && <span>p.{note.page_number}</span>}
                        {note.season_number && (
                          <span>
                            S{note.season_number}
                            {note.episode_number ? `E${note.episode_number}` : ''}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <span className="flex-shrink-0 text-xs text-neutral-400">
                    {formatDate(note.created_at)}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
