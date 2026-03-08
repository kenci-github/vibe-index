# Vibe Index — Missing Functionality Analysis & New Phase Prompts
## Comparison: Product Vision vs Current Implementation Plan

---

## GAP ANALYSIS SUMMARY

### What the vision requires that the current plan does NOT address

| # | Missing Feature | Vision Source | Priority |
|---|---|---|---|
| 1 | **Category filter** (food, spa, dental, hair, etc.) | "choose category" is a core UX step | 🔴 Critical |
| 2 | **Natural language / vibe search** ("sexy oysters second-date energy") | Core product differentiator | 🔴 Critical |
| 3 | **Event stream** — structured log of what people click, save, share | Required for taste graph | 🔴 Critical |
| 4 | **Creator attribution** — link back to original TikTok/IG creator | "creator links" listed as a data entity | 🟠 High |
| 5 | **`category` field on places** | Listed as a core entity | 🟠 High |
| 6 | **Taste graph foundations** — co-occurrence tracking, user preference signals | Phase 2+ core | 🟠 High |
| 7 | **Contextual ad slot model** — vibe-aligned placements | Revenue model | 🟡 Medium |
| 8 | **"Explore Everywhere" feed** — cross-city discovery | Implied by multi-city + taste graph | 🟡 Medium |
| 9 | **Vibe search API** — structured endpoint over tags | "solid API over vibe/intent/moment" | 🟡 Medium |
| 10 | **Lisbon + other missing cities** | "sexy oysters in Lisbon tonight" is the hero example | 🟡 Medium |

### What is already covered well
- ✅ City + tag filtering (taste/intent/moment)
- ✅ Video embeds (TikTok/IG/YouTube via oEmbed)
- ✅ Booking CTAs (whatsapp/opentable/fresha/website/phone/instagram)
- ✅ Place detail page
- ✅ Save/bookmark
- ✅ Submission form
- ✅ PostHog analytics (basic events)
- ✅ PWA + mobile-first
- ✅ Featured listings
- ✅ Related places

### Key discrepancies
1. **Category is entirely absent** from the data model and UI. The vision explicitly lists it as a core entity alongside city, and describes it as a filter step before vibe refinement.
2. **Natural language search is the headline product promise** ("type how life feels") but the current plan has zero search — only tag filter UI.
3. **The event stream** (what people actually pick, click, save) is described as a Phase 2 backend requirement. PostHog covers basic analytics but not the structured event log needed to build the taste graph.
4. **Creator attribution** is listed as a data entity. The current schema has `tiktok_url` but no separate `creator_name`, `creator_handle`, or `creator_url` fields — making it impossible to link back to the creator or build creator-facing features.
5. **The UX flow described is city → category → vibe tags**, but the current UX is city → vibe tags. Category is a missing middle step.

---

---

# PHASE 6 — Category Layer
## Add category as a core filter dimension

---

## P6.1 — Category Database Migration
```
Add the category dimension to the Vibe Index data model.

Run this SQL in Supabase SQL Editor:

-- Add category column to places
ALTER TABLE places
  ADD COLUMN IF NOT EXISTS category text;

-- Add a CHECK constraint for valid categories
ALTER TABLE places
  ADD CONSTRAINT places_category_check
  CHECK (category IN (
    'food', 'drink', 'cafe', 'spa', 'wellness',
    'hair', 'nails', 'dental', 'fitness',
    'nightlife', 'shopping', 'experience'
  ));

-- Index for category filtering
CREATE INDEX IF NOT EXISTS places_category_idx ON places(category);

-- Refresh the places_with_location view to expose category
DROP VIEW IF EXISTS places_with_location;
CREATE VIEW places_with_location AS
  SELECT
    p.*,
    ci.name        AS city_name,
    ci.tagline     AS city_tagline,
    ci.hero_image_url AS city_hero_image_url,
    ci.active      AS city_active,
    co.name        AS country_name,
    co.code        AS country_code
  FROM places p
  JOIN cities  ci ON ci.id = p.city_id
  JOIN countries co ON co.id = ci.country_id;

-- Update existing places with categories
-- Food & drink
UPDATE places SET category = 'food'      WHERE name IN ('Cafe Cecilia', 'Nopi', 'Le Coucou', 'Rosetta', 'Aprazível', 'Expendio de Maíz Sin Nombre');
UPDATE places SET category = 'drink'     WHERE name IN ('Bar Tausend', 'Swift Bar', 'Gimlet at Cavendish House', 'The Everleigh', 'Bemelmans Bar', 'Bar Basso', 'Bar High Five', 'Bar Urca', 'Bar Raval', 'Caveau de la Huchette', 'Alobar Yorkville');
UPDATE places SET category = 'cafe'      WHERE name IN ('Attendant Coffee', 'Café de Flore', 'Café de l''Ambre');
UPDATE places SET category = 'food'      WHERE name IN ('Sexy Fish', 'Sketch', 'Ceresio 7', 'Bambi');
UPDATE places SET category = 'spa'       WHERE name IN ('Aman Spa London');
UPDATE places SET category = 'nightlife' WHERE name IN ('Clärchens Ballhaus');

-- Verify
SELECT name, category, city_name
FROM places_with_location
WHERE active = true
ORDER BY city_name, category, name;
```

