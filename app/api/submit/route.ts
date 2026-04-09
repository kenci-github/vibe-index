import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const ALLOWED_SOCIAL_HOSTS = new Set([
  'tiktok.com', 'www.tiktok.com',
  'instagram.com', 'www.instagram.com',
  'youtube.com', 'www.youtube.com',
])

function parseUrl(raw: string): URL | null {
  try { return new URL(raw) } catch { return null }
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }

  // Honeypot — bots fill this in, humans never see it
  if (body.website) {
    return NextResponse.json({ success: true })
  }

  const place_name = typeof body.place_name === 'string' ? body.place_name.trim() : ''
  const city_id = typeof body.city_id === 'string' ? body.city_id.trim() : ''
  const submitter_email = typeof body.submitter_email === 'string' ? body.submitter_email.trim() : ''
  const vibe_description = typeof body.vibe_description === 'string' ? body.vibe_description.trim() : null
  const booking_url_raw = typeof body.booking_url === 'string' ? body.booking_url.trim() : ''
  const social_url_raw = typeof body.social_url === 'string' ? body.social_url.trim() : ''

  // Required field validation
  if (!place_name) {
    return NextResponse.json({ error: 'Place name is required' }, { status: 400 })
  }
  if (place_name.length > 100) {
    return NextResponse.json({ error: 'Place name must be under 100 characters' }, { status: 400 })
  }
  if (!city_id || !UUID_RE.test(city_id)) {
    return NextResponse.json({ error: 'A valid city is required' }, { status: 400 })
  }
  if (!submitter_email || !EMAIL_RE.test(submitter_email)) {
    return NextResponse.json({ error: 'A valid email address is required' }, { status: 400 })
  }
  if (submitter_email.length > 200) {
    return NextResponse.json({ error: 'Email address is too long' }, { status: 400 })
  }

  // Optional field validation
  if (vibe_description && vibe_description.length > 500) {
    return NextResponse.json({ error: 'Vibe description must be under 500 characters' }, { status: 400 })
  }

  let booking_url: string | null = null
  if (booking_url_raw) {
    const parsed = parseUrl(booking_url_raw)
    if (!parsed) {
      return NextResponse.json({ error: 'Booking URL is not a valid URL' }, { status: 400 })
    }
    booking_url = booking_url_raw
  }

  let social_url: string | null = null
  if (social_url_raw) {
    const parsed = parseUrl(social_url_raw)
    if (!parsed || !ALLOWED_SOCIAL_HOSTS.has(parsed.hostname)) {
      return NextResponse.json(
        { error: 'Social URL must be a TikTok, Instagram, or YouTube link' },
        { status: 400 }
      )
    }
    social_url = social_url_raw
  }

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { error } = await admin.from('place_submissions').insert({
    place_name,
    city_id,
    vibe_description: vibe_description || null,
    booking_url,
    social_url,
    submitter_email,
  })

  if (error?.code === '23505') {
    // Silent dedup — don't reveal to caller
    return NextResponse.json({ success: true })
  }
  if (error) {
    console.error('submission insert error:', error)
    return NextResponse.json({ error: 'Submission failed' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
