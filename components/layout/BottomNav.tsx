'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Compass, Bookmark } from 'lucide-react'
import { cn } from '@/lib/utils'

const tabs = [
  { href: '/', label: 'Discover', icon: Compass },
  { href: '/saved', label: 'Saved', icon: Bookmark },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white pb-safe shadow-[0_-1px_0_rgba(0,0,0,0.06)]">
      <div className="mx-auto flex max-w-md items-center justify-around">
        {tabs.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-1 flex-col items-center gap-1 py-3 text-xs font-medium transition-all duration-150',
                isActive ? 'text-accent' : 'text-gray-400'
              )}
            >
              <Icon
                className="h-5 w-5"
                strokeWidth={isActive ? 2.5 : 1.8}
              />
              <span>{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
