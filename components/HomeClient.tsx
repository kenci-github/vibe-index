'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import TagFilter from '@/components/filters/TagFilter'
import PlaceCard from '@/components/places/PlaceCard'
import SkeletonCard from '@/components/places/SkeletonCard'
import CitySelector from '@/components/filters/CitySelector'
import CityHero from '@/components/filters/CityHero'
import { getPlaces } from '@/lib/db/supabase'
import { CITY_STORAGE_KEY } from '@/lib/storage/bookmarks'
import { cn } from '@/lib/utils'
import type { Place, ActiveFilters, City, Country, TasteTag, IntentTag, MomentTag } from '@/types'

interface HomeClientProps {
  cities: (City & { country: Country })[]
}

const PAGE_SIZE = 20

export default function HomeClient({ cities }: HomeClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [cityId, setCityId] = useState<string | null>(null)
  const [allPlaces, setAllPlaces] = useState<Place[]>([])
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  // Prevents the fetch effect from running before localStorage is read on mount
  const [initialized, setInitialized] = useState(false)

  // Derive tag arrays from URL params
  const tasteTags = (searchParams.get('taste')?.split(',').filter(Boolean) ?? []) as TasteTag[]
  const intentTags = (searchParams.get('intent')?.split(',').filter(Boolean) ?? []) as IntentTag[]
  const momentTags = (searchParams.get('moment')?.split(',').filter(Boolean) ?? []) as MomentTag[]

  // Composed filters object — city from localStorage state, tags from URL
  const activeFilters: ActiveFilters = { cityId, tasteTags, intentTags, momentTags }

  // Restore city from localStorage — runs once, then marks initialized
  useEffect(() => {
    const saved = localStorage.getItem(CITY_STORAGE_KEY)
    if (saved) {
      // Reading from localStorage is a legitimate external system sync — effect is correct here
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCityId(saved)
    }
    setInitialized(true)
  }, [])

  // Fetch first page — resets whenever city or tag params change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!initialized) return
    let cancelled = false
    // Loading state must be set synchronously before the async fetch begins
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(true)
    setOffset(0)
    setHasMore(true)
    getPlaces(activeFilters, 0, PAGE_SIZE).then((data) => {
      if (!cancelled) {
        setAllPlaces(data)
        if (data.length < PAGE_SIZE) setHasMore(false)
        setIsLoading(false)
      }
    })
    return () => { cancelled = true }
  // activeFilters is derived from cityId + searchParams — depend on primitives only
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cityId, searchParams, initialized])

  async function loadMore() {
    setLoadingMore(true)
    const nextOffset = offset + PAGE_SIZE
    const data = await getPlaces(activeFilters, nextOffset, PAGE_SIZE)
    setAllPlaces((prev) => [...prev, ...data])
    if (data.length < PAGE_SIZE) setHasMore(false)
    setOffset(nextOffset)
    setLoadingMore(false)
  }

  function handleCitySelect(id: string | null) {
    if (id) {
      localStorage.setItem(CITY_STORAGE_KEY, id)
    } else {
      localStorage.removeItem(CITY_STORAGE_KEY)
    }
    setCityId(id)
    // Clear tag params when city changes
    router.replace('/', { scroll: false })
  }

  function handleTagChange(filters: ActiveFilters) {
    const params = new URLSearchParams(searchParams.toString())
    if (filters.tasteTags.length) params.set('taste', filters.tasteTags.join(','))
    else params.delete('taste')
    if (filters.intentTags.length) params.set('intent', filters.intentTags.join(','))
    else params.delete('intent')
    if (filters.momentTags.length) params.set('moment', filters.momentTags.join(','))
    else params.delete('moment')
    router.replace('?' + params.toString(), { scroll: false })
  }

  const selectedCity = cities.find((c) => c.id === cityId)
  const locationLabel = selectedCity ? `in ${selectedCity.name}` : 'worldwide'

  return (
    <div>
      {/* City selector */}
      <div className="px-4 pb-3 pt-2">
        <CitySelector
          cities={cities}
          selectedCityId={cityId}
          onSelect={handleCitySelect}
        />
      </div>

      {/* City editorial hero */}
      <CityHero city={selectedCity ?? null} />

      {/* Tag filter */}
      <TagFilter activeTags={activeFilters} onChange={handleTagChange} />

      {/* Result count */}
      <div className="px-4 pb-1 pt-2">
        <p className="text-xs text-gray-400">
          {isLoading ? (
            <span className="animate-pulse">Loading…</span>
          ) : (
            <>
              {allPlaces.length} {allPlaces.length === 1 ? 'place' : 'places'} {locationLabel}
            </>
          )}
        </p>
      </div>

      {/* Content */}
      <div className={cn('transition-opacity duration-200', isLoading && 'opacity-50 pointer-events-none')}>
        {!isLoading && allPlaces.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-4 py-20 text-center">
            <p className="text-2xl">🌆</p>
            <p className="mt-2 text-base font-semibold text-gray-700">No places found</p>
            <p className="mt-1 text-sm text-gray-400">Try a different vibe combination</p>
          </div>
        ) : (
          <div className="px-4 pb-24 pt-3">
            <div className="grid grid-cols-2 gap-3">
              {isLoading && allPlaces.length === 0
                ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
                : allPlaces.map((place) => <PlaceCard key={place.id} place={place} />)}
            </div>

            {/* Load more */}
            {!isLoading && hasMore && (
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 py-3 text-sm font-semibold text-gray-700 transition active:scale-95 disabled:opacity-50"
              >
                {loadingMore ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
                ) : null}
                {loadingMore ? 'Loading…' : 'Load more places'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
