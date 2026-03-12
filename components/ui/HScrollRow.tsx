'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface HScrollRowProps {
  children: React.ReactNode
  className?: string
}

export default function HScrollRow({ children, className }: HScrollRowProps) {
  const rowRef = useRef<HTMLDivElement>(null)
  const [canLeft, setCanLeft] = useState(false)
  const [canRight, setCanRight] = useState(false)
  const [hasOverflow, setHasOverflow] = useState(false)

  const sync = useCallback(() => {
    const el = rowRef.current
    if (!el) return
    setCanLeft(el.scrollLeft > 4)
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4)
    setHasOverflow(el.scrollWidth > el.clientWidth + 4)
  }, [])

  useEffect(() => {
    sync()
    const t = setTimeout(sync, 150)
    return () => clearTimeout(t)
  }, [sync])

  function scroll(dir: 'left' | 'right') {
    rowRef.current?.scrollBy({ left: dir === 'left' ? -200 : 200, behavior: 'smooth' })
  }

  const arrowBase =
    'h-7 w-7 flex items-center justify-center rounded-full bg-white border border-border shadow-md text-foreground transition-opacity hover:opacity-80 active:scale-95 disabled:opacity-30 disabled:cursor-default'

  return (
    <div className="min-w-0 w-full">
      {hasOverflow && (
        <div className="hidden md:flex justify-end gap-1.5 px-4 pb-1.5">
          <button
            onClick={() => scroll('left')}
            disabled={!canLeft}
            className={arrowBase}
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => scroll('right')}
            disabled={!canRight}
            className={arrowBase}
            aria-label="Scroll right"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
      <div ref={rowRef} className={cn('scroll-x', className)} onScroll={sync}>
        {children}
      </div>
    </div>
  )
}
