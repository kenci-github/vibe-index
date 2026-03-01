'use client'

import { cn } from '@/lib/utils'
import { TAG_GROUPS } from '@/lib/tags'

interface TagFilterProps {
  activeTags: string[]
  onToggle: (tag: string) => void
}

export default function TagFilter({ activeTags, onToggle }: TagFilterProps) {
  return (
    <div className="w-full overflow-x-auto scrollbar-none">
      <div className="flex gap-4 px-4 pb-2" style={{ width: 'max-content' }}>
        {TAG_GROUPS.map(({ label, tags }) => (
          <div key={label} className="flex flex-col gap-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
              {label}
            </span>
            <div className="flex gap-2">
              {tags.map((tag) => {
                const active = activeTags.includes(tag)
                return (
                  <button
                    key={tag}
                    onClick={() => onToggle(tag)}
                    className={cn(
                      'whitespace-nowrap rounded-full border px-3 py-1 text-xs font-medium transition-all',
                      active
                        ? 'border-accent bg-accent text-white'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-accent/50'
                    )}
                  >
                    {tag}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
