import type { MediaStatus } from '@/types/media'

const statusConfig: Record<MediaStatus, { label: string; className: string }> = {
  planned: { label: 'Planned', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  in_progress: { label: 'In Progress', className: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  completed: { label: 'Completed', className: 'bg-green-50 text-green-700 border-green-200' },
  paused: { label: 'Paused', className: 'bg-neutral-100 text-neutral-600 border-neutral-200' },
  dropped: { label: 'Dropped', className: 'bg-red-50 text-red-600 border-red-200' },
  archived: { label: 'Archived', className: 'bg-neutral-50 text-neutral-400 border-neutral-200' },
}

interface MediaStatusBadgeProps {
  status: MediaStatus
  className?: string
}

export function MediaStatusBadge({ status, className = '' }: MediaStatusBadgeProps) {
  const config = statusConfig[status]
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${config.className} ${className}`}>
      {config.label}
    </span>
  )
}