---

## P6.2 — Category Type + Constants
```
Add category to the TypeScript type system and constants in Vibe Index.

1. Update types/index.ts:
   Add to the Place type:
     category: PlaceCategory | null

   Add a new type:
     export type PlaceCategory =
       | 'food' | 'drink' | 'cafe' | 'spa' | 'wellness'
       | 'hair' | 'nails' | 'dental' | 'fitness'
       | 'nightlife' | 'shopping' | 'experience'

2. Create lib/constants/categories.ts:

   export const CATEGORIES: {
     value: PlaceCategory
     label: string
     emoji: string
   }[] = [
     { value: 'food',       label: 'Food',        emoji: '🍽️' },
     { value: 'drink',      label: 'Drinks',       emoji: '🍸' },
     { value: 'cafe',       label: 'Café',         emoji: '☕' },
     { value: 'spa',        label: 'Spa',          emoji: '🧖' },
     { value: 'wellness',   label: 'Wellness',     emoji: '🌿' },
     { value: 'hair',       label: 'Hair',         emoji: '✂️' },
     { value: 'nails',      label: 'Nails',        emoji: '💅' },
     { value: 'dental',     label: 'Dental',       emoji: '🦷' },
     { value: 'fitness',    label: 'Fitness',      emoji: '💪' },
     { value: 'nightlife',  label: 'Nightlife',    emoji: '🌙' },
     { value: 'shopping',   label: 'Shopping',     emoji: '🛍️' },
     { value: 'experience', label: 'Experience',   emoji: '✨' },
   ]

   export const ALL_CATEGORIES = 'all' as const
   export type CategoryFilter = PlaceCategory | typeof ALL_CATEGORIES

3. Update ActiveFilters type in types/index.ts to include:
     category: CategoryFilter

4. Update getPlaces() in lib/db/supabase.ts to accept an optional
   category param and add .eq('category', category) when set
   (skip the filter entirely when value is 'all' or undefined)

Run tsc --noEmit after. Fix any type errors.
```

---

## P6.3 — Category Filter UI
```
Add a category filter bar to the Vibe Index home feed.

This sits above the existing tag filter bar and lets users narrow
the feed by category before refining by vibe/intent/moment tags.

1. Create components/filters/CategoryFilter.tsx as a 'use client' component.

   Props:
     selected: CategoryFilter   — current selected category or 'all'
     onChange: (cat: CategoryFilter) => void

   Render a horizontally scrollable pill row:
   - First pill: "All" — selected when no category filter is active
   - One pill per category from CATEGORIES constant: "{emoji} {label}"
   - Active pill: bg-accent text-white font-semibold
   - Inactive pill: bg-white border border-gray-200 text-gray-600
   - All pills: rounded-full px-4 py-2 text-sm whitespace-nowrap
   - Container: flex gap-2 overflow-x-auto px-4 py-3
     scrollbar-hide (add [&::-webkit-scrollbar]:hidden to tailwind config if needed)
   - No scroll indicators — just swipe naturally

2. Update components/HomeClient.tsx:
   - Add category to URL search params: ?category=food
   - Read: const category = (searchParams.get('category') ?? 'all') as CategoryFilter
   - Update filter function to set/clear the category param
   - Render CategoryFilter between CityHero and TagFilter
   - Pass category and the update function as props
   - When category changes: reset to page 0, clear allPlaces, re-fetch

3. Add category to the URL param update logic:
   - Category stored as ?category=food (single value, not comma-separated)
   - Clearing: remove the param entirely (not set to 'all')
   - Changing city: preserve category selection
   - Changing category: preserve tag selections

4. Display the active category as a subtle label above the tag filter:
   When a category is selected (not 'all'), show:
   "Showing {emoji} {label} in {cityName}" in text-xs text-gray-400 px-4 pb-1

Run tsc --noEmit after. Fix any type errors.
```

---

