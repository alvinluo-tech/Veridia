'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MediaStatusBadge } from '@/components/media/media-status-badge'
import { MediaTypeBadge } from '@/components/media/media-type-badge'
import { MediaProgress } from '@/components/media/media-progress'
import { MediaRating } from '@/components/media/media-rating'
import {
  updateMediaStatusAction,
  updateMediaProgressAction,
  updateMediaRatingAction,
  toggleFavoriteAction,
  removeMediaFromLibraryAction,
} from '@/app/actions/media'
import { addNoteAction, deleteNoteAction } from '@/app/actions/notes'
import { addToCollectionAction, removeFromCollectionAction } from '@/app/actions/collections'
import type { UserMediaItem, MediaNote, ActivityLog, MediaStatus, NoteType, Collection } from '@/types/media'
import {
  ArrowLeft, Heart, Trash2, Calendar, Clock, Globe, Tag,
  Plus, MessageSquare, Quote, BookOpen, PenTool, FileText,
  FolderOpen, Check, X,
} from 'lucide-react'
import Link from 'next/link'

interface DetailPageClientProps {
  item: UserMediaItem
  notes: MediaNote[]
  activity: ActivityLog[]
  collections?: Collection[]
  collectionIds?: Set<string>
}

const noteTypeIcons: Record<NoteType, typeof MessageSquare> = {
  note: MessageSquare,
  quote: Quote,
  review: Star,
  reflection: PenTool,
  summary: FileText,
}

import { Star } from 'lucide-react'

