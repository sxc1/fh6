import type { Car } from './types'
import manifest from './car-images.json'

/**
 * Car render images live in public/assets/cars/<slug>.<ext> and are indexed by
 * a slug derived purely from the car's make + name. See
 * scripts/download_car_images.py, whose slugify() MUST stay identical to
 * carImageSlug() below so the two agree on filenames.
 */
const IMAGES = manifest as Record<string, string>

/**
 * Stable, collision-free image key for a car. Because (make, name) is unique
 * across the dataset, the slug can be recomputed from any car row without a
 * lookup table.
 *
 * Algorithm (mirrors slugify() in scripts/download_car_images.py):
 *   NFKD-normalize, drop combining marks, lower-case, collapse every run of
 *   non-alphanumeric characters to a single hyphen, trim leading/trailing ones.
 */
export function carImageSlug(car: Pick<Car, 'make' | 'name'>): string {
  return `${car.make} ${car.name}`
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Public URL for a car's render, honoring Vite's base path, or `null` when no
 * image was found for that car.
 */
export function carImageUrl(car: Pick<Car, 'make' | 'name'>): string | null {
  const file = IMAGES[carImageSlug(car)]
  return file ? `${import.meta.env.BASE_URL}assets/cars/${file}` : null
}