## P6.4 — Category on Place Cards and Detail Page
```
Surface the category on PlaceCard and the place detail page.

1. components/places/PlaceCard.tsx:
   - Add a small category pill below the place name
   - Look up the category from CATEGORIES to get the emoji + label
   - Style: text-xs text-gray-400, emoji + label, no background
   - Example: "🍸 Drinks" or "☕ Café"
   - Only render if place.category is set

2. app/place/[id]/page.tsx:
   - Add the category pill near the top of the detail page
   - Same style as PlaceCard
   - Add a "See more {label}" link below the detail content that links back
     to /?category={place.category}&city={place.city_id}
     This closes the discovery loop — user can find similar places

Run tsc --noEmit after. Fix any type errors.
```

---

## P6.5 — Phase 6 Tests
```
Add Playwright tests for the category feature. Save in tests/e2e/phase6.spec.ts.

TEST 1: Category filter renders
  - Navigate to /
  - Assert the category filter bar is visible above the tag filter
  - Assert "All" pill is visible and appears selected by default

TEST 2: Category filter changes feed
  - Navigate to /
  - Click the "Drinks" category pill
  - Assert URL updates to include ?category=drink
  - Assert place cards are visible
  - Assert only drink places are shown (check card category labels)

TEST 3: Category persists on reload
  - Navigate to /?category=cafe
  - Assert the "Café" pill appears selected
  - Assert feed shows café places

TEST 4: Category + tag filter combined
  - Navigate to /?category=drink&taste=cozy
  - Assert both the category and tag are active
  - Assert place cards are visible (or empty state if no matches)

TEST 5: Category shown on place detail
  - Navigate to /place/[a-place-id-with-category-set]
  - Assert the category label (e.g. "🍸 Drinks") is visible on the page
  - Assert a "See more Drinks" link exists

Run with: npx playwright test tests/e2e/phase6.spec.ts --reporter=list
```

---

---

# PHASE 7 — Natural Language Vibe Search
## The headline product promise: "type how life feels"

---

## P7.1 — Search Infrastructure
```
Add the infrastructure for natural language vibe search in Vibe Index.

This is the core product differentiator — users type a phrase like
"sexy oysters second-date energy tonight" and get real matching places.

The approach for MVP: tag extraction from natural language using the
Claude API, then query Supabase with the extracted tags.

PART A — Search API route: app/api/search/route.ts

Create a POST handler:

  Request body: { query: string, city_id?: string }

  Step 1 — Call Claude API to extract structured tags from the query:

    const systemPrompt = `You are a vibe extraction engine for a place discovery app.
    Given a natural language query, extract matching tags from these exact lists:

    taste_tags: sexy, cozy, chic, loud, dim, kinetic, earthy, elegant, stylish, playful, intimate
    intent_tags: date, solo, group, chill, brunch, spa, manicure, dessert, late-night
    moment_tags: before-dinner, rainy-day, late-night, sunday-morning, after-shopping
    categories: food, drink, cafe, spa, wellness, hair, nails, dental, fitness, nightlife, shopping, experience

    Respond ONLY with a JSON object, no preamble:
    {
      "taste_tags": [],
      "intent_tags": [],
      "moment_tags": [],
      "category": null,
      "interpreted_as": "brief human-readable interpretation of the query"
    }

    Rules:
    - Only include tags that genuinely match — do not force matches
    - interpreted_as should be one sentence explaining what you understood
    - If no tags match at all, return empty arrays`

    Call the Anthropic API with model: claude-haiku-4-5-20251001
    (fast and cheap — search should feel instant)
    max_tokens: 200
    Pass the user query as the user message.

  Step 2 — Parse the JSON response from Claude.

  Step 3 — Query Supabase using the extracted tags:
    - Use existing getPlaces() logic but pass extracted tags + category + city_id
    - Return up to 20 results

  Step 4 — Return response:
    {
      results: Place[],
      interpreted_as: string,   ← show this to the user as "Showing results for..."
      extracted: {
        taste_tags: string[],
        intent_tags: string[],
        moment_tags: string[],
        category: string | null
      }
    }

  Error handling:
  - If Claude API fails: fall back to a basic keyword match against place names/descriptions
  - If query is empty: return 400
  - Add rate limiting: max 20 requests per minute per IP (use a simple in-memory counter for MVP)

PART B — Environment variable:
  Add to .env.local:
    ANTHROPIC_API_KEY=    ← get from console.anthropic.com
  Add to .env.local comment: never expose this client-side

Run tsc --noEmit after. Fix any type errors.
```

---

