import { useState } from 'react'
import {
  RangeSlider as KendoRangeSlider,
  type RangeSliderChangeEvent,
} from '@progress/kendo-react-inputs'

interface RangeSliderProps {
  min: number
  max: number
  value: [number, number]
  step?: number
  onChange: (value: [number, number]) => void
  /** Formats a bound for display when the input isn't being edited (e.g. "20,000,000 CR"). */
  formatValue?: (value: number) => string
  /**
   * When true, the max bound is an open-ended limit: at the ceiling its display gets a
   * trailing "+" (e.g. "2027+"), signalling everything beyond `max` is included too.
   */
  openEndedMax?: boolean
}

/**
 * Editable numeric bound. Shows the formatted value at rest; on focus it swaps to the
 * raw number for easy typing, and commits (clamped + step-snapped) on blur/Enter.
 */
function EditableBound({
  value,
  lo,
  hi,
  step,
  onCommit,
  formatValue,
  align,
  ariaLabel,
}: {
  value: number
  lo: number
  hi: number
  step: number
  onCommit: (n: number) => void
  formatValue: (v: number) => string
  align: 'left' | 'right'
  ariaLabel: string
}) {
  const [text, setText] = useState<string | null>(null)
  const editing = text !== null

  const commit = () => {
    if (text === null) return
    const digits = text.replace(/[^0-9]/g, '')
    let n = digits === '' ? value : Number.parseInt(digits, 10)
    if (!Number.isFinite(n)) n = value
    n = Math.round(n / step) * step
    n = Math.min(hi, Math.max(lo, n))
    onCommit(n)
    setText(null)
  }

  return (
    <input
      type="text"
      inputMode="numeric"
      aria-label={ariaLabel}
      value={editing ? text : formatValue(value)}
      onFocus={(e) => {
        setText(String(value))
        requestAnimationFrame(() => e.target.select())
      }}
      onChange={(e) => setText(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') e.currentTarget.blur()
        else if (e.key === 'Escape') {
          setText(null)
          e.currentTarget.blur()
        }
      }}
      className={`w-[46%] rounded-md border border-input bg-card px-2 py-1 text-xs tabular-nums outline-none focus:ring-2 focus:ring-ring ${
        align === 'right' ? 'text-right' : 'text-left'
      }`}
    />
  )
}

export function RangeSlider({
  min,
  max,
  value,
  step = 1,
  onChange,
  formatValue = (v) => String(v),
  openEndedMax = false,
}: RangeSliderProps) {
  const [lo, hi] = value

  // At the ceiling, the max bound reads "…+"; below it, it formats like any other value.
  const formatMax =
    openEndedMax && hi >= max ? (v: number) => `${formatValue(v)}+` : formatValue

  return (
    <div>
      <KendoRangeSlider
        className="fh6-range"
        min={min}
        max={max}
        step={step}
        value={{ start: lo, end: hi }}
        onChange={(e: RangeSliderChangeEvent) => {
          // KendoReact's `step` only governs keyboard arrows; dragging emits
          // continuous floats, so snap to `step` (and clamp) to keep values integral.
          const snap = (v: number) => Math.min(max, Math.max(min, Math.round(v / step) * step))
          const s = snap(e.value.start)
          const en = snap(e.value.end)
          onChange([Math.min(s, en), Math.max(s, en)])
        }}
      />
      <div className="mt-2 flex items-center justify-between gap-2">
        <EditableBound
          value={lo}
          lo={min}
          hi={hi}
          step={step}
          onCommit={(n) => onChange([n, hi])}
          formatValue={formatValue}
          align="left"
          ariaLabel="Minimum"
        />
        <EditableBound
          value={hi}
          lo={lo}
          hi={max}
          step={step}
          onCommit={(n) => onChange([lo, n])}
          formatValue={formatMax}
          align="right"
          ariaLabel="Maximum"
        />
      </div>
    </div>
  )
}
