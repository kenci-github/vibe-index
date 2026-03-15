'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Heart } from 'lucide-react'
import { cn } from '@/lib/utils'

const links = [
  { href: '/', label: 'Discover' },
  { href: '/submit', label: 'Submit a place' },
]

export default function TopNav() {
  const pathname = usePathname()

  return (
    <nav className="hidden lg:block sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/50">
      <div className="mx-auto flex max-w-screen-xl items-center gap-6 px-8 py-2.5">
        {/* Wordmark */}
        <span className="font-display text-xl font-semibold tracking-tight text-foreground flex-shrink-0">
          Vibe Index
        </span>

        {/* Static search pill — display only */}
        <div className="flex-1 max-w-[280px]">
          <button
            aria-label="Search places"
            className="flex w-full items-center gap-2 rounded-full border border-black/[0.12] bg-white px-3 py-1 shadow-sm cursor-pointer hover:border-black/[0.20] transition-colors"
          >
            <span className="text-accent text-xs">✦</span>
            <span className="text-xs text-warm-gray-mid italic flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
              Explore a vibe / Any city · Any mood
            </span>
          </button>
        </div>

        {/* Nav links + ♡ Saved pill */}
        <div className="ml-auto flex items-center gap-5">
          {links.map(({ href, label }) => {
            const isActive = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'text-sm font-medium transition-colors whitespace-nowrap',
                  // Active state uses text-foreground (Airbnb-style) rather than text-accent
                  isActive ? 'text-foreground font-semibold' : 'text-warm-gray-mid hover:text-foreground'
                )}
              >
                {label}
              </Link>
            )
          })}
          {/* ♡ Saved pill button */}
          <Link
            href="/saved"
            className="flex items-center gap-1.5 rounded-full border border-border bg-white px-3 py-1.5 text-sm font-medium text-foreground shadow-sm hover:border-foreground/20 transition-colors"
          >
            <Heart className="h-3.5 w-3.5" strokeWidth={1.6} />
            Saved
          </Link>
        </div>
      </div>
    </nav>
  )
}