## P7.2 — Search UI Component
```
Build the vibe search input for Vibe Index.

This replaces the city picker as the primary entry point on the home screen.
The tag filter remains as a secondary refinement tool below the results.

1. Create components/filters/VibeSearch.tsx as a 'use client' component:

   Props:
     onResults: (results: Place[], interpretedAs: string) => void
     onClear: () => void
     cityId: string | null   — passed through to the search API

   State:
     query: string
     isSearching: boolean
     hasSearched: boolean

   Render:
   - A prominent search input at the top of the feed:
     Placeholder: "A vibe, a moment, a mood..."
     Icon: lucide-react Search (left inside input)
     Clear button: lucide-react X (right inside input, only when query is not empty)
     Style: rounded-2xl border-2 border-gray-100 bg-white px-4 py-3.5 text-base
            focus:border-accent/50 focus:outline-none shadow-sm
            Full width, mx-4

   - Below input when isSearching: show a subtle "Finding your vibe..." text
     with a small animated pulse dot — text-sm text-gray-400 px-4 mt-2

   - Below input when hasSearched and results came back: show
     "Showing results for: {interpretedAs}" in text-sm text-accent px-4 mt-2
     with a small ✦ prefix

   Search trigger:
   - On Enter key: trigger search
   - On input clear (X button): call onClear(), reset hasSearched
   - Debounce: do NOT auto-search on keystroke — only on Enter or submit
   - Minimum query length: 3 characters

   Search function:
   - POST to /api/search with { query, city_id: cityId }
   - On success: call onResults(results, interpretedAs)
   - On error: show "Couldn't read that vibe — try different words" below input

2. Update components/HomeClient.tsx:
   - Add search mode state: const [isSearchMode, setIsSearchMode] = useState(false)
   - Add searchResults state: const [searchResults, setSearchResults] = useState<Place[] | null>(null)
   - Render VibeSearch above CategoryFilter
   - When onResults fires: set searchResults, set isSearchMode true
     Show searchResults in the feed instead of regular filtered places
   - When onClear fires: set searchResults to null, set isSearchMode false
     Resume showing regular filtered places
   - When isSearchMode is true: hide CategoryFilter and TagFilter
     (search results are already tag-matched by the API)
   - When isSearchMode is false: show CategoryFilter and TagFilter as normal

3. Track search events in PostHog:
   track('vibe_search', {
     query,
     interpreted_as: interpretedAs,
     result_count: results.length,
     city_id: cityId
   })

Run tsc --noEmit after. Fix any type errors.
```

---

## P7.3 — Search Empty and Edge States
```
Handle the search empty, no-match, and error states for Vibe Index search.

1. In VibeSearch.tsx — add handling for zero results:
   After a search returns 0 results, show below the input:
   - "No places matched that vibe yet."
   - "Try: " + 3 suggested example queries as tappable pills:
     "cozy date night drinks" / "solo rainy day café" / "late night dancing"
   - Tapping a suggestion fills the input and triggers the search

2. In HomeClient.tsx — add a search results header above the feed
   when isSearchMode is true:
   - "{result_count} places matched" in text-sm text-gray-400
   - A "← Back to browsing" text link that clears search mode
   - Style: px-4 py-2 flex items-center justify-between

3. Add example search prompts to the home page when the feed is
   in its default state (no city selected, no tags, no search):
   Show 3–4 tappable example queries in a row below the search input:
   - "date night in London"
   - "solo rainy day café"
   - "late night energy"
   - "low-key luxe spa day"
   Style: small rounded pills, bg-gray-100 text-gray-500 text-xs px-3 py-1.5
   Tapping one fills the search input and triggers search automatically

Run tsc --noEmit after. Fix any type errors.
```

---

## P7.4 — Phase 7 Tests
```
Add Playwright tests for vibe search. Save in tests/e2e/phase7.spec.ts.

TEST 1: Search input renders on home page
  - Navigate to /
  - Assert a search input is visible with placeholder text
  - Assert example query pills are visible below the input

TEST 2: Search returns results
  - Navigate to /
  - Click the search input
  - Type "cozy date night drinks"
  - Press Enter
  - Assert "Finding your vibe..." or loading indicator appears
  - Wait for results
  - Assert at least one place card is visible
  - Assert an "interpreted as" message is visible

TEST 3: Search clears back to browse mode
  - Navigate to /
  - Search for "date night"
  - Assert search results are showing
  - Click the X button to clear
  - Assert the regular feed returns (category + tag filters visible again)

TEST 4: Example query pill triggers search
  - Navigate to /
  - Click one of the example query pills
  - Assert the search input is populated with that query
  - Assert search results appear

TEST 5: Empty search state
  - Navigate to /
  - Search for "xyzabc123notavibeterm"
  - Assert either: no results message is shown, OR place cards appear
    (fallback to keyword match may still return something)
  - Assert no JavaScript errors in console

Run with: npx playwright test tests/e2e/phase7.spec.ts --reporter=list
```

