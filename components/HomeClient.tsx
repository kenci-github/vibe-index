'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Compass, Heart, X } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import VibeSearch from '@/components/filters/VibeSearch'
import CategoryChips from '@/components/filters/CategoryChips'
import FilterSheet from '@/components/filters/FilterSheet'
import InterpretationStrip from '@/components/filters/InterpretationStrip'
import PlaceCard from '@/components/places/PlaceCard'
import { TASTE_TAGS, INTENT_TAGS, MOMENT_TAGS } from '@/lib/constants/tags'
import SkeletonCard from '@/components/places/SkeletonCard'
import CitySelector from '@/components/filters/CitySelector'
import CityHero from '@/components/filters/CityHero'
import { getPlaces } from '@/lib/db/supabase'
import { CITY_STORAGE_KEY } from '@/lib/storage/bookmarks'
import { logEvent } from '@/lib/analytics/events'
import { cn } from '@/lib/utils'
import type { Place, ActiveFilters, City, Country, TasteTag, IntentTag, MomentTag, CategoryFilter } from '@/types'
import type { ParsedQuery } from '@/lib/search/keywords'

function getMatchedTags(place: Place, extracted: ParsedQuery | null): string[] {
  if (!extracted) return []
  return [
    ...(place.taste_tags ?? []).filter(t => (extracted.taste_tags as string[]).includes(t)),
    ...(place.intent_tags ?? []).filter(t => (extracted.intent_tags as string[]).includes(t)),
    ...(place.moment_tags ?? []).filter(t => (extracted.moment_tags as string[]).includes(t)),
  ]
}

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
  const [extractedQuery, setExtractedQuery] = useState<ParsedQuery | null>(null)
  const [isSearching, setIsSearching] = useState(false)

  // Stable string primitives for deps (avoids new array identity on every render)
  const tasteStr = searchParams.get('taste') ?? ''
  const intentStr = searchParams.get('intent') ?? ''
  const momentStr = searchParams.get('moment') ?? ''
  const categoryParam = (searchParams.get('category') ?? 'all') as CategoryFilter

  const activeFilters = useMemo<ActiveFilters>(() => ({
    cityId,
    category: categoryParam,
    tasteTags: tasteStr.split(',').filter(Boolean) as TasteTag[],
    intentTags: intentStr.split(',').filter(Boolean) as IntentTag[],
    momentTags: momentStr.split(',').filter(Boolean) as MomentTag[],
  }), [cityId, categoryParam, tasteStr, intentStr, momentStr])

  // Mount: parallel cities + places fetches
  useEffect(() => {
    const saved = localStorage.getItem(CITY_STORAGE_KEY)
    const initialCityId = saved ?? null
    if (saved) setCityId(saved)

    fetch('/api/cities').then(r => r.json()).then(setCities).catch(() => {})

    let cancelled = false
    const initialFilters: ActiveFilters = {
      cityId: initialCityId,
      category: categoryParam,
      tasteTags: tasteStr.split(',').filter(Boolean) as TasteTag[],
      intentTags: intentStr.split(',').filter(Boolean) as IntentTag[],
      momentTags: momentStr.split(',').filter(Boolean) as MomentTag[],
    }
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
  }, [cityId, categoryParam, tasteStr, intentStr, momentStr]) // eslint-disable-line react-hooks/exhaustive-deps

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
    logEvent({ event_type: 'search_submitted', search_query: query.trim(), city_id: cityId ?? undefined })
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

  function toggleSidebarTag(tag: string, type: 'taste' | 'intent' | 'moment') {
    const next = { ...activeFilters }
    if (type === 'taste') {
      next.tasteTags = next.tasteTags.includes(tag as TasteTag)
        ? next.tasteTags.filter(t => t !== (tag as TasteTag))
        : [...next.tasteTags, tag as TasteTag]
    } else if (type === 'intent') {
      next.intentTags = next.intentTags.includes(tag as IntentTag)
        ? next.intentTags.filter(t => t !== (tag as IntentTag))
        : [...next.intentTags, tag as IntentTag]
    } else {
      next.momentTags = next.momentTags.includes(tag as MomentTag)
        ? next.momentTags.filter(t => t !== (tag as MomentTag))
        : [...next.momentTags, tag as MomentTag]
    }
    handleTagChange(next)
  }

  const hasActiveTagFilters =
    activeFilters.tasteTags.length > 0 ||
    activeFilters.intentTags.length > 0 ||
    activeFilters.momentTags.length > 0

  const allActiveTags = [
    ...activeFilters.tasteTags,
    ...activeFilters.intentTags,
    ...activeFilters.momentTags,
  ]

  const selectedCity = cities.find((c) => c.id === cityId)
  const locationLabel = selectedCity ? `in ${selectedCity.name}` : 'worldwide'

  return (
    <div className="flex flex-col min-h-screen bg-background">

      {/* ── Mobile sticky bar (hidden lg+) ── */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm lg:hidden">
        <header className="flex items-center justify-between px-4 pt-safe pt-4 pb-2">
          <div>
            <h1 className="font-display text-[26px] font-semibold tracking-tight text-foreground">
              Vibe Index
            </h1>
            <p className="text-[11px] font-light text-warm-gray-mid">Find places by feel</p>
          </div>
          <Link
            href="/saved"
            aria-label="Saved places"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-white shadow-sm transition hover:border-foreground/20"
          >
            <Heart className="h-4 w-4 text-foreground" strokeWidth={1.6} />
          </Link>
        </header>

        <VibeSearch
          value={searchQuery}
          onChange={setSearchQuery}
          onSearch={runSearch}
          onClear={clearSearch}
          isSearching={isSearching}
        />

        <div className="px-4 pb-3 pt-1">
          <CitySelector cities={cities} selectedCityId={cityId} onSelect={handleCitySelect} />
        </div>

        {!isSearchMode && (
          <>
            <div className="flex items-center gap-2 pb-2 pr-4">
              <div className="flex-1 min-w-0">
                <CategoryChips activeTags={activeFilters} onChange={handleTagChange} />
              </div>
              <FilterSheet activeTags={activeFilters} onChange={handleTagChange} />
            </div>
            {(activeFilters.tasteTags.length > 0 || activeFilters.intentTags.length > 0 || activeFilters.momentTags.length > 0) && (
              <div className="overflow-x-auto scrollbar-none border-t border-border/40">
                <div className="flex items-center gap-2 px-4 py-2">
                  {([
                    ...activeFilters.tasteTags.map(t => ({ tag: t as string, type: 'taste' as const })),
                    ...activeFilters.intentTags.map(t => ({ tag: t as string, type: 'intent' as const })),
                    ...activeFilters.momentTags.map(t => ({ tag: t as string, type: 'moment' as const })),
                  ]).map(({ tag, type }) => (
                    <button
                      key={`${type}-${tag}`}
                      onClick={() => {
                        const next = { ...activeFilters }
                        if (type === 'taste') next.tasteTags = next.tasteTags.filter(t => t !== tag as TasteTag)
                        if (type === 'intent') next.intentTags = next.intentTags.filter(t => t !== tag as IntentTag)
                        if (type === 'moment') next.momentTags = next.momentTags.filter(t => t !== tag as MomentTag)
                        handleTagChange(next)
                      }}
                      className="flex shrink-0 items-center gap-1 rounded-full bg-accent/10 border border-accent/30 px-3 py-1 text-xs font-medium text-accent"
                    >
                      {tag.replace(/-/g, ' ')}
                      <X className="h-3 w-3" />
                    </button>
                  ))}
                  <button
                    onClick={() => handleTagChange({ ...activeFilters, category: 'all', tasteTags: [], intentTags: [], momentTags: [] })}
                    className="shrink-0 text-xs font-medium text-warm-gray-mid hover:text-foreground transition whitespace-nowrap"
                  >
                    Clear all
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {isSearchMode && (
          <InterpretationStrip
            interpretedAs={interpretedAs}
            resultCount={searchResults?.length ?? 0}
            onClear={clearSearch}
          />
        )}
      </div>

      {/* ── Desktop: sidebar + main ── */}
      <div className="flex flex-1">

        {/* Desktop sidebar (hidden mobile) */}
        <aside className="hidden lg:flex lg:flex-col lg:w-72 xl:w-80 lg:flex-shrink-0 lg:sticky lg:top-12 lg:h-[calc(100vh-3rem)] lg:overflow-y-auto lg:border-r lg:border-border/50 lg:px-6 lg:py-6 lg:gap-5">
          {/* Search */}
          <VibeSearch
            value={searchQuery}
            onChange={setSearchQuery}
            onSearch={runSearch}
            onClear={clearSearch}
            isSearching={isSearching}
          />

          {/* City */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-warm-gray-mid mb-2">City</p>
            <CitySelector cities={cities} selectedCityId={cityId} onSelect={handleCitySelect} />
          </div>

          {/* Vibe */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-warm-gray-mid mb-2">Vibe</p>
            <div className="flex flex-wrap gap-1.5">
              {TASTE_TAGS.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleSidebarTag(tag, 'taste')}
                  className={cn(
                    'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                    activeFilters.tasteTags.includes(tag as TasteTag)
                      ? 'bg-accent border-accent text-white'
                      : 'bg-white border-border text-warm-gray-mid hover:border-foreground/30'
                  )}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Intent */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-warm-gray-mid mb-2">Intent</p>
            <div className="flex flex-wrap gap-1.5">
              {INTENT_TAGS.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleSidebarTag(tag, 'intent')}
                  className={cn(
                    'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                    activeFilters.intentTags.includes(tag as IntentTag)
                      ? 'bg-accent border-accent text-white'
                      : 'bg-white border-border text-warm-gray-mid hover:border-foreground/30'
                  )}
                >
                  {tag.replace(/-/g, ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Moment */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-warm-gray-mid mb-2">Moment</p>
            <div className="flex flex-wrap gap-1.5">
              {MOMENT_TAGS.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleSidebarTag(tag, 'moment')}
                  className={cn(
                    'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                    activeFilters.momentTags.includes(tag as MomentTag)
                      ? 'bg-accent border-accent text-white'
                      : 'bg-white border-border text-warm-gray-mid hover:border-foreground/30'
                  )}
                >
                  {tag.replace(/-/g, ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Clear all */}
          {hasActiveTagFilters && (
            <button
              onClick={() => handleTagChange({ ...activeFilters, category: 'all', tasteTags: [], intentTags: [], momentTags: [] })}
              className="text-sm font-semibold text-accent text-left"
            >
              Clear all filters
            </button>
          )}

          {/* Search interpretation strip (search mode only) */}
          {isSearchMode && (
            <InterpretationStrip
              interpretedAs={interpretedAs}
              resultCount={searchResults?.length ?? 0}
              onClear={clearSearch}
            />
          )}
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* City editorial hero — scrolls away */}
          <CityHero city={selectedCity ?? null} />

      {/* Results header */}
      <div className="flex items-center justify-between px-6 pb-2 pt-4" aria-live="polite" aria-atomic="true">
        {/* Left: bold count + active tag names */}
        <p className="text-sm text-foreground">
          {isLoading && !isSearchMode ? (
            <span className="animate-pulse text-warm-gray-mid">Loading…</span>
          ) : isSearchMode ? (
            <>
              <span className="font-semibold">{searchResults?.length ?? 0} {(searchResults?.length ?? 0) === 1 ? 'result' : 'results'}</span>
            </>
          ) : (
            <>
              <span className="font-semibold">{allPlaces.length} {allPlaces.length === 1 ? 'place' : 'places'}</span>
              {allActiveTags.map(tag => (
                <span key={tag} className="text-warm-gray-mid"> · {tag.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</span>
              ))}
            </>
          )}
        </p>

        {/* Right: Sort pill (browse mode only) */}
        {!isSearchMode && !isLoading && (
          <div className="flex items-center gap-1.5 rounded-full border border-border bg-white px-3 py-1 text-xs font-medium text-foreground shadow-sm">
            Sort: Featured first
            <span className="text-warm-gray-mid text-[10px]">▾</span>
          </div>
        )}
      </div>

      {/* Content */}
      {isSearchMode ? (
        <div className={cn('px-4 pb-24 pt-3', isSearching && 'opacity-50 pointer-events-none transition-opacity duration-200')}>
          {searchResults && searchResults.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-4 py-20 text-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/8">
                <Compass className="h-7 w-7 text-accent" strokeWidth={1.5} />
              </div>
              <div className="space-y-1.5">
                <p className="font-display text-[19px] font-semibold text-foreground">Nothing here yet for that vibe</p>
                <p className="text-sm text-warm-gray-mid">Try a different search or browse the full feed</p>
              </div>
              <button
                onClick={clearSearch}
                className="mt-1 rounded-full bg-accent px-6 py-2 text-sm font-semibold text-white transition active:scale-95"
              >
                Back to browse
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {(searchResults ?? []).map((place, i) => {
                const isHero = i === 0
                const isWide = i > 0 && (i - 1) % 5 === 4
                const variant = isHero ? 'hero' : isWide ? 'wide' : 'default'
                return (
                  <div key={place.id} className={isHero ? 'col-span-2 lg:col-span-1' : isWide ? 'col-span-2 lg:col-span-1' : ''}>
                    <PlaceCard place={place} searchMode={true} matchedTags={getMatchedTags(place, extractedQuery)} variant={variant} />
                  </div>
                )
              })}
            </div>
          )}
        </div>
      ) : (
        <div className={cn('transition-opacity duration-200', isLoading && 'opacity-50 pointer-events-none')}>
          {!isLoading && allPlaces.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-8 py-20 text-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/8">
                <Compass className="h-7 w-7 text-accent" strokeWidth={1.5} />
              </div>
              <div className="space-y-1.5">
                <p className="font-display text-[19px] font-semibold text-foreground">Try a different city or loosen the filters</p>
                <p className="text-sm text-warm-gray-mid">No places match your current selection</p>
              </div>
              <button
                onClick={() => handleTagChange({ cityId, category: 'all', tasteTags: [], intentTags: [], momentTags: [] })}
                className="mt-1 rounded-full bg-accent px-6 py-2 text-sm font-semibold text-white transition active:scale-95"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="px-4 pb-24 pt-3">
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {isLoading && allPlaces.length === 0
                  ? Array.from({ length: 6 }).map((_, i) => {
                      const variant: 'hero' | 'wide' | 'default' =
                        i === 0 ? 'hero' : (i - 1) % 5 === 4 ? 'wide' : 'default'
                      const colClass = variant !== 'default' ? 'col-span-2 lg:col-span-1' : ''
                      return (
                        <div key={i} className={colClass}>
                          <SkeletonCard variant={variant} />
                        </div>
                      )
                    })
                  : allPlaces.flatMap((place, i) => {
                      const isHero = i === 0
                      const isWide = i > 0 && (i - 1) % 5 === 4
                      const variant = isHero ? 'hero' : isWide ? 'wide' : 'default'
                      const card = (
                        <div key={place.id} className={isHero ? 'col-span-2 lg:col-span-1' : isWide ? 'col-span-2 lg:col-span-1' : ''}>
                          <PlaceCard place={place} variant={variant} />
                        </div>
                      )
                      if (i === 9) {
                        return [card, (
                          <div key="submit-cta" className="col-span-2 lg:col-span-3 xl:col-span-4">
                            <div className="flex flex-col items-center gap-4 rounded-2xl border border-accent/20 bg-accent/[0.06] px-6 py-8 text-center">
                              <p className="text-2xl text-accent">✦</p>
                              <div className="space-y-1">
                                <p className="font-display text-xl font-semibold text-foreground">Know a place with the right vibe?</p>
                                <p className="text-sm text-warm-gray-mid">Submit it to the Vibe Index.</p>
                              </div>
                              <Link
                                href="/submit"
                                className="rounded-full border border-accent px-6 py-2 text-sm font-semibold text-accent transition hover:bg-accent hover:text-white active:scale-95"
                              >
                                Submit a place
                              </Link>
                            </div>
                          </div>
                        )]
                      }
                      return [card]
                    })}
              </div>

              {!isLoading && hasMore && (
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-border py-3 text-sm font-semibold text-foreground transition active:scale-95 disabled:opacity-50"
                >
                  {loadingMore && (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-accent border-t-transparent" />
                  )}
                  {loadingMore ? 'Loading…' : 'Load more places'}
                </button>
              )}
            </div>
          )}
        </div>
      )}
        </div> {/* /flex-1 main content */}
      </div> {/* /flex flex-1 desktop row */}
    </div>
  )
}
