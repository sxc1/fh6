import { classRank, type Car, type Filters, type SortDir, type SortField } from './types'

export function matchesFilters(
  car: Car,
  filters: Filters,
  priceOf: (id: string) => number,
): boolean {
  if (filters.classes.length && !filters.classes.includes(car.carClass)) return false
  if (filters.categories.length && !filters.categories.includes(car.type)) return false
  if (filters.manufacturers.length && !filters.manufacturers.includes(car.make)) return false
  if (car.year < filters.yearRange[0] || car.year > filters.yearRange[1]) return false
  const price = priceOf(car.id)
  if (price < filters.costRange[0] || price > filters.costRange[1]) return false
  return true
}

export function matchesSearch(car: Car, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return (
    car.name.toLowerCase().includes(q) ||
    car.make.toLowerCase().includes(q) ||
    car.type.toLowerCase().includes(q) ||
    car.country.toLowerCase().includes(q)
  )
}

export function compareCars(
  a: Car,
  b: Car,
  field: SortField,
  dir: SortDir,
  priceOf: (id: string) => number,
): number {
  let result = 0
  switch (field) {
    case 'name':
      result = a.name.localeCompare(b.name)
      break
    case 'make':
      result = a.make.localeCompare(b.make) || a.name.localeCompare(b.name)
      break
    case 'year':
      result = a.year - b.year
      break
    case 'class':
      result = classRank(a.carClass) - classRank(b.carClass) || a.classRating - b.classRating
      break
    case 'rating':
      result = a.classRating - b.classRating
      break
    case 'price':
      result = priceOf(a.id) - priceOf(b.id)
      break
  }
  return dir === 'asc' ? result : -result
}
