# Forza Horizon 6 Wishlist

Published to `https://sxc1.github.io/fh6/`

## Use Case

All races in Forza Horizon restrict your car selection based on Car Type, maintaining a tuned car for each Car Type is necessary.

Because of this, I've created this companion tool that allows you to build a wishlist, filtering on Car Type + many other categories to ensure you have a well-rounded garage.

## Features 

1. **Car browser** - text search, sorting (manufacturer, name, year, class, rating, price), and list/tile views.
2. **Comprehensive filtering** - Class, Category (car type), Manufacturer, Year range, Cost range.
3. **Wishlist** -  drag-and-drop re-ordering, filtering, "acquired" marking, and cost totals
4. **Import and export** - for saving and sharing

## Export / import format

Export produces a CSV of the wishlist, in wishlist order, with the columns:
`Acquired, Make, Car Name, Price, Car Type, Car Class, Class Rating, Country, Collection`.
Import reads that CSV, matches rows back to the dataset by make + car name, and rebuilds the
ordered wishlist (row order = wishlist order) along with the imported prices.

## Tech

- **Core Stack** - Vite, React 19, TypeScript
- **Styling** - Tailwind CSS v4 (`@tailwindcss/vite`), themed via `src/index.css`
- **Components** - radix-ui, country-flag-icons
- Zustand (state + `localStorage` persistence)
- @dnd-kit (drag-and-drop reordering)
- PapaParse (CSV parsing / generation)
- **AI Tooling** - Claude Code, Codex, and Cursor (varied for experimentation)

## Disclaimer

This is an unofficial fan-made companion tool and is not affiliated with, endorsed by, sponsored by, or approved by Microsoft, Xbox Game Studios, Playground Games, Turn 10 Studios, or the Forza franchise. Forza Horizon and related names, logos, and vehicle content are trademarks or copyrighted material of their respective owners.