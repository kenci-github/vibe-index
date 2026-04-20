'use client'

import { useState } from 'react'
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet'
import FilterPill from '@/components/ui/FilterPill'
import { TASTE_TAGS, INTENT_TAGS, MOMENT_TAGS } from '@/lib/constants/tags'
import type { ActiveFilters, TasteTag, IntentTag, MomentTag } from '@/types'

interface FilterSheetProps {
  activeTags: ActiveFilters
  onChange: (filters: ActiveFilters) => void
  /** When true, renders as an expanded inline panel (sidebar). Default: button + sheet. */
  inline?: boolean
}

function totalActive(filters: ActiveFilters): number {
  return filters.tasteTags.length + filters.intentTags.length + filters.momentTags.length
}

function InlineFilters({ activeTags, onChange }: { activeTags: ActiveFilters; onChange: (f: ActiveFilters) => void }) {
  function toggle(tag: string, type: 'taste' | 'intent' | 'moment') {
    const next = { ...activeTags }
    if (type === 'taste') {
      next.tasteTags = next.tasteTags.includes(tag as TasteTag)
        ? next.tasteTags.filter(t => t !== tag)
        : [...next.tasteTags, tag as TasteTag]
    } else if (type === 'intent') {
      next.intentTags = next.intentTags.includes(tag as IntentTag)
        ? next.intentTags.filter(t => t !== tag)
        : [...next.intentTags, tag as IntentTag]
    } else {
      next.momentTags = next.momentTags.includes(tag as MomentTag)
        ? next.momentTags.filter(t => t !== tag)
        : [...next.momentTags, tag as MomentTag]
    }
    onChange(next)
  }

  return (
    <div className="w-full space-y-4">
      {/* Vibe */}
      <div>
        <p style={{ fontSize: '9.5px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '14px 0 8px' }}>
          Vibe
        </p>
        <div className="flex flex-wrap gap-2">
          {TASTE_TAGS.map(tag => (
            <FilterPill
              key={tag}
              label={tag}
              active={activeTags.tasteTags.includes(tag as TasteTag)}
              onClick={() => toggle(tag, 'taste')}
            />
          ))}
        </div>
      </div>

      {/* Intent */}
      <div>
        <p style={{ fontSize: '9.5px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '14px 0 8px' }}>
          Intent
        </p>
        <div className="flex flex-wrap gap-2">
          {INTENT_TAGS.map(tag => (
            <FilterPill
              key={tag}
              label={tag.replace(/-/g, ' ')}
              active={activeTags.intentTags.includes(tag as IntentTag)}
              onClick={() => toggle(tag, 'intent')}
            />
          ))}
        </div>
      </div>

      {/* Moment */}
      <div>
        <p style={{ fontSize: '9.5px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '14px 0 8px' }}>
          Moment
        </p>
        <div className="flex flex-wrap gap-2">
          {MOMENT_TAGS.map(tag => (
            <FilterPill
              key={tag}
              label={tag.replace(/-/g, ' ')}
              active={activeTags.momentTags.includes(tag as MomentTag)}
              onClick={() => toggle(tag, 'moment')}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function FilterSheet({ activeTags, onChange, inline = false }: FilterSheetProps) {
  const count = totalActive(activeTags)
  const [open, setOpen] = useState(false)

  function handleClearAll() {
    onChange({ ...activeTags, tasteTags: [], intentTags: [], momentTags: [] })
  }

  if (inline) {
    return (
      <div className="w-full">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-warm-gray-mid">
          Filters
        </p>
        <InlineFilters activeTags={activeTags} onChange={onChange} />
      </div>
    )
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          className="flex shrink-0 items-center gap-1.5 rounded-full border transition-all"
          style={{
            padding: '7px 14px',
            fontSize: '13px',
            fontWeight: 500,
            border: count > 0 ? '1.5px solid var(--accent)' : '1.5px solid var(--border)',
            background: count > 0 ? 'var(--accent-light)' : 'transparent',
            color: count > 0 ? 'var(--accent)' : 'var(--text)',
            cursor: 'pointer',
          }}
        >
          {/* Filter lines SVG */}
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="4" y1="6" x2="20" y2="6"/>
            <line x1="8" y1="12" x2="16" y2="12"/>
            <line x1="11" y1="18" x2="13" y2="18"/>
          </svg>
          Filters
          {count > 0 && (
            <span
              style={{
                background: 'var(--accent)',
                color: 'white',
                borderRadius: '10px',
                padding: '1px 5px',
                fontSize: '9px',
                fontWeight: 700,
                lineHeight: '1.4',
              }}
            >
              {count}
            </span>
          )}
        </button>
      </SheetTrigger>

      <SheetContent
        side="bottom"
        className="filter-sheet-content p-0"
        style={{
          borderRadius: '20px 20px 0 0',
          background: 'white',
          boxShadow: 'var(--shadow-sheet)',
          border: 'none',
          maxHeight: '85vh',
          overflowY: 'auto',
        }}
      >
        {/* Drag handle */}
        <div
          style={{
            width: '36px',
            height: '4px',
            background: 'var(--border)',
            borderRadius: '2px',
            margin: '12px auto 0',
          }}
        />

        {/* Header */}
        <div
          className="flex items-center justify-between"
          style={{ padding: '16px 20px 12px' }}
        >
          <p style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)' }}>Filters</p>
          <div className="flex items-center gap-3">
            {count > 0 && (
              <button
                onClick={handleClearAll}
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--accent)',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  background: 'none',
                  border: 'none',
                  padding: 0,
                }}
              >
                Clear all
              </button>
            )}
            <SheetClose asChild>
              <button
                style={{
                  color: 'var(--muted)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '2px',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </SheetClose>
          </div>
        </div>

        {/* Filter sections */}
        <div style={{ padding: '0 20px' }}>
          <InlineFilters activeTags={activeTags} onChange={onChange} />
        </div>

        {/* CTA button */}
        <div style={{ padding: '16px 20px 20px' }}>
          <SheetClose asChild>
            <button
              style={{
                width: '100%',
                background: 'var(--accent)',
                color: 'white',
                fontWeight: 700,
                borderRadius: '14px',
                height: '50px',
                border: 'none',
                fontSize: '15px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {count > 0 ? `Show places` : 'Show results'}
            </button>
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  )
}
