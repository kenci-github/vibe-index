# Vibe Index — Revised MVP Plan
## Incorporating: Product Vision + UI/UX Brief + Gap Analysis + Existing Implementation
## Generated: March 2026

---

## SECTION 1: CONFLICTS & DECISIONS REQUIRED

The following conflicts exist between the new MVP brief and the existing plan.
**Review these before proceeding.**

---

### CONFLICT 1 — Home Page Layout: Search-first vs Filter-first 🔴 Breaking

**Existing plan:** Home page leads with CitySelector → CategoryFilter → TagFilter bar.
Filters are the primary interaction. Search is an overlay that hides the filters.

**New MVP brief:** Search bar is the dominant hero element at the top.
City selector sits *below* the search bar as supporting context.
Quick chips (Date night, Brunch, Solo coffee, etc.) sit below city as helpers, not primary filters.
Filters are secondary — chips map to the same tag/intent system but search is the lead.

**Decision needed:** Confirm the new layout order:
1. Logo + bookmark icon (header)
2. Large search bar (hero)
3. City selector (below search)
4. Quick chip suggestions (Date night / Brunch / Quiet / etc.)
5. Active interpretation strip (after search: "Showing results for: Sexy · Date night")
6. Results grid

**Impact:** HomeClient.tsx, page layout, CitySelector positioning all need restructuring.
This is a significant UI change from what was planned in Phases 2–5.

---

### CONFLICT 2 — Category Filter: Separate bar vs Quick Chips 🟠 Design

**Existing plan (Phase 6):** Category gets its own dedicated horizontal scroll filter bar
with emoji pills (🍽️ Food, 🍸 Drinks, ☕ Café, etc.) sitting above TagFilter.

**New MVP brief:** Category is one of the quick chips (Coffee, Spa, Brunch) — not a
separate bar. Category selection is merged into the chip suggestions, not a distinct UI layer.

**Decision needed:** Should category be:
- **Option A:** Separate filter bar (Phase 6 plan) — more structured, database-style
- **Option B:** Merged into quick chips (MVP brief) — more fluid, less formal
- **Option C:** Both — chips for common categories, full filter bar accessible via "More filters"

**Recommendation:** Option B for MVP — matches the "don't make them think like a database"
principle. Option C can come later as a power-user refinement.

---

### CONFLICT 3 — Natural Language: AI vs Keyword MVP 🟡 Implementation

**Existing plan (Phase 7, P7.1):** Uses Claude API (claude-haiku) to extract tags
from natural language queries. Full AI interpretation on every search.

**New MVP brief:** Explicitly states MVP does NOT need full AI.
"MVP version: keyword extraction + synonym matching + tag mapping → scoring."
AI-magical version is "later."

