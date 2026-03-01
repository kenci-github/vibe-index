'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useTransition } from 'react'
import TagFilter from '@/components/TagFilter'
import PlaceCard from '@/components/PlaceCard'
import type { Place } from '@/lib/types'

interface HomeClientProps {
  places: Place[]
  activeTags: string[]
}

export default function HomeClient({ places, activeTags }: HomeClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const handleToggle = useCallback(
    (tag: string) => {
      const current = activeTags.includes(tag)
        ? activeTags.filter((t) => t !== tag)
        : [...activeTags, tag]

      const params = new URLSearchParams(searchParams.toString())
      if (current.length > 0) {
        params.set('tags', current.join(','))
      } else {
        params.delete('tags')
      }

      startTransition(() => {
        router.push(`/?${params.toString()}`)
      })
    },
    [activeTags, router, searchParams]
  )

  return (
    <>
      <div className={isPending ? 'opacity-60 transition-opacity' : ''}>
        <TagFilter activeTags={activeTags} onToggle={handleToggle} />
      </div>

      {places.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-4 py-20 text-center">
          <p className="text-2xl">🌆</p>
          <p className="mt-2 text-base font-semibold text-gray-700">No places found</p>
          <p className="mt-1 text-sm text-gray-400">Try a different vibe combination</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 px-4 pb-24 pt-3">
          {places.map((place) => (
            <PlaceCard key={place.id} place={place} />
          ))}
        </div>
      )}
    </>
  )
}
