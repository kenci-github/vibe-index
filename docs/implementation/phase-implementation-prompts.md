# Vibe Index — Phase Implementation Prompts
## Based on Gap Analysis · Phases 2–5 · New refactored file paths

---

## HOW TO USE THESE PROMPTS

- Run prompts **in order within each phase** — they build on each other
- Run phases **in order** — Phase 2 before Phase 3, etc.
- Each prompt starts with a **context reminder** — Claude Code reads CLAUDE.md
  automatically but the reminder keeps it focused on the specific task
- After every prompt, ask Claude Code:
  > "Run tsc --noEmit and confirm no type errors before we continue."
- Update the Session Log in CLAUDE.md at the end of each phase

---

---

# PHASE 2 — Feed & Filtering Gaps
## Remaining gaps: BookingCTA · Pagination · URL filter state · Skeleton loading

---

## P2.1 — BookingCTA Component
> VideoEmbed is already being handled separately.
> Start Phase 2 here.

```
Build the BookingCTA component for the Vibe Index app.

Context: places in Supabase now have booking_url (text) and cta_type (text) fields.
The cta_type determines which booking platform to link to.

Create components/places/BookingCTA.tsx as a client component.

Props:
  bookingUrl: string | null
  ctaType: string | null
  placeName: string   — used for WhatsApp message pre-fill

Behaviour — render nothing (return null) if bookingUrl or ctaType is null/empty.

Otherwise render a full-width button linking to the correct destination:

  cta_type = 'whatsapp'
    → href: https://wa.me/{phone}?text=Hi%2C+I+found+{placeName}+on+Vibe+Index
    → where {phone} is the bookingUrl value (store the number in booking_url)
    → Button label: "Message on WhatsApp"
    → Icon: lucide-react MessageCircle

  cta_type = 'opentable'
    → href: bookingUrl (full OpenTable URL)
    → Button label: "Reserve on OpenTable"
    → Icon: lucide-react CalendarCheck

  cta_type = 'fresha'
    → href: bookingUrl (full Fresha URL)
    → Button label: "Book on Fresha"
    → Icon: lucide-react Scissors

  cta_type = 'website'
    → href: bookingUrl
    → Button label: "Visit Website"
    → Icon: lucide-react ExternalLink

  cta_type = 'phone'
    → href: tel:{bookingUrl}
    → Button label: "Call to Book"
    → Icon: lucide-react Phone

  cta_type = 'instagram'
    → href: https://instagram.com/{bookingUrl}
    → Button label: "DM on Instagram"
    → Icon: lucide-react Instagram

All links: target="_blank" rel="noopener noreferrer" except tel: links.

Styling:
- Full width button
- Background: #FF4D4D (accent)
- Text: white, font-semibold
- Rounded-xl, py-3.5
- Icon left of label, gap-2
- Active scale: active:scale-95 transition
- Mobile tap target minimum 44px height

Wire it into app/place/[id]/page.tsx:
- Import BookingCTA dynamically: import dynamic from 'next/dynamic'
- Render below the place description
- Pass place.booking_url, place.cta_type, place.name
- Only render if the place has a cta_type value

Run tsc --noEmit after. Fix any type errors.
```

---

## P2.2 — Load-More Pagination
```
Add load-more pagination to the Vibe Index feed.

Current state: getPlaces() in lib/db/supabase.ts fetches all matching places with
no limit. HomeClient.tsx renders all results at once.

Changes needed:

1. Update getPlaces() in lib/db/supabase.ts:
   - Add offset: number = 0 and limit: number = 20 to the function params
   - Add .range(offset, offset + limit - 1) to the query
   - Also update the sort order:
     .order('featured', { ascending: false })
     .order('created_at', { ascending: false })
   - Return type stays Place[] — no other changes to the function signature

2. Update HomeClient.tsx (components/HomeClient.tsx):
   - Add state: const [offset, setOffset] = useState(0)
   - Add state: const [allPlaces, setAllPlaces] = useState<Place[]>([])
   - Add state: const [hasMore, setHasMore] = useState(true)
   - Add state: const [loadingMore, setLoadingMore] = useState(false)
   - On initial fetch (when city or tags change): reset offset to 0, reset
     allPlaces to [], fetch first page, set allPlaces to result
   - If result.length < 20: set hasMore to false
   - Add loadMore function:
     - Set loadingMore to true
     - Fetch getPlaces with offset + 20
     - Append new results to allPlaces
     - If new results.length < 20: set hasMore to false
     - Increment offset by 20
     - Set loadingMore to false

3. Render a Load More button at the bottom of the feed:
   - Only show if hasMore is true
   - Show a loading spinner inside the button when loadingMore is true
   - Button text: "Load more places"
   - Style: outlined button, full width, rounded-xl, py-3
   - Margin top: mt-6

Do not change: tag filter logic, city filter logic, the card rendering,
or any other part of HomeClient. Only add pagination.

Run tsc --noEmit after. Fix any type errors.
```

---

## P2.3 — URL Search Params for Tag Filters
```
Move active tag filters from component state into URL search params in the
Vibe Index app. This makes filtered feeds shareable and bookmarkable.

Current state: HomeClient.tsx stores active tags in useState. Filters are lost
on page refresh and cannot be shared as links.

Target behaviour:
  URL: /?taste=cozy,chic&intent=date
  → pre-populates the TagFilter with those tags selected
  → fetches places with those filters applied
  → updating filters updates the URL without a page reload

Changes needed in components/HomeClient.tsx:

1. Import useSearchParams and useRouter from 'next/navigation'

2. Replace the taste/intent/moment tag useState arrays with URL param reads:
   const searchParams = useSearchParams()
   const tasteTags = searchParams.get('taste')?.split(',').filter(Boolean) ?? []
   const intentTags = searchParams.get('intent')?.split(',').filter(Boolean) ?? []
   const momentTags = searchParams.get('moment')?.split(',').filter(Boolean) ?? []

3. Create a updateFilters function that updates the URL:
   - Takes a tag category ('taste' | 'intent' | 'moment') and new tag array
   - Builds new URLSearchParams from current params
   - Sets or deletes the relevant param
   - Calls router.replace('?' + params.toString(), { scroll: false })
   - This replaces history state (not push) so back button still works

4. Pass updateFilters as the onChange handler to TagFilter

5. The useEffect that fetches places should depend on the searchParams values,
   not on local state — so the feed re-fetches whenever the URL changes

6. City selection stays in localStorage as before — do not move it to URL params

Do not change: TagFilter.tsx component itself, the city selector behaviour,
the load-more logic, or the Supabase query functions.

Run tsc --noEmit after. Fix any type errors.
```

---

## P2.4 — Skeleton Loading Cards
```
Add skeleton loading cards to the Vibe Index feed so users see a meaningful
loading state instead of a blank screen on first load.

1. Create components/places/SkeletonCard.tsx:
   - Match the exact dimensions and layout of PlaceCard.tsx
   - Use Tailwind animate-pulse on all placeholder elements
   - Structure:
     - Thumbnail placeholder: rounded-xl, aspect-ratio same as PlaceCard image,
       bg-gray-200 with pulse
     - Title placeholder: h-4 bg-gray-200 rounded w-3/4 mt-3 with pulse
     - Subtitle placeholder: h-3 bg-gray-200 rounded w-1/2 mt-2 with pulse
     - Tags row placeholder: flex gap-2 mt-3 with 3 small rounded pill shapes
   - No props needed — purely visual placeholder
   - Export as default

2. Update components/HomeClient.tsx:
   - Import SkeletonCard
   - When isLoading is true AND allPlaces.length === 0 (initial load only):
     render a grid of 6 SkeletonCard components in place of the feed
   - When isLoading is true AND allPlaces.length > 0 (loading more):
     show existing cards + the Load More button in loading state (already handled)
   - When isLoading is false AND allPlaces.length === 0:
     show empty state: "No places found for this vibe — try different tags"

Do not change PlaceCard.tsx or any filter/city logic.

Run tsc --noEmit after. Fix any type errors.
```

---

