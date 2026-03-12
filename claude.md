# CLAUDE.md — Vibe Index

## What This Is
Mobile-first web app for vibe-based place discovery. TikTok Discover meets
Airbnb Experiences. Users find places by mood/moment, not category.
Global multi-city app — London, NYC, Tokyo, Paris, Berlin, Milan, Toronto, Melbourne, Mexico City, Rio.

## Stack
- Next.js 15 App Router + TypeScript
- Tailwind CSS + shadcn/ui
- Supabase (PostgreSQL) — places data, read-only via anon key
- localStorage — anonymous bookmarks + selected city, no auth
- Vercel — hosting
- PostHog — analytics (to be wired up)

## Always Do First
Invoke the frontend-design skill before writing any frontend code, every session, no exceptions.

## Reference Images
If a reference image is provided: match layout, spacing, typography, and color exactly. Swap in placeholder content (images via https://placehold.co/, generic copy). Do not improve or add to the design.
If no reference image: design from scratch with high craft (see guardrails below).
Screenshot your output, compare against reference, fix mismatches, re-screenshot. Do at least 2 comparison rounds. Stop only when no visible differences remain or user says so.

## Hard Rules
- Mobile-first. 390px is primary. Scale up, never down.
- Server components by default. 'use client' only for state/browser APIs.
- Accent: #C4622D (burnt terracotta). Background: #FAF9F7 (warm off-white). Display font: Cormorant Garamond. Body font: DM Sans.
- No stars, ratings, or review UI. Ever.
- Bottom tab nav only. No hamburger menus.
- Tailwind only. No inline styles.

## Env Variables
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=   ← use this (not ANON_KEY)
NEXT_PUBLIC_BASE_URL=                           ← production URL for OG tags (e.g. https://vibeindex.app)

## Key Files
/types/index.ts              — canonical TypeScript types (Place, City, Country, ActiveFilters, tag unions)
/lib/supabase.ts             — Supabase client + named query functions
/lib/bookmarks.ts            — localStorage save/unsave/check
/lib/tags.ts                 — tag arrays and TAG_GROUPS constant
/components/CitySelector.tsx — bottom sheet city picker (mobile) / select (desktop)
/components/HomeClient.tsx   — client home: city + tag filter state, fetches places
/components/PlaceCard.tsx    — main card component
/components/TagFilter.tsx    — horizontal scrollable tag bar (ActiveFilters props)
/components/BottomNav.tsx    — bottom tab navigation
/components/VideoEmbed.tsx   — lazy oEmbed video embed (TikTok/IG/YouTube) [to build]
/components/BookingCTA.tsx   — booking/contact CTA button variants [to build]
/scripts/db/                 — migration, restore, and backup SQL scripts

## Implementation Plan
Full phase delivery plan: docs/implementation/revised-mvp-plan.md
Current phase prompts:    docs/implementation/phase-implementation-prompts.md
                          docs/implementation/phase-6-10-prompts.md
Execute phases in the order defined in Section 4 of the revised plan.

## Data Model (Supabase)

### Tables
- `countries` — id (uuid), name (text), code (char 2)
- `cities` — id (uuid), name (text), country_id (uuid FK), tagline (text), hero_image_url (text)
- `places` — id, name, city (text legacy), city_id (uuid FK), neighbourhood, description,
             thumbnail_url, taste_tags[], intent_tags[], moment_tags[],
             tiktok_url, google_maps_url, booking_url, cta_type, featured (bool), active
- `submissions` — id, name, email, platform, video_url, city_id, booking_url, description, status, created_at [to build]

### View: `places_with_location`
Joins places → cities → countries. Exposes city_name, country_name, country_code.
All app queries target this view (never `places` directly).

## Tag Enums
taste_tags:  sexy, cozy, chic, loud, dim, kinetic, earthy, elegant, stylish, playful, intimate
intent_tags: date, solo, group, chill, brunch, spa, manicure, dessert, late-night
moment_tags: before-dinner, rainy-day, late-night, sunday-morning, after-shopping

## Filtering Logic
- City: `.eq('city_id', ...)` — exact match
- Tags: `.contains(column, [...])` — AND within category (must have all selected tags)
- Multiple categories: independent AND conditions
- Clear resets tag arrays only (not city)
- Active tag filters should be stored in URL search params (?taste=cozy,chic&intent=date) for shareable links

## Pagination
- Use Supabase `.range(offset, offset + 19)` — 20 places per page
- HomeClient tracks offset in state, exposes loadMore()
- Show "Load more" button at feed bottom with loading spinner
- Featured places always sort first: `.order('featured', { ascending: false }).order('created_at', { ascending: false })`

## BookingCTA Types
cta_type enum values and behaviour:
- `whatsapp`   → wa.me/+{phone} link
- `opentable`  → opentable.com/... link
- `fresha`     → fresha.com/... link
- `website`    → generic external link
- `phone`      → tel: link
- `instagram`  → instagram.com/{handle} with DM prompt

## Video Embeds
- VideoEmbed.tsx handles TikTok, Instagram Reels, YouTube Shorts
- Default state: thumbnail image + play button overlay (no iframe loaded)
- On play tap: inject oEmbed iframe, remove overlay
- oEmbed calls proxied through app/api/oembed/route.ts to avoid CORS
- Always reserve aspect-ratio: 9/16 container to prevent layout shift

## localStorage Keys
- `vibe_bookmarks` — JSON array of bookmarked place IDs
- `vibe-index-city` — selected city ID string (or absent = Explore Everywhere)

## Screens
/ → Home, discover and filter (city + tags)
/place/[id] → Place detail (video embed + booking CTA + related places)
/saved → Bookmarked places (grouped by city)
/submit → Creator/provider submission form [to build]

## Analytics Events (PostHog)
Track these events once PostHog is wired up in app/layout.tsx:
- city_selected · tag_applied · listing_viewed · video_played
- bookmark_tapped · share_tapped · booking_cta_tapped
- submission_started · submission_completed

## Non-Goals (never build these)
Reviews, ratings, payments, social graph, itinerary building, vendor onboarding.
Auth is deferred — add only when cloud-sync of saves is needed.

## Build Priority (next sessions)
P0 — build now:
1. VideoEmbed.tsx + app/api/oembed/route.ts
2. BookingCTA.tsx + add booking_url/cta_type to Supabase places table
3. Load-more pagination in HomeClient
4. Dynamic generateMetadata() per listing in app/place/[id]/page.tsx

P1 — build next:
5. PostHog analytics in app/layout.tsx
6. URL search params for active tag filters
7. /submit page + Supabase submissions table + app/api/submit/route.ts
8. SkeletonCard.tsx loading state in feed

P2 — build soon:
9. featured boolean column + sort order in Supabase
10. City editorial header (tagline + hero_image_url in cities table)
11. Supabase Auth magic link + cloud-synced saved_places table
12. Related places carousel on /place/[id]

## Session Log
Session 1: [x] Scaffold + Supabase + all screens working
Session 2: [x] Tag filtering working end-to-end
Session 2+: [x] Multi-city migration — countries/cities tables, places_with_location view, CitySelector, HomeClient rewrite, TagFilter refactor, PlaceCard city/flag display,detail page location string, saved page getSavedPlaces, scripts/db/
Session 3: [x] PWA config + mobile polish — manifest, SW, icons, safe areas, overscroll, OG image
Session 4: [x] Production hardening — security headers, error boundary, OG/Twitter metadata, deploy docs
Session 5: [x] Phase 2 complete — BookingCTA, pagination, URL params, skeleton
Session 5: [x] Phase 2b — PostHog wired up
Session 6: [x] Phase 5 complete — featured sort, city hero, related places, waitlist
Session 7: [x] UI/UX redesign — Cormorant Garamond + DM Sans, #C4622D accent, warm palette, editorial mixed grid, redesigned search/chips/cards/tags across all screens

## Design System (Redesigned — Session 7)
Accent: #C4622D — burnt terracotta
Background: #FAF9F7 — warm off-white
Foreground: #1A1814 — warm near-black
Display font: Cormorant Garamond — headings, wordmark, card titles (var --font-cormorant)
Body font: DM Sans — UI, labels, descriptions (var --font-dm-sans)
Card grid: mixed editorial layout — hero card (col-span-2, 16/9) + two-column (3/4) + wide every 5th (21/9)
Tag pills: bg-accent/10 text-accent (filled low-opacity, not outline)
Search bar: min-height 52px, white surface with warm shadow, accent ring on focus, ✦ icon
Interpretation strip: bg-accent/[0.06] with left border-accent, ✦ prefix, result count pill

## Documentation
Update files in docs folder after major milestones and updates to the project.
