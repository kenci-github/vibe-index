'use client'

import { cn } from '@/lib/utils'
import type { ActiveFilters, TasteTag, IntentTag, MomentTag } from '@/types'

interface ChipDef {
  label: string
  tasteTags?: TasteTag[]
  intentTags?: IntentTag[]
  momentTags?: MomentTag[]
}

// Spec §2.2 primary categories
// Extra entries cover additional chips not in the spec's abbreviated list.
const CHIP_ICONS: Record<string, string> = {
  // Spec §2.2 primary categories
  'Date night':   '🕯️',
  'Brunch':       '☀️',
  'Late night':   '🌙',
  'Cozy':         '🌿',
  'Solo':         '💆',
  "Girls' night": '🥂',
  'Spa':          '💅',
  'Dessert':      '🍮',
  // Additional CHIPS array entries
  'Chic':         '💎',
  'Elegant':      '🌸',
  'Playful':      '🎭',
  'Rainy day':    '🌧️',
  'Sunday a.m.':  '☕',
  // 'Manicure' intentionally omitted — falls through to default '✦' fallback
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

  // All-clear item — shows active state when no filters are selected
  const noFiltersActive =
    activeTags.tasteTags.length === 0 &&
    activeTags.intentTags.length === 0 &&
    activeTags.momentTags.length === 0

  const allItem = (
    <button
      key="__all__"
      onClick={() => onChange({ ...activeTags, tasteTags: [], intentTags: [], momentTags: [] })}
      aria-label="Show all places"
      className={cn(
        'flex flex-col items-center gap-1.5 px-2 pb-2 pt-1.5 flex-shrink-0 min-w-[52px] border-b-2 transition-all',
        noFiltersActive ? 'border-foreground' : 'border-transparent'
      )}
    >
      <div className={cn(
        'flex h-11 w-11 items-center justify-center rounded-full text-xl transition-all',
        noFiltersActive ? 'bg-foreground' : 'bg-black/5'
      )}>
        <span style={noFiltersActive ? { filter: 'grayscale(1) brightness(10)' } : undefined}>
          🌍
        </span>
      </div>
      <span className={cn(
        'text-[10px] whitespace-nowrap',
        noFiltersActive ? 'font-bold text-foreground' : 'font-medium text-warm-gray-mid'
      )}>
        All
      </span>
    </button>
  )

  const iconChipElements = chips.map(({ label, active, ...chip }) => (
    <button
      key={label}
      onClick={() => onChange(toggleChip({ label, ...chip }, activeTags))}
      aria-pressed={active}
      className={cn(
        'flex flex-col items-center gap-1.5 px-2 pb-2 pt-1.5 flex-shrink-0 min-w-[52px] border-b-2 transition-all',
        active ? 'border-foreground' : 'border-transparent'
      )}
    >
      <div className={cn(
        'flex h-11 w-11 items-center justify-center rounded-full text-xl transition-all',
        active ? 'bg-foreground' : 'bg-black/5'
      )}>
        <span style={active ? { filter: 'grayscale(1) brightness(10)' } : undefined}>
          {CHIP_ICONS[label] ?? '✦'}
        </span>
      </div>
      <span className={cn(
        'text-[10px] whitespace-nowrap',
        active ? 'font-bold text-foreground' : 'font-medium text-warm-gray-mid'
      )}>
        {label}
      </span>
    </button>
  ))

  // Wrap mode — keep existing text pills (sidebar)
  if (wrap) {
    return (
      <div className="flex flex-wrap gap-2">
        {chips.map(({ label, active, ...chip }) => (
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
        ))}
      </div>
    )
  }

  // Default mode — emoji icon circles with horizontal scroll
  return (
    <div className="overflow-x-auto scrollbar-none -mx-4">
      <div className="flex px-2">
        {allItem}
        {iconChipElements}
      </div>
    </div>
  )
}
