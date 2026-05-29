'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Collection } from '@/types/media'
import { createCollectionAction, deleteCollectionAction } from '@/app/actions/collections'
import { FolderOpen, Plus, X, Trash2 } from 'lucide-react'

interface CollectionsClientProps {
  collections: Collection[]
}

export function CollectionsClient({ collections }: CollectionsClientProps) {
  const router = useRouter()
  const [showCreate, setShowCreate] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCreate = async () => {
    if (!name.trim()) return

    setCreating(true)
    setError(null)
    try {
      await createCollectionAction({ name: name.trim(), description: description.trim() || undefined })
      setShowCreate(false)
      setName('')
      setDescription('')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create collection')
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this collection? Items in it will not be deleted.')) return

    try {
      await deleteCollectionAction(id)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete collection')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Collections</h1>
          <p className="text-sm text-neutral-500">{collections.length} collections</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" />
          New Collection
        </button>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>
      )}

      {/* Create dialog */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowCreate(false)}>
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-neutral-900">New Collection</h2>
              <button onClick={() => setShowCreate(false)} className="rounded-lg p-1 hover:bg-neutral-100">
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
                  placeholder="e.g., Summer Reading List"
                  className="mt-1 block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional description..."
                  rows={3}
                  className="mt-1 block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowCreate(false)}
                className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={creating || !name.trim()}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {creating ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Collections grid */}
      {collections.length === 0 ? (
        <div className="rounded-xl border border-neutral-200 bg-white p-12 text-center">
          <FolderOpen className="mx-auto h-8 w-8 text-neutral-300" />
          <h3 className="mt-3 text-lg font-medium text-neutral-900">No collections yet</h3>
          <p className="mt-2 text-sm text-neutral-500">
            Create collections to organize your media by theme, mood, or purpose.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((collection) => (
            <div
              key={collection.id}
              className="group relative rounded-xl border border-neutral-200 bg-white p-5 transition-colors hover:border-indigo-300"
            >
              <Link href={`/collections/${collection.id}`} className="block">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-lg text-lg"
                    style={{ backgroundColor: collection.color ?? '#e0e7ff' }}
                  >
                    {collection.icon ?? '📁'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-medium text-neutral-900">{collection.name}</h3>
                    {collection.description && (
                      <p className="mt-0.5 truncate text-xs text-neutral-500">{collection.description}</p>
                    )}
                  </div>
                </div>
              </Link>

              <button
                onClick={() => handleDelete(collection.id)}
                className="absolute right-3 top-3 rounded-lg p-1.5 text-neutral-300 opacity-0 transition-opacity hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
