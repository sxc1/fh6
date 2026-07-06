import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

interface MultiSelectProps {
  options: string[]
  selected: string[]
  onToggle: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
}

interface MenuPosition {
  left: number
  width: number
  top?: number
  bottom?: number
  maxHeight: number
}

/**
 * Chip-style multi-select: a bordered trigger that renders each selected value as a
 * removable chip and opens a searchable, keyboard-navigable option list. Functionally
 * modeled on MUI's chip Select, styled entirely with the shared design tokens.
 *
 * The dropdown is portaled to <body> and positioned against the trigger so it isn't
 * clipped by the filter panel's own scroll container.
 */
export function MultiSelect({
  options,
  selected,
  onToggle,
  placeholder = 'Select…',
  searchPlaceholder = 'Search…',
}: MultiSelectProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const [menu, setMenu] = useState<MenuPosition | null>(null)

  const triggerRef = useRef<HTMLDivElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return q ? options.filter((o) => o.toLowerCase().includes(q)) : options
  }, [options, query])

  const updatePosition = useCallback(() => {
    const el = triggerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const spaceBelow = window.innerHeight - rect.bottom
    const spaceAbove = rect.top
    const placeAbove = spaceBelow < 240 && spaceAbove > spaceBelow
    const maxHeight = Math.max(160, (placeAbove ? spaceAbove : spaceBelow) - 12)
    setMenu({
      left: rect.left,
      width: rect.width,
      maxHeight,
      ...(placeAbove
        ? { bottom: window.innerHeight - rect.top + 4 }
        : { top: rect.bottom + 4 }),
    })
  }, [])

  // Position the menu before paint whenever it opens, then keep it pinned to the
  // trigger while scrolling/resizing.
  useLayoutEffect(() => {
    if (!open) return
    updatePosition()
    const onScroll = () => updatePosition()
    window.addEventListener('scroll', onScroll, true)
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll, true)
      window.removeEventListener('resize', onScroll)
    }
  }, [open, updatePosition])

  useEffect(() => {
    if (open) searchRef.current?.focus()
    else {
      setQuery('')
      setActiveIndex(0)
    }
  }, [open])

  // Close on outside click (accounting for the portaled menu).
  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      const target = e.target as Node
      if (triggerRef.current?.contains(target) || popoverRef.current?.contains(target)) return
      setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  // Keep the keyboard highlight within the (possibly filtered) list.
  useEffect(() => {
    setActiveIndex((i) => Math.min(i, Math.max(0, filtered.length - 1)))
  }, [filtered.length])

  const handleListKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      setOpen(false)
      triggerRef.current?.focus()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const value = filtered[activeIndex]
      if (value) onToggle(value)
    }
  }

  const handleTriggerKeyDown = (e: React.KeyboardEvent) => {
    // Ignore keys bubbling up from the chip remove-buttons — only the trigger
    // itself should open the dropdown.
    if (e.target !== e.currentTarget) return
    if (!open && (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault()
      setOpen(true)
    }
  }

  return (
    <>
      <div
        ref={triggerRef}
        role="button"
        tabIndex={0}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={handleTriggerKeyDown}
        className="flex min-h-[2.25rem] w-full cursor-pointer items-center gap-1 rounded-md border border-input bg-card px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring"
      >
        <div className="flex flex-1 flex-wrap items-center gap-1">
          {selected.length === 0 ? (
            <span className="text-muted-foreground">{placeholder}</span>
          ) : (
            selected.map((value) => (
              <button
                key={value}
                type="button"
                aria-label={`Remove ${value}`}
                title={`Remove ${value}`}
                onClick={(e) => {
                  e.stopPropagation()
                  onToggle(value)
                }}
                className="inline-flex cursor-pointer items-center gap-1 rounded bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground transition-colors hover:bg-destructive hover:text-destructive-foreground"
              >
                {value}
                <span aria-hidden>&times;</span>
              </button>
            ))
          )}
        </div>
        <span
          className={`shrink-0 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden
        >
          &#9662;
        </span>
      </div>

      {open && menu
        ? createPortal(
            <div
              ref={popoverRef}
              style={{
                position: 'fixed',
                left: menu.left,
                width: menu.width,
                top: menu.top,
                bottom: menu.bottom,
                maxHeight: menu.maxHeight,
              }}
              className="z-50 flex flex-col overflow-hidden rounded-md border border-border bg-card shadow-lg"
              onKeyDown={handleListKeyDown}
            >
              <div className="border-b border-border p-2">
                <input
                  ref={searchRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <ul role="listbox" aria-multiselectable className="min-h-0 flex-1 overflow-y-auto p-1">
                {filtered.length === 0 ? (
                  <li className="px-2 py-2 text-sm text-muted-foreground">No matches</li>
                ) : (
                  filtered.map((value, i) => {
                    const isSelected = selected.includes(value)
                    return (
                      <li key={value} role="option" aria-selected={isSelected}>
                        <button
                          type="button"
                          onClick={() => onToggle(value)}
                          onMouseEnter={() => setActiveIndex(i)}
                          className={`flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm ${
                            i === activeIndex ? 'bg-secondary' : ''
                          }`}
                        >
                          <span
                            className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border text-[0.65rem] ${
                              isSelected
                                ? 'border-primary bg-primary text-primary-foreground'
                                : 'border-input'
                            }`}
                            aria-hidden
                          >
                            {isSelected ? '✓' : ''}
                          </span>
                          <span className="truncate">{value}</span>
                        </button>
                      </li>
                    )
                  })
                )}
              </ul>
            </div>,
            document.body,
          )
        : null}
    </>
  )
}
