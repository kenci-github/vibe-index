import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { supabase } from '@/lib/db/supabase'
import { parseVibeQuery, formatInterpretation } from '@/lib/search/keywords'
import type { Place, TasteTag, IntentTag, MomentTag } from '@/types'
import type { ParsedQuery } from '@/lib/search/keywords'

const SEARCH_CACHE = 'public, s-maxage=120, stale-while-revalidate=600'

// ── Claude Haiku tag extraction ──────────────────────────────────────────────

const TASTE_TAGS = ['sexy', 'cozy', 'chic', 'loud', 'dim', 'kinetic', 'earthy', 'elegant', 'stylish', 'playful', 'intimate']
const INTENT_TAGS = ['date', 'solo', 'group', 'chill', 'brunch', 'spa', 'manicure', 'dessert', 'late-night', 'girls-night', 'solo-reset']
const MOMENT_TAGS = ['before-dinner', 'rainy-day', 'late-night', 'sunday-morning', 'after-shopping']
const CATEGORIES = ['food', 'drink', 'cafe', 'spa', 'wellness', 'hair', 'nails', 'dental', 'fitness', 'nightlife', 'shopping', 'experience']

const EXTRACT_TOOL: Anthropic.Tool = {
  name: 'extract_vibe_tags',
  description: 'Extract structured vibe tags from a natural language place discovery query',
  input_schema: {
    type: 'object' as const,
    properties: {
      taste_tags: {
        type: 'array',
        items: { type: 'string', enum: TASTE_TAGS },
        description: 'Atmosphere/aesthetic tags that describe the vibe of the place',
      },
      intent_tags: {
        type: 'array',
        items: { type: 'string', enum: INTENT_TAGS },
        description: 'What the user intends to do or who they are going with',
      },
      moment_tags: {
        type: 'array',
        items: { type: 'string', enum: MOMENT_TAGS },
        description: 'Time-of-day or situational context tags',
      },
      category: {
        type: 'string',
        enum: [...CATEGORIES, 'null'],
        description: 'Primary category of place, or "null" if no specific category',
      },
      is_quiet: {
        type: 'boolean',
        description: 'True if the user is explicitly asking for a quiet/low-noise place',
      },
    },
    required: ['taste_tags', 'intent_tags', 'moment_tags', 'category', 'is_quiet'],
    additionalProperties: false,
  },
}

const SYSTEM_PROMPT = `You are a tag extractor for a vibe-based place discovery app.
Users search for places using natural language describing mood, atmosphere, occasion, or activity.

Your job: map their query to the exact tags in our system. Be generous — extract everything relevant.
If a tag is even slightly implied, include it. Prefer more tags over fewer.

Examples:
- "dim cocktails for a second date" → taste:[dim,intimate,sexy], intent:[date], category:drink
- "cozy Sunday morning cafe" → taste:[cozy], moment:[sunday-morning], category:cafe
- "late night dancing girls night" → taste:[loud,kinetic], intent:[girls-night,late-night], moment:[late-night], category:nightlife
- "quiet spa day alone" → intent:[solo,spa,solo-reset], category:spa, is_quiet:true`

async function extractWithHaiku(query: string): Promise<ParsedQuery | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return null

  try {
    const client = new Anthropic({ apiKey })

    const response = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 256,
      system: SYSTEM_PROMPT,
      tools: [EXTRACT_TOOL],
      tool_choice: { type: 'tool', name: 'extract_vibe_tags' },
      messages: [{ role: 'user', content: query }],
    })

    const toolUse = response.content.find(
      (b): b is Anthropic.ToolUseBlock => b.type === 'tool_use'
    )
    if (!toolUse) return null

    const input = toolUse.input as {
      taste_tags: string[]
      intent_tags: string[]
      moment_tags: string[]
      category: string
      is_quiet: boolean
    }

    return {
      taste_tags: (input.taste_tags ?? []) as TasteTag[],
      intent_tags: (input.intent_tags ?? []) as IntentTag[],
      moment_tags: (input.moment_tags ?? []) as MomentTag[],
      category: input.category === 'null' ? null : (input.category as ParsedQuery['category']) ?? null,
      is_quiet: input.is_quiet ?? false,
      matched_keywords: [], // Haiku extraction — no keyword matches
      raw_query: query,
    }
  } catch (err) {
    console.error('[search] Haiku extraction failed, falling back to keywords:', err)
    return null
  }
}

// ── Route handler ─────────────────────────────────────────────────────────────

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

  // Try Claude Haiku first, fall back to keyword engine
  const haikuResult = await extractWithHaiku(query.trim())
  const parsed: ParsedQuery = haikuResult ?? parseVibeQuery(query)
  const usedAi = haikuResult !== null

  const hasFilters =
    parsed.taste_tags.length > 0 ||
    parsed.intent_tags.length > 0 ||
    parsed.moment_tags.length > 0 ||
    parsed.is_quiet ||
    parsed.category !== null

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let q: any = supabase
    .from('places_with_location')
    .select('*')
    .eq('active', true)

  if (city_id) q = q.eq('city_id', city_id)
  if (parsed.category) q = q.eq('category', parsed.category)

  if (hasFilters) {
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
        category:         parsed.category,
        matched_keywords: parsed.matched_keywords,
        is_quiet:         parsed.is_quiet,
        used_ai:          usedAi,
      },
    },
    { headers: { 'Cache-Control': SEARCH_CACHE } }
  )
}