## P2.5 — Phase 2 Tests
```
Add Playwright tests for the Phase 2 features. Save in tests/e2e/phase2.spec.ts.

TEST 1: BookingCTA renders on detail page
  - Find a place in Supabase that has a cta_type set (check Table Editor)
  - Navigate to /place/[that-id]
  - Assert a booking button is visible (check for button text containing
    "Book", "Reserve", "Message", "Call", or "Visit")
  - Assert tapping the button does not navigate away (it opens a new tab)

TEST 2: Load more pagination
  - Navigate to /
  - Count the number of place cards visible
  - If a "Load more places" button is visible:
    - Click it
    - Wait for network idle
    - Assert more cards are now visible than before
  - If no Load more button: assert at least 1 card is visible (pass either way)

TEST 3: Tag filter updates URL
  - Navigate to /
  - Click a tag in the tag filter bar
  - Assert the URL now contains a search param (e.g. ?taste= or ?intent=)
  - Reload the page
  - Assert the same tag is still selected (loaded from URL)

TEST 4: Shareable filter URL
  - Navigate to /?taste=cozy
  - Assert the "cozy" tag appears selected/active in the tag filter bar
  - Assert place cards are visible

TEST 5: Empty state
  - Navigate to /?taste=sexy&intent=brunch&moment=rainy-day
    (an unlikely combination that may return no results)
  - Assert either: place cards are shown OR an empty state message is visible
  - Assert no JavaScript errors in console

Run with: npx playwright test tests/e2e/phase2.spec.ts --reporter=list
```

---

---

# PHASE 3 — Auth & Submissions
## Gaps: Saved page city grouping · Creator submission form · (Auth deferred)

---

## P3.1 — Group Saved Page by City
```
Update the saved places page to group bookmarks by city.

Current state: app/saved/page.tsx renders saved places as a flat list.

Target state: places grouped under their city name as a sticky sub-header,
matching the pattern used in CitySelector (grouped by country/city).

Changes needed in app/saved/page.tsx:

1. After fetching saved places via getSavedPlaces(ids), group them by city_name:
   - Use a reduce to build: Record<string, { cityName: string, places: Place[] }>
   - Key by city_name (or 'Unknown' if null)
   - Sort groups alphabetically by cityName
   - Within each group, keep existing order

2. Render grouped output:
   - For each city group: render a sticky sub-header row with the city name
     and country flag (look up country_code from the first place in the group)
     Style: bg-gray-50, px-4, py-2, text-xs font-semibold uppercase
     tracking-widest text-gray-400 — same pattern as CitySelector country headers
   - Below the header: render each PlaceCard in that group
   - Import PlaceCard from @/components/places/PlaceCard (new refactored path)

3. Empty state (no saved places):
   - Keep existing empty state if present, or add:
     "No saved places yet — tap ♡ on any place to save it"
     Centre-aligned, text-gray-400, mt-12

4. Page header: "Your Saved Places" with a count badge showing total number saved
   Style: text-xl font-bold, count in a small rounded pill bg-accent/10 text-accent

Do not change: getSavedPlaces() query, bookmark logic in lib/storage/bookmarks.ts,
or the BottomNav.

Run tsc --noEmit after. Fix any type errors.
```

---

## P3.2 — Creator Submission Form
```
Build the creator and service provider submission form for Vibe Index.

This lets TikTok creators and business owners submit their content for
consideration — writing to the Supabase submissions table.

PART A — Page: app/submit/page.tsx

Create a server component page with:
- Title: "Submit your place"
- Subtitle: "Got a great spot you've seen on TikTok or Instagram?
  Submit it and we'll review it for the Vibe Index."
- Render the SubmitForm client component (see Part B)
- Standard app layout with BottomNav

PART B — Form: components/actions/SubmitForm.tsx

Create as a 'use client' component.

Fields (all required unless noted):
  1. Your name (text input)
  2. Your email (email input)
  3. Platform (select: TikTok / Instagram / YouTube / Other)
  4. Video or profile URL (url input — the TikTok/IG/YouTube link)
  5. City (select — populated from getCities() which filters active: true)
  6. Booking or contact link (url input — optional)
  7. Brief description (textarea, optional, max 280 chars, show char count)

Validation (client-side, before submit):
  - Name: required, min 2 chars
  - Email: required, valid email format
  - Platform: required, must be one of the 4 options
  - Video URL: required, must start with https://
  - City: required, must select a city
  - Booking URL: optional, but if provided must start with https://
  - Show inline validation errors below each field on blur

On submit:
  - Show loading state on submit button ("Submitting...")
  - POST to /api/submit with JSON body
  - On success: show success state (see below)
  - On error: show "Something went wrong — please try again" below the button

Success state (replace form):
  - Large checkmark icon (lucide-react CheckCircle, text-green-500, size 48px)
  - Heading: "Thanks! We'll review your submission."
  - Body: "We review all submissions within 3–5 days. If approved,
    your place will appear in the Vibe Index."
  - Button: "Submit another" — resets form to initial state

Styling:
  - Mobile-first, full width inputs
  - Input style: rounded-xl border border-gray-200 bg-white px-4 py-3
    text-base focus:outline-none focus:ring-2 focus:ring-accent/30
  - Labels: text-sm font-medium text-gray-700 mb-1
  - Submit button: full width, bg-accent (#FF4D4D), text-white,
    rounded-xl, py-3.5, font-semibold, disabled when loading

PART C — API Route: app/api/submit/route.ts

Create a POST handler:
  - Parse JSON body
  - Validate required fields server-side (name, email, platform, video_url, city_id)
  - If validation fails: return 400 with { error: 'Missing required fields', fields: [...] }
  - Insert into Supabase submissions table using the service role client:
    const supabase = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY!)
    Note: use service role key (not anon key) so RLS INSERT policy applies correctly
  - On success: return 200 with { success: true }
  - On Supabase error: return 500 with { error: 'Failed to save submission' }

Add SUPABASE_SERVICE_ROLE_KEY= to .env.local as a comment (never expose this client-side)

PART D — Navigation:
  Add a "Submit a place" link to the bottom navigation or as a floating button
  on the home page. Discuss with me which approach before implementing.

Run tsc --noEmit after. Fix any type errors.
```

