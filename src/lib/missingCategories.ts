import { CAR_TYPES, CARS_BY_ID } from './cars'

/**
 * Categories present in the full dataset but not represented by any wishlist car.
 */
export function missingCategoriesForWishlist(wishlist: string[]): string[] {
  const represented = new Set<string>()
  for (const id of wishlist) {
    const type = CARS_BY_ID.get(id)?.type
    if (type) represented.add(type)
  }
  return CAR_TYPES.filter((type) => !represented.has(type))
}
