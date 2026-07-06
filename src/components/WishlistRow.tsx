import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Car } from '../lib/types'
import { effectivePrice, useStore } from '../store'
import { ClassBadge, PriceInput } from './ui'

export function WishlistRow({ car, index }: { car: Car; index: number }) {
  const price = useStore((s) => effectivePrice(car.id, s.prices))
  const obtained = useStore((s) => s.obtained.includes(car.id))
  const setPrice = useStore((s) => s.setPrice)
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
      className={`flex items-center gap-2 rounded-lg border border-border bg-card px-2 py-2 shadow-sm ${
        obtained ? 'opacity-60' : ''
      }`}
    >
      <button
        type="button"
        className="cursor-grab touch-none px-1 text-muted-foreground hover:text-foreground active:cursor-grabbing"
        title="Drag to reorder"
        {...attributes}
        {...listeners}
      >
        &#8942;&#8942;
      </button>

      <span className="w-6 shrink-0 text-center text-xs font-semibold text-muted-foreground tabular-nums">
        {index + 1}
      </span>

      <input
        type="checkbox"
        checked={obtained}
        onChange={() => toggleObtained(car.id)}
        className="h-4 w-4 shrink-0 accent-primary"
        title="Mark as obtained"
      />

      <ClassBadge carClass={car.carClass} />

      <div className="min-w-0 flex-1">
        <div className={`truncate text-sm font-semibold ${obtained ? 'line-through' : ''}`}>
          {car.name}
        </div>
        <div className="truncate text-xs text-muted-foreground">
          {car.make} &middot; {car.type}
        </div>
      </div>

      <PriceInput value={price} onCommit={(v) => setPrice(car.id, v)} />

      <button
        type="button"
        onClick={() => removeFromWishlist(car.id)}
        className="shrink-0 rounded-md px-2 py-1 text-sm text-muted-foreground hover:bg-destructive hover:text-destructive-foreground"
        title="Remove from wishlist"
      >
        &times;
      </button>
    </div>
  )
}
