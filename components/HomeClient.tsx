'use client'

import { useEffect, useRef, useState } from 'react'
import { MapPin, Bookmark } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import VibeSearch from '@/components/filters/VibeSearch'
import QuickChips from '@/components/filters/QuickChips'
import InterpretationStrip from '@/components/filters/InterpretationStrip'
import TagFilter from '@/components/filters/TagFilter'
import PlaceCard from '@/components/places/PlaceCard'
import SkeletonCard from '@/components/places/SkeletonCard'
import CitySelector from '@/components/filters/CitySelector'
import CityHero from '@/components/filters/CityHero'
import { getPlaces } from '@/lib/db/supabase'
import { CITY_STORAGE_KEY } from '@/lib/storage/bookmarks'
import { cn } from '@/lib/utils'
import type { Place, ActiveFilters, City, Country, TasteTag, IntentTag, MomentTag } from '@/types'
import type { ParsedQuery } from '@/lib/search/keywords'

const PAGE_SIZE = 20

export default function HomeClient() {
  const [cities, setCities] = useState<(City & { country: Country })[]>([])
  const router = useRouter()
  const searchParams = useSearchParams()

  // Browse state
  const [cityId, setCityId] = useState<string | null>(null)
  const [allPlaces, setAllPlaces] = useState<Place[]>([])
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const mountedRef = useRef(false)

  // Search state
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchMode, setIsSearchMode] = useState(false)
  const [searchResults, setSearchResults] = useState<Place[] | null>(null)
  const [interpretedAs, setInterpretedAs] = useState<string | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [extractedQuery, setExtractedQuery] = useState<ParsedQuery | null>(null)
  const [isSearching, setIsSearching] = useState(false)

  // Derive tag arrays from URL params
  const tasteTags = (searchParams.get('taste')?.split(',').filter(Boolean) ?? []) as TasteTag[]
  const intentTags = (searchParams.get('intent')?.split(',').filter(Boolean) ?? []) as IntentTag[]
  const momentTags = (searchParams.get('moment')?.split(',').filter(Boolean) ?? []) as MomentTag[]
  const activeFilters: ActiveFilters = { cityId, tasteTags, intentTags, momentTags }

  // Mount: parallel cities + places fetches
  useEffect(() => {
    const saved = localStorage.getItem(CITY_STORAGE_KEY)
    const initialCityId = saved ?? null
    if (saved) setCityId(saved)

    fetch('/api/cities').then(r => r.json()).then(setCities).catch(() => {})

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Re-fetch on filter changes after mount
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
    setAllPlaces((prev) => {
      const ids = new Set(prev.map((p) => p.id))
      return [...prev, ...data.filter((p) => !ids.has(p.id))]
    })
    if (data.length < PAGE_SIZE) setHasMore(false)
    setOffset(nextOffset)
    setLoadingMore(false)
  }

  function handleCitySelect(id: string | null) {
    if (id) localStorage.setItem(CITY_STORAGE_KEY, id)
    else localStorage.removeItem(CITY_STORAGE_KEY)
    setCityId(id)
    clearSearch()
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

  async function runSearch(query: string) {
    if (!query.trim() || query.trim().length < 2) return
    setIsSearching(true)
    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim(), city_id: cityId }),
      })
      const data = await res.json()
      setSearchResults(data.results ?? [])
      setInterpretedAs(data.interpreted_as ?? null)
      setExtractedQuery(data.extracted ?? null)
      setIsSearchMode(true)
    } catch {
      // silent fail — browse mode stays intact
    } finally {
      setIsSearching(false)
    }
  }

  function clearSearch() {
    setSearchQuery('')
    setIsSearchMode(false)
    setSearchResults(null)
    setInterpretedAs(null)
    setExtractedQuery(null)
  }

  const selectedCity = cities.find((c) => c.id === cityId)
  const locationLabel = selectedCity ? `in ${selectedCity.name}` : 'worldwide'

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Sticky header */}
      <header className="sticky top-0 z-40 flex items-center justify-between bg-background/95 px-4 pt-safe pt-4 pb-2 backdrop-blur-sm">
        <h1 className="text-xl font-bold tracking-tight">
          Vibe<span className="text-accent">.</span>
        </h1>
        <Link href="/saved" aria-label="Saved places">
          <Bookmark className="h-5 w-5 text-gray-500" strokeWidth={1.8} />
        </Link>
      </header>

      {/* Search — hero element */}
      <VibeSearch
        value={searchQuery}
        onChange={setSearchQuery}
        onSearch={runSearch}
        onClear={clearSearch}
        isSearching={isSearching}
      />

      {/* City selector */}
      <div className="px-4 pb-3 pt-1">
        <CitySelector
          cities={cities}
          selectedCityId={cityId}
          onSelect={handleCitySelect}
        />
      </div>

      {/* City editorial hero */}
      <CityHero city={selectedCity ?? null} />

      {/* Quick chips — browse mode only */}
      {!isSearchMode && (
        <QuickChips onChipSelect={(q) => { setSearchQuery(q); runSearch(q) }} />
      )}

      {/* Interpretation strip — search mode only */}
      {isSearchMode && (
        <InterpretationStrip
          interpretedAs={interpretedAs}
          resultCount={searchResults?.length ?? 0}
          onClear={clearSearch}
        />
      )}

      {/* Tag filter — browse mode only */}
      {!isSearchMode && (
        <TagFilter activeTags={activeFilters} onChange={handleTagChange} />
      )}

      {/* Result count */}
      <div className="px-4 pb-1 pt-2">
        <p className="text-xs text-warm-gray-mid">
          {isSearchMode
            ? `${searchResults?.length ?? 0} ${(searchResults?.length ?? 0) === 1 ? 'result' : 'results'}`
            : isLoading
            ? <span className="animate-pulse">Loading…</span>
            : `${allPlaces.length} ${allPlaces.length === 1 ? 'place' : 'places'} ${locationLabel}`
          }
        </p>
      </div>

      {/* Content */}
      {isSearchMode ? (
        <div className={cn('px-4 pb-24 pt-3', isSearching && 'opacity-50 pointer-events-none transition-opacity duration-200')}>
          {searchResults && searchResults.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-4 py-20 text-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                <MapPin className="h-7 w-7 text-warm-gray-light" strokeWidth={1.5} />
              </div>
              <div className="space-y-1.5">
                <p className="text-[17px] font-semibold text-gray-800">No matches found</p>
                <p className="text-sm text-warm-gray-mid">Try a different search or browse the full feed</p>
              </div>
              <button
                onClick={clearSearch}
                className="mt-1 rounded-full border border-gray-900 px-6 py-2 text-sm font-semibold text-gray-900 transition active:scale-95"
              >
                Back to browse
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {(searchResults ?? []).map((place) => (
                <PlaceCard key={place.id} place={place} />
              ))}
            </div>
          )}
        </div>
      ) : (
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

              {!isLoading && hasMore && (
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 py-3 text-sm font-semibold text-gray-700 transition active:scale-95 disabled:opacity-50"
                >
                  {loadingMore && (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
                  )}
                  {loadingMore ? 'Loading…' : 'Load more places'}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
