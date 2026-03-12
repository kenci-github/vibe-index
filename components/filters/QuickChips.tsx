'use client'

import HScrollRow from '@/components/ui/HScrollRow'

const CHIPS: { label: string; query: string; tint?: string }[] = [
  { label: 'Date night',   query: 'date night',           tint: 'bg-rose-50' },
  { label: 'Brunch',       query: 'brunch',               tint: 'bg-amber-50' },
  { label: 'Quiet',        query: 'quiet and cozy' },
  { label: "Girls' night", query: 'girls night out',      tint: 'bg-rose-50' },
  { label: 'Solo reset',   query: 'solo reset recharge' },
  { label: 'Late night',   query: 'late night',           tint: 'bg-stone-100' },
  { label: 'Coffee',       query: 'coffee cafe',          tint: 'bg-amber-50' },
  { label: 'Spa',          query: 'spa wellness' },
]

interface QuickChipsProps {
  onChipSelect: (query: string) => void
}

export default function QuickChips({ onChipSelect }: QuickChipsProps) {
  return (
    <HScrollRow>
      <div className="inline-flex gap-2 px-4 py-2 pr-8">
        {CHIPS.map(({ label, query, tint }) => (
          <button
            key={label}
            onClick={() => onChipSelect(query)}
            className={`whitespace-nowrap rounded-full border border-border px-4 py-2.5 text-sm font-medium text-warm-gray-mid transition-colors active:scale-95 active:bg-accent active:text-white active:border-accent ${tint ?? 'bg-background'}`}
          >
            {label}
          </button>
        ))}
      </div>
    </HScrollRow>
  )
}