---

## P3.3 — Phase 3 Tests
```
Add Playwright tests for Phase 3 features. Save in tests/e2e/phase3.spec.ts.

TEST 1: Saved page shows city groupings
  - Add at least 2 saved place IDs to localStorage key 'vibe_bookmarks'
    that belong to different cities (use real IDs from your Supabase database)
  - Navigate to /saved
  - Assert city sub-headers are visible (look for uppercase city name text)
  - Assert place cards appear under their correct city

TEST 2: Saved page empty state
  - Clear localStorage before this test
  - Navigate to /saved
  - Assert an empty state message is visible
  - Assert no JavaScript errors

TEST 3: Submit page loads
  - Navigate to /submit
  - Assert the form is visible
  - Assert all required fields are present:
    name input, email input, platform select, video URL input, city select
  - Assert submit button is visible

TEST 4: Submit form validation
  - Navigate to /submit
  - Click the submit button without filling in any fields
  - Assert validation error messages appear
  - Assert no network request was made (form should not submit)

TEST 5: Submit form happy path
  - Navigate to /submit
  - Fill in all required fields with valid test data:
    Name: "Test User"
    Email: "test@vibeindex.co"
    Platform: "TikTok"
    Video URL: "https://www.tiktok.com/@test/video/123"
    City: select the first available city
  - Click submit
  - Assert loading state appears on button
  - Assert success state appears (checkmark + thank you message)
  - Note: this will create a real row in your submissions table — delete it
    after testing via Supabase Table Editor

Run with: npx playwright test tests/e2e/phase3.spec.ts --reporter=list
```

---

---

# PHASE 4 — SEO & Analytics
## Gaps: Per-listing OG metadata · PostHog analytics · Offline SW · Lighthouse audit

---

## P4.1 — Dynamic Per-Listing OG Metadata
```
Ensure every place detail page has fully dynamic Open Graph and Twitter Card
metadata for rich social sharing previews.

Current state: app/place/[id]/page.tsx may have static or partial metadata.

Target state: each place page generates unique OG tags from its Supabase data.

Update app/place/[id]/page.tsx:

1. Add or update the generateMetadata export:

export async function generateMetadata({ params }: { params: { id: string } }) {
  const place = await getPlaceById(params.id)
  if (!place) return { title: 'Place not found — Vibe Index' }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://vibeindex.app'
  const placeUrl = `${baseUrl}/place/${params.id}`
  const imageUrl = place.thumbnail_url ?? `${baseUrl}/opengraph-image`

  return {
    title: `${place.name} — Vibe Index`,
    description: place.description ?? `Discover ${place.name} on Vibe Index`,
    openGraph: {
      title: place.name,
      description: place.description ?? `Discover ${place.name} on Vibe Index`,
      url: placeUrl,
      siteName: 'Vibe Index',
      images: [{ url: imageUrl, width: 1200, height: 630, alt: place.name }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: place.name,
      description: place.description ?? `Discover ${place.name} on Vibe Index`,
      images: [imageUrl],
    },
    alternates: {
      canonical: placeUrl,
    },
  }
}

2. Confirm getPlaceById is imported from @/lib/db/supabase (refactored path)

3. Confirm the page component itself also calls getPlaceById and handles
   the null case with notFound() from 'next/navigation'

4. Test by running: next build
   Then check the built HTML of a place page for og:title and og:image tags.

Run tsc --noEmit after. Fix any type errors.
```

