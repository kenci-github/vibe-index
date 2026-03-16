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
      <div className="mx-auto max-w-6xl px-4 lg:px-8 pb-2 pt-5">
        <div className="flex items-center gap-2">
          <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">Your Saved Places</h1>
          {!loading && places.length > 0 && (
            <span className="rounded-full bg-accent/10 px-2 py-0.5 text-xs font-semibold text-accent">
              {places.length}
            </span>
          )}
        </div>
      </div>

      {loading ? (
        <div className="mx-auto max-w-6xl grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 px-4 lg:px-8 pt-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : places.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-4 py-24 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/8">
            <Compass className="h-7 w-7 text-accent" strokeWidth={1.5} />
          </div>
          <p className="mt-4 font-display text-xl font-semibold text-foreground">Nothing saved yet</p>
          <p className="mt-1 text-sm text-warm-gray-mid">Tap ♡ on any place to collect it</p>
          <Link
            href="/"
            className="mt-6 flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white"
          >
            <Compass className="h-4 w-4" />
            Discover vibes
          </Link>
        </div>
      ) : (
        <div className="pt-3 mx-auto max-w-6xl">
          {groups.map(({ cityName, countryCode, places: groupPlaces }) => (
            <div key={cityName}>
              <div className="sticky top-0 z-10 bg-background px-4 lg:px-8 py-2">
                <span className="font-display text-sm font-semibold tracking-wider text-foreground">
                  {FLAG_MAP[countryCode] ? `${FLAG_MAP[countryCode]} ` : ''}{cityName}
                </span>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 px-4 lg:px-8 py-3">
                {groupPlaces.map((place, i) => {
                  const isHero = i === 0
                  const variant = isHero ? 'hero' : 'default'
                  return (
                    <div key={place.id} className={isHero ? 'col-span-2 lg:col-span-3 xl:col-span-4' : ''}>
                      <PlaceCard place={place} variant={variant} />
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
