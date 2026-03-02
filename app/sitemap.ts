import type { MetadataRoute } from 'next'
import { getPlaces } from '@/lib/supabase'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://vibeindex.app'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const places = await getPlaces({ cityId: null, tasteTags: [], intentTags: [], momentTags: [] })

  const placeEntries: MetadataRoute.Sitemap = places.map((place) => ({
    url: `${BASE_URL}/place/${place.id}`,
    lastModified: new Date(place.created_at),
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    ...placeEntries,
  ]
}
