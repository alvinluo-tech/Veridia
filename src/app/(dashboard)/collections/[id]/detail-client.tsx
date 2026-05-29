'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Collection, UserMediaItem } from '@/types/media'
import { updateCollectionAction, removeFromCollectionAction } from '@/app/actions/collections'
import { MediaGrid } from '@/components/media/media-grid'
import { ArrowLeft, Edit, X, Trash2 } from 'lucide-react'

interface CollectionDetailClientProps {
  collection: Collection & { items?: UserMediaItem[] }
}

export function CollectionDetailClient({ collection }: CollectionDetailClientProps) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(collection.name)
  const [description, setDescription] = useState(collection.description ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const items = collection.items ?? []

  const handleSave = async () => {
    if (!name.trim()) return

    setSaving(true)
    setError(null)
    try {
      await updateCollectionAction(collection.id, {
        name: name.trim(),
        description: description.trim() || undefined,
      })
      setEditing(false)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update')
    } finally {
      setSaving(false)
    }
  }

  const handleRemoveItem = async (userMediaId: string) => {
    try {
      await removeFromCollectionAction(collection.id, userMediaId)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove item')
    }
  }

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/collections"
        className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Collections
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-xl text-2xl"
            style={{ backgroundColor: collection.color ?? '#e0e7ff' }}
          >
            {collection.icon ?? '📁'}
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900">{collection.name}</h1>
            {collection.description && (
              <p className="text-sm text-neutral-500">{collection.description}</p>
            )}
            <p className="mt-1 text-xs text-neutral-400">{items.length} items</p>
          </div>
        </div>
        <button
          onClick={() => setEditing(true)}
          className="flex items-center gap-1.5 rounded-lg border border-neutral-300 px-3 py-1.5 text-sm text-neutral-600 hover:bg-neutral-50"
        >
          <Edit className="h-3.5 w-3.5" />
          Edit
        </button>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>
      )}

      {/* Edit dialog */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setEditing(false)}>
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-neutral-900">Edit Collection</h2>
              <button onClick={() => setEditing(false)} className="rounded-lg p-1 hover:bg-neutral-100">
                <X className="h-5 w-5 text-neutral-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="mt-1 block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setEditing(false)}
                className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !name.trim()}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Items */}
      {items.length === 0 ? (
        <div className="rounded-xl border border-neutral-200 bg-white p-12 text-center">
          <h3 className="text-lg font-medium text-neutral-900">No items in this collection</h3>
          <p className="mt-2 text-sm text-neutral-500">
            Add items from your library to this collection.
          </p>
          <Link
            href="/library"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Browse Library
          </Link>
        </div>
      ) : (
        <MediaGrid items={items} />
      )}
    </div>
  )
}
