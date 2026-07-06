import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Car } from '../lib/types'
import { effectivePrice, useStore } from '../store'
import { ClassBadge, PriceDisplay } from './ui'

export function WishlistRow({ car, index }: { car: Car; index: number }) {
  const price = useStore((s) => effectivePrice(car.id, s.prices))
  const obtained = useStore((s) => s.obtained.includes(car.id))
  const toggleObtained = useStore((s) => s.toggleObtained)
  const removeFromWishlist = useStore((s) => s.removeFromWishlist)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: car.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => toggleObtained(car.id)}
      className="relative flex cursor-grab touch-none items-center gap-2 rounded-lg border border-border bg-card px-2 py-2 shadow-sm active:cursor-grabbing"
      title="Click to toggle obtained; drag to reorder"
      {...attributes}
      {...listeners}
    >
      <span className="w-6 shrink-0 text-center text-xs font-semibold text-muted-foreground tabular-nums">
        {index + 1}
      </span>

      <ClassBadge carClass={car.carClass} />

      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold">{car.name}</div>
        <div className="truncate text-xs text-muted-foreground">
          {car.make} &middot; {car.type}
        </div>
      </div>

      <PriceDisplay value={price} />

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          removeFromWishlist(car.id)
        }}
        className="shrink-0 rounded-md px-2 py-1 text-sm text-muted-foreground hover:bg-destructive hover:text-destructive-foreground"
        title="Remove from wishlist"
      >
        &times;
      </button>

      {obtained ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-lg bg-background/70">
          <span className="text-sm font-bold uppercase tracking-widest text-primary">Obtained</span>
        </div>
      ) : null}
    </div>
  )
}
