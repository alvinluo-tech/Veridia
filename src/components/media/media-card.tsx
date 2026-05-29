'use client'
import Link from 'next/link'
import { MediaStatusBadge } from './media-status-badge'
import { MediaTypeBadge } from './media-type-badge'
import { MediaProgress } from './media-progress'
import { MediaRating } from './media-rating'
import { updateMediaRatingAction } from '@/app/actions/media'
import type { UserMediaItem } from '@/types/media'
import { Heart } from 'lucide-react'

interface MediaCardProps {
  item: UserMediaItem
}

export function MediaCard({ item }: MediaCardProps) {
  const media = item.media
  if (!media) return null

  return (
    <Link
      href={`/library/${item.id}`}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white transition-shadow hover:shadow-md"
    >
      {/* Cover */}
      <div className="relative aspect-[3/4] overflow-hidden bg-neutral-100">
        {media.cover_url ? (
          <img
            src={media.cover_url}
            alt={media.title}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-neutral-300">
            <span className="text-4xl font-light">{media.title[0]}</span>
          </div>
        )}
        {/* Favorite indicator */}
        {item.is_favorite && (
          <div className="absolute right-2 top-2">
            <Heart className="h-4 w-4 fill-red-500 text-red-500" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <MediaTypeBadge type={media.type} />
          <MediaStatusBadge status={item.status} />
        </div>

        <h3 className="line-clamp-2 text-sm font-medium text-neutral-900">{media.title}</h3>

        {media.creators.length > 0 && (
          <p className="text-xs text-neutral-500 line-clamp-1">
            {media.creators.map(c => c.name).join(', ')}
          </p>
        )}

        {item.progress_total && item.progress_total > 0 && (
          <MediaProgress
            current={item.progress_current}
            total={item.progress_total}
            unit={item.progress_unit}
          />
        )}

        {item.rating !== null && (
          <MediaRating rating={item.rating} readonly />
        )}

        {media.genres.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {media.genres.slice(0, 3).map(genre => (
              <span key={genre} className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] text-neutral-500">
                {genre}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}
