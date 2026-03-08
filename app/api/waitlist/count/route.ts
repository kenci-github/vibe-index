import { NextRequest, NextResponse } from 'next/server'
import { getWaitlistCount } from '@/lib/db/supabase'

export async function GET(req: NextRequest) {
  const cityId = req.nextUrl.searchParams.get('city_id') ?? ''
  const count = await getWaitlistCount(cityId)
  return NextResponse.json({ count })
}
