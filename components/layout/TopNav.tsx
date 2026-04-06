'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const links = [
  { href: '/', label: 'Discover' },
  { href: '/saved', label: 'Saved' },
  { href: '/submit', label: 'Submit a place' },
]

export default function TopNav() {
  const pathname = usePathname()

  return (
    <nav className="hidden lg:block sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/50">
      <div className="mx-auto flex h-12 max-w-screen-xl items-center justify-between px-7">
        {/* Wordmark */}
        <span className="font-display text-xl font-semibold tracking-tight text-foreground flex-shrink-0">
          Vibe Index
        </span>

        <div className="flex-1" />

        {/* Nav links — justify-between handles placement, no ml-auto needed */}
        <div className="flex items-center gap-3">
          {links.map(({ href, label }) => {
            const isActive = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'text-[13px] transition-colors whitespace-nowrap pb-[1px]',
                  isActive
                    ? 'font-semibold text-foreground border-b-[1.5px] border-foreground'
                    : 'font-medium text-warm-gray-mid hover:text-foreground'
                )}
              >
                {label}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