---

---

# PHASE 8 — Creator Attribution
## Surface the creator behind every place

---

## P8.1 — Creator Fields Migration
```
Add creator attribution fields to the places table in Vibe Index.

Run in Supabase SQL Editor:

ALTER TABLE places
  ADD COLUMN IF NOT EXISTS creator_handle text,   -- e.g. @londonvibes
  ADD COLUMN IF NOT EXISTS creator_platform text  -- tiktok | instagram | youtube
    CHECK (creator_platform IN ('tiktok', 'instagram', 'youtube', NULL));

-- Refresh view
DROP VIEW IF EXISTS places_with_location;
CREATE VIEW places_with_location AS
  SELECT
    p.*,
    ci.name           AS city_name,
    ci.tagline        AS city_tagline,
    ci.hero_image_url AS city_hero_image_url,
    ci.active         AS city_active,
    co.name           AS country_name,
    co.code           AS country_code
  FROM places p
  JOIN cities    ci ON ci.id = p.city_id
  JOIN countries co ON co.id = ci.country_id;

-- Verify
SELECT name, creator_handle, creator_platform, tiktok_url
FROM places
WHERE active = true
ORDER BY name;
```

---

## P8.2 — Creator Attribution UI
```
Surface creator attribution on place cards and the detail page in Vibe Index.

The creator is the person whose TikTok/IG video brought this place to light.
Attributing them respects their work and adds social proof.

1. Update types/index.ts — add to Place type:
     creator_handle: string | null
     creator_platform: 'tiktok' | 'instagram' | 'youtube' | null

2. Create components/places/CreatorAttribution.tsx:

   Props:
     handle: string | null
     platform: 'tiktok' | 'instagram' | 'youtube' | null
     videoUrl: string | null

   If handle is null: return null

   Render a small attribution line:
   - "via {platform icon} {handle}"
   - platform icon: small SVG or text indicator (TikTok / IG / YT)
   - handle links to the video URL if present, otherwise to the creator profile:
     TikTok: https://tiktok.com/@{handle}
     Instagram: https://instagram.com/{handle}
     YouTube: https://youtube.com/@{handle}
   - Opens in new tab
   - Style: text-xs text-gray-400 flex items-center gap-1
   - Prefix text "via" in text-gray-300

3. Add CreatorAttribution to PlaceCard.tsx:
   - Render below the place name, above the tag pills
   - Small and subtle — should not compete with the place name

4. Add CreatorAttribution to app/place/[id]/page.tsx:
   - Render near the video embed with slightly larger treatment
   - Label: "Discovered via {platform icon} {handle}"
   - If video URL is present: wrap in a link to the original video

Run tsc --noEmit after. Fix any type errors.
```

---

---

# PHASE 9 — Event Stream & Taste Graph Foundations
## Build the data infrastructure for "what people actually pick"

---

## P9.1 — Event Stream Table
```
Create a structured event stream in Supabase to log every meaningful
user action in Vibe Index. This is the foundation for the taste graph.

Run in Supabase SQL Editor:

CREATE TABLE IF NOT EXISTS events (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at   timestamptz NOT NULL DEFAULT now(),
  session_id   text        NOT NULL,   -- anonymous session identifier
  event_type   text        NOT NULL,   -- see allowed types below
  place_id     uuid        REFERENCES places(id) ON DELETE SET NULL,
  city_id      uuid        REFERENCES cities(id) ON DELETE SET NULL,
  category     text,
  taste_tags   text[],
  intent_tags  text[],
  moment_tags  text[],
  search_query text,                   -- for search events
  cta_type     text,                   -- for booking events
  metadata     jsonb                   -- flexible additional data
);

-- Allowed event_type values (enforced in app, not DB):
-- page_view | search | listing_view | video_play
-- bookmark_add | bookmark_remove | share | booking_click
-- filter_apply | filter_clear | category_select | city_select

-- Index for analytics queries
CREATE INDEX IF NOT EXISTS events_session_idx   ON events(session_id);
CREATE INDEX IF NOT EXISTS events_type_idx      ON events(event_type);
CREATE INDEX IF NOT EXISTS events_place_idx     ON events(place_id);
CREATE INDEX IF NOT EXISTS events_created_idx   ON events(created_at DESC);

-- RLS: allow anonymous inserts, no reads via anon
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
CREATE POLICY events_insert_anon ON events FOR INSERT TO anon WITH CHECK (true);

-- Verify
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'events' ORDER BY ordinal_position;
```

