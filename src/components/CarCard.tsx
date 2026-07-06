import { effectivePrice, useStore } from '../store'
import type { Car, ViewMode } from '../lib/types'
import { ClassBadge, PriceInput } from './ui'

function useCarBindings(car: Car) {
  const inWishlist = useStore((s) => s.wishlist.includes(car.id))
  const price = useStore((s) => effectivePrice(car.id, s.prices))
  const addToWishlist = useStore((s) => s.addToWishlist)
  const removeFromWishlist = useStore((s) => s.removeFromWishlist)
  const setPrice = useStore((s) => s.setPrice)
  return { inWishlist, price, addToWishlist, removeFromWishlist, setPrice }
}

function AddButton({ inWishlist, onClick }: { inWishlist: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-md px-3 py-1.5 text-sm font-semibold transition-colors ${
        inWishlist
          ? 'bg-secondary text-secondary-foreground hover:bg-destructive hover:text-destructive-foreground'
          : 'bg-primary text-primary-foreground hover:opacity-90'
      }`}
    >
      {inWishlist ? 'In list' : '+ Add'}
    </button>
  )
}

export function CarCard({ car, viewMode }: { car: Car; viewMode: ViewMode }) {
  const { inWishlist, price, addToWishlist, removeFromWishlist, setPrice } = useCarBindings(car)
  const toggle = () => (inWishlist ? removeFromWishlist(car.id) : addToWishlist(car.id))

  if (viewMode === 'tile') {
    return (
      <div className="flex flex-col gap-2 rounded-lg border border-border bg-card p-3 shadow-sm">
        <div className="flex items-start justify-between gap-2">
          <ClassBadge carClass={car.carClass} rating={car.classRating} />
          <span className="text-xs text-muted-foreground">{car.year}</span>
        </div>
        <div className="min-h-10">
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {car.make}
          </div>
          <div className="text-sm font-semibold leading-tight">{car.name}</div>
        </div>
        <div className="flex flex-wrap gap-1 text-xs text-muted-foreground">
          <span className="rounded bg-secondary px-1.5 py-0.5 text-secondary-foreground">
            {car.type}
          </span>
          <span className="rounded bg-secondary px-1.5 py-0.5 text-secondary-foreground">
            {car.country}
          </span>
        </div>
        <div className="mt-auto flex items-center justify-between gap-2 pt-1">
          <PriceInput value={price} onCommit={(v) => setPrice(car.id, v)} />
          <AddButton inWishlist={inWishlist} onClick={toggle} />
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2 shadow-sm">
      <ClassBadge carClass={car.carClass} rating={car.classRating} />
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold">{car.name}</div>
        <div className="truncate text-xs text-muted-foreground">
          {car.make} &middot; {car.type} &middot; {car.country}
        </div>
      </div>
      <span className="hidden w-12 shrink-0 text-right text-sm text-muted-foreground sm:block">
        {car.year}
      </span>
      <PriceInput value={price} onCommit={(v) => setPrice(car.id, v)} />
      <AddButton inWishlist={inWishlist} onClick={toggle} />
    </div>
  )
}
