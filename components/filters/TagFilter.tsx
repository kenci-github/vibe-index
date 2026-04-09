'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { TAG_GROUPS } from '@/lib/constants/tags'
import { logEvent } from '@/lib/analytics/events'
import type { ActiveFilters, TasteTag, IntentTag, MomentTag } from '@/types'
import HScrollRow from '@/components/ui/HScrollRow'

interface TagFilterProps {
  activeTags: ActiveFilters
  onChange: (filters: ActiveFilters) => void
}

type GroupLabel = 'Vibe' | 'Intent' | 'Moment'

export default function TagFilter({ activeTags, onChange }: TagFilterProps) {
  const hasActive =
    activeTags.tasteTags.length > 0 ||
    activeTags.intentTags.length > 0 ||
    activeTags.momentTags.length > 0

  const [activeGroup, setActiveGroup] = useState<GroupLabel>(() => {
    if (activeTags.tasteTags.length) return 'Vibe'
    if (activeTags.intentTags.length) return 'Intent'
    if (activeTags.momentTags.length) return 'Moment'
    return 'Vibe'
  })

  function groupCount(group: GroupLabel): number {
    if (group === 'Vibe') return activeTags.tasteTags.length
    if (group === 'Intent') return activeTags.intentTags.length
    return activeTags.momentTags.length
  }

  function handleToggle(tag: string, group: GroupLabel) {
    if (group === 'Vibe') {
      const t = tag as TasteTag
      const next = activeTags.tasteTags.includes(t)
        ? activeTags.tasteTags.filter((x) => x !== t)
        : [...activeTags.tasteTags, t]
      logEvent({ event_type: 'tag_applied', taste_tags: next })
      onChange({ ...activeTags, tasteTags: next })
    } else if (group === 'Intent') {
      const t = tag as IntentTag
      const next = activeTags.intentTags.includes(t)
        ? activeTags.intentTags.filter((x) => x !== t)
        : [...activeTags.intentTags, t]
      logEvent({ event_type: 'tag_applied', intent_tags: next })
      onChange({ ...activeTags, intentTags: next })
    } else {
      const t = tag as MomentTag
      const next = activeTags.momentTags.includes(t)
        ? activeTags.momentTags.filter((x) => x !== t)
        : [...activeTags.momentTags, t]
      logEvent({ event_type: 'tag_applied', moment_tags: next })
      onChange({ ...activeTags, momentTags: next })
    }
  }

  function isActive(tag: string, group: GroupLabel): boolean {
    if (group === 'Vibe') return activeTags.tasteTags.includes(tag as TasteTag)
    if (group === 'Intent') return activeTags.intentTags.includes(tag as IntentTag)
    return activeTags.momentTags.includes(tag as MomentTag)
  }

  function handleClear() {
    onChange({ ...activeTags, tasteTags: [], intentTags: [], momentTags: [] })
  }

  const currentGroup = TAG_GROUPS.find((g) => g.label === activeGroup)!

  return (
    <div className="pb-1">
      {/* Segment control row */}
      <div className="flex items-center gap-2 px-4 pb-1.5 pt-1">
        <div className="flex flex-1 gap-1 rounded-full bg-accent/[0.06] p-0.5">
          {TAG_GROUPS.map(({ label }) => {
            const count = groupCount(label as GroupLabel)
            const isTab = activeGroup === label
            return (
              <button
                key={label}
                onClick={() => setActiveGroup(label as GroupLabel)}
                data-active={isTab}
                className={cn(
                  'relative flex-1 rounded-full py-1.5 text-xs font-semibold transition-all duration-150',
                  isTab
                    ? 'bg-foreground text-background shadow-sm'
                    : 'text-warm-gray-mid hover:text-foreground'
                )}
              >
                {label}
                {!isTab && count > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[9px] font-bold text-white">
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {hasActive && (
          <button
            onClick={handleClear}
            className="shrink-0 text-xs font-medium text-accent transition-opacity hover:opacity-70"
          >
            Clear
          </button>
        )}
      </div>

      {/* Tag pills for active group */}
      <HScrollRow>
        <div className="flex gap-2 px-4 pb-2 pt-0.5">
          {currentGroup.tags.map((tag) => {
            const active = isActive(tag, activeGroup)
            return (
              <button
                key={tag}
                onClick={() => handleToggle(tag, activeGroup)}
                aria-pressed={active}
                className={cn(
                  'whitespace-nowrap rounded-full border px-3 py-1 text-xs font-medium transition-all',
                  active
                    ? 'border-accent bg-accent text-white'
                    : 'border-border bg-white text-warm-gray-mid hover:border-accent/50'
                )}
              >
                {tag}
              </button>
            )
          })}
        </div>
      </HScrollRow>
    </div>
  )
}