---

## P9.2 — Event Stream Client
```
Build the client-side event logging layer for Vibe Index.

This replaces the PostHog-only approach with a dual-track system:
PostHog for product analytics dashboard, Supabase events table for
taste graph data.

PART A — Session ID:
  Create lib/analytics/session.ts:

  export function getSessionId(): string {
    if (typeof window === 'undefined') return 'server'
    const key = 'vibe_session_id'
    let id = localStorage.getItem(key)
    if (!id) {
      id = crypto.randomUUID()
      localStorage.setItem(key, id)
    }
    return id
  }

  The session ID persists across page loads in the same browser.
  It is anonymous — no user identity required.

PART B — Event logger:
  Create lib/analytics/events.ts:

  import { getSessionId } from './session'
  import { track as posthogTrack } from './posthog'

  interface EventPayload {
    event_type: string
    place_id?: string
    city_id?: string
    category?: string
    taste_tags?: string[]
    intent_tags?: string[]
    moment_tags?: string[]
    search_query?: string
    cta_type?: string
    metadata?: Record<string, unknown>
  }

  export async function logEvent(payload: EventPayload): Promise<void> {
    const session_id = getSessionId()

    // 1. Fire to PostHog (existing)
    posthogTrack(payload.event_type, { ...payload, session_id })

    // 2. Fire to Supabase event stream (new)
    // Non-blocking: fire and forget, never await in UI code
    fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, session_id }),
    }).catch(() => {}) // silently fail — never block the UI
  }

PART C — API route: app/api/events/route.ts:
  POST handler:
  - Parse body
  - Validate event_type is present and is a known type
  - Insert into events table using service role client
  - Return 200 immediately (do not wait for DB confirmation in response)
  - Batch if possible: accept either single event or array of events

PART D — Replace all PostHog track() calls with logEvent():
  Update these files to use logEvent instead of track directly:
  - components/filters/CitySelector.tsx    → city_select event
  - components/filters/TagFilter.tsx       → filter_apply event + taste/intent/moment arrays
  - components/filters/CategoryFilter.tsx  → category_select event
  - components/filters/VibeSearch.tsx      → search event + search_query
  - components/places/VideoEmbed.tsx       → video_play event
  - components/actions/BookmarkButton.tsx  → bookmark_add / bookmark_remove
  - components/actions/ShareButton.tsx     → share event
  - components/places/BookingCTA.tsx       → booking_click event + cta_type
  - app/place/[id]/page.tsx               → listing_view event + all tag arrays

Run tsc --noEmit after. Fix any type errors.
```

---

## P9.3 — Taste Affinity Query
```
Build the first taste graph query — co-occurrence based place recommendations.

This is "people who saved X also saved Y" — simple collaborative filtering
using the events table as the signal source.

PART A — Supabase function (run in SQL Editor):

  CREATE OR REPLACE FUNCTION get_taste_affinity(
    p_place_id uuid,
    p_limit    int DEFAULT 4
  )
  RETURNS TABLE (
    place_id        uuid,
    affinity_score  bigint
  )
  LANGUAGE sql
  STABLE
  AS $$
    -- Find sessions that interacted with this place
    WITH target_sessions AS (
      SELECT DISTINCT session_id
      FROM events
      WHERE place_id = p_place_id
        AND event_type IN ('listing_view', 'bookmark_add', 'share', 'booking_click')
    ),
    -- Find other places those sessions interacted with
    co_occurred AS (
      SELECT e.place_id, COUNT(*) AS affinity_score
      FROM events e
      JOIN target_sessions ts ON ts.session_id = e.session_id
      WHERE e.place_id != p_place_id
        AND e.place_id IS NOT NULL
        AND e.event_type IN ('listing_view', 'bookmark_add', 'share', 'booking_click')
      GROUP BY e.place_id
      ORDER BY affinity_score DESC
      LIMIT p_limit
    )
    SELECT * FROM co_occurred;
  $$;

PART B — Add getTasteAffinityPlaces() to lib/db/supabase.ts:

  export async function getTasteAffinityPlaces(
    placeId: string,
    limit = 4
  ): Promise<Place[]> {
    // Call the Supabase RPC function
    const { data: affinityRows, error } = await supabase
      .rpc('get_taste_affinity', { p_place_id: placeId, p_limit: limit })

    if (error || !affinityRows?.length) return []

    // Fetch full place data for the matched IDs
    const ids = affinityRows.map((r: { place_id: string }) => r.place_id)
    const { data: places } = await supabase
      .from('places_with_location')
      .select('*')
      .in('id', ids)
      .eq('active', true)

    return (places as Place[]) ?? []
  }

PART C — Wire into place detail page:
  Update app/place/[id]/page.tsx:
  - Fetch both getRelatedPlaces() and getTasteAffinityPlaces() in parallel
    using Promise.all
  - If taste affinity returns results: show a second section below related places
    Heading: "Others also loved"
    Same horizontal scroll card treatment as related places
  - If no affinity results yet (cold start): show nothing — this section
    grows naturally as events accumulate

Note: on cold start (no events yet) this section will be empty. That is correct.
It will populate automatically as real users interact with the app.

Run tsc --noEmit after. Fix any type errors.
```

