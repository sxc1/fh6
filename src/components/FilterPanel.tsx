import { useMemo, useState, type ReactNode } from 'react'
import {
  CAR_TYPES,
  CLASSES,
  COST_CEIL,
  COST_FLOOR,
  COST_STEP,
  MAKES,
  YEAR_MAX,
  YEAR_MIN,
} from '../lib/cars'
import { useStore } from '../store'
import { RangeSlider } from './RangeSlider'

function Section({
  title,
  count,
  children,
  defaultOpen = true,
}: {
  title: string
  count?: number
  children: ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-border py-3">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between text-left text-sm font-semibold"
      >
        <span className="flex items-center gap-2">
          {title}
          {count ? (
            <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
              {count}
            </span>
          ) : null}
        </span>
        <span
          className={`text-muted-foreground transition-transform ${open ? 'rotate-90' : ''}`}
          aria-hidden
        >
          &#9656;
        </span>
      </button>
      {open ? <div className="mt-3">{children}</div> : null}
    </div>
  )
}

function CheckItem({
  label,
  checked,
  onToggle,
}: {
  label: string
  checked: boolean
  onToggle: () => void
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 rounded px-1 py-1 text-sm hover:bg-secondary">
      <input
        type="checkbox"
        checked={checked}
        onChange={onToggle}
        className="h-4 w-4 accent-primary"
      />
      <span className="truncate">{label}</span>
    </label>
  )
}

export function FilterPanel() {
  const filters = useStore((s) => s.filters)
  const toggleClass = useStore((s) => s.toggleClass)
  const toggleCategory = useStore((s) => s.toggleCategory)
  const toggleManufacturer = useStore((s) => s.toggleManufacturer)
  const setYearRange = useStore((s) => s.setYearRange)
  const setCostRange = useStore((s) => s.setCostRange)
  const resetFilters = useStore((s) => s.resetFilters)

  const [makeQuery, setMakeQuery] = useState('')
  const [typeQuery, setTypeQuery] = useState('')

  const filteredMakes = useMemo(() => {
    const q = makeQuery.trim().toLowerCase()
    return q ? MAKES.filter((m) => m.toLowerCase().includes(q)) : MAKES
  }, [makeQuery])

  const filteredTypes = useMemo(() => {
    const q = typeQuery.trim().toLowerCase()
    return q ? CAR_TYPES.filter((t) => t.toLowerCase().includes(q)) : CAR_TYPES
  }, [typeQuery])

  const activeCount =
    filters.classes.length +
    filters.categories.length +
    filters.manufacturers.length +
    (filters.yearRange[0] !== YEAR_MIN || filters.yearRange[1] !== YEAR_MAX ? 1 : 0) +
    (filters.costRange[0] !== COST_FLOOR || filters.costRange[1] !== COST_CEIL ? 1 : 0)

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-4 py-3">
        <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Filters</h2>
        <button
          type="button"
          onClick={resetFilters}
          disabled={activeCount === 0}
          className="rounded-md px-2 py-1 text-xs font-medium text-primary hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-40"
        >
          Clear all
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6">
        <Section title="Class" count={filters.classes.length}>
          <div className="flex flex-wrap gap-2">
            {CLASSES.map((c) => {
              const active = filters.classes.includes(c)
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => toggleClass(c)}
                  className={`rounded-md border px-3 py-1 text-sm font-medium transition-colors ${
                    active
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-card hover:bg-secondary'
                  }`}
                >
                  {c}
                </button>
              )
            })}
          </div>
        </Section>

        <Section title="Category" count={filters.categories.length}>
          <input
            type="text"
            value={typeQuery}
            onChange={(e) => setTypeQuery(e.target.value)}
            placeholder="Search categories..."
            className="mb-2 w-full rounded-md border border-input bg-card px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          <div className="max-h-56 overflow-y-auto pr-1">
            {filteredTypes.map((t) => (
              <CheckItem
                key={t}
                label={t}
                checked={filters.categories.includes(t)}
                onToggle={() => toggleCategory(t)}
              />
            ))}
          </div>
        </Section>

        <Section title="Manufacturer" count={filters.manufacturers.length}>
          <input
            type="text"
            value={makeQuery}
            onChange={(e) => setMakeQuery(e.target.value)}
            placeholder="Search manufacturers..."
            className="mb-2 w-full rounded-md border border-input bg-card px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          <div className="max-h-56 overflow-y-auto pr-1">
            {filteredMakes.map((m) => (
              <CheckItem
                key={m}
                label={m}
                checked={filters.manufacturers.includes(m)}
                onToggle={() => toggleManufacturer(m)}
              />
            ))}
          </div>
        </Section>

        <Section title="Year range">
          <RangeSlider
            min={YEAR_MIN}
            max={YEAR_MAX}
            value={filters.yearRange}
            onChange={setYearRange}
          />
        </Section>

        <Section title="Cost range">
          <RangeSlider
            min={COST_FLOOR}
            max={COST_CEIL}
            step={COST_STEP}
            value={filters.costRange}
            onChange={setCostRange}
            formatValue={(v) => `${v.toLocaleString()} CR`}
          />
        </Section>
      </div>
    </div>
  )
}
