import { useCallback, useEffect, useRef } from 'react'
import { CarBrowser } from './components/CarBrowser'
import { FilterPanel } from './components/FilterPanel'
import { WishlistPanel, type WishlistPanelHandle } from './components/WishlistPanel'
import { useStore } from './store'

export default function App() {
  const leftPanelCollapsed = useStore((s) => s.leftPanelCollapsed)
  const wishlistPanelExpanded = useStore((s) => s.wishlistPanelExpanded)
  const wishlistPanelRef = useRef<WishlistPanelHandle>(null)

  useEffect(() => {
    document.documentElement.classList.add('dark')
  }, [])

  const onAddCar = useCallback((id: string) => {
    const anchorId = wishlistPanelRef.current?.getViewportCenterAnchorId()
    const { wishlist, insertIntoWishlist } = useStore.getState()
    const anchorIndex = anchorId ? wishlist.indexOf(anchorId) : -1
    insertIntoWishlist(id, anchorIndex === -1 ? wishlist.length : anchorIndex)
    wishlistPanelRef.current?.revealAddedCar(id)
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
        <CarBrowser onAddCar={onAddCar} />
      </main>

      <aside
        className={`shrink-0 border-l border-border bg-card transition-all duration-200 ${
          wishlistPanelExpanded ? 'w-[min(56rem,60vw)]' : 'w-96'
        }`}
      >
        <WishlistPanel ref={wishlistPanelRef} />
      </aside>
    </div>
  )
}
