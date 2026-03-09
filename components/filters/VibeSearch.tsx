'use client'

import { Search, X } from 'lucide-react'

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
      <div className="relative flex items-center">
        <Search className="absolute left-3.5 h-[18px] w-[18px] text-gray-300" strokeWidth={2} />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder='Try "dim cocktails for a second date"'
          className="w-full rounded-2xl border-2 border-gray-100 bg-white py-3.5 pl-10 pr-10 text-base text-gray-900 placeholder-gray-300 shadow-sm transition-colors focus:border-accent/40 focus:outline-none"
        />
        {value && (
          <button
            onClick={handleClear}
            aria-label="Clear search"
            className="absolute right-3.5 flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-gray-500 transition-colors hover:bg-gray-300"
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
