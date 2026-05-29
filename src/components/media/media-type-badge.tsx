import type { MediaType } from '@/types/media'
import { BookOpen, Film, Tv, FileText, GraduationCap, Headphones } from 'lucide-react'

const typeConfig: Record<MediaType, { label: string; icon: typeof BookOpen; className: string }> = {
  book: { label: 'Book', icon: BookOpen, className: 'bg-blue-50 text-blue-700 border-blue-200' },
  movie: { label: 'Movie', icon: Film, className: 'bg-purple-50 text-purple-700 border-purple-200' },
  tv: { label: 'TV', icon: Tv, className: 'bg-pink-50 text-pink-700 border-pink-200' },
  article: { label: 'Article', icon: FileText, className: 'bg-orange-50 text-orange-700 border-orange-200' },
  course: { label: 'Course', icon: GraduationCap, className: 'bg-teal-50 text-teal-700 border-teal-200' },
  podcast: { label: 'Podcast', icon: Headphones, className: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
}

interface MediaTypeBadgeProps {
  type: MediaType
  showIcon?: boolean
  className?: string
}

export function MediaTypeBadge({ type, showIcon = true, className = '' }: MediaTypeBadgeProps) {
  const config = typeConfig[type]
  const Icon = config.icon
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${config.className} ${className}`}>
      {showIcon && <Icon className="h-3 w-3" />}
      {config.label}
    </span>
  )
}
