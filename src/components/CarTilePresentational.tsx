import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { carImageUrl } from '../lib/carImages'
import type { Car } from '../lib/types'
import { CarTypeBadge } from './CarTypeBadge'
import { ClassBadge } from './ClassBadge'
import { CountryFlag } from './CountryFlag'
import { PriceDisplay } from './PriceDisplay'
import { RarityDisplay } from './RarityDisplay'

type DivProps = Omit<HTMLAttributes<HTMLDivElement>, 'children'>

interface CarTilePresentationalProps extends DivProps {
  car: Car
  price: number | null
  imageTopLeft?: ReactNode
  imageTopRight?: ReactNode
  overlay?: ReactNode
  imageDraggable?: boolean
  abbreviatedRarity?: boolean
}

export const CarTilePresentational = forwardRef<HTMLDivElement, CarTilePresentationalProps>(
  function CarTilePresentational(
    {
      car,
      price,
      imageTopLeft,
      imageTopRight,
      overlay,
      imageDraggable = false,
      abbreviatedRarity = false,
      className = '',
      ...divProps
    },
    ref,
  ) {
    const imageUrl = carImageUrl(car)

    return (
      <div
        ref={ref}
        {...divProps}
        className={`relative flex flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm ${className}`.trim()}
      >
        {/* Hero render on a light "studio" backdrop so cars of every color stay legible. */}
        <div className="relative aspect-[16/9] w-full bg-[radial-gradient(circle_at_50%_35%,#f8fafc,#cbd5e1)]">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={`${car.make} ${car.name}`}
              loading="lazy"
              decoding="async"
              draggable={imageDraggable}
              className="h-full w-full object-contain p-2"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs font-medium text-slate-500">
              No image
            </div>
          )}
          {imageTopLeft ? <div className="absolute left-2 top-2">{imageTopLeft}</div> : null}
          {imageTopRight ? <div className="absolute right-2 top-2">{imageTopRight}</div> : null}
        </div>

        <div className="flex flex-1 flex-col gap-2 p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex min-w-0 items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <CountryFlag country={car.country} />
              <span className="truncate">{car.make}</span>
            </div>
            <ClassBadge carClass={car.carClass} rating={car.classRating} />
          </div>
          <div className="min-h-5 text-sm font-semibold leading-tight">
            <span className="text-muted-foreground">{car.year}</span>{' '}
            <span>{car.modelName}</span>
          </div>
          <div className="mt-auto flex items-center justify-between gap-2 pt-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <RarityDisplay rarity={car.rarity} abbreviated={abbreviatedRarity} />
              <CarTypeBadge type={car.type} />
            </div>
            <PriceDisplay value={price} />
          </div>
        </div>

        {overlay}
      </div>
    )
  },
)
