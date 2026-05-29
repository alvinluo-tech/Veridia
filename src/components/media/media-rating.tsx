'use client'
import { Star } from 'lucide-react'
import { useState } from 'react'

interface MediaRatingProps {
  rating: number | null
  onChange?: (rating: number | null) => void
  size?: 'sm' | 'md'
  readonly?: boolean
}

export function MediaRating({ rating, onChange, size = 'sm', readonly = false }: MediaRatingProps) {
  const [hovered, setHovered] = useState<number | null>(null)

  const starSize = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4.5 w-4.5'
  const displayRating = hovered ?? rating

  if (readonly && !rating) return null

  return (
    <div className="flex items-center gap-0.5" onMouseLeave={() => setHovered(null)}>
      {[1, 2, 3, 4, 5].map((value) => {
        const filled = displayRating !== null && value <= displayRating
        const halfFilled = displayRating !== null && value - 0.5 === displayRating

        return (
          <button
            key={value}
            type="button"
            disabled={readonly}
            className={`relative ${readonly ? 'cursor-default' : 'cursor-pointer'}`}
            onMouseEnter={() => !readonly && setHovered(value)}
            onClick={() => {
              if (readonly || !onChange) return
              onChange(rating === value ? null : value)
            }}
          >
            <Star
              className={`${starSize} ${
                filled
                  ? 'fill-amber-400 text-amber-400'
                  : halfFilled
                  ? 'fill-amber-400/50 text-amber-400'
                  : 'text-neutral-200'
              }`}
            />
          </button>
        )
      })}
      {rating && !readonly && (
        <span className="ml-1 text-xs text-neutral-400">{rating}</span>
      )}
    </div>
  )
}
