'use client'

const CHIPS: { label: string; query: string }[] = [
  { label: 'Date night',    query: 'date night' },
  { label: 'Brunch',        query: 'brunch' },
  { label: 'Quiet',         query: 'quiet and cozy' },
  { label: "Girls' night",  query: 'girls night out' },
  { label: 'Solo reset',    query: 'solo reset recharge' },
  { label: 'Late night',    query: 'late night' },
  { label: 'Coffee',        query: 'coffee cafe' },
  { label: 'Spa',           query: 'spa wellness' },
]

interface QuickChipsProps {
  onChipSelect: (query: string) => void
}

export default function QuickChips({ onChipSelect }: QuickChipsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto px-4 py-2 [&::-webkit-scrollbar]:hidden">
      {CHIPS.map(({ label, query }) => (
        <button
          key={label}
          onClick={() => onChipSelect(query)}
          className="whitespace-nowrap rounded-full border border-gray-200 bg-white px-4 py-2 text-sm text-gray-600 transition-all active:scale-95 active:bg-accent/10"
        >
          {label}
        </button>
      ))}
    </div>
  )
}
