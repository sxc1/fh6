interface RangeSliderProps {
  min: number
  max: number
  value: [number, number]
  step?: number
  onChange: (value: [number, number]) => void
  formatValue?: (value: number) => string
}

export function RangeSlider({
  min,
  max,
  value,
  step = 1,
  onChange,
  formatValue = (v) => String(v),
}: RangeSliderProps) {
  const [lo, hi] = value
  const span = Math.max(1, max - min)
  const loPct = ((lo - min) / span) * 100
  const hiPct = ((hi - min) / span) * 100

  return (
    <div>
      <div className="relative h-5">
        <div className="absolute top-1/2 h-1 w-full -translate-y-1/2 rounded-full bg-border" />
        <div
          className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-primary"
          style={{ left: `${loPct}%`, right: `${100 - hiPct}%` }}
        />
        <input
          type="range"
          className="range-thumb"
          min={min}
          max={max}
          step={step}
          value={lo}
          onChange={(e) => onChange([Math.min(Number(e.target.value), hi), hi])}
          aria-label="Minimum"
        />
        <input
          type="range"
          className="range-thumb"
          min={min}
          max={max}
          step={step}
          value={hi}
          onChange={(e) => onChange([lo, Math.max(Number(e.target.value), lo)])}
          aria-label="Maximum"
        />
      </div>
      <div className="mt-1 flex justify-between text-xs text-muted-foreground">
        <span>{formatValue(lo)}</span>
        <span>{formatValue(hi)}</span>
      </div>
    </div>
  )
}