---

## P4.2 — PostHog Analytics
```
Wire up PostHog analytics to track the key user funnel in Vibe Index.

PART A — Install and initialise:
  npm install posthog-js

  Create lib/analytics/posthog.ts:
    import posthog from 'posthog-js'

    export function initPostHog() {
      if (typeof window === 'undefined') return
      if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://app.posthog.com',
        capture_pageview: false,  // we handle this manually
        persistence: 'localStorage+cookie',
      })
    }

    export function track(event: string, properties?: Record<string, unknown>) {
      if (typeof window === 'undefined') return
      posthog.capture(event, properties)
    }

  Add to .env.local:
    NEXT_PUBLIC_POSTHOG_KEY=     ← get from PostHog dashboard
    NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

PART B — Initialise in layout:
  Create components/layout/PostHogProvider.tsx as a 'use client' component:
    - Call initPostHog() in a useEffect on mount
    - Track page views on route change using usePathname and useEffect
    - Wrap children in a React fragment (no visual output)

  Import and render PostHogProvider in app/layout.tsx wrapping the body content.

PART C — Add event tracking:

  In components/filters/CitySelector.tsx — on city select:
    track('city_selected', { city: cityName })

  In components/filters/TagFilter.tsx — on tag toggle:
    track('tag_applied', { tag, category, active: !wasActive })

  In app/place/[id]/page.tsx — on page mount (useEffect in a client wrapper):
    track('listing_viewed', { place_id: id, city: place.city_name,
      category: 'place', has_video: !!place.tiktok_url })

  In components/places/VideoEmbed.tsx — when play is tapped:
    track('video_played', { place_id, platform })

  In components/actions/BookmarkButton.tsx — on toggle:
    track('bookmark_tapped', { place_id, saved: !wasSaved })

  In components/actions/ShareButton.tsx — on share:
    track('share_tapped', { place_id })

  In components/places/BookingCTA.tsx — on button click:
    track('booking_cta_tapped', { place_id, cta_type })

  In components/actions/SubmitForm.tsx — on form start (first field focus):
    track('submission_started', {})
  — on successful submit:
    track('submission_completed', { platform, city_id })

PART D — Verify:
  Open the app in dev, click through some actions.
  Go to PostHog dashboard → Live Events.
  Confirm events are appearing with correct properties.

Run tsc --noEmit after. Fix any type errors.
```

---

## P4.3 — Service Worker Offline Verification
```
Verify and improve the existing service worker in public/sw.js to ensure
meaningful offline behaviour.

Current state: public/sw.js exists from Session 3 but offline behaviour
has not been verified.

Step 1 — Read the current sw.js and report what caching strategy it uses.

Step 2 — Verify it handles these cases correctly:
  A) App shell (HTML, JS, CSS): should be cached and served offline
  B) API responses from Supabase: should use network-first with cached fallback
  C) Images (thumbnail_url): should be cached after first load
  D) If all fail: should serve a meaningful offline message

Step 3 — If any case is not handled, update sw.js to add:
  - A dedicated offline fallback page response when the network is unavailable
  - Cache the app shell on install
  - Use stale-while-revalidate for API responses (serve cache instantly,
    update in background)
  - Cache images with a max of 50 entries, expire after 7 days

Step 4 — Test offline behaviour:
  - Run npm run dev
  - Open Chrome DevTools → Application → Service Workers → confirm SW is active
  - Go to Network tab → check Offline
  - Reload the page
  - Confirm the app loads (from cache) or shows a graceful offline message
  - Report what happens

Do not change manifest.ts or ServiceWorkerRegistration.tsx unless Step 4
reveals a registration issue.
```

---

