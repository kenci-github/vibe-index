'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { isBookmarked, toggleBookmark } from '@/lib/storage/bookmarks'
import { logEvent } from '@/lib/analytics/events'

interface BookmarkButtonProps {
  id: string
  className?: string
}

export default function BookmarkButton({ id, className }: BookmarkButtonProps) {
  const [saved, setSaved] = useState(false)
  const [animating, setAnimating] = useState(false)

  useEffect(() => {
    setSaved(isBookmarked(id))
  }, [id])

  function handleClick(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    const next = toggleBookmark(id)
    setSaved(next)
    if (next) {
      setAnimating(true)
      setTimeout(() => setAnimating(false), 300)
    }
    logEvent({ event_type: 'bookmark_tapped', place_id: id, metadata: { saved: next } })
  }

  return (
    <button
      onClick={handleClick}
      aria-label={saved ? 'Remove bookmark' : 'Save place'}
      className={cn('flex items-center justify-center', className)}
      style={{
        width: 34,
        height: 34,
        borderRadius: '50%',
        cursor: 'pointer',
        background: saved ? 'var(--accent)' : 'white',
        color: saved ? 'white' : 'oklch(0.18 0.01 50)',
        border: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: animating
          ? 'springBounce 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards'
          : 'none',
      }}
    >
      {saved ? (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      ) : (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      )}
    </button>
  )
}
