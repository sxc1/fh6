import { useEffect } from 'react'
import { CarBrowser } from './components/CarBrowser'
import { FilterPanel } from './components/FilterPanel'
import { WishlistPanel } from './components/WishlistPanel'
import { useStore } from './store'

export default function App() {
  const leftPanelCollapsed = useStore((s) => s.leftPanelCollapsed)
  const toggleLeftPanel = useStore((s) => s.toggleLeftPanel)

  useEffect(() => {
    document.documentElement.classList.add('dark')
  }, [])

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      <header className="flex shrink-0 items-center gap-3 border-b border-border px-4 py-3">
        <button
          type="button"
          onClick={toggleLeftPanel}
          className="rounded-md border border-input bg-card px-2 py-1 text-sm hover:bg-secondary"
          title={leftPanelCollapsed ? 'Show filters' : 'Hide filters'}
        >
          {leftPanelCollapsed ? '\u00BB' : '\u00AB'}
        </button>
        <h1 className="text-lg font-bold">
          Forza Horizon 6 <span className="text-primary">Wishlist</span>
        </h1>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside
          className={`shrink-0 overflow-hidden border-r border-border bg-card transition-all duration-200 ${
            leftPanelCollapsed ? 'w-0' : 'w-72'
          }`}
        >
          <div className="h-full w-72">
            <FilterPanel />
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <CarBrowser />
        </main>

        <aside className="w-96 shrink-0 border-l border-border bg-card">
          <WishlistPanel />
        </aside>
      </div>
    </div>
  )
}
