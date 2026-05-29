import Link from 'next/link'
import { MediaStatusBadge } from './media-status-badge'
import { MediaTypeBadge } from './media-type-badge'
import { MediaRating } from './media-rating'
import type { UserMediaItem } from '@/types/media'
import { Heart } from 'lucide-react'

interface MediaListProps {
  items: UserMediaItem[]
}

export function MediaList({ items }: MediaListProps) {
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
    <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
      <table className="w-full">
        <thead>
          <tr className="border-b border-neutral-100 bg-neutral-50 text-left text-xs font-medium text-neutral-500">
            <th className="px-4 py-3">Title</th>
            <th className="px-4 py-3">Type</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Progress</th>
            <th className="px-4 py-3">Rating</th>
            <th className="px-4 py-3">Updated</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const media = item.media
            if (!media) return null
            return (
              <tr key={item.id} className="border-b border-neutral-50 hover:bg-neutral-50/50">
                <td className="px-4 py-3">
                  <Link href={`/library/${item.id}`} className="flex items-center gap-3 group">
                    <div className="h-10 w-7 flex-shrink-0 overflow-hidden rounded bg-neutral-100">
                      {media.cover_url ? (
                        <img src={media.cover_url} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-neutral-300">{media.title[0]}</div>
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-neutral-900 group-hover:text-indigo-600">
                        {media.title}
                        {item.is_favorite && <Heart className="ml-1 inline h-3 w-3 fill-red-500 text-red-500" />}
                      </div>
                      {media.creators.length > 0 && (
                        <div className="text-xs text-neutral-400">{media.creators[0].name}</div>
                      )}
                    </div>
                  </Link>
                </td>
                <td className="px-4 py-3"><MediaTypeBadge type={media.type} /></td>
                <td className="px-4 py-3"><MediaStatusBadge status={item.status} /></td>
                <td className="px-4 py-3 text-sm text-neutral-600">
                  {item.progress_total ? `${item.progress_current}/${item.progress_total} ${item.progress_unit ?? ''}` : '—'}
                </td>
                <td className="px-4 py-3"><MediaRating rating={item.rating} readonly /></td>
                <td className="px-4 py-3 text-xs text-neutral-400">
                  {item.last_interacted_at ? new Date(item.last_interacted_at).toLocaleDateString() : '—'}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
