import { type ReactNode, useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  CAR_TYPES,
  CLASSES,
  COST_CEIL,
  COST_FLOOR,
  COST_STEP,
  COUNTRIES,
  RARITIES,
  makesForCountries,
  YEAR_MAX,
  YEAR_MIN,
} from '../lib/cars'
import { getClassColor } from '../lib/classColors'
import { missingCategoriesForWishlist } from '../lib/missingCategories'
import { useStore } from '../store'
import { CountryFlag } from './CountryFlag'
import { MultiSelect } from './MultiSelect'
import { RangeSlider } from './RangeSlider'

function Section({
  title,
  count,
  onClear,
  children,
}: {
  title: string
  count?: number
  onClear?: () => void
  children: ReactNode
}) {
  return (
    <div className="border-b border-border py-3">
      <div className="flex w-full items-center justify-between text-left text-sm font-semibold">
        <span className="flex items-center gap-2 py-0.5">
          {title}
          {count ? (
            <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
              {count}
            </span>
          ) : null}
        </span>
        {onClear ? (
          <button
            type="button"
            onClick={onClear}
            className="rounded-md px-2 py-1 text-xs font-medium text-primary hover:bg-secondary"
          >
            Clear
          </button>
        ) : null}
      </div>
      <div className="mt-3">{children}</div>
    </div>
  )
}

export function FilterPanel() {
  const filters = useStore((s) => s.filters)
  const leftPanelCollapsed = useStore((s) => s.leftPanelCollapsed)
  const toggleLeftPanel = useStore((s) => s.toggleLeftPanel)
  const toggleClass = useStore((s) => s.toggleClass)
  const toggleCategory = useStore((s) => s.toggleCategory)
  const setCategories = useStore((s) => s.setCategories)
  const toggleManufacturer = useStore((s) => s.toggleManufacturer)
  const toggleCountry = useStore((s) => s.toggleCountry)
  const toggleRarity = useStore((s) => s.toggleRarity)
  const clearClasses = useStore((s) => s.clearClasses)
  const clearCategories = useStore((s) => s.clearCategories)
  const clearManufacturers = useStore((s) => s.clearManufacturers)
  const clearCountries = useStore((s) => s.clearCountries)
  const clearRarities = useStore((s) => s.clearRarities)
  const setYearRange = useStore((s) => s.setYearRange)
  const setCostRange = useStore((s) => s.setCostRange)
  const resetFilters = useStore((s) => s.resetFilters)
  const wishlist = useStore((s) => s.wishlist)

  const yearFiltered = filters.yearRange[0] !== YEAR_MIN || filters.yearRange[1] !== YEAR_MAX
  const costFiltered = filters.costRange[0] !== COST_FLOOR || filters.costRange[1] !== COST_CEIL

  // Country narrows the manufacturer picker. Manufacturers already selected but no longer
  // in a selected country are kept and pinned to the top so the selection stays visible
  // and removable (they also remain as chips in the trigger).
  const manufacturerOptions = useMemo(() => {
    const inCountry = makesForCountries(filters.countries)
    const inCountrySet = new Set(inCountry)
    const pinned = filters.manufacturers
      .filter((m) => !inCountrySet.has(m))
      .sort((a, b) => a.localeCompare(b))
    return pinned.length ? [...pinned, ...inCountry] : inCountry
  }, [filters.countries, filters.manufacturers])

  const activeCount =
    filters.classes.length +
    filters.categories.length +
    filters.manufacturers.length +
    filters.countries.length +
    filters.rarities.length +
    (yearFiltered ? 1 : 0) +
    (costFiltered ? 1 : 0)

  const missingCategories = useMemo(
    () => missingCategoriesForWishlist(wishlist),
    [wishlist],
  )
  const hasMissingCategories = missingCategories.length > 0
  const applyMissingCategories = () => setCategories(missingCategories)

  if (leftPanelCollapsed) {
    return (
      <button
        type="button"
        onClick={toggleLeftPanel}
        title="Show filters"
        className="flex h-full w-full flex-col items-center gap-3 py-3 hover:bg-secondary/40"
      >
        <ChevronRight size={16} strokeWidth={2.25} />
        {activeCount ? (
          <span className="rounded-full bg-primary px-1.5 py-0.5 text-xs font-medium text-primary-foreground">
            {activeCount}
          </span>
        ) : null}
        <span
          className="text-sm font-bold uppercase tracking-wide text-muted-foreground [writing-mode:vertical-rl]"
        >
          Filters
        </span>
      </button>
    )
  }

  return (
    <div className="flex h-full w-72 flex-col">
      <div
        className="flex cursor-pointer items-center justify-between border-b border-border px-4 py-3"
        role="button"
        tabIndex={0}
        onClick={toggleLeftPanel}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            toggleLeftPanel()
          }
        }}
      >
        <div className="flex items-center gap-2">
          <ChevronLeft size={16} strokeWidth={2.25} />
          <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
            Filters
          </h2>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            resetFilters()
          }}
          disabled={activeCount === 0}
          className="rounded-md px-2 py-1 text-xs font-medium text-primary hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-40"
        >
          Clear all
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6">
        <Section
          title="Class"
          count={filters.classes.length}
          onClear={filters.classes.length ? clearClasses : undefined}
        >
          <div className="flex flex-wrap gap-2">
            {CLASSES.map((c) => {
              const active = filters.classes.includes(c)
              const classColor = getClassColor(c)
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => toggleClass(c)}
                  className={`rounded-md border px-3 py-1 text-sm font-medium transition-colors ${
                    active
                      ? 'border-primary bg-primary text-white'
                      : 'border-border bg-card hover:bg-secondary'
                  }`}
                  style={
                    active && classColor
                      ? { backgroundColor: classColor, borderColor: classColor }
                      : undefined
                  }
                >
                  {c}
                </button>
              )
            })}
          </div>
        </Section>

        <Section
          title="Category"
          count={filters.categories.length}
          onClear={filters.categories.length ? clearCategories : undefined}
        >
          <MultiSelect
            options={CAR_TYPES}
            selected={filters.categories}
            onToggle={toggleCategory}
            placeholder="All categories"
            searchPlaceholder="Search categories..."
            menuAction={{
              label: 'Auto-select missing categories',
              onClick: applyMissingCategories,
              disabled: !hasMissingCategories,
              title: hasMissingCategories
                ? 'Select categories not yet in wishlist'
                : 'All categories are already represented in your wishlist',
            }}
          />
        </Section>

        <Section
          title="Country"
          count={filters.countries.length}
          onClear={filters.countries.length ? clearCountries : undefined}
        >
          <MultiSelect
            options={COUNTRIES}
            selected={filters.countries}
            onToggle={toggleCountry}
            placeholder="All countries"
            searchPlaceholder="Search countries..."
            renderOption={(c) => (
              <span className="inline-flex min-w-0 items-center gap-1.5">
                <CountryFlag country={c} />
                <span className="truncate">{c}</span>
              </span>
            )}
          />
        </Section>

        <Section
          title="Manufacturer"
          count={filters.manufacturers.length}
          onClear={filters.manufacturers.length ? clearManufacturers : undefined}
        >
          <MultiSelect
            options={manufacturerOptions}
            selected={filters.manufacturers}
            onToggle={toggleManufacturer}
            placeholder="All manufacturers"
            searchPlaceholder="Search manufacturers..."
          />
        </Section>

        <Section
          title="Year range"
          onClear={yearFiltered ? () => setYearRange([YEAR_MIN, YEAR_MAX]) : undefined}
        >
          <RangeSlider
            min={YEAR_MIN}
            max={YEAR_MAX}
            value={filters.yearRange}
            onChange={setYearRange}
            openEndedMax
          />
        </Section>

        <Section
          title="Price range"
          onClear={costFiltered ? () => setCostRange([COST_FLOOR, COST_CEIL]) : undefined}
        >
          <RangeSlider
            min={COST_FLOOR}
            max={COST_CEIL}
            step={COST_STEP}
            value={filters.costRange}
            onChange={setCostRange}
            formatValue={(v) => v.toLocaleString()}
            openEndedMax
            scale="log"
          />
        </Section>

        <Section
          title="Rarity"
          count={filters.rarities.length}
          onClear={filters.rarities.length ? clearRarities : undefined}
        >
          <MultiSelect
            options={RARITIES}
            selected={filters.rarities}
            onToggle={toggleRarity}
            placeholder="All rarities"
            searchPlaceholder="Search rarities..."
          />
        </Section>
      </div>
    </div>
  )
}
