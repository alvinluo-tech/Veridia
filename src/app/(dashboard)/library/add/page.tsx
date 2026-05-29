'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { addManualMediaAction } from '@/app/actions/media'
import type { MediaType, MediaStatus } from '@/types/media'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

const mediaTypes: { value: MediaType; label: string }[] = [
  { value: 'book', label: 'Book' },
  { value: 'movie', label: 'Movie' },
  { value: 'tv', label: 'TV' },
  { value: 'article', label: 'Article' },
  { value: 'course', label: 'Course' },
  { value: 'podcast', label: 'Podcast' },
]

export default function AddMediaPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)

    try {
      const type = formData.get('type') as MediaType
      const title = formData.get('title') as string

      if (!type || !title) {
        setError('Type and title are required')
        setLoading(false)
        return
      }

      await addManualMediaAction({
        type,
        title,
        original_title: formData.get('original_title') as string || undefined,
        description: formData.get('description') as string || undefined,
        cover_url: formData.get('cover_url') as string || undefined,
        language: formData.get('language') as string || undefined,
        release_date: formData.get('release_date') as string || undefined,
        genres: (formData.get('genres') as string || '').split(',').map(g => g.trim()).filter(Boolean),
        status: (formData.get('status') as MediaStatus) || 'planned',
        priority: parseInt(formData.get('priority') as string) || 3,
      })

      router.push('/library')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add media')
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/library" className="rounded-lg p-1 hover:bg-neutral-100">
          <ArrowLeft className="h-5 w-5 text-neutral-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Add Media</h1>
          <p className="text-sm text-neutral-500">Manually add a book, movie, or show</p>
        </div>
      </div>

      <form action={handleSubmit} className="space-y-5 rounded-xl border border-neutral-200 bg-white p-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-neutral-700">Type *</label>
            <select
              id="type"
              name="type"
              required
              className="mt-1 block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            >
              {mediaTypes.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-neutral-700">Status</label>
            <select
              id="status"
              name="status"
              defaultValue="planned"
              className="mt-1 block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            >
              <option value="planned">Planned</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-neutral-700">Title *</label>
          <input
            id="title"
            name="title"
            type="text"
            required
            className="mt-1 block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            placeholder="Enter title"
          />
        </div>

        <div>
          <label htmlFor="original_title" className="block text-sm font-medium text-neutral-700">Original Title</label>
          <input
            id="original_title"
            name="original_title"
            type="text"
            className="mt-1 block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            placeholder="Original language title"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-neutral-700">Description</label>
          <textarea
            id="description"
            name="description"
            rows={3}
            className="mt-1 block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            placeholder="Brief description"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="language" className="block text-sm font-medium text-neutral-700">Language</label>
            <input
              id="language"
              name="language"
              type="text"
              className="mt-1 block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              placeholder="en, zh, ja..."
            />
          </div>
          <div>
            <label htmlFor="release_date" className="block text-sm font-medium text-neutral-700">Release Date</label>
            <input
              id="release_date"
              name="release_date"
              type="date"
              className="mt-1 block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label htmlFor="genres" className="block text-sm font-medium text-neutral-700">Genres</label>
          <input
            id="genres"
            name="genres"
            type="text"
            className="mt-1 block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            placeholder="sci-fi, psychology, fiction (comma separated)"
          />
        </div>

        <div>
          <label htmlFor="cover_url" className="block text-sm font-medium text-neutral-700">Cover URL</label>
          <input
            id="cover_url"
            name="cover_url"
            type="url"
            className="mt-1 block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            placeholder="https://..."
          />
        </div>

        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-neutral-700">Priority</label>
          <select
            id="priority"
            name="priority"
            defaultValue="3"
            className="mt-1 block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          >
            <option value="1">High</option>
            <option value="2">Medium</option>
            <option value="3">Normal</option>
            <option value="4">Low</option>
          </select>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>
        )}

        <div className="flex justify-end gap-3">
          <Link
            href="/library"
            className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Adding...' : 'Add to Library'}
          </button>
        </div>
      </form>
    </div>
  )
}