## P4.4 — Lighthouse Audit and Fixes
```
Run a Lighthouse audit on the Vibe Index app and fix any issues found.

Step 1 — Build and run the production server locally:
  npm run build
  npm run start

Step 2 — Run Lighthouse via CLI:
  npx lighthouse http://localhost:3000 --view --preset=desktop
  npx lighthouse http://localhost:3000 --view --form-factor=mobile

  If CLI is not available, provide instructions for running in Chrome DevTools.

Step 3 — Report scores for:
  Performance · Accessibility · Best Practices · SEO · PWA

Step 4 — Fix issues in this priority order:

  PERFORMANCE (target: > 85):
  - LCP > 2.5s: add priority prop to the first PlaceImage in the feed
    (Next.js Image priority={true} on the first card)
  - Large images: confirm PlaceImage uses Next.js <Image> with appropriate sizes prop
  - Unused JavaScript: check for any large imports that could be lazy-loaded

  ACCESSIBILITY (target: > 90):
  - Missing alt text on any images
  - Buttons without accessible labels (check icon-only buttons)
  - Colour contrast issues (check against #FF4D4D accent on white)
  - Missing aria-labels on interactive elements

  SEO (target: > 90):
  - Confirm all pages have unique title and description meta tags
  - Confirm robots.ts is not blocking indexing
  - Confirm sitemap.ts includes all place URLs

  PWA:
  - Confirm manifest has all required fields
  - Confirm SW is registered and active
  - Confirm app is installable (Add to Home Screen prompt)

Step 5 — Re-run Lighthouse after fixes and report final scores.
```

---

## P4.5 — Phase 4 Tests
```
Add Playwright tests for Phase 4 features. Save in tests/e2e/phase4.spec.ts.

TEST 1: OG metadata on place detail page
  - Navigate to /place/[a-valid-id]
  - Assert the page <title> contains the place name
  - Assert og:title meta tag exists and contains the place name
  - Assert og:image meta tag exists and contains a URL
  - Assert twitter:card meta tag exists

TEST 2: PostHog loads without errors
  - Navigate to /
  - Assert no console errors related to PostHog or analytics
  - Assert window.posthog is defined (if POSTHOG_KEY is set)
    — skip assertion if key is not in test environment

TEST 3: Page has correct title tags
  - Navigate to / — assert title contains "Vibe Index"
  - Navigate to /saved — assert title contains "Saved" or "Vibe Index"
  - Navigate to /submit — assert title contains "Submit" or "Vibe Index"
  - Navigate to /this-does-not-exist — assert title contains "Not Found" or similar

TEST 4: Images load correctly
  - Navigate to /
  - Wait for networkidle
  - Assert at least one img element is visible and has a src attribute
  - Assert no images have a broken src (check for 404 on image requests
    via page.on('response') listener — report but do not fail the test)

TEST 5: App is installable PWA
  - Navigate to /
  - Assert the page has a manifest link in the head
  - Assert the manifest URL returns 200
  - Assert the manifest contains name, icons, and start_url fields

Run with: npx playwright test tests/e2e/phase4.spec.ts --reporter=list
```

---

---

# PHASE 5 — Growth Features
## Featured listings · City editorial · Share card · City waitlist · Related places

---

## P5.1 — Featured Listings Sort
```
Implement featured listing sort so pinned places always appear at the top of
every feed in Vibe Index.

Current state: places.featured column exists (boolean, default false) from the
database migration. The feed does not yet sort by it.

Changes needed:

1. lib/db/supabase.ts — update getPlaces():
   Replace the existing .order() call with:
     .order('featured', { ascending: false })
     .order('created_at', { ascending: false })
   This sorts featured=true places first, then by newest.

2. components/places/PlaceCard.tsx — add a Featured badge:
   If place.featured is true, show a small badge on the card:
   - Position: top-left corner of the thumbnail, 8px inset
   - Style: bg-accent text-white text-[10px] font-bold px-2 py-0.5 rounded-full
   - Content: "✦ Featured"
   - Only render if place.featured === true

3. Verify in the app:
   - Go to Supabase Table Editor → places
   - Set featured = true on one place
   - Reload the app feed
   - Confirm that place appears first
   - Confirm the Featured badge is visible on its card

Run tsc --noEmit after. Fix any type errors.
```

---

