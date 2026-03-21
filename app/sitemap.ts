import type { MetadataRoute } from 'next'
import { getPlaces } from '@/lib/db/supabase'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://vibeindex.app'
const PAGE_SIZE = 100

async function getAllPlaces() {
  const all = []
  let offset = 0
  while (true) {
    const batch = await getPlaces({ cityId: null, category: 'all', tasteTags: [], intentTags: [], momentTags: [] }, offset, PAGE_SIZE)
    all.push(...batch)
    if (batch.length < PAGE_SIZE) break
    offset += PAGE_SIZE
  }
  return all
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const places = await getAllPlaces()

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
