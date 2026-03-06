import { createClient } from '@supabase/supabase-js'
import type { Place, City, Country, ActiveFilters } from '@/types'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const key =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(url, key)

export async function getPlaces(filters: ActiveFilters, offset: number = 0, limit: number = 20): Promise<Place[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query: any = supabase
    .from('places_with_location')
    .select('*')
    .eq('active', true)

  if (filters.cityId) query = query.eq('city_id', filters.cityId)
  if (filters.tasteTags.length) query = query.contains('taste_tags', filters.tasteTags)
  if (filters.intentTags.length) query = query.contains('intent_tags', filters.intentTags)
  if (filters.momentTags.length) query = query.contains('moment_tags', filters.momentTags)

  const { data, error } = await query
    .order('featured', { ascending: false })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)
  if (error) { console.error('getPlaces error:', error); return [] }
  return (data as Place[]) ?? []
}

export async function getCities(): Promise<(City & { country: Country })[]> {
  const { data, error } = await supabase
    .from('cities')
    .select('*, country:countries(*)')
    .eq('active', true)
    .order('name')
  if (error) { console.error('getCities error:', error); return [] }
  return (data as (City & { country: Country })[]) ?? []
}

export async function getCountries(): Promise<Country[]> {
  const { data, error } = await supabase
    .from('countries')
    .select('*')
    .order('name')
  if (error) { console.error('getCountries error:', error); return [] }
  return (data as Country[]) ?? []
}

export async function getPlaceById(id: string): Promise<Place | null> {
  const { data, error } = await supabase
    .from('places_with_location')
    .select('*')
    .eq('id', id)
    .eq('active', true)
    .single()
  if (error || !data) return null
  return data as Place
}

export async function getSavedPlaces(ids: string[]): Promise<Place[]> {
  if (!ids.length) return []
  const { data, error } = await supabase
    .from('places_with_location')
    .select('*')
    .in('id', ids)
    .eq('active', true)
  if (error) { console.error('getSavedPlaces error:', error); return [] }
  return (data as Place[]) ?? []
}