## P5.2 — City Editorial Header
```
Add a city editorial header to the Vibe Index home feed that shows context
and personality when a city is selected.

Current state: cities table now has tagline (text) and hero_image_url (text)
columns from the database migration. Neither is used in the UI yet.

Target state: when a user selects a city, a hero strip appears above the
tag filter bar showing the city name, flag, tagline, and hero image.

Changes needed:

1. Update getCities() in lib/db/supabase.ts to also select tagline and hero_image_url:
   .select('*, country:countries(*)')
   already returns all columns — confirm tagline and hero_image_url are in the
   City type in types/index.ts. If not, add them.

2. Create components/filters/CityHero.tsx:
   Props: city: City & { country: Country } | null

   If city is null: return null (Explore Everywhere mode — no hero)

   If city is set: render a hero strip:
   - Full width, height: h-28 (112px)
   - Background: if hero_image_url is set — Next.js Image fill with overlay
     gradient (from-black/60 to-transparent); if not set — gradient bg
     from-accent/20 to-accent/5
   - Overlay content (absolute positioned, bottom-left, p-4):
     - Flag emoji + city name: text-xl font-bold text-white (or dark if no image)
     - Tagline below: text-sm text-white/80 italic (if tagline is set)
   - Rounded-2xl, overflow-hidden, mx-4 mt-3

3. Render CityHero in components/HomeClient.tsx:
   - Import CityHero
   - Render it between the CitySelector row and the TagFilter bar
   - Pass the currently selected city object (find it from the cities array
     using selectedCityId)

4. Seed sample data — add this in Supabase Table Editor for at least 2 cities:
   London: tagline = "Style, grit, and a perfect flat white"
   New York City: tagline = "If you can find it here, you can find it anywhere"

Run tsc --noEmit after. Fix any type errors.
```

---

## P5.3 — Related Places on Detail Page
```
Add a related places section at the bottom of each place detail page in
Vibe Index. This encourages discovery and keeps users in the app.

Definition of "related": same city + at least one overlapping tag
(across taste, intent, or moment tags). Exclude the current place.

Changes needed:

1. Add getRelatedPlaces() to lib/db/supabase.ts:

export async function getRelatedPlaces(place: Place, limit = 4): Promise<Place[]> {
  // Build a combined array of all tags from this place
  const allTags = [
    ...place.taste_tags.map(t => ({ col: 'taste_tags', val: t })),
    ...place.intent_tags.map(t => ({ col: 'intent_tags', val: t })),
    ...place.moment_tags.map(t => ({ col: 'moment_tags', val: t })),
  ]

  if (!allTags.length || !place.city_id) return []

  // Fetch places in same city, exclude current place
  const { data, error } = await supabase
    .from('places_with_location')
    .select('*')
    .eq('city_id', place.city_id)
    .eq('active', true)
    .neq('id', place.id)
    .limit(limit * 3)  // fetch more, filter by tag overlap below

  if (error || !data) return []

  // Filter to places that share at least one tag with the current place
  const related = (data as Place[]).filter(p =>
    place.taste_tags.some(t => p.taste_tags.includes(t)) ||
    place.intent_tags.some(t => p.intent_tags.includes(t)) ||
    place.moment_tags.some(t => p.moment_tags.includes(t))
  )

  return related.slice(0, limit)
}

2. Update app/place/[id]/page.tsx:
   - Call getRelatedPlaces(place) after fetching the main place
   - If related.length > 0: render a "More like this" section below the main content
   - Section heading: "More like this in {place.city_name}"
     text-lg font-bold mb-3 mt-8
   - Render related places as a horizontal scroll strip (overflow-x-auto flex gap-3)
   - Each item: a compact card (image + name only, smaller than PlaceCard)
     or reuse PlaceCard at a smaller scale with w-48 flex-shrink-0
   - Each card links to /place/[related.id]

3. The related places fetch runs in parallel with nothing else blocking it —
   use Promise.all if the page fetches multiple things.

Run tsc --noEmit after. Fix any type errors.
```

---

