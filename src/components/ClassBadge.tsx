import { getClassColor } from '../lib/classColors'

export function ClassBadge({ carClass, rating }: { carClass: string; rating?: number }) {
  const classColor = getClassColor(carClass)
  return (
    <span
      className="inline-flex items-center overflow-hidden rounded-[3px] border-[2px] border-muted"
      style={classColor ? { borderColor: classColor } : undefined}
      title={rating ? `Class ${carClass} - ${rating} rating` : `Class ${carClass}`}
    >
      <span
        className="bg-muted px-[7px] py-[3px] text-[12px] font-bold leading-none text-white"
        style={classColor ? { backgroundColor: classColor } : undefined}
      >
        {carClass}
      </span>
      {rating != null ? (
        <span className="inline-flex min-w-[2.25rem] justify-center bg-black px-[8px] py-[3px] text-[12px] font-bold leading-none text-white tabular-nums">
          {rating}
        </span>
      ) : null}
    </span>
  )
}
