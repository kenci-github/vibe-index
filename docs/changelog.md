# Changelog — Vibe Index

## Session 1 — Scaffold (2026-03-01)

### Added
- Next.js 15 App Router project with TypeScript, Tailwind CSS, Geist font
- `lib/supabase.ts` — Supabase client using publishable key with anon key fallback
- `lib/types.ts` — `Place` TypeScript interface matching Supabase schema
- `lib/tags.ts` — `TASTE_TAGS`, `INTENT_TAGS`, `MOMENT_TAGS` constants and `TAG_GROUPS`
- `lib/bookmarks.ts` — `getBookmarkIds`, `isBookmarked`, `toggleBookmark` via localStorage
- `lib/utils.ts` — `cn()` utility (clsx + tailwind-merge)
- `components/BottomNav.tsx` — fixed bottom nav with Discover and Saved tabs
- `components/TagFilter.tsx` — horizontally scrollable tag pill bar, grouped by category
- `components/PlaceCard.tsx` — place card with thumbnail, name, neighbourhood, tags
- `components/BookmarkButton.tsx` — client-side bookmark toggle persisted to localStorage
- `components/HomeClient.tsx` — client wrapper syncing tag selection to URL search params
- `components/ShareButton.tsx` — uses `navigator.share` or clipboard fallback
- `components/ui/badge.tsx`, `components/ui/button.tsx` — shadcn UI primitives
- `app/page.tsx` — home page, server-rendered, Supabase fetch filtered by tags
- `app/place/[id]/page.tsx` — place detail page with hero image, tags, action links
- `app/saved/page.tsx` — saved places page, client-rendered from localStorage + Supabase
- `app/not-found.tsx` — global 404 page

### Fixed
- Added `autoprefixer` to devDependencies (PostCSS config referenced it but it wasn't installed)
- `searchParams` and `params` typed as `Promise<{...}>` for Next.js 15 compatibility
- Tag filtering now routes each tag to its correct enum column only, preventing
  Postgres `22P02` enum type errors when e.g. a taste tag is matched against `intent_tags`

---

## Session 2 — Tag Filtering End-to-End (2026-03-01)

### Added
- `TagFilter`: "✕ Clear" pill button appears at the left of the filter strip when ≥1 tag is active — one tap resets all filters
- `HomeClient`: result count line ("X places" / "X places for cozy, date") between filter strip and grid
- `HomeClient`: `handleClear` callback navigates to `/` inside `startTransition`

### Fixed
- `TagFilter`: replaced `style={{ width: 'max-content' }}` inline style with Tailwind `w-max` (satisfies "Tailwind only" hard rule)
- `TagFilter`: added `aria-pressed={active}` to pill buttons for screen reader state
- `HomeClient`: single `transition-opacity` wrapper now covers TagFilter + count + grid (previously only TagFilter dimmed during pending navigation)
- `HomeClient`: `transition-opacity` always present as base class so fade-in transition fires on restore as well as on pending

---

## Planned

- **Session 3** — Place detail refinements, bookmark count, share improvements
- **Session 4** — PWA manifest, offline support, mobile polish
- **Session 5** — Vercel deploy, production environment, smoke testing