## P5.4 — City Waitlist
```
Add a waitlist capture for cities that are not yet live in Vibe Index.

Current state: cities.active = false hides a city from the picker.
If a user somehow lands on a city URL or searches for an unlaunched city,
there is no handling.

This feature adds an email capture for upcoming cities.

PART A — Supabase table:
  Create a waitlist table in Supabase SQL Editor:

  CREATE TABLE IF NOT EXISTS waitlist (
    id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz NOT NULL DEFAULT now(),
    email      text        NOT NULL,
    city_id    uuid        REFERENCES cities(id),
    city_name  text,
    UNIQUE (email, city_id)
  );
  ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;
  CREATE POLICY waitlist_insert_anon ON waitlist FOR INSERT TO anon WITH CHECK (true);

PART B — Waitlist count query:
  Add getWaitlistCount(cityId: string) to lib/db/supabase.ts:
    Query: .select('id', { count: 'exact' }).eq('city_id', cityId)
    Return the count number.

PART C — API route: app/api/waitlist/route.ts:
  POST handler:
  - Parse { email, city_id, city_name } from body
  - Validate email format and city_id presence
  - Insert into waitlist using service role client
  - On duplicate (same email + city): return 200 with { alreadyJoined: true }
  - On success: return 200 with { success: true }

PART D — WaitlistForm component: components/actions/WaitlistForm.tsx:
  'use client' component.
  Props: cityId: string, cityName: string

  Render:
  - Heading: "{cityName} is coming soon"
  - Subtext: "Join {count} people waiting" (fetch count on mount)
  - Email input + "Notify me" button
  - On submit: POST to /api/waitlist
  - Success state: "You're on the list! We'll email you when {cityName} launches."
  - Error state: "Something went wrong — try again"

PART E — Wire into CitySelector.tsx:
  If a user selects a city where city.active === false from Supabase
  (handle the case where an admin manually passes an inactive city ID via URL):
  - Close the city picker
  - Show a modal or bottom sheet with WaitlistForm
  - For now: console.log the inactive city selection and note this
    as a future enhancement — inactive cities are filtered by getCities()
    so this case only occurs via direct URL manipulation

Run tsc --noEmit after. Fix any type errors.
```

---

## P5.5 — Phase 5 Tests
```
Add Playwright tests for Phase 5 features. Save in tests/e2e/phase5.spec.ts.

TEST 1: Featured places appear first
  - Ensure at least one place has featured = true in Supabase
  - Navigate to /
  - Assert the first place card has the "Featured" badge visible
  - Assert it appears before non-featured cards

TEST 2: City editorial header appears
  - Ensure London has a tagline set in Supabase
  - Navigate to /
  - Select London from the city picker
  - Assert the city hero strip is visible above the tag filter
  - Assert the city name "London" appears in the hero
  - Assert the tagline text is visible

TEST 3: Related places on detail page
  - Navigate to /place/[a-place-id-that-has-tags-and-a-city]
  - Assert a "More like this" section is visible (if related places exist)
  - Assert the related place cards are visible and link to /place/[id]
  - If no related places exist for this place: assert the section is
    simply not rendered (no empty state error)

TEST 4: Submit page is accessible from navigation
  - Navigate to /
  - Look for a "Submit a place" link or button in the navigation or on the page
  - Assert it exists and links to /submit

TEST 5: Full user journey smoke test
  - Navigate to /
  - Select a city
  - Apply a tag filter
  - Click a place card
  - Assert the detail page loads with the place name
  - Tap the browser back button (page.goBack())
  - Assert we are back on the feed with the same city and filter still active
    (URL params should preserve filter state)

Run with: npx playwright test tests/e2e/phase5.spec.ts --reporter=list
```

---

---

# END OF PHASE PROMPTS

## Session Log Updates
> After completing each phase, ask Claude Code to run this:

```
Update the Session Log in CLAUDE.md to add the completed phase.
Use this format:

Session [N]: [x] Phase 2 complete — BookingCTA, pagination, URL filter params,
                 skeleton loading, smoke tests
Session [N]: [x] Phase 3 complete — Saved page city grouping, creator submission
                 form, API route, phase tests
Session [N]: [x] Phase 4 complete — per-listing OG metadata, PostHog analytics,
                 SW offline verification, Lighthouse audit, phase tests
Session [N]: [x] Phase 5 complete — featured sort + badge, city editorial header,
                 related places, city waitlist, phase tests

Also update the Build Priority section in CLAUDE.md to mark completed items.
```

## Running All Tests Together
> After all phases are complete, run the full test suite:

```
Run all Playwright tests and produce a summary report:

npx playwright test --reporter=list

List each spec file and each test with PASS or FAIL.
For any failures, describe whether it is a test selector issue or a genuine
app bug, and fix selector issues automatically.
Report final counts: X passed, Y failed.
```
