'use client'

import { useState, useEffect } from 'react'
import { Bookmark } from 'lucide-react'
import { cn } from '@/lib/utils'
import { isBookmarked, toggleBookmark } from '@/lib/storage/bookmarks'

interface BookmarkButtonProps {
  id: string
  className?: string
}

export default function BookmarkButton({ id, className }: BookmarkButtonProps) {
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setSaved(isBookmarked(id))
  }, [id])

  function handleClick(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    const next = toggleBookmark(id)
    setSaved(next)
  }

  return (
    <button
      onClick={handleClick}
      aria-label={saved ? 'Remove bookmark' : 'Save place'}
      className={cn(
        'flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-sm transition-transform active:scale-90',
        className
      )}
    >
      <Bookmark
        className="h-4 w-4"
        strokeWidth={2}
        fill={saved ? '#FF4D4D' : 'none'}
        stroke={saved ? '#FF4D4D' : '#374151'}
      />
    </button>
  )
}
