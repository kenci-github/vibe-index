'use client'

import { useEffect } from 'react'
import { logEvent } from '@/lib/analytics/events'
import type { PlaceCategory } from '@/types'

interface PlaceViewTrackerProps {
  placeId: string
  cityId: string
  category: PlaceCategory | null
}

export default function PlaceViewTracker({ placeId, cityId, category }: PlaceViewTrackerProps) {
  useEffect(() => {
    logEvent({
      event_type: 'listing_viewed',
      place_id: placeId,
      city_id: cityId,
      category,
    })
    // Run once on mount only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}
