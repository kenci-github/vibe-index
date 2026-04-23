'use client'

import { useState } from 'react'

export default function TopNavSearch() {
  const [value, setValue] = useState('')

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && value.trim().length >= 2) {
      window.dispatchEvent(new CustomEvent('vibe-search', { detail: { query: value.trim() } }))
    }
  }

  function handleClear() {
    setValue('')
    window.dispatchEvent(new CustomEvent('vibe-search-clear'))
  }

  return (
    <div style={{ flex: 1, maxWidth: 460, margin: '0 auto' }}>
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          height: 42, border: '1.5px solid var(--border)', borderRadius: 40,
          background: 'var(--surface)', padding: '0 14px',
          transition: 'border-color 0.15s, box-shadow 0.15s',
        }}
        onFocusCapture={e => {
          (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--accent)'
          ;(e.currentTarget as HTMLDivElement).style.boxShadow = '0 0 0 3px var(--accent-light)'
        }}
        onBlurCapture={e => {
          (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)'
          ;(e.currentTarget as HTMLDivElement).style.boxShadow = 'none'
        }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" style={{ color: 'var(--accent)', flexShrink: 0 }}>
          <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
        </svg>
        <input
          type="text"
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Try 'dim cozy bar'…"
          style={{
            flex: 1, border: 'none', background: 'transparent',
            fontSize: 13, fontFamily: 'inherit',
            color: 'oklch(0.25 0.01 50)', outline: 'none', minWidth: 0,
          }}
        />
        {value ? (
          <button
            onClick={handleClear}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: 'var(--dim)' }}>
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        ) : (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--dim)', flexShrink: 0 }}>
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        )}
      </div>
    </div>
  )
}
