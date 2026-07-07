import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Car, ViewMode } from '../lib/types'
import { effectivePrice, useStore } from '../store'
import { CarTilePresentational } from './CarTilePresentational'
import { ClassBadge } from './ClassBadge'
import { CountryFlag } from './CountryFlag'
import { PriceDisplay } from './PriceDisplay'

export function WishlistRow({
  car,
  index,
  viewMode,
}: {
  car: Car
  index: number
  viewMode: ViewMode
}) {
  const price = useStore((s) => effectivePrice(car.id, s.prices))
  const acquired = useStore((s) => s.acquired.includes(car.id))
  const toggleAcquired = useStore((s) => s.toggleAcquired)
  const removeFromWishlist = useStore((s) => s.removeFromWishlist)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: car.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const remove = (e: React.MouseEvent) => {
    e.stopPropagation()
    removeFromWishlist(car.id)
  }

  const dragProps = {
    style,
    onClick: () => toggleAcquired(car.id),
    title: 'Click to toggle acquired; drag to reorder',
    ...attributes,
    ...listeners,
  }

  const acquiredOverlay = acquired ? (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-lg bg-background/70">
      <span className="text-sm font-bold uppercase tracking-widest text-primary">Acquired</span>
    </div>
  ) : null

  if (viewMode === 'list') {
    return (
      <div
        ref={setNodeRef}
        {...dragProps}
        className="relative flex cursor-grab touch-none items-start gap-2 rounded-lg border border-border bg-card px-2 py-2 shadow-sm active:cursor-grabbing"
      >
        <span className="w-6 shrink-0 text-center text-xs font-semibold text-muted-foreground tabular-nums">
          {index + 1}
        </span>

        <div className="min-w-0 flex-1">
          <div className="min-w-0 space-y-1">
            <div className="flex min-w-0 items-center gap-1.5">
              <CountryFlag country={car.country} />
              <div className="truncate text-sm font-semibold">{car.name}</div>
            </div>
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0 flex items-center gap-2">
                <ClassBadge carClass={car.carClass} rating={car.classRating} />
                <div className="truncate text-xs text-muted-foreground">{car.type}</div>
              </div>
              <PriceDisplay value={price} />
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={remove}
          className="shrink-0 rounded-md px-2 py-1 text-sm text-muted-foreground hover:bg-destructive hover:text-destructive-foreground"
          title="Remove from wishlist"
        >
          &times;
        </button>

        {acquiredOverlay}
      </div>
    )
  }

  return (
    <CarTilePresentational
      ref={setNodeRef}
      car={car}
      price={price}
      {...dragProps}
      className="cursor-grab touch-none active:cursor-grabbing"
      imageTopLeft={
        <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-background/80 px-1.5 text-xs font-bold tabular-nums text-foreground shadow-sm">
          {index + 1}
        </span>
      }
      imageTopRight={
        <button
          type="button"
          onClick={remove}
          className="flex h-6 w-6 items-center justify-center rounded-full bg-background/80 text-sm text-muted-foreground shadow-sm hover:bg-destructive hover:text-destructive-foreground"
          title="Remove from wishlist"
        >
          &times;
        </button>
      }
      overlay={acquiredOverlay}
    />
  )
}
