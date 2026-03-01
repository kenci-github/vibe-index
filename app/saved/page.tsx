'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Compass } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { getBookmarkIds } from '@/lib/bookmarks'
import PlaceCard from '@/components/PlaceCard'
import type { Place } from '@/lib/types'

export default function SavedPage() {
  const [places, setPlaces] = useState<Place[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const ids = getBookmarkIds()

      if (ids.length === 0) {
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('places')
        .select('*')
        .in('id', ids)
        .eq('active', true)

      if (!error && data) {
        setPlaces(data as Place[])
      }

      setLoading(false)
    }

    load()
  }, [])

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-4 pb-2 pt-5">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Saved<span className="text-accent">.</span>
        </h1>
        <p className="text-sm text-gray-400">Your bookmarked places</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-3 px-4 pt-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="aspect-[3/4] animate-pulse rounded-2xl bg-gray-200" />
          ))}
        </div>
      ) : places.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-4 py-24 text-center">
          <p className="text-4xl">🔖</p>
          <p className="mt-4 text-base font-semibold text-gray-700">No saved places yet</p>
          <p className="mt-1 text-sm text-gray-400">
            Tap the bookmark icon on any place to save it
          </p>
          <Link
            href="/"
            className="mt-6 flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white"
          >
            <Compass className="h-4 w-4" />
            Discover vibes
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 px-4 pt-3">
          {places.map((place) => (
            <PlaceCard key={place.id} place={place} />
          ))}
        </div>
      )}
    </div>
  )
}
