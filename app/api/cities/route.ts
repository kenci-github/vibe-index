import { NextResponse } from 'next/server'
import { getCities } from '@/lib/db/supabase'

export async function GET() {
  const cities = await getCities()
  return NextResponse.json(cities, {
    headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' },
  })
}
