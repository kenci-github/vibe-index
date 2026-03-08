import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { email, city_id, city_name } = await req.json()

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
  }
  if (!city_id) {
    return NextResponse.json({ error: 'city_id required' }, { status: 400 })
  }

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { error } = await admin.from('waitlist').insert({ email, city_id, city_name })

  if (error?.code === '23505') {
    return NextResponse.json({ alreadyJoined: true })
  }
  if (error) {
    console.error('waitlist insert error:', error)
    return NextResponse.json({ error: 'Insert failed' }, { status: 500 })
  }
  return NextResponse.json({ success: true })
}