**Decision needed:** Which approach to build first?
- **Option A — Keyword MVP (brief's recommendation):** Build a static keyword→tag
  mapping table. No API calls. Fast, cheap, offline-capable. Feels ~70% as magical.
- **Option B — AI from day one (Phase 7 plan):** Use Claude Haiku API. Full NL interpretation.
  Costs ~$0.001 per search. Slower (300–500ms API round trip).

**Recommendation:** Option A for MVP launch — matches the brief exactly and avoids
API dependency and latency on the critical first interaction. Upgrade to Option B
in a Phase 7b once the product is live and you can validate the improvement.

---

### CONFLICT 4 — "Why this matched" line on cards 🟡 New requirement

**Existing plan:** PlaceCard shows name, neighbourhood, tags, featured badge, category pill.
No "why this matched" line.

**New MVP brief:** Every card should show a short "why this matched" reason line.
Example: "Matched for: dim lighting, oysters, date-night energy"

**This is only meaningful when a search has been performed.** Outside of search mode,
this line should not appear (or show something like the place tagline/description instead).

**Decision:** Confirm this behaviour:
- In search mode: show "Matched for: {extracted tags}"
- In browse/chip mode: show first sentence of place description, or hide the line
- In default feed: hide the match line entirely

---

### CONFLICT 5 — Tag system: current tags vs MVP brief tags 🟡 Data

**Existing tags in DB:**
- taste_tags: sexy, cozy, chic, loud, dim, kinetic, earthy, elegant, stylish, playful, intimate
- intent_tags: date, solo, group, chill, brunch, spa, manicure, dessert, late-night
- moment_tags: before-dinner, rainy-day, late-night, sunday-morning, after-shopping

**New MVP brief quick chips:** Date night · Brunch · Quiet · Girls' night · Solo reset · Late night · Coffee · Spa

**"Girls' night" and "Solo reset"** are not in the current tag system.
"Quiet" maps to no single tag (it maps to the absence of "loud").

**Decision needed:** Either:
- Add `girls-night` to intent_tags and `solo-reset` to intent_tags via migration
- Or map "Girls' night" chip → `group` + `playful` tags, "Solo reset" → `solo` + `chill`
- "Quiet" → filter for places without `loud` tag (negative filter — needs query change)

**Recommendation:** Add `girls-night` and `solo-reset` to intent_tags.
Handle "Quiet" as a negative filter: `.not('taste_tags', 'cs', '{"loud"}')`.

---

## SECTION 2: WHAT STAYS, WHAT CHANGES, WHAT IS NEW

### ✅ Stays as planned (no changes needed)
- Phase 2: BookingCTA, pagination, skeleton loading
- Phase 3: Saved page city grouping, submission form
- Phase 4: OG metadata, PostHog, Lighthouse, SW offline
- Phase 5: Featured sort, city editorial header, related places, city waitlist
- Phase 8: Creator attribution (still needed, unchanged)
- Phase 9: Event stream + taste graph (still needed, unchanged)
- Phase 10: Contextual ad slots (still needed, unchanged)
- All database migrations already run (M1–M5)

### 🔄 Changes required to existing phases
- **Phase 5 (P5.2):** City editorial header moves — it's below search bar not above tag filter
- **Phase 6 (P6.3):** Category filter bar replaced by quick chips merged into search flow
- **Phase 7 (P7.1):** AI search replaced with keyword mapping for MVP; AI version deferred

### 🆕 New work identified by the MVP brief
- Home page layout restructure (search-first)
- Keyword→tag mapping table (`lib/search/keywords.ts`)
- "Why this matched" line on PlaceCard in search mode
- Active interpretation strip ("Showing results for: Sexy · Date night ·")
- Suggested search chips on home page (Date night, Solo coffee, etc.)
- New tags: `girls-night`, `solo-reset` in intent_tags
- Negative filter for "Quiet" chip

---

## SECTION 3: REVISED FULL PHASE PLAN

---

# PHASE 2 — Feed & Filtering Gaps
## No changes — run as documented in phase-implementation-prompts.md
### Prompts: P2.1 → P2.2 → P2.3 → P2.4 → P2.5

---

# PHASE 3 — Auth & Submissions
## No changes — run as documented in phase-implementation-prompts.md
### Prompts: P3.1 → P3.2 → P3.3

---

# PHASE 4 — SEO & Analytics
## No changes — run as documented in phase-implementation-prompts.md
### Prompts: P4.1 → P4.2 → P4.3 → P4.4 → P4.5

---

# PHASE 5 — Growth Features
## Minor change: CityHero position updated (P5.2 only)
### P5.1, P5.3, P5.4, P5.5 — run as documented

## P5.2 — City Editorial Header (UPDATED)
```
Add a city editorial header to the Vibe Index home feed.

NOTE: Updated position from original plan.
The CityHero now renders BELOW the city selector and ABOVE the quick chips
(not above the tag filter bar, which is being replaced by chips in Phase 6).

Current state: cities table has tagline and hero_image_url columns.
Neither is used in the UI yet.

Changes needed:

1. Confirm City type in types/index.ts includes: tagline, hero_image_url

2. Create components/filters/CityHero.tsx:
   Props: city: City & { country: Country } | null

   If city is null: return null (Explore Everywhere — no hero)

   If city is set: render a hero strip:
   - Full width, height: h-28 (112px)
   - Background: if hero_image_url — Next.js Image fill with gradient overlay
     (from-black/60 to-transparent); if not — gradient bg-gradient-to-br
     from-accent/20 to-accent/5
   - Overlay content (absolute, bottom-left, p-4):
     - Flag emoji + city name: text-xl font-bold text-white
     - Tagline below: text-sm text-white/80 italic (if tagline set)
   - Rounded-2xl, overflow-hidden, mx-4 mt-3

3. Render CityHero in components/HomeClient.tsx:
   Position: after city selector row, before quick chips section
   (Quick chips are added in Phase 6 — leave a comment: {/* Quick chips — Phase 6 */})

4. Seed data in Supabase for at least 2 cities:
   London: tagline = "Style, grit, and a perfect flat white"
   New York City: tagline = "If you can find it here, you can find it anywhere"

Run tsc --noEmit after. Fix any type errors.
```

---

# PHASE 6 — Search-First Home Layout + Quick Chips
## Replaces old Phase 6 (Category filter bar)
## This is the single biggest structural change from the original plan

---

## P6.1 — Tag System Expansion (DB migration)
```
Expand the intent_tags system to support the MVP quick chips.

Run in Supabase SQL Editor:

-- The intent_tags column is a text[] — no enum constraint to update.
-- We just need to document and use the new values consistently.
-- Add two new intent tag values: girls-night, solo-reset

-- Verify current intent_tags distribution
SELECT DISTINCT unnest(intent_tags) AS tag, COUNT(*) AS places
FROM places
GROUP BY tag
ORDER BY places DESC;

-- Update places that suit girls-night (group + playful places)
-- Update based on your knowledge of the data — example:
UPDATE places SET intent_tags = array_append(intent_tags, 'girls-night')
WHERE 'group' = ANY(intent_tags) AND 'playful' = ANY(taste_tags)
  AND 'girls-night' != ALL(intent_tags);

UPDATE places SET intent_tags = array_append(intent_tags, 'solo-reset')
WHERE 'solo' = ANY(intent_tags) AND 'chill' = ANY(intent_tags)
  AND 'solo-reset' != ALL(intent_tags);

-- Verify
SELECT name, intent_tags FROM places WHERE active = true ORDER BY name;
```

---

## P6.2 — Category DB Migration
```
Add the category dimension to the Vibe Index data model.

Run in Supabase SQL Editor:

ALTER TABLE places
  ADD COLUMN IF NOT EXISTS category text
  CHECK (category IN (
    'food', 'drink', 'cafe', 'spa', 'wellness',
    'hair', 'nails', 'dental', 'fitness',
    'nightlife', 'shopping', 'experience'
  ));

CREATE INDEX IF NOT EXISTS places_category_idx ON places(category);

-- Refresh places_with_location view to expose category
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

-- Set categories for existing places
UPDATE places SET category = 'food'      WHERE name IN ('Cafe Cecilia','Nopi','Le Coucou','Rosetta','Aprazível','Expendio de Maíz Sin Nombre','Sexy Fish','Sketch','Ceresio 7','Bambi');
UPDATE places SET category = 'drink'     WHERE name IN ('Bar Tausend','Swift Bar','Gimlet at Cavendish House','The Everleigh','Bemelmans Bar','Bar Basso','Bar High Five','Bar Urca','Bar Raval','Alobar Yorkville');
UPDATE places SET category = 'cafe'      WHERE name IN ('Attendant Coffee','Café de Flore','Café de l''Ambre');
UPDATE places SET category = 'nightlife' WHERE name IN ('Clärchens Ballhaus','Caveau de la Huchette');
UPDATE places SET category = 'spa'       WHERE name IN ('Aman Spa London');

-- Verify
SELECT name, category, city_name FROM places_with_location WHERE active = true ORDER BY category, name;
```

---

## P6.3 — Keyword Search Engine (no AI required)
```
Build the keyword-to-tag mapping engine for Vibe Index natural language search.
This is the MVP search implementation — no AI API calls required.

Create lib/search/keywords.ts:

This file maps common words and phrases to the tag system.
It should be comprehensive enough that ~80% of natural queries
produce useful tag matches.

export const KEYWORD_MAP: Record<string, {
  taste_tags?: string[]
  intent_tags?: string[]
  moment_tags?: string[]
  category?: string
}> = {
  // Taste mappings
  'sexy':        { taste_tags: ['sexy', 'dim', 'intimate'] },
  'romantic':    { taste_tags: ['intimate', 'dim'], intent_tags: ['date'] },
  'cozy':        { taste_tags: ['cozy', 'intimate'] },
  'quiet':       { taste_tags: [] },  // handled as negative filter (not loud)
  'dim':         { taste_tags: ['dim'] },
  'bright':      { taste_tags: ['kinetic'] },
  'elegant':     { taste_tags: ['elegant', 'chic'] },
  'chic':        { taste_tags: ['chic', 'stylish'] },
  'loud':        { taste_tags: ['loud', 'kinetic'] },
  'lively':      { taste_tags: ['loud', 'kinetic', 'playful'] },
  'fun':         { taste_tags: ['playful', 'kinetic'] },
  'playful':     { taste_tags: ['playful'] },
  'earthy':      { taste_tags: ['earthy'] },
  'luxe':        { taste_tags: ['elegant', 'chic'] },
  'low-key':     { taste_tags: ['cozy', 'intimate'] },
  'intimate':    { taste_tags: ['intimate', 'dim'] },
  'stylish':     { taste_tags: ['stylish', 'chic'] },
  'moody':       { taste_tags: ['dim', 'intimate'] },
  'airy':        { taste_tags: ['kinetic'] },
  'sunlight':    { taste_tags: ['kinetic', 'earthy'] },
  'sunny':       { taste_tags: ['kinetic'] },

  // Intent mappings
  'date':        { intent_tags: ['date'] },
  'second date': { intent_tags: ['date'], taste_tags: ['intimate', 'dim'] },
  'date night':  { intent_tags: ['date'], moment_tags: ['late-night'] },
  'solo':        { intent_tags: ['solo'] },
  'alone':       { intent_tags: ['solo'] },
  'group':       { intent_tags: ['group'] },
  'friends':     { intent_tags: ['group'] },
  'girls':       { intent_tags: ['girls-night'] },
  'girls night': { intent_tags: ['girls-night'] },
  'galentines':  { intent_tags: ['girls-night'] },
  'brunch':      { intent_tags: ['brunch'], category: 'food' },
  'breakfast':   { intent_tags: ['brunch'], category: 'cafe' },
  'coffee':      { category: 'cafe', intent_tags: ['solo'] },
  'work':        { intent_tags: ['solo'], taste_tags: ['cozy'] },
  'working':     { intent_tags: ['solo'], taste_tags: ['cozy'] },
  'spa':         { intent_tags: ['spa'], category: 'spa' },
  'massage':     { intent_tags: ['spa'], category: 'spa' },
  'nails':       { intent_tags: ['manicure'], category: 'nails' },
  'manicure':    { intent_tags: ['manicure'], category: 'nails' },
  'pedicure':    { intent_tags: ['manicure'], category: 'nails' },
  'dessert':     { intent_tags: ['dessert'] },
  'sweet':       { intent_tags: ['dessert'] },
  'chill':       { intent_tags: ['chill'], taste_tags: ['cozy'] },
  'relax':       { intent_tags: ['chill', 'solo-reset'] },
  'reset':       { intent_tags: ['solo-reset'] },
  'recharge':    { intent_tags: ['solo-reset'] },
  'late':        { intent_tags: ['late-night'], moment_tags: ['late-night'] },
  'late night':  { intent_tags: ['late-night'], moment_tags: ['late-night'] },
  'drinks':      { category: 'drink' },
  'cocktails':   { category: 'drink', taste_tags: ['elegant'] },
  'wine':        { category: 'drink' },
  'bar':         { category: 'drink' },
  'dinner':      { category: 'food', moment_tags: ['before-dinner'] },
  'lunch':       { category: 'food' },
  'food':        { category: 'food' },
  'restaurant':  { category: 'food' },
  'sushi':       { category: 'food' },
  'oysters':     { category: 'food', taste_tags: ['sexy', 'elegant'] },
  'seafood':     { category: 'food' },
  'pastry':      { intent_tags: ['brunch'], category: 'cafe' },
  'pastries':    { intent_tags: ['brunch'], category: 'cafe' },
  'wellness':    { category: 'wellness', intent_tags: ['solo-reset'] },

  // Moment mappings
  'tonight':     { moment_tags: ['late-night'] },
  'evening':     { moment_tags: ['late-night'] },
  'morning':     { moment_tags: ['sunday-morning'] },
  'sunday':      { moment_tags: ['sunday-morning'] },
  'rainy':       { moment_tags: ['rainy-day'] },
  'raining':     { moment_tags: ['rainy-day'] },
  'after shopping':  { moment_tags: ['after-shopping'] },
  'pre dinner':  { moment_tags: ['before-dinner'] },
  'before dinner': { moment_tags: ['before-dinner'] },
}

export interface ParsedQuery {
  taste_tags: string[]
  intent_tags: string[]
  moment_tags: string[]
  category: string | null
  matched_keywords: string[]
  is_quiet: boolean    // special negative filter flag
  raw_query: string
}

export function parseVibeQuery(query: string): ParsedQuery {
  const lower = query.toLowerCase().trim()
  const result: ParsedQuery = {
    taste_tags: [], intent_tags: [], moment_tags: [],
    category: null, matched_keywords: [], is_quiet: false, raw_query: query
  }

  // Check for quiet (negative filter) first
  if (lower.includes('quiet') || lower.includes('not too loud') || lower.includes('low noise')) {
    result.is_quiet = true
    result.matched_keywords.push('quiet')
  }

  // Try multi-word phrases first (most specific), then single words
  const sortedKeys = Object.keys(KEYWORD_MAP).sort((a, b) => b.length - a.length)

  for (const keyword of sortedKeys) {
    if (lower.includes(keyword)) {
      const mapping = KEYWORD_MAP[keyword]
      if (mapping.taste_tags)  result.taste_tags  = [...new Set([...result.taste_tags,  ...mapping.taste_tags])]
      if (mapping.intent_tags) result.intent_tags = [...new Set([...result.intent_tags, ...mapping.intent_tags])]
      if (mapping.moment_tags) result.moment_tags = [...new Set([...result.moment_tags, ...mapping.moment_tags])]
      if (mapping.category && !result.category)   result.category = mapping.category
      result.matched_keywords.push(keyword)
    }
  }

  // Deduplicate matched keywords
  result.matched_keywords = [...new Set(result.matched_keywords)]
  return result
}

export function formatInterpretation(parsed: ParsedQuery): string {
  const chips = [
    ...parsed.taste_tags,
    ...parsed.intent_tags,
    ...parsed.moment_tags,
    ...(parsed.category ? [parsed.category] : []),
    ...(parsed.is_quiet ? ['quiet'] : []),
  ]
  if (!chips.length) return ''
  return chips.map(c => c.charAt(0).toUpperCase() + c.slice(1).replace('-', ' ')).join(' · ')
}

Run tsc --noEmit after. Fix any type errors.
```

---

## P6.4 — Search API Route (keyword version)
```
Build the search API route for Vibe Index using keyword matching (no AI).

Create app/api/search/route.ts:

POST handler — request body: { query: string, city_id?: string }

1. Import parseVibeQuery and formatInterpretation from @/lib/search/keywords
2. Parse the query: const parsed = parseVibeQuery(query)
3. If no tags extracted and no category: return results from a broad fetch
   (all places in the city, limited to 20) with interpreted_as: "Showing all places"

4. Build a Supabase query against places_with_location:
   - Start with base query: .select('*').eq('active', true).limit(20)
   - If city_id: add .eq('city_id', city_id)
   - If taste_tags.length: add .overlaps('taste_tags', taste_tags)
     Note: use .overlaps() not .contains() — match ANY tag not ALL tags
     This is more forgiving for natural language
   - If intent_tags.length: add .overlaps('intent_tags', intent_tags)
   - If moment_tags.length: add .overlaps('moment_tags', moment_tags)
   - If category: add .eq('category', category)
   - If is_quiet: add .not('taste_tags', 'cs', '{"loud"}')
   - Sort: .order('featured', { ascending: false })
            .order('created_at', { ascending: false })

5. Return:
   {
     results: Place[],
     interpreted_as: formatInterpretation(parsed),  // e.g. "Sexy · Date · Evening"
     extracted: {
       taste_tags: parsed.taste_tags,
       intent_tags: parsed.intent_tags,
       moment_tags: parsed.moment_tags,
       category: parsed.category,
       matched_keywords: parsed.matched_keywords,
       is_quiet: parsed.is_quiet
     }
   }

6. Error handling:
   - Empty query: return 400 { error: 'Query required' }
   - Supabase error: return 500 { error: 'Search failed' }
   - Always return results array even if empty

Add Supabase .overlaps() to the query functions if not already available.
Note: Supabase overlaps uses: .overlaps('column', ['val1','val2'])

Run tsc --noEmit after. Fix any type errors.
```

---

## P6.5 — Search-First Home Layout
```
Restructure the Vibe Index home page to be search-first per the MVP brief.

This is the most significant UI change in the entire build.
The new layout top-to-bottom is:

  1. Header: logo left, bookmark icon right
  2. VibeSearch — large search bar (hero element)
  3. City selector — below the search bar (supporting context)
  4. CityHero strip — if a city is selected (from Phase 5)
  5. Quick search chips — Date night / Brunch / Quiet / Girls' night /
     Solo reset / Late night / Coffee / Spa
  6. Active interpretation strip — after search only
  7. Results grid

PART A — Create components/filters/VibeSearch.tsx as 'use client':

Props:
  cityId: string | null
  onResults: (results: Place[], interpretedAs: string, extracted: ParsedQuery) => void
  onClear: () => void

State:
  query: string
  isSearching: boolean
  hasSearched: boolean
  error: string | null

Render:
- Container: px-4 pt-3 pb-2
- Input wrapper: relative flex items-center
- Search icon: lucide-react Search, absolute left-3, text-gray-300, size 18
- Input:
    placeholder: 'Try "dim cocktails for a second date"'
    className: w-full rounded-2xl border-2 border-gray-100 bg-white pl-10 pr-10
               py-3.5 text-base focus:border-accent/40 focus:outline-none shadow-sm
- Clear button (X): show when query is not empty, absolute right-3
  onClick: clear query, call onClear()
- Below input when isSearching:
    "Finding your vibe..." with animated pulse dot
    text-sm text-gray-400 px-1 mt-2
- Error state below input: text-sm text-red-400 px-1 mt-2

Search trigger: Enter key only (no auto-search)
Min length: 2 characters

On search:
  setIsSearching(true)
  POST to /api/search with { query, city_id: cityId }
  On success: call onResults(results, interpretedAs, extracted)
  On error: set error message

PART B — Create components/filters/QuickChips.tsx as 'use client':

Props:
  onChipSelect: (query: string) => void
  hidden: boolean  — hide when search results are active

Chips config (label → search query string):
  { label: 'Date night',   query: 'date night' }
  { label: 'Brunch',       query: 'brunch' }
  { label: 'Quiet',        query: 'quiet and cozy' }
  { label: 'Girls\' night', query: 'girls night out' }
  { label: 'Solo reset',   query: 'solo reset recharge' }
  { label: 'Late night',   query: 'late night' }
  { label: 'Coffee',       query: 'coffee cafe' }
  { label: 'Spa',          query: 'spa wellness' }

Render: horizontal scroll row, no scrollbar
Each chip: rounded-full bg-white border border-gray-200 text-gray-600
           text-sm px-4 py-2 whitespace-nowrap active:bg-accent/10
Container: flex gap-2 overflow-x-auto px-4 py-2 [&::-webkit-scrollbar]:hidden

On chip tap: call onChipSelect(chip.query)
— this fills the VibeSearch input AND triggers the search automatically

PART C — Create components/filters/InterpretationStrip.tsx:

Props:
  interpretedAs: string | null  — e.g. "Sexy · Date · Evening"
  resultCount: number
  onClear: () => void

If interpretedAs is null or empty: return null

Render:
- Container: px-4 py-2 flex items-center justify-between
- Left: "✦ Showing results for: {interpretedAs}"
  text-sm, "✦" in text-accent, rest in text-gray-500
- Right: small "✕ Clear" button → calls onClear()
  text-xs text-gray-400 underline

PART D — Update components/HomeClient.tsx:

New state:
  searchResults: Place[] | null  (null = not in search mode)
  interpretedAs: string | null
  extractedQuery: ParsedQuery | null
  isSearchMode: boolean

New layout order (replace existing layout):
  <div className="flex flex-col min-h-screen bg-[#FAFAFA]">
    {/* Header */}
    <header className="flex items-center justify-between px-4 pt-safe pt-4 pb-2">
      <span className="text-lg font-bold tracking-tight">Vibe Index</span>
      <BookmarkIcon ... />
    </header>

    {/* Search */}
    <VibeSearch
      cityId={selectedCityId}
      onResults={(results, interpretedAs, extracted) => {
        setSearchResults(results)
        setInterpretedAs(interpretedAs)
        setExtractedQuery(extracted)
        setIsSearchMode(true)
      }}
      onClear={() => {
        setSearchResults(null)
        setInterpretedAs(null)
        setExtractedQuery(null)
        setIsSearchMode(false)
      }}
    />

    {/* City selector */}
    <CitySelector ... />

    {/* City hero — only when city is selected */}
    <CityHero city={selectedCity} />

    {/* Quick chips — hidden in search mode */}
    <QuickChips
      hidden={isSearchMode}
      onChipSelect={(query) => {/* fill VibeSearch and trigger */}}
    />

    {/* Interpretation strip — only in search mode */}
    <InterpretationStrip
      interpretedAs={interpretedAs}
      resultCount={searchResults?.length ?? 0}
      onClear={...}
    />

    {/* Results grid */}
    {isSearchMode
      ? <PlacesGrid places={searchResults ?? []} searchMode={true} extractedQuery={extractedQuery} />
      : <PlacesGrid places={allPlaces} searchMode={false} extractedQuery={null} />
    }
  </div>

Note: QuickChips needs a ref or callback to trigger VibeSearch programmatically.
Use a React ref on VibeSearch that exposes a triggerSearch(query: string) method,
or lift the query state up into HomeClient and pass it down.
Discuss the cleanest approach before implementing.

Run tsc --noEmit after. Fix any type errors.
```

---

## P6.6 — "Why this matched" on PlaceCard
```
Add a contextual match reason line to PlaceCard in search mode.

The card currently shows: thumbnail, name, neighbourhood, tags.
In search mode it should also show: "Matched for: {reasons}"

PART A — Update PlaceCard.tsx:

Add optional props:
  searchMode?: boolean
  matchedTags?: string[]    — the tags from extractedQuery that this place has

Render a match reason line when searchMode is true AND matchedTags has items:
  Position: below neighbourhood, above tag pills
  Text: "Matched for: " + matchedTags.map(t => t.replace('-', ' ')).join(' · ')
  Style: text-xs text-accent/80 italic
  Example: "Matched for: dim · date night · evening"

If searchMode is false or matchedTags is empty: do not render this line.
Instead, if place.description is set, show the first 60 chars of description
as a subtle grey subtitle (only if not in search mode).

PART B — Update PlacesGrid (or HomeClient render logic):

When rendering cards in search mode:
  For each place, compute matchedTags by intersecting:
    - place.taste_tags against extractedQuery.taste_tags
    - place.intent_tags against extractedQuery.intent_tags
    - place.moment_tags against extractedQuery.moment_tags
  Pass this array as matchedTags prop to PlaceCard

When rendering in browse mode: pass searchMode={false}, no matchedTags

Run tsc --noEmit after. Fix any type errors.
```

---

## P6.7 — Phase 6 Tests
```
Add Playwright tests for Phase 6 features. Save in tests/e2e/phase6.spec.ts.

TEST 1: Search bar is the first interactive element
  - Navigate to /
  - Assert a search input is visible near the top of the page
  - Assert it has placeholder text containing "vibe" or "mood" or "date"
  - Assert the quick chips row is visible below it

TEST 2: Natural language search works
  - Navigate to /
  - Click the search input, type "cozy date night drinks"
  - Press Enter
  - Assert loading state appears
  - Wait for results
  - Assert at least one place card is visible
  - Assert interpretation strip is visible (contains "Date" or "Cozy")
  - Assert quick chips are hidden

TEST 3: Quick chip triggers search
  - Navigate to /
  - Click the "Brunch" chip
  - Assert search results appear
  - Assert interpretation strip shows brunch-related tags

TEST 4: Clear search restores browse mode
  - Navigate to /, perform a search
  - Click the clear button (✕ in interpretation strip or X in search input)
  - Assert quick chips reappear
  - Assert interpretation strip is gone
  - Assert browse feed is showing

TEST 5: Match reason appears on cards
  - Navigate to /, search for "date night dim cocktails"
  - Assert at least one card shows a "Matched for:" line
  - Assert the line contains relevant tags

TEST 6: Quiet filter works
  - Navigate to /, search for "quiet coffee"
  - Assert results appear without loud/kinetic places
    (check that no card has "loud" in its visible tags)

Run with: npx playwright test tests/e2e/phase6.spec.ts --reporter=list
```

---

# PHASE 7 — Creator Attribution
## Renamed from Phase 8 in the original gap analysis plan
## No changes to content — run as documented in phase-6-10-prompts.md P8.1 and P8.2

---

# PHASE 8 — Event Stream & Taste Graph
## Renamed from Phase 9 — no changes to content
## Run as documented in phase-6-10-prompts.md P9.1, P9.2, P9.3

---

# PHASE 9 — AI-Upgraded Search (post-MVP)
## Upgrade the keyword search to Claude API-powered NL interpretation

---

## P9.1 — AI Search Upgrade
```
Upgrade the Vibe Index search from keyword matching to Claude API-powered
natural language interpretation.

This is a drop-in replacement for the existing /api/search route.
The keyword system (lib/search/keywords.ts) is kept as a fallback.

PART A — Update app/api/search/route.ts:

Add an AI interpretation path before the keyword fallback:

  import Anthropic from '@anthropic-ai/sdk'

  const client = new Anthropic()  // uses ANTHROPIC_API_KEY from env

  const systemPrompt = `You are a vibe extraction engine for a place discovery app.
  Given a natural language query, extract matching tags from these exact lists:

  taste_tags: sexy, cozy, chic, loud, dim, kinetic, earthy, elegant, stylish, playful, intimate
  intent_tags: date, solo, group, chill, brunch, spa, manicure, dessert, late-night, girls-night, solo-reset
  moment_tags: before-dinner, rainy-day, late-night, sunday-morning, after-shopping
  categories: food, drink, cafe, spa, wellness, hair, nails, dental, fitness, nightlife, shopping, experience
  special: is_quiet (boolean — true if user wants somewhere not loud)

  Respond ONLY with valid JSON, no preamble, no markdown:
  {
    "taste_tags": [],
    "intent_tags": [],
    "moment_tags": [],
    "category": null,
    "is_quiet": false,
    "interpreted_as": "one sentence: what you understood"
  }

  Rules:
  - Only include tags that genuinely match the query
  - Do not force matches where there are none
  - interpreted_as must be short (under 60 chars) and human-friendly`

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 200,
    messages: [{ role: 'user', content: query }],
    system: systemPrompt,
  })

  Parse the JSON response. If parsing fails, fall back to parseVibeQuery(query).

PART B — Response format stays identical to the keyword version.
The front end does not need to change.

PART C — Add ANTHROPIC_API_KEY= to .env.local (server-side only, never NEXT_PUBLIC_)

PART D — Verify:
  Test with: "somewhere sexy but not too loud for a second date"
  Expected response includes: intimate, dim, date, is_quiet: true
  Check PostHog / event stream for search events with AI results

Run tsc --noEmit after. Fix any type errors.
```

---

# PHASE 10 — Contextual Ad Slots
## No changes — run as documented in phase-6-10-prompts.md P10.1 and P10.2

---

---

## SECTION 4: UPDATED EXECUTION ORDER

```
Completed (Sessions 1–4):
  ✅ Scaffold, Supabase, all screens
  ✅ Tag filtering, multi-city migration
  ✅ PWA config, mobile polish
  ✅ Production hardening, OG metadata, deploy

In progress / next:
  Phase 2  → BookingCTA, pagination, URL params, skeleton (no changes)
  Phase 3  → Saved grouping, submission form (no changes)
  Phase 4  → SEO, PostHog, Lighthouse (no changes)
  Phase 5  → Featured, city hero (P5.2 updated), related places, waitlist

New phases:
  Phase 6  → Search-first layout (biggest structural change)
             P6.1 → Tag expansion (DB)
             P6.2 → Category DB migration
             P6.3 → Keyword search engine
             P6.4 → Search API route
             P6.5 → Search-first home layout   ← plan before executing
             P6.6 → Match reason on cards
             P6.7 → Tests

  Phase 7  → Creator attribution (DB + UI)
  Phase 8  → Event stream + taste graph
  Phase 9  → AI search upgrade (post-MVP)
  Phase 10 → Contextual ad slots
```

## Parallelisation opportunities in new phases:
- P6.1 + P6.2 (both DB migrations) can run in the same SQL session
- P6.3 (keyword engine) can be built while P6.1/P6.2 run
- Phase 7 (creator) can run in parallel with Phase 8 (event stream)
- P9.1 (AI upgrade) is a self-contained swap — run any time after Phase 6 ships

---

## SECTION 5: UPDATED CLAUDE.md ADDITIONS

> After completing Phase 6, ask Claude Code to append this to CLAUDE.md:

```
## Search Architecture (MVP)
Natural language search via keyword mapping — no AI API calls.
Keyword engine: lib/search/keywords.ts — KEYWORD_MAP + parseVibeQuery()
Search route: app/api/search/route.ts — POST { query, city_id? }
Returns: { results, interpreted_as, extracted: { taste_tags, intent_tags,
          moment_tags, category, matched_keywords, is_quiet } }
Uses .overlaps() not .contains() — match ANY tag (more forgiving for NL)
Quiet filter: .not('taste_tags', 'cs', '{"loud"}') — negative filter
AI upgrade path: Phase 9 — claude-haiku drop-in replacement, same response shape

## Home Layout (search-first)
Order: Header → VibeSearch → CitySelector → CityHero → QuickChips →
       InterpretationStrip (search mode only) → Results grid
Search mode: QuickChips hidden, InterpretationStrip visible
Browse mode: QuickChips visible, InterpretationStrip hidden

## Quick Chips
Map to search queries (not to tags directly):
'Date night' → 'date night', 'Brunch' → 'brunch',
'Quiet' → 'quiet and cozy', 'Girls\' night' → 'girls night out',
'Solo reset' → 'solo reset recharge', 'Late night' → 'late night',
'Coffee' → 'coffee cafe', 'Spa' → 'spa wellness'

## New Tag Values (Phase 6)
intent_tags now includes: girls-night, solo-reset
is_quiet is a special search flag (negative filter) not a tag

## PlaceCard Search Mode
searchMode={true}: show "Matched for: tag · tag" line (text-xs text-accent/80 italic)
searchMode={false}: show first 60 chars of description as subtitle
matchedTags computed in HomeClient by intersecting place tags with extractedQuery tags
```
