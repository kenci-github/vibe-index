'use client'

import { useState } from 'react'
import { logEvent } from '@/lib/analytics/events'
import { TASTE_TAGS, INTENT_TAGS, MOMENT_TAGS } from '@/lib/constants/tags'
import FilterPill from '@/components/ui/FilterPill'
import type { ActiveFilters, TasteTag, IntentTag, MomentTag } from '@/types'

interface TagFilterProps {
  activeTags: ActiveFilters
  onChange: (filters: ActiveFilters) => void
}

type SectionKey = 'Vibe' | 'Intent' | 'Moment'

function ChevronIcon({ collapsed }: { collapsed: boolean }) {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      style={{
        transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
        transition: 'transform 0.2s',
      }}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

interface SectionProps {
  label: SectionKey
  count: number
  open: boolean
  onToggle: () => void
  children: React.ReactNode
}

function Section({ label, count, open, onToggle, children }: SectionProps) {
  return (
    <div>
      {/* Section header */}
      <div
        onClick={onToggle}
        className="flex items-center justify-between"
        style={{
          padding: '10px 0',
          borderBottom: '1px solid var(--border)',
          cursor: 'pointer',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-jakarta)',
            fontSize: 9.5,
            letterSpacing: '0.12em',
            fontWeight: 700,
            color: 'var(--muted)',
            textTransform: 'uppercase',
          }}
        >
          {label}
        </span>

        <div className="flex items-center gap-1.5">
          {count > 0 && (
            <span
              style={{
                background: 'var(--accent)',
                color: 'white',
                borderRadius: 10,
                padding: '1px 6px',
                fontSize: 9,
                fontWeight: 700,
              }}
            >
              {count}
            </span>
          )}
          <span style={{ color: 'var(--muted)' }}>
            <ChevronIcon collapsed={!open} />
          </span>
        </div>
      </div>

      {/* Section body */}
      {open && (
        <div className="flex flex-wrap gap-2 py-3">
          {children}
        </div>
      )}
    </div>
  )
}

export default function TagFilter({ activeTags, onChange }: TagFilterProps) {
  const [vibeOpen, setVibeOpen] = useState(true)
  const [intentOpen, setIntentOpen] = useState(true)
  const [momentOpen, setMomentOpen] = useState(true)

  const hasActive =
    activeTags.tasteTags.length > 0 ||
    activeTags.intentTags.length > 0 ||
    activeTags.momentTags.length > 0

  function handleTasteToggle(tag: TasteTag) {
    const next = activeTags.tasteTags.includes(tag)
      ? activeTags.tasteTags.filter((x) => x !== tag)
      : [...activeTags.tasteTags, tag]
    logEvent({ event_type: 'tag_applied', taste_tags: next })
    onChange({ ...activeTags, tasteTags: next })
  }

  function handleIntentToggle(tag: IntentTag) {
    const next = activeTags.intentTags.includes(tag)
      ? activeTags.intentTags.filter((x) => x !== tag)
      : [...activeTags.intentTags, tag]
    logEvent({ event_type: 'tag_applied', intent_tags: next })
    onChange({ ...activeTags, intentTags: next })
  }

  function handleMomentToggle(tag: MomentTag) {
    const next = activeTags.momentTags.includes(tag)
      ? activeTags.momentTags.filter((x) => x !== tag)
      : [...activeTags.momentTags, tag]
    logEvent({ event_type: 'tag_applied', moment_tags: next })
    onChange({ ...activeTags, momentTags: next })
  }

  function handleClear() {
    onChange({ ...activeTags, tasteTags: [], intentTags: [], momentTags: [] })
  }

  return (
    <div className="flex flex-col gap-0">
      <Section
        label="Vibe"
        count={activeTags.tasteTags.length}
        open={vibeOpen}
        onToggle={() => setVibeOpen((v) => !v)}
      >
        {TASTE_TAGS.map((tag) => (
          <FilterPill
            key={tag}
            label={tag}
            active={activeTags.tasteTags.includes(tag as TasteTag)}
            onClick={() => handleTasteToggle(tag as TasteTag)}
          />
        ))}
      </Section>

      <Section
        label="Intent"
        count={activeTags.intentTags.length}
        open={intentOpen}
        onToggle={() => setIntentOpen((v) => !v)}
      >
        {INTENT_TAGS.map((tag) => (
          <FilterPill
            key={tag}
            label={tag.replace(/-/g, ' ')}
            active={activeTags.intentTags.includes(tag as IntentTag)}
            onClick={() => handleIntentToggle(tag as IntentTag)}
          />
        ))}
      </Section>

      <Section
        label="Moment"
        count={activeTags.momentTags.length}
        open={momentOpen}
        onToggle={() => setMomentOpen((v) => !v)}
      >
        {MOMENT_TAGS.map((tag) => (
          <FilterPill
            key={tag}
            label={tag.replace(/-/g, ' ')}
            active={activeTags.momentTags.includes(tag as MomentTag)}
            onClick={() => handleMomentToggle(tag as MomentTag)}
          />
        ))}
      </Section>

      {hasActive && (
        <button
          onClick={handleClear}
          style={{
            color: 'var(--accent)',
            textDecoration: 'underline',
            fontWeight: 600,
            fontSize: 12,
            cursor: 'pointer',
            background: 'none',
            border: 'none',
            textAlign: 'left',
            padding: '8px 0 0',
          }}
        >
          Clear all filters
        </button>
      )}
    </div>
  )
}
