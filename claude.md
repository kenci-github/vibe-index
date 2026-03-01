# CLAUDE.md — Vibe Index

## What This Is
Mobile-first web app for vibe-based place discovery. TikTok Discover meets
Airbnb Experiences. Users find places by mood/moment, not category.
UK-focused MVP, launching with London first.

## Stack
- Next.js 14 App Router + TypeScript
- Tailwind CSS + shadcn/ui
- Supabase (PostgreSQL) — places data, read-only via anon key
- localStorage — anonymous bookmarks, no auth
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
NEXT_PUBLIC_SUPABASE_ANON_KEY=

## Key Files
/lib/supabase.ts         — Supabase client
/lib/bookmarks.ts        — localStorage save/unsave/check
/components/PlaceCard.tsx    — main card component
/components/TagFilter.tsx    — horizontal scrollable tag bar
/components/BottomNav.tsx    — bottom tab navigation

## Data Model (Supabase — places table)
id, name, city, neighbourhood, description, thumbnail_url,
taste_tags[], intent_tags[], moment_tags[],
tiktok_url, google_maps_url, active

## Tag Enums
taste_tags: sexy, cozy, chic, loud, dim, kinetic, earthy, elegant, stylish, playful, intimate
intent_tags: date, solo, group, chill, brunch, spa, manicure, dessert, late-night
moment_tags: before-dinner, rainy-day, late-night, sunday-morning, after-shopping

## Screens
/ → Home, discover and filter
/place/[id] → Place detail
/saved → Bookmarked places

## Non-Goals (never build these)
Reviews, ratings, booking, payments, auth, social graph,
itinerary building, vendor onboarding

## Session Log
Session 1: [x] Scaffold + Supabase + all screens working
Session 2: [ ] Tag filtering working end-to-end
Session 3: [ ] Place detail + bookmarks complete
Session 4: [ ] PWA config + mobile polish
Session 5: [ ] Vercel deploy + production testing

## Documentation
update files in docs folder after major milestones and updates to the project 