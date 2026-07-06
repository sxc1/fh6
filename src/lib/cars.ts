import Papa from 'papaparse'
import csvRaw from '../../data/fh6-cars.csv?raw'
import { classRank, type Car } from './types'

interface RawRow {
  Make: string
  'Car Name': string
  Year: string
  'Car Type': string
  'Car Class': string
  'Class Rating': string
  Country: string
  Collection: string
  'Add-Ons': string
  Price: string
}

export function makeCarId(make: string, name: string): string {
  return `${make}__${name}`
}

function parseCars(): Car[] {
  const parsed = Papa.parse<RawRow>(csvRaw, {
    header: true,
    skipEmptyLines: true,
  })

  const seen = new Set<string>()
  const cars: Car[] = []

  for (const row of parsed.data) {
    const make = (row.Make ?? '').trim()
    const name = (row['Car Name'] ?? '').trim()
    if (!make || !name) continue

    let id = makeCarId(make, name)
    // Guard against any duplicate name collisions so ids stay unique.
    if (seen.has(id)) {
      let n = 2
      while (seen.has(`${id}#${n}`)) n++
      id = `${id}#${n}`
    }
    seen.add(id)

    const collection = (row.Collection ?? '')
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean)

    cars.push({
      id,
      make,
      name,
      year: Number.parseInt(row.Year, 10) || 0,
      type: (row['Car Type'] ?? '').trim(),
      carClass: (row['Car Class'] ?? '').trim(),
      classRating: Number.parseInt(row['Class Rating'], 10) || 0,
      country: (row.Country ?? '').trim(),
      collection,
      addOns: (row['Add-Ons'] ?? '').trim(),
      basePrice: Number.parseInt(row.Price, 10) || 0,
    })
  }

  return cars
}

export const CARS: Car[] = parseCars()

export const CARS_BY_ID: Map<string, Car> = new Map(CARS.map((c) => [c.id, c]))

/** Sorted distinct manufacturers. */
export const MAKES: string[] = [...new Set(CARS.map((c) => c.make))].sort((a, b) =>
  a.localeCompare(b),
)

/** Sorted distinct car types (used as the "Category" filter). */
export const CAR_TYPES: string[] = [...new Set(CARS.map((c) => c.type))].sort((a, b) =>
  a.localeCompare(b),
)

/** Distinct classes present in the data, ordered by performance rank. */
export const CLASSES: string[] = [...new Set(CARS.map((c) => c.carClass))].sort(
  (a, b) => classRank(a) - classRank(b),
)

export const YEAR_MIN = Math.min(...CARS.map((c) => c.year))
export const YEAR_MAX = Math.max(...CARS.map((c) => c.year))

/**
 * Cost-range slider domain. Base prices all start at 1000, but users edit prices
 * upward, so we use a fixed, generous domain rather than the (degenerate) data min/max.
 */
export const COST_FLOOR = 0
export const COST_CEIL = 20_000_000
export const COST_STEP = 10_000
