import { effectivePrice, useStore } from '../store'
import type { Car, ViewMode } from '../lib/types'
import { CarTilePresentational } from './CarTilePresentational'
import { ClassBadge } from './ClassBadge'
import { CountryFlag } from './CountryFlag'
import { PriceDisplay } from './PriceDisplay'
import { RarityDisplay } from './RarityDisplay'

function useCarBindings(car: Car) {
  const inWishlist = useStore((s) => s.wishlist.includes(car.id))
  const price = useStore((s) => effectivePrice(car.id, s.prices))
  const removeFromWishlist = useStore((s) => s.removeFromWishlist)
  return { inWishlist, price, removeFromWishlist }
}

function AddedOverlay() {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-lg bg-background/70">
      <span className="text-sm font-bold uppercase tracking-widest text-primary">Added</span>
    </div>
  )
}

export function CarBrowserCard({
  car,
  viewMode,
  onAddCar,
}: {
  car: Car
  viewMode: ViewMode
  onAddCar: (id: string) => void
}) {
  const { inWishlist, price, removeFromWishlist } = useCarBindings(car)
  const toggle = () => (inWishlist ? removeFromWishlist(car.id) : onAddCar(car.id))
  const title = inWishlist ? 'Click to remove from wishlist' : 'Click to add to wishlist'

  if (viewMode === 'tile') {
    return (
      <CarTilePresentational
        car={car}
        price={price}
        onClick={toggle}
        title={title}
        className="cursor-pointer [content-visibility:auto] [contain-intrinsic-block-size:auto_22rem]"
        overlay={inWishlist ? <AddedOverlay /> : null}
      />
    )
  }

  return (
    <div
      onClick={toggle}
      title={title}
      className="relative flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-card px-3 py-2 shadow-sm [content-visibility:auto] [contain-intrinsic-block-size:auto_5rem]"
    >
      <ClassBadge carClass={car.carClass} rating={car.classRating} />
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold">{car.name}</div>
        <div className="flex items-center gap-1.5 truncate text-xs text-muted-foreground">
          <CountryFlag country={car.country} className="ml-0.5" />
          <span className="truncate">
            {car.make} &middot; {car.type}
          </span>
        </div>
      </div>
      <div className="hidden shrink-0 sm:block">
        <RarityDisplay rarity={car.rarity} />
      </div>
      <PriceDisplay value={price} className="w-24" />
      {inWishlist ? <AddedOverlay /> : null}
    </div>
  )
}
