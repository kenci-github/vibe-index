import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const {
      session_id,
      event_type,
      place_id,
      city_id,
      category,
      taste_tags,
      intent_tags,
      moment_tags,
      search_query,
      cta_type,
      metadata,
    } = body

    if (!session_id || !event_type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { error } = await supabase.from('events').insert({
      session_id,
      event_type,
      place_id: place_id ?? null,
      city_id: city_id ?? null,
      category: category ?? null,
      taste_tags: taste_tags ?? null,
      intent_tags: intent_tags ?? null,
      moment_tags: moment_tags ?? null,
      search_query: search_query ?? null,
      cta_type: cta_type ?? null,
      metadata: metadata ?? null,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }
}
