import type { UserMediaItem } from '@/types/media'
import { MediaCard } from './media-card'

interface MediaGridProps {
  items: UserMediaItem[]
}

export function MediaGrid({ items }: MediaGridProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-neutral-200 bg-white p-12 text-center">
        <h3 className="text-lg font-medium text-neutral-900">Your library is waiting.</h3>
        <p className="mt-2 text-sm text-neutral-500">
          Add books, films, shows, articles, and courses you want to read, watch, or learn.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {items.map((item) => (
        <MediaCard key={item.id} item={item} />
      ))}
    </div>
  )
}
