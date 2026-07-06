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
