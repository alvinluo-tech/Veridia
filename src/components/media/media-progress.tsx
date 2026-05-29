interface MediaProgressProps {
  current: number
  total: number | null
  unit: string | null
  className?: string
}

export function MediaProgress({ current, total, unit, className = '' }: MediaProgressProps) {
  if (!total || total === 0) return null

  const percent = Math.min(Math.round((current / total) * 100), 100)

  return (
    <div className={`space-y-1 ${className}`}>
      <div className="flex items-center justify-between text-xs text-neutral-500">
        <span>{current} / {total} {unit ?? ''}</span>
        <span>{percent}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-100">
        <div
          className="h-full rounded-full bg-indigo-500 transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}
