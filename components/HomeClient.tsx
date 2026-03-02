'use client'

import { useEffect, useState } from 'react'
import TagFilter from '@/components/TagFilter'
import PlaceCard from '@/components/PlaceCard'
import CitySelector from '@/components/CitySelector'
import { getPlaces } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import type { Place, ActiveFilters, City, Country } from '@/types'

const CITY_KEY = 'vibe-index-city'

const EMPTY_FILTERS: ActiveFilters = {
  cityId: null,
  tasteTags: [],
  intentTags: [],
  momentTags: [],
}

interface HomeClientProps {
  cities: (City & { country: Country })[]
}

export default function HomeClient({ cities }: HomeClientProps) {
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>(EMPTY_FILTERS)
  const [places, setPlaces] = useState<Place[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Restore city from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(CITY_KEY)
    if (saved) {
      setActiveFilters((prev) => ({ ...prev, cityId: saved }))
    } else {
      // trigger initial fetch even without a saved city
      setActiveFilters((prev) => ({ ...prev }))
    }
  }, [])

  // Fetch places whenever filters change
  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    getPlaces(activeFilters).then((data) => {
      if (!cancelled) {
        setPlaces(data)
        setIsLoading(false)
      }
    })
    return () => { cancelled = true }
  }, [activeFilters])

  function handleCitySelect(cityId: string | null) {
    if (cityId) {
      localStorage.setItem(CITY_KEY, cityId)
    } else {
      localStorage.removeItem(CITY_KEY)
    }
    // Reset tags when city changes
    setActiveFilters({ cityId, tasteTags: [], intentTags: [], momentTags: [] })
  }

  function handleTagChange(filters: ActiveFilters) {
    setActiveFilters(filters)
  }

  const selectedCity = cities.find((c) => c.id === activeFilters.cityId)
  const locationLabel = selectedCity ? `in ${selectedCity.name}` : 'worldwide'

  return (
    <div>
      {/* City selector */}
      <div className="px-4 pb-3 pt-2">
        <CitySelector
          cities={cities}
          selectedCityId={activeFilters.cityId}
          onSelect={handleCitySelect}
        />
      </div>

      {/* Tag filter */}
      <TagFilter activeTags={activeFilters} onChange={handleTagChange} />

      {/* Result count */}
      <div className="px-4 pb-1 pt-2">
        <p className="text-xs text-gray-400">
          {isLoading ? (
            <span className="animate-pulse">Loading…</span>
          ) : (
            <>
              {places.length} {places.length === 1 ? 'place' : 'places'} {locationLabel}
            </>
          )}
        </p>
      </div>

      {/* Content */}
      <div className={cn('transition-opacity duration-200', isLoading && 'opacity-50 pointer-events-none')}>
        {!isLoading && places.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-4 py-20 text-center">
            <p className="text-2xl">🌆</p>
            <p className="mt-2 text-base font-semibold text-gray-700">No places found</p>
            <p className="mt-1 text-sm text-gray-400">Try a different vibe combination</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 px-4 pb-24 pt-3">
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="aspect-[3/4] animate-pulse rounded-2xl bg-gray-100"
                  />
                ))
              : places.map((place) => (
                  <PlaceCard key={place.id} place={place} />
                ))}
          </div>
        )}
      </div>
    </div>
  )
}
