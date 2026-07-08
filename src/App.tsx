import { useEffect } from 'react'
import { CarBrowser } from './components/CarBrowser'
import { FilterPanel } from './components/FilterPanel'
import { WishlistPanel } from './components/WishlistPanel'
import { useStore } from './store'

export default function App() {
  const leftPanelCollapsed = useStore((s) => s.leftPanelCollapsed)
  const wishlistPanelExpanded = useStore((s) => s.wishlistPanelExpanded)

  useEffect(() => {
    document.documentElement.classList.add('dark')
  }, [])

  return (
    <div className="flex h-screen bg-background text-foreground">
      <aside
        className={`shrink-0 overflow-hidden border-r border-border bg-card transition-all duration-200 ${
          leftPanelCollapsed ? 'w-12' : 'w-72'
        }`}
      >
        <FilterPanel />
      </aside>

      <main className="min-w-0 flex-1">
        <CarBrowser />
      </main>

      <aside
        className={`shrink-0 border-l border-border bg-card transition-all duration-200 ${
          wishlistPanelExpanded ? 'w-[min(56rem,60vw)]' : 'w-96'
        }`}
      >
        <WishlistPanel />
      </aside>
    </div>
  )
}
