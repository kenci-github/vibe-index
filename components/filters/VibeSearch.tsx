'use client'

import { X } from 'lucide-react'

interface VibeSearchProps {
  value: string
  onChange: (v: string) => void
  onSearch: (v: string) => void
  onClear: () => void
  isSearching: boolean
}

export default function VibeSearch({ value, onChange, onSearch, onClear, isSearching }: VibeSearchProps) {
  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && value.trim().length >= 2) {
      onSearch(value)
    }
  }

  function handleClear() {
    onChange('')
    onClear()
  }

  return (
    <div className="px-4 pt-3 pb-2">
      <div className="relative flex items-center rounded-2xl bg-white ring-1 ring-border shadow-[0_2px_12px_rgba(0,0,0,0.07)] focus-within:ring-accent transition-shadow">
        <span className="absolute left-4 text-[15px] text-accent/60 select-none pointer-events-none">✦</span>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder='Try "dim cocktails for a second date"'
          className="w-full min-h-[52px] rounded-2xl bg-transparent py-3.5 pl-10 pr-10 text-base text-foreground placeholder:italic placeholder:text-warm-gray-mid/60 focus:outline-none"
        />
        {value && (
          <button
            onClick={handleClear}
            aria-label="Clear search"
            className="absolute right-3.5 flex h-6 w-6 items-center justify-center rounded-full bg-stone-100 text-warm-gray-mid transition-colors hover:bg-stone-200"
          >
            <X className="h-3.5 w-3.5" strokeWidth={2.5} />
          </button>
        )}
      </div>

      {isSearching && (
        <div className="flex items-center gap-2 px-1 pt-2">
          <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
          <span className="text-sm text-warm-gray-mid">Finding your vibe…</span>
        </div>
      )}
    </div>
  )
}
