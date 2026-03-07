'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Compass } from 'lucide-react'
import { getSavedPlaces } from '@/lib/db/supabase'
import { getBookmarkIds } from '@/lib/storage/bookmarks'
import { FLAG_MAP } from '@/lib/constants/flags'
import PlaceCard from '@/components/places/PlaceCard'
import SkeletonCard from '@/components/places/SkeletonCard'
import type { Place } from '@/types'

export default function SavedPage() {
  const [places, setPlaces] = useState<Place[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const ids = getBookmarkIds()
    getSavedPlaces(ids).then((data) => {
      setPlaces(data)
      setLoading(false)
    })
  }, [])

  // Group by city_name, sorted alphabetically
  const grouped = places.reduce<Record<string, { cityName: string; countryCode: string; places: Place[] }>>(
    (acc, place) => {
      const key = place.city_name ?? 'Unknown'
      if (!acc[key]) acc[key] = { cityName: key, countryCode: place.country_code ?? '', places: [] }
      acc[key].places.push(place)
      return acc
    },
    {}
  )
  const groups = Object.values(grouped).sort((a, b) => a.cityName.localeCompare(b.cityName))

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-4 pb-2 pt-5">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold tracking-tight text-gray-900">Your Saved Places</h1>
          {!loading && places.length > 0 && (
            <span className="rounded-full bg-accent/10 px-2 py-0.5 text-xs font-semibold text-accent">
              {places.length}
            </span>
          )}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-3 px-4 pt-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : places.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-4 py-24 text-center">
          <p className="text-4xl">🔖</p>
          <p className="mt-4 text-base font-semibold text-gray-700">Nothing saved yet.</p>
          <p className="mt-1 text-sm text-gray-400">No saved places yet — tap ♡ on any place to save it</p>
          <Link
            href="/"
            className="mt-6 flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white"
          >
            <Compass className="h-4 w-4" />
            Discover vibes
          </Link>
        </div>
      ) : (
        <div className="pt-3">
          {groups.map(({ cityName, countryCode, places: groupPlaces }) => (
            <div key={cityName}>
              <div className="sticky top-0 z-10 bg-gray-50 px-4 py-2">
                <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                  {FLAG_MAP[countryCode] ? `${FLAG_MAP[countryCode]} ` : ''}{cityName}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 px-4 py-3">
                {groupPlaces.map((place) => (
                  <PlaceCard key={place.id} place={place} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