export function DetailPageClient({ item, notes, activity, collections = [], collectionIds = new Set() }: DetailPageClientProps) {
  const router = useRouter()
  const media = item.media!
  const [showNoteForm, setShowNoteForm] = useState(false)
  const [noteContent, setNoteContent] = useState('')
  const [noteType, setNoteType] = useState<NoteType>('note')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showCollections, setShowCollections] = useState(false)

  const handleStatusChange = async (status: MediaStatus) => {
    await updateMediaStatusAction(item.id, status)
  }

  const handleProgressUpdate = async (current: number) => {
    await updateMediaProgressAction(item.id, {
      current,
      total: item.progress_total ?? undefined,
      unit: item.progress_unit ?? undefined,
    })
  }

  const handleRatingChange = async (rating: number | null) => {
    await updateMediaRatingAction(item.id, rating)
  }

  const handleAddNote = async () => {
    if (!noteContent.trim()) return
    await addNoteAction({
      user_media_id: item.id,
      type: noteType,
      content: noteContent,
    })
    setNoteContent('')
    setShowNoteForm(false)
  }

  const handleDelete = async () => {
    await removeMediaFromLibraryAction(item.id)
    router.push('/library')
  }

  const handleToggleCollection = async (collectionId: string, isMember: boolean) => {
    if (isMember) {
      await removeFromCollectionAction(collectionId, item.id)
    } else {
      await addToCollectionAction(collectionId, item.id)
    }
  }

  const creators = media.creators ?? []
  const metadata = media.metadata ?? {}

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/library" className="rounded-lg p-1 hover:bg-neutral-100">
          <ArrowLeft className="h-5 w-5 text-neutral-500" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <MediaTypeBadge type={media.type} />
            <MediaStatusBadge status={item.status} />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleFavoriteAction(item.id)}
            className="rounded-lg p-2 hover:bg-neutral-100"
          >
            <Heart className={`h-5 w-5 ${item.is_favorite ? 'fill-red-500 text-red-500' : 'text-neutral-400'}`} />
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="rounded-lg p-2 text-neutral-400 hover:bg-red-50 hover:text-red-500"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Cover */}
        <div className="md:col-span-1">
          <div className="aspect-[3/4] overflow-hidden rounded-xl bg-neutral-100">
            {media.cover_url ? (
              <img src={media.cover_url} alt={media.title} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-6xl font-light text-neutral-200">
                {media.title[0]}
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="md:col-span-2 space-y-5">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900">{media.title}</h1>
            {media.original_title && (
              <p className="text-sm text-neutral-500">{media.original_title}</p>
            )}
            {creators.length > 0 && (
              <p className="mt-1 text-sm text-neutral-600">
                {creators.map(c => `${c.name} (${c.role})`).join(', ')}
              </p>
            )}
          </div>

          {media.description && (
            <p className="text-sm text-neutral-600 leading-relaxed">{media.description}</p>
          )}

          {/* Metadata tags */}
          <div className="flex flex-wrap gap-2">
            {media.genres?.map(genre => (
              <span key={genre} className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs text-neutral-600">
                <Tag className="h-3 w-3" />
                {genre}
              </span>
            ))}
            {media.language && (
              <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs text-neutral-600">
                <Globe className="h-3 w-3" />
                {media.language}
              </span>
            )}
            {media.release_date && (
              <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs text-neutral-600">
                <Calendar className="h-3 w-3" />
                {media.release_date}
              </span>
            )}
          </div>

          {/* Type-specific metadata */}
          {media.type === 'book' && (
            <div className="grid grid-cols-2 gap-3 text-sm">
              {(metadata as any).publisher && (
                <div><span className="text-neutral-400">Publisher:</span> {(metadata as any).publisher}</div>
              )}
              {(metadata as any).isbn && (
                <div><span className="text-neutral-400">ISBN:</span> {(metadata as any).isbn}</div>
              )}
              {(metadata as any).page_count && (
                <div><span className="text-neutral-400">Pages:</span> {(metadata as any).page_count}</div>
              )}
            </div>
          )}

          {media.type === 'movie' && (
            <div className="grid grid-cols-2 gap-3 text-sm">
              {(metadata as any).runtime && (
                <div><span className="text-neutral-400">Runtime:</span> {(metadata as any).runtime} min</div>
              )}
              {(metadata as any).director && (
                <div><span className="text-neutral-400">Director:</span> {(metadata as any).director}</div>
              )}
            </div>
          )}

          {media.type === 'tv' && (
            <div className="grid grid-cols-2 gap-3 text-sm">
              {(metadata as any).seasons && (
                <div><span className="text-neutral-400">Seasons:</span> {(metadata as any).seasons}</div>
              )}
              {(metadata as any).episodes && (
                <div><span className="text-neutral-400">Episodes:</span> {(metadata as any).episodes}</div>
              )}
              {(metadata as any).network && (
                <div><span className="text-neutral-400">Network:</span> {(metadata as any).network}</div>
              )}
            </div>
          )}

          {/* Status controls */}
          <div className="rounded-xl border border-neutral-200 bg-white p-4 space-y-4">
            <h3 className="text-sm font-medium text-neutral-900">Status</h3>
            <div className="flex flex-wrap gap-2">
              {(['planned', 'in_progress', 'completed', 'paused', 'dropped'] as MediaStatus[]).map(status => (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    item.status === status
                      ? 'bg-indigo-600 text-white'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  {status.replace('_', ' ')}
                </button>
              ))}
            </div>

            {/* Progress */}
            {item.progress_total && item.progress_total > 0 && (
              <div className="space-y-2">
                <MediaProgress
                  current={item.progress_current}
                  total={item.progress_total}
                  unit={item.progress_unit}
                />
                <input
                  type="range"
                  min={0}
                  max={item.progress_total}
                  value={item.progress_current}
                  onChange={(e) => handleProgressUpdate(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            )}

            {/* Rating */}
            <div>
              <span className="text-sm text-neutral-500">Rating</span>
              <div className="mt-1">
                <MediaRating rating={item.rating} onChange={handleRatingChange} size="md" />
              </div>
            </div>
          </div>

          {/* Collections */}
          {collections.length > 0 && (
            <div className="rounded-xl border border-neutral-200 bg-white p-4">
              <button
                onClick={() => setShowCollections(!showCollections)}
                className="flex w-full items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <FolderOpen className="h-4 w-4 text-neutral-400" />
                  <span className="text-sm font-medium text-neutral-900">
                    Collections ({collections.filter(c => collectionIds.has(c.id)).length})
                  </span>
                </div>
                <span className="text-xs text-neutral-400">
                  {showCollections ? 'Hide' : 'Manage'}
                </span>
              </button>

              {showCollections && (
                <div className="mt-3 space-y-2">
                  {collections.map((col) => {
                    const isMember = collectionIds.has(col.id)
                    return (
                      <button
                        key={col.id}
                        onClick={() => handleToggleCollection(col.id, isMember)}
                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                          isMember
                            ? 'bg-indigo-50 text-indigo-700'
                            : 'hover:bg-neutral-50 text-neutral-600'
                        }`}
                      >
                        <div
                          className="flex h-7 w-7 items-center justify-center rounded text-xs"
                          style={{ backgroundColor: col.color ?? '#e0e7ff' }}
                        >
                          {col.icon ?? '📁'}
                        </div>
                        <span className="flex-1 truncate">{col.name}</span>
                        {isMember && <Check className="h-4 w-4 text-indigo-600" />}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Reason to consume */}
          {item.reason_to_consume && (
            <div className="rounded-xl border border-neutral-200 bg-white p-4">
              <h3 className="text-sm font-medium text-neutral-900">Why I want to consume this</h3>
              <p className="mt-1 text-sm text-neutral-600">{item.reason_to_consume}</p>
            </div>
          )}
        </div>
      </div>

      {/* Notes section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-neutral-900">Notes ({notes.length})</h2>
          <button
            onClick={() => setShowNoteForm(!showNoteForm)}
            className="flex items-center gap-1 rounded-lg bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-100"
          >
            <Plus className="h-4 w-4" />
            Add Note
          </button>
        </div>

        {showNoteForm && (
          <div className="rounded-xl border border-neutral-200 bg-white p-4 space-y-3">
            <select
              value={noteType}
              onChange={(e) => setNoteType(e.target.value as NoteType)}
              className="rounded-lg border border-neutral-200 px-3 py-1.5 text-sm"
            >
              <option value="note">Note</option>
              <option value="quote">Quote</option>
              <option value="review">Review</option>
              <option value="reflection">Reflection</option>
              <option value="summary">Summary</option>
            </select>
            <textarea
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              placeholder="Write your note..."
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowNoteForm(false)}
                className="rounded-lg px-3 py-1.5 text-sm text-neutral-500 hover:bg-neutral-100"
              >
                Cancel
              </button>
              <button
                onClick={handleAddNote}
                disabled={!noteContent.trim()}
                className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                Save Note
              </button>
            </div>
          </div>
        )}

        {notes.length === 0 ? (
          <div className="rounded-xl border border-neutral-200 bg-white p-8 text-center">
            <p className="text-sm text-neutral-500">No notes yet. Add your first note!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notes.map((note) => (
              <div key={note.id} className="rounded-xl border border-neutral-200 bg-white p-4">
                <div className="flex items-start justify-between">
                  <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-500">
                    {note.type}
                  </span>
                  <button
                    onClick={async () => {
                      await deleteNoteAction(note.id, item.id)
                    }}
                    className="rounded p-1 text-neutral-400 hover:bg-red-50 hover:text-red-500"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <p className="mt-2 text-sm text-neutral-700 whitespace-pre-wrap">{note.content}</p>
                <div className="mt-2 flex items-center gap-3 text-xs text-neutral-400">
                  {note.page_number && <span>Page {note.page_number}</span>}
                  {note.season_number && <span>S{note.season_number}E{note.episode_number}</span>}
                  <span>{new Date(note.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-medium text-neutral-900">Remove from library?</h3>
            <p className="mt-2 text-sm text-neutral-500">
              This will remove &ldquo;{media.title}&rdquo; from your library. This action cannot be undone.
            </p>
            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
