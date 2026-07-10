import { CarBrowserDisplay } from './CarBrowserDisplay'
import { CarBrowserHeader } from './CarBrowserHeader'

export function CarBrowser({ onAddCar }: { onAddCar: (id: string) => void }) {
  return (
    <div className="flex h-full flex-col">
      <CarBrowserHeader />
      <CarBrowserDisplay onAddCar={onAddCar} />
    </div>
  )
}
