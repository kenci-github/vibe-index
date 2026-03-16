import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/db/supabase'
import { parseVibeQuery, formatInterpretation } from '@/lib/search/keywords'
import type { Place } from '@/types'

const SEARCH_CACHE = 'public, s-maxage=120, stale-while-revalidate=600'

export async function POST(req: NextRequest) {
  let body: { query?: string; city_id?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { query, city_id } = body

  if (!query || !query.trim()) {
    return NextResponse.json({ error: 'Query required' }, { status: 400 })
  }

  if (query.trim().length > 200) {
    return NextResponse.json({ error: 'Query too long' }, { status: 400 })
  }

  const parsed = parseVibeQuery(query)
  const hasFilters =
    parsed.taste_tags.length > 0 ||
    parsed.intent_tags.length > 0 ||
    parsed.moment_tags.length > 0 ||
    parsed.is_quiet

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let q: any = supabase
    .from('places_with_location')
    .select('*')
    .eq('active', true)

  if (city_id) q = q.eq('city_id', city_id)

  if (hasFilters) {
    // overlaps = match ANY tag (OR logic) — more forgiving for natural language
    if (parsed.taste_tags.length)  q = q.overlaps('taste_tags',  parsed.taste_tags)
    if (parsed.intent_tags.length) q = q.overlaps('intent_tags', parsed.intent_tags)
    if (parsed.moment_tags.length) q = q.overlaps('moment_tags', parsed.moment_tags)
    if (parsed.is_quiet)           q = q.not('taste_tags', 'cs', '{"loud"}')
  }

  const { data, error } = await q
    .order('featured', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) {
    console.error('search error:', error)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }

  const results: Place[] = (data as Place[]) ?? []
  const interpreted_as = hasFilters
    ? formatInterpretation(parsed)
    : 'Showing all places'

  return NextResponse.json(
    {
      results,
      interpreted_as,
      extracted: {
        taste_tags:       parsed.taste_tags,
        intent_tags:      parsed.intent_tags,
        moment_tags:      parsed.moment_tags,
        matched_keywords: parsed.matched_keywords,
        is_quiet:         parsed.is_quiet,
      },
    },
    { headers: { 'Cache-Control': SEARCH_CACHE } }
  )
}
