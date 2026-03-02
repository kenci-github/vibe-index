# Architecture — Vibe Index

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 App Router + TypeScript |
| Styling | Tailwind CSS + shadcn/ui primitives |
| Database | Supabase (PostgreSQL) — read-only via publishable key |
| Bookmarks | `localStorage` — no auth, anonymous |
| Hosting | Vercel (planned) |
| Font | Geist (via `geist` npm package) |

---

## Directory Structure

```
app/
  layout.tsx          Root layout — Geist font, BottomNav, max-w-md container
  globals.css         Tailwind base + shadcn CSS vars + scrollbar-none utility
  page.tsx            Home — server component, fetches filtered places
  not-found.tsx       Global 404 page
  place/[id]/
    page.tsx          Place detail — server component, fetches single place
  saved/
    page.tsx          Saved — client component, reads localStorage → Supabase

components/
  BottomNav.tsx       Fixed bottom nav (Discover / Saved), usePathname
  BookmarkButton.tsx  Client toggle, reads/writes localStorage
  HomeClient.tsx      Client wrapper — TagFilter + PlaceCard grid, URL param sync
  PlaceCard.tsx       Server component — thumbnail, name, tags, BookmarkButton
  ShareButton.tsx     Client — navigator.share or clipboard copy
  TagFilter.tsx       Client — horizontal pill scroller, grouped by category
  ui/
    badge.tsx         shadcn Badge primitive
    button.tsx        shadcn Button primitive

lib/
  bookmarks.ts        getBookmarkIds / isBookmarked / toggleBookmark
  supabase.ts         Supabase client (publishable key with anon key fallback)
  tags.ts             TASTE_TAGS, INTENT_TAGS, MOMENT_TAGS, TAG_GROUPS constants
  types.ts            Place interface
  utils.ts            cn() (clsx + tailwind-merge)
```

---

## Rendering Pattern

```
User visits /
└── app/page.tsx (Server Component)
    ├── reads searchParams.tags (awaited — Next.js 15 requirement)
    ├── calls getPlaces(activeTags) → Supabase query
    └── renders <HomeClient places={...} activeTags={...} />
            wrapped in <Suspense> (required for useSearchParams)

User clicks tag pill
└── HomeClient.handleToggle
    ├── builds new tag list
    └── router.push("/?tags=cozy,date")
        └── triggers server re-render → new getPlaces() call

User clicks PlaceCard
└── app/place/[id]/page.tsx (Server Component)
    ├── awaits params.id (Next.js 15 requirement)
    ├── calls getPlace(id) → Supabase .single()
    └── renders hero image, tags, action links
```

---

## Tag Filtering

Tags are split across three Postgres enum-typed columns. Passing a taste tag
(e.g. "sexy") to `intent_tags.ov.{}` causes a `22P02` enum error.

The `getPlaces` function in `app/page.tsx` routes each selected tag to its
correct column only:

```ts
const taste  = tags.filter(t => TASTE_TAGS.includes(t))
const intent = tags.filter(t => INTENT_TAGS.includes(t))
const moment = tags.filter(t => MOMENT_TAGS.includes(t))

const conditions = []
if (taste.length)  conditions.push(`taste_tags.ov.{${taste.join(',')}}`)
if (intent.length) conditions.push(`intent_tags.ov.{${intent.join(',')}}`)
if (moment.length) conditions.push(`moment_tags.ov.{${moment.join(',')}}`)

query.or(conditions.join(','))
```

---

## Design Tokens

| Token | Value |
|-------|-------|
| Accent | `#FF4D4D` |
| Background | `#FAFAFA` |
| Primary breakpoint | 390px (mobile-first) |
| Max content width | `max-w-md` (448px) |
| Bottom nav height | 64px (`pb-16` on body) |

---

## Key Constraints

- No stars, ratings, or review UI — ever
- Bottom tab nav only (no hamburger)
- `'use client'` only where browser APIs or state are needed
- Tailwind only — no inline styles
- Supabase is read-only (anon key, no writes from frontend)
