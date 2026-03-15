'use client'

import { SlidersHorizontal } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import TagFilter from '@/components/filters/TagFilter'
import type { ActiveFilters } from '@/types'
import { cn } from '@/lib/utils'

interface FilterSheetProps {
  activeTags: ActiveFilters
  onChange: (filters: ActiveFilters) => void
  /** When true, renders as an expanded inline panel (sidebar). Default: button + sheet. */
  inline?: boolean
}

function totalActive(filters: ActiveFilters): number {
  return filters.tasteTags.length + filters.intentTags.length + filters.momentTags.length
}

export default function FilterSheet({ activeTags, onChange, inline = false }: FilterSheetProps) {
  const count = totalActive(activeTags)

  if (inline) {
    return (
      <div className="w-full">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-warm-gray-mid">
          Filters
        </p>
        <TagFilter activeTags={activeTags} onChange={onChange} />
      </div>
    )
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          className={cn(
            'flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium transition-all',
            count > 0
              ? 'border-accent bg-accent/10 text-accent'
              : 'border-border bg-background text-warm-gray-mid hover:border-accent/50 hover:text-foreground'
          )}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" strokeWidth={2} />
          Filters
          {count > 0 && (
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white">
              {count}
            </span>
          )}
        </button>
      </SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-2xl px-0 pb-safe">
        <SheetHeader className="px-4 pb-2">
          <SheetTitle className="font-display text-lg font-semibold">Filters</SheetTitle>
        </SheetHeader>
        <TagFilter activeTags={activeTags} onChange={onChange} />
      </SheetContent>
    </Sheet>
  )
}
