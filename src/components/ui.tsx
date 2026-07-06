const CLASS_STYLES: Record<string, string> = {
  D: 'bg-neutral-500 text-white',
  C: 'bg-[#007d79] text-white',
  B: 'bg-[#4ab2ff] text-white',
  A: 'bg-[#3d84f8] text-white',
  S1: 'bg-[#8a3ffc] text-white',
  S2: 'bg-[#fc7aa4] text-white',
  R: 'bg-[#ed4142] text-white',
  X: 'bg-primary-alt text-primary-foreground',
}

export function ClassBadge({ carClass, rating }: { carClass: string; rating?: number }) {
  const style = CLASS_STYLES[carClass] ?? 'bg-muted text-muted-foreground'
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-bold ${style}`}
      title={rating ? `Class ${carClass} - ${rating} rating` : `Class ${carClass}`}
    >
      {carClass}
      {rating != null ? <span className="font-medium opacity-90">{rating}</span> : null}
    </span>
  )
}

export function PriceDisplay({
  value,
  className = '',
}: {
  /** Price in CR, or null when unknown (rendered as "?"). */
  value: number | null
  className?: string
}) {
  return (
    <div
      className={`inline-flex items-baseline justify-end gap-1 tabular-nums ${className}`}
      aria-label="Price"
    >
      <span className="text-sm font-medium">{value == null ? '?' : value.toLocaleString()}</span>
      <span className="text-xs text-muted-foreground">CR</span>
    </div>
  )
}