---

---

# PHASE 10 — Contextual Ad Slots (MVP)
## Revenue model foundation — vibe-aligned placements

---

## P10.1 — Ad Slot Data Model
```
Add the data model for contextual ad placements in Vibe Index.

Run in Supabase SQL Editor:

CREATE TABLE IF NOT EXISTS ad_slots (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at      timestamptz NOT NULL DEFAULT now(),
  advertiser_name text        NOT NULL,
  headline        text        NOT NULL,   -- e.g. "Perfect for your second date"
  body            text,                   -- optional subtext
  cta_label       text        NOT NULL,   -- e.g. "Book a table"
  cta_url         text        NOT NULL,
  image_url       text,
  city_id         uuid        REFERENCES cities(id),   -- null = all cities
  category        text,                               -- null = all categories
  taste_tags      text[],                             -- match any of these
  intent_tags     text[],                             -- match any of these
  moment_tags     text[],                             -- match any of these
  active          boolean     NOT NULL DEFAULT true,
  priority        int         NOT NULL DEFAULT 0      -- higher = shown first
);

-- Index for efficient matching
CREATE INDEX IF NOT EXISTS ad_slots_city_idx     ON ad_slots(city_id);
CREATE INDEX IF NOT EXISTS ad_slots_category_idx ON ad_slots(category);
CREATE INDEX IF NOT EXISTS ad_slots_active_idx   ON ad_slots(active);

-- RLS: read-only for anon, full access for service role
ALTER TABLE ad_slots ENABLE ROW LEVEL SECURITY;
CREATE POLICY ad_slots_read_anon ON ad_slots FOR SELECT TO anon USING (active = true);

-- Insert a sample ad slot for testing
INSERT INTO ad_slots (
  advertiser_name, headline, body, cta_label, cta_url,
  city_id, intent_tags, taste_tags, priority
) VALUES (
  'Vibe Index',
  'Find your next favourite spot',
  'Discover places curated for your exact vibe',
  'Explore now',
  'https://vibeindex.app',
  NULL,
  ARRAY['date'],
  ARRAY['intimate', 'elegant'],
  0
);

-- Verify
SELECT * FROM ad_slots;
```

---

## P10.2 — Ad Matching and Display
```
Build the contextual ad matching logic and ad card component for Vibe Index.

PART A — Ad matching query:
  Add getContextualAd() to lib/db/supabase.ts:

  export async function getContextualAd(filters: {
    cityId?: string
    category?: string
    tasteTags?: string[]
    intentTags?: string[]
    momentTags?: string[]
  }): Promise<AdSlot | null> {
    let query = supabase
      .from('ad_slots')
      .select('*')
      .eq('active', true)
      .order('priority', { ascending: false })
      .limit(5)

    // City match: show city-specific ads first, fall back to global (null city)
    if (filters.cityId) {
      query = query.or(`city_id.eq.${filters.cityId},city_id.is.null`)
    }

    const { data } = await query
    if (!data?.length) return null

    // Score each ad by tag overlap
    const scored = data.map(ad => {
      let score = ad.priority
      if (filters.tasteTags?.some(t => ad.taste_tags?.includes(t)))  score += 3
      if (filters.intentTags?.some(t => ad.intent_tags?.includes(t))) score += 3
      if (filters.momentTags?.some(t => ad.moment_tags?.includes(t))) score += 2
      if (ad.category && ad.category === filters.category)            score += 2
      if (!ad.city_id)                                                score -= 1 // slight penalty for global
      return { ...ad, score }
    })

    scored.sort((a, b) => b.score - a.score)
    return scored[0] as AdSlot
  }

  Add AdSlot type to types/index.ts:
  export interface AdSlot {
    id: string
    advertiser_name: string
    headline: string
    body: string | null
    cta_label: string
    cta_url: string
    image_url: string | null
    city_id: string | null
    category: string | null
    taste_tags: string[]
    intent_tags: string[]
    moment_tags: string[]
    active: boolean
    priority: number
  }

PART B — Ad card component:
  Create components/places/AdCard.tsx:

  Props: ad: AdSlot

  Render a card that visually fits in the feed but is clearly labelled as sponsored:
  - Small "Sponsored" label: text-[10px] uppercase tracking-widest text-gray-300
    positioned top-right inside the card
  - If image_url: show image (same aspect ratio as PlaceCard thumbnail)
    If no image: show a gradient placeholder bg-gradient-to-br from-accent/10 to-accent/5
  - Advertiser name: text-xs text-gray-400
  - Headline: text-sm font-semibold text-gray-800
  - Body: text-xs text-gray-500 (if present)
  - CTA button: small, outlined, rounded-full, text-accent border-accent
    Label: ad.cta_label
    Opens cta_url in new tab

  On CTA click: log event:
    logEvent({ event_type: 'ad_click', metadata: { ad_id: ad.id, advertiser: ad.advertiser_name } })

PART C — Wire into HomeClient.tsx:
  - After fetching places, call getContextualAd() with current active filters
  - Insert the AdCard after every 8th place card in the feed
    (position 8, 16, 24, etc.)
  - If no matching ad: skip — never show an empty ad slot

Run tsc --noEmit after. Fix any type errors.
```

