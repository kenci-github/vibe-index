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

## Always Do First
Invoke the frontend-design skill before writing any frontend code, every session, no exceptions.

## Reference Images
If a reference image is provided: match layout, spacing, typography, and color exactly. Swap in placeholder content (images via https://placehold.co/, generic copy). Do not improve or add to the design.
If no reference image: design from scratch with high craft (see guardrails below).
Screenshot your output, compare against reference, fix mismatches, re-screenshot. Do at least 2 comparison rounds. Stop only when no visible differences remain or user says so.

## Hard Rules
- Mobile-first. 390px is primary. Scale up, never down.
- Server components by default. 'use client' only for state/browser APIs.
- Accent: #FF4D4D. Background: #FAFAFA. Font: Geist.
- No stars, ratings, or review UI. Ever.
- Bottom tab nav only. No hamburger menus.
- Tailwind only. No inline styles.

## Env Variables
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=   ← use this (not ANON_KEY)

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
/scripts/db/                 — migration, restore, and backup SQL scripts

## Data Model (Supabase)

### Tables
- `countries` — id (uuid), name (text), code (char 2)
- `cities` — id (uuid), name (text), country_id (uuid FK)
- `places` — id, name, city (text legacy), city_id (uuid FK), neighbourhood, description,
             thumbnail_url, taste_tags[], intent_tags[], moment_tags[],
             tiktok_url, google_maps_url, active

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

## localStorage Keys
- `vibe_bookmarks` — JSON array of bookmarked place IDs
- `vibe-index-city` — selected city ID string (or absent = Explore Everywhere)

## Screens
/ → Home, discover and filter (city + tags)
/place/[id] → Place detail
/saved → Bookmarked places

## Non-Goals (never build these)
Reviews, ratings, booking, payments, auth, social graph,
itinerary building, vendor onboarding

## Session Log
Session 1: [x] Scaffold + Supabase + all screens working
Session 2: [x] Tag filtering working end-to-end
Session 2+: [x] Multi-city migration — countries/cities tables, places_with_location view,
                CitySelector, HomeClient rewrite, TagFilter refactor, PlaceCard city/flag display,
                detail page location string, saved page getSavedPlaces, scripts/db/
Session 3: [ ] PWA config + mobile polish
Session 4: [ ] Vercel deploy + production testing

## Documentation
Update files in docs folder after major milestones and updates to the project.
