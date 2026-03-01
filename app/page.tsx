import { Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import { TASTE_TAGS, INTENT_TAGS, MOMENT_TAGS } from '@/lib/tags'
import HomeClient from '@/components/HomeClient'
import type { Place } from '@/lib/types'

interface HomePageProps {
  searchParams: Promise<{ tags?: string }>
}

async function getPlaces(tags: string[]): Promise<Place[]> {
  let query = supabase.from('places').select('*').eq('active', true)

  if (tags.length > 0) {
    const taste = tags.filter((t) => (TASTE_TAGS as readonly string[]).includes(t))
    const intent = tags.filter((t) => (INTENT_TAGS as readonly string[]).includes(t))
    const moment = tags.filter((t) => (MOMENT_TAGS as readonly string[]).includes(t))

    const conditions: string[] = []
    if (taste.length) conditions.push(`taste_tags.ov.{${taste.join(',')}}`)
    if (intent.length) conditions.push(`intent_tags.ov.{${intent.join(',')}}`)
    if (moment.length) conditions.push(`moment_tags.ov.{${moment.join(',')}}`)

    if (conditions.length) query = query.or(conditions.join(','))
  }

  const { data, error } = await query.order('name')

  if (error) {
    console.error('Supabase error:', error)
    return []
  }

  return (data as Place[]) ?? []
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const { tags: rawTags = '' } = await searchParams
  const activeTags = rawTags ? rawTags.split(',').filter(Boolean) : []
  const places = await getPlaces(activeTags)

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-40 bg-background/95 px-4 pb-2 pt-5 backdrop-blur-sm">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Vibe<span className="text-accent">.</span>
        </h1>
        <p className="text-sm text-gray-400">Discover by mood, not category</p>
      </div>

      <Suspense>
        <HomeClient places={places} activeTags={activeTags} />
      </Suspense>
    </div>
  )
}
