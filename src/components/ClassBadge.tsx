const CLASS_PANEL_STYLES: Record<string, string> = {
  D: 'bg-neutral-500',
  C: 'bg-[#007d79]',
  B: 'bg-[#4ab2ff]',
  A: 'bg-[#3d84f8]',
  S1: 'bg-[#8a3ffc]',
  S2: 'bg-[#fc7aa4]',
  R: 'bg-[#ed4142]',
  X: 'bg-primary-alt',
}

const CLASS_OUTLINE_STYLES: Record<string, string> = {
  D: 'border-neutral-500',
  C: 'border-[#007d79]',
  B: 'border-[#4ab2ff]',
  A: 'border-[#3d84f8]',
  S1: 'border-[#8a3ffc]',
  S2: 'border-[#fc7aa4]',
  R: 'border-[#ed4142]',
  X: 'border-primary-alt',
}

export function ClassBadge({ carClass, rating }: { carClass: string; rating?: number }) {
  const classPanelStyle = CLASS_PANEL_STYLES[carClass] ?? 'bg-muted'
  const outlineStyle = CLASS_OUTLINE_STYLES[carClass] ?? 'border-muted'
  return (
    <span
      className={`inline-flex items-center overflow-hidden rounded-[3px] border-[2px] ${outlineStyle}`}
      title={rating ? `Class ${carClass} - ${rating} rating` : `Class ${carClass}`}
    >
      <span
        className={`px-[7px] py-[3px] text-[12px] font-bold leading-none text-white ${classPanelStyle}`}
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
