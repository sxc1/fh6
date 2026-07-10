import * as Select from '@radix-ui/react-select'
import type { SortField } from '../lib/types'

const SORT_OPTIONS: { value: SortField; label: string }[] = [
  { value: 'make', label: 'Manufacturer' },
  { value: 'name', label: 'Name' },
  { value: 'year', label: 'Year' },
  { value: 'class', label: 'Class' },
  { value: 'price', label: 'Price' },
]

type SortDropdownProps = {
  value: SortField
  onChange: (field: SortField) => void
}

export function SortDropdown({ value, onChange }: SortDropdownProps) {
  const selectedLabel = SORT_OPTIONS.find((option) => option.value === value)?.label ?? 'Manufacturer'

  return (
    <Select.Root
      value={value}
      onValueChange={(nextValue) => onChange(nextValue as SortField)}
    >
      <Select.Trigger
        className="inline-flex min-w-40 items-center justify-between gap-2 rounded-md border border-input bg-card px-2 py-1.5 text-left text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Sort cars by field"
      >
        <Select.Value aria-label={selectedLabel}>{`Sort: ${selectedLabel}`}</Select.Value>
        <Select.Icon className="text-muted-foreground">▾</Select.Icon>
      </Select.Trigger>

      <Select.Content
        position="popper"
        sideOffset={4}
        className="z-50 w-[var(--radix-select-trigger-width)] overflow-hidden rounded-md border border-input bg-card p-1 shadow-lg"
      >
        <Select.Viewport>
          {SORT_OPTIONS.map((option) => (
            <Select.Item
              key={option.value}
              value={option.value}
              className="relative flex cursor-pointer select-none items-center rounded-sm py-1.5 pl-2 pr-7 text-sm outline-none hover:bg-secondary focus:bg-secondary"
            >
              <Select.ItemText>{option.label}</Select.ItemText>
              <Select.ItemIndicator className="absolute right-2 text-primary">✓</Select.ItemIndicator>
            </Select.Item>
          ))}
        </Select.Viewport>
      </Select.Content>
    </Select.Root>
  )
}
