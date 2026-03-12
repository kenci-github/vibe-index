'use client'

import { cn } from '@/lib/utils'
import { TAG_GROUPS } from '@/lib/constants/tags'
import type { ActiveFilters, TasteTag, IntentTag, MomentTag } from '@/types'
import HScrollRow from '@/components/ui/HScrollRow'

interface TagFilterProps {
  activeTags: ActiveFilters
  onChange: (filters: ActiveFilters) => void
}

export default function TagFilter({ activeTags, onChange }: TagFilterProps) {
  const hasActive =
    activeTags.tasteTags.length > 0 ||
    activeTags.intentTags.length > 0 ||
    activeTags.momentTags.length > 0

  function handleToggle(tag: string, group: 'Vibe' | 'Intent' | 'Moment') {
    if (group === 'Vibe') {
      const t = tag as TasteTag
      const next = activeTags.tasteTags.includes(t)
        ? activeTags.tasteTags.filter((x) => x !== t)
        : [...activeTags.tasteTags, t]
      onChange({ ...activeTags, tasteTags: next })
    } else if (group === 'Intent') {
      const t = tag as IntentTag
      const next = activeTags.intentTags.includes(t)
        ? activeTags.intentTags.filter((x) => x !== t)
        : [...activeTags.intentTags, t]
      onChange({ ...activeTags, intentTags: next })
    } else {
      const t = tag as MomentTag
      const next = activeTags.momentTags.includes(t)
        ? activeTags.momentTags.filter((x) => x !== t)
        : [...activeTags.momentTags, t]
      onChange({ ...activeTags, momentTags: next })
    }
  }

  function isActive(tag: string, group: 'Vibe' | 'Intent' | 'Moment'): boolean {
    if (group === 'Vibe') return activeTags.tasteTags.includes(tag as TasteTag)
    if (group === 'Intent') return activeTags.intentTags.includes(tag as IntentTag)
    return activeTags.momentTags.includes(tag as MomentTag)
  }

  function handleClear() {
    onChange({ ...activeTags, tasteTags: [], intentTags: [], momentTags: [] })
  }

  return (
    <HScrollRow>
      <div className="flex w-max gap-4 px-4 pb-2">
        {hasActive && (
          <div className="flex flex-col justify-end pb-0.5">
            <button
              onClick={handleClear}
              className="whitespace-nowrap rounded-full border border-accent px-3 py-1 text-xs font-medium text-accent transition-all hover:bg-accent/5"
            >
              ✕ Clear
            </button>
          </div>
        )}
        {TAG_GROUPS.map(({ label, tags }) => (
          <div key={label} className="flex flex-col gap-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
              {label}
            </span>
            <div className="flex gap-2">
              {tags.map((tag) => {
                const active = isActive(tag, label as 'Vibe' | 'Intent' | 'Moment')
                return (
                  <button
                    key={tag}
                    onClick={() => handleToggle(tag, label as 'Vibe' | 'Intent' | 'Moment')}
                    aria-pressed={active}
                    className={cn(
                      'whitespace-nowrap rounded-full border px-3 py-1 text-xs font-medium transition-all',
                      active
                        ? 'border-accent bg-accent text-white'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-accent/50'
                    )}
                  >
                    {tag}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </HScrollRow>
  )
}
