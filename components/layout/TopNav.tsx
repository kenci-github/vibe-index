'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import TopNavSearch from './TopNavSearch'

const links = [
  { href: '/', label: 'Discover' },
  { href: '/saved', label: 'Saved' },
  { href: '/submit', label: 'Submit a place' },
]

export default function TopNav() {
  const pathname = usePathname()

  return (
    <nav
      className="hidden lg:block sticky top-0 z-[100]"
      style={{
        height: 'var(--header-h)',
        background: 'oklch(1 0 0 / 0.92)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div
        className="flex items-center h-full w-full px-7"
        style={{ gap: 20 }}
      >
        {/* Logo — left */}
        <Link
          href="/"
          className="flex-shrink-0"
          style={{
            fontFamily: 'var(--font-jakarta)',
            fontWeight: 800,
            fontSize: 18,
            letterSpacing: '-0.04em',
            lineHeight: 1,
            textDecoration: 'none',
          }}
        >
          <span style={{ color: 'var(--text)' }}>Vibe</span>
          <span style={{ color: 'var(--accent)' }}>Index</span>
        </Link>

        {/* Search pill — center (functional) */}
        <div style={{ flex: 1, maxWidth: 460, margin: '0 auto' }}>
          <TopNavSearch />
        </div>

        {/* Nav links — right */}
        <nav className="flex items-center flex-shrink-0" style={{ gap: 4 }}>
          {links.map(({ href, label }) => {
            const isActive = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'whitespace-nowrap transition-colors',
                  isActive
                    ? 'text-foreground'
                    : 'hover:text-foreground'
                )}
                style={{
                  fontSize: 13,
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? 'var(--text)' : 'var(--muted)',
                  textDecoration: 'none',
                  padding: '6px 11px',
                  borderRadius: 8,
                  borderBottom: isActive ? '2px solid var(--text)' : '2px solid transparent',
                }}
              >
                {label}
              </Link>
            )
          })}
        </nav>
      </div>
    </nav>
  )
}