---

---

# UPDATED CLAUDE.md ADDITIONS

> Ask Claude Code to append these sections to CLAUDE.md after completing
> the phases above:

```
## Category System
category field on places — one of:
food | drink | cafe | spa | wellness | hair | nails | dental | fitness | nightlife | shopping | experience
Defined in lib/constants/categories.ts as CATEGORIES array with value/label/emoji.
Filter: .eq('category', category) in getPlaces() — skip when 'all' or undefined.
URL param: ?category=food (single value, not comma-separated)

## Vibe Search
Natural language search via /api/search POST endpoint.
Uses Claude API (claude-haiku-4-5-20251001) to extract tags from free text.
Returns: { results, interpreted_as, extracted: { taste_tags, intent_tags, moment_tags, category } }
Client: VibeSearch.tsx — Enter key triggers search, not auto-search on keystroke.
When search mode active: CategoryFilter and TagFilter hidden.
Track as: logEvent({ event_type: 'search', search_query: query })

## Creator Attribution
creator_handle: text — e.g. "londonvibes" (without @)
creator_platform: tiktok | instagram | youtube
CreatorAttribution.tsx renders "via {platform} {handle}" linked to original video.

## Event Stream
events table — structured log of all user interactions.
Session ID: anonymous UUID stored in localStorage key 'vibe_session_id'
Dual-track: logEvent() in lib/analytics/events.ts fires to both PostHog and /api/events
All components use logEvent() not posthog track() directly.
Taste graph: get_taste_affinity() Supabase RPC function — co-occurrence scoring.

## Ad Slots
ad_slots table — contextual placements matched to active filters.
getContextualAd() scores ads by tag overlap + city match + priority.
AdCard.tsx renders in feed at every 8th position.
Always labelled "Sponsored". Never shown without a matching ad.
```

---

---

# EXECUTION ORDER FOR NEW PHASES

```
Phase 6  (Category)        ← start here, foundational data model change
  └── P6.1 DB migration
  └── P6.2 Types + constants
  └── P6.3 Category filter UI   ← depends on P6.1 + P6.2
  └── P6.4 Cards + detail page  ← depends on P6.3
  └── P6.5 Tests

Phase 7  (Vibe Search)     ← after Phase 6, needs ANTHROPIC_API_KEY
  └── P7.1 Search API      ← can build in parallel with P7.2 scaffold
  └── P7.2 Search UI
  └── P7.3 Empty states    ← depends on P7.2
  └── P7.4 Tests

Phase 8  (Creator)         ← can run in parallel with Phase 7
  └── P8.1 DB migration
  └── P8.2 Attribution UI  ← depends on P8.1

Phase 9  (Event Stream)    ← after Phase 7 (needs search events)
  └── P9.1 DB migration
  └── P9.2 Event client    ← replaces PostHog-only approach
  └── P9.3 Taste affinity  ← depends on P9.1 + P9.2

Phase 10 (Ad Slots)        ← after Phase 9 (needs event stream for future targeting)
  └── P10.1 DB migration
  └── P10.2 Ad matching + display

```

## What can run in parallel across new phases:
- Phase 8 (Creator attribution) can run alongside Phase 7 (Search) — different files
- P9.1 DB migration can run before Phase 7 is finished
- P10.1 DB migration can run any time — it is additive only
