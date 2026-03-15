'use client'

import { cn } from '@/lib/utils'
import HScrollRow from '@/components/ui/HScrollRow'
import type { ActiveFilters, TasteTag, IntentTag, MomentTag } from '@/types'

interface ChipDef {
  label: string
  tasteTags?: TasteTag[]
  intentTags?: IntentTag[]
  momentTags?: MomentTag[]
}

const CHIPS: ChipDef[] = [
  { label: 'Date night',     intentTags: ['date'] },
  { label: 'Brunch',         intentTags: ['brunch'] },
  { label: 'Cozy',           tasteTags: ['cozy'] },
  { label: 'Chic',           tasteTags: ['chic'] },
  { label: 'Elegant',        tasteTags: ['elegant'] },
  { label: 'Playful',        tasteTags: ['playful'] },
  { label: 'Late night',     intentTags: ['late-night'], momentTags: ['late-night'] },
  { label: 'Spa',            intentTags: ['spa'] },
  { label: 'Manicure',       intentTags: ['manicure'] },
  { label: 'Solo',           intentTags: ['solo'] },
  { label: "Girls' night",   tasteTags: ['loud'], intentTags: ['group'] },
  { label: 'Dessert',        intentTags: ['dessert'] },
  { label: 'Rainy day',      momentTags: ['rainy-day'] },
  { label: 'Sunday a.m.',    momentTags: ['sunday-morning'] },
]

interface CategoryChipsProps {
  activeTags: ActiveFilters
  onChange: (filters: ActiveFilters) => void
  /** When true, renders as a wrapping flex row (sidebar). Default: horizontal scroll row. */
  wrap?: boolean
}

function isChipActive(chip: ChipDef, activeTags: ActiveFilters): boolean {
  const taste = chip.tasteTags ?? []
  const intent = chip.intentTags ?? []
  const moment = chip.momentTags ?? []
  return (
    taste.every((t) => activeTags.tasteTags.includes(t)) &&
    intent.every((t) => activeTags.intentTags.includes(t)) &&
    moment.every((t) => activeTags.momentTags.includes(t)) &&
    (taste.length + intent.length + moment.length) > 0
  )
}

function toggleChip(chip: ChipDef, activeTags: ActiveFilters): ActiveFilters {
  const active = isChipActive(chip, activeTags)
  const taste = chip.tasteTags ?? []
  const intent = chip.intentTags ?? []
  const moment = chip.momentTags ?? []

  if (active) {
    return {
      ...activeTags,
      tasteTags: activeTags.tasteTags.filter((t) => !taste.includes(t)),
      intentTags: activeTags.intentTags.filter((t) => !intent.includes(t)),
      momentTags: activeTags.momentTags.filter((t) => !moment.includes(t)),
    }
  } else {
    return {
      ...activeTags,
      tasteTags: [...new Set([...activeTags.tasteTags, ...taste])],
      intentTags: [...new Set([...activeTags.intentTags, ...intent])],
      momentTags: [...new Set([...activeTags.momentTags, ...moment])],
    }
  }
}

export default function CategoryChips({ activeTags, onChange, wrap = false }: CategoryChipsProps) {
  const chips = CHIPS.map((chip) => ({
    ...chip,
    active: isChipActive(chip, activeTags),
  }))

  const chipElements = chips.map(({ label, active, ...chip }) => (
    <button
      key={label}
      onClick={() => onChange(toggleChip({ label, ...chip }, activeTags))}
      aria-pressed={active}
      className={cn(
        'whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition-all active:scale-95',
        active
          ? 'border-accent bg-accent text-white'
          : 'border-border bg-background text-warm-gray-mid hover:border-accent/50 hover:text-foreground'
      )}
    >
      {label}
    </button>
  ))

  if (wrap) {
    return (
      <div className="flex flex-wrap gap-2">
        {chipElements}
      </div>
    )
  }

  return (
    <HScrollRow>
      <div className="inline-flex gap-2 px-4 py-2 pr-8">
        {chipElements}
      </div>
    </HScrollRow>
  )
}
