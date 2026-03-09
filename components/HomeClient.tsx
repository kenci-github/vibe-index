'use client'

import { useEffect, useRef, useState } from 'react'
import { MapPin } from 'lucide-react'
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

const PAGE_SIZE = 20

export default function HomeClient() {
  const [cities, setCities] = useState<(City & { country: Country })[]>([])
  const router = useRouter()
  const searchParams = useSearchParams()

  const [cityId, setCityId] = useState<string | null>(null)
  const [allPlaces, setAllPlaces] = useState<Place[]>([])
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  // True once the mount effect has completed (prevents filter effect double-fetch on mount)
  const mountedRef = useRef(false)

  // Derive tag arrays from URL params
  const tasteTags = (searchParams.get('taste')?.split(',').filter(Boolean) ?? []) as TasteTag[]
  const intentTags = (searchParams.get('intent')?.split(',').filter(Boolean) ?? []) as IntentTag[]
  const momentTags = (searchParams.get('moment')?.split(',').filter(Boolean) ?? []) as MomentTag[]

  // Composed filters object — city from localStorage state, tags from URL
  const activeFilters: ActiveFilters = { cityId, tasteTags, intentTags, momentTags }

  // Mount: read localStorage synchronously, then start cities + places fetches in parallel
  useEffect(() => {
    const saved = localStorage.getItem(CITY_STORAGE_KEY)
    const initialCityId = saved ?? null
    if (saved) setCityId(saved)

    // Cities: fetched via API route (browser-cached for 1h, no SSR network dependency)
    fetch('/api/cities').then(r => r.json()).then(setCities).catch(() => {})

    // Places: starts immediately in parallel with cities — uses initialCityId from localStorage
    let cancelled = false
    const initialFilters: ActiveFilters = { cityId: initialCityId, tasteTags, intentTags, momentTags }
    getPlaces(initialFilters, 0, PAGE_SIZE).then((data) => {
      if (!cancelled) {
        setAllPlaces(data)
        if (data.length < PAGE_SIZE) setHasMore(false)
        setIsLoading(false)
        mountedRef.current = true
      }
    })
    return () => { cancelled = true }
  // Mount only — URL params are captured once at load via initialFilters above
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Re-fetch places when city or tag filters change after mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!mountedRef.current) return
    let cancelled = false
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cityId, searchParams])

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
        <p className="text-xs text-warm-gray-mid">
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
          <div className="flex flex-col items-center justify-center px-8 py-20 text-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <MapPin className="h-7 w-7 text-warm-gray-light" strokeWidth={1.5} />
            </div>
            <div className="space-y-1.5">
              <p className="text-[17px] font-semibold text-gray-800">No places found</p>
              <p className="text-sm text-warm-gray-mid">Try adjusting your filters or explore a different city</p>
            </div>
            <button
              onClick={() => handleTagChange({ cityId, tasteTags: [], intentTags: [], momentTags: [] })}
              className="mt-1 rounded-full border border-gray-900 px-6 py-2 text-sm font-semibold text-gray-900 transition active:scale-95"
            >
              Clear filters
            </button>
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
