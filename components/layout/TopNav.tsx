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
    <nav
      className="hidden md:block sticky top-0 z-[100]"
      style={{
        height: 'var(--header-h)',
        background: 'oklch(1 0 0 / 0.92)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div
        className="mx-auto flex items-center h-full max-w-screen-xl px-7 gap-6"
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

        {/* Search pill — center */}
        <div
          className="flex-1 flex justify-center"
        >
          <div
            className="flex items-center gap-2"
            style={{
              flex: 1,
              maxWidth: 460,
              height: 42,
              border: '1.5px solid var(--border)',
              borderRadius: 40,
              background: 'var(--surface)',
              padding: '0 16px',
              cursor: 'default',
            }}
          >
            {/* Sparkle icon */}
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="currentColor"
              style={{ color: 'var(--accent)', flexShrink: 0 }}
            >
              <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
            </svg>

            {/* Placeholder text */}
            <span
              className="flex-1 truncate"
              style={{ color: 'var(--muted)', fontSize: 13 }}
            >
              Try &apos;dim cozy bar&apos;…
            </span>

            {/* Search icon */}
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              style={{ color: 'var(--dim)', flexShrink: 0 }}
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </div>
        </div>

        {/* Nav links — right */}
        <div className="flex items-center flex-shrink-0" style={{ gap: 24 }}>
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
                  fontSize: 13.5,
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? 'var(--text)' : 'var(--muted)',
                  textDecoration: 'none',
                  borderBottom: isActive ? '2px solid var(--text)' : 'none',
                  paddingBottom: isActive ? 2 : 0,
                }}
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
