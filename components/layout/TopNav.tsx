'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const links = [
  { href: '/', label: 'Discover' },
  { href: '/saved', label: 'Saved' },
]

export default function TopNav() {
  const pathname = usePathname()

  return (
    <nav className="hidden lg:block sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/50">
      <div className="mx-auto flex max-w-screen-xl items-center justify-between px-8 py-4">
        <div>
          <span className="font-display text-2xl font-semibold tracking-tight text-foreground">
            Vibe Index
          </span>
          <p className="text-[11px] font-light text-warm-gray-mid">Find places by feel</p>
        </div>
        <div className="flex items-center gap-6">
          {links.map(({ href, label }) => {
            const isActive = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'text-sm font-medium transition-colors',
                  isActive ? 'text-accent font-semibold' : 'text-warm-gray-mid hover:text-foreground'
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
