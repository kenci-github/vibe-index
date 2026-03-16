# Vibe Index — Related Places Carousel + QuickChips Scroll Fix
## Two fixes in one prompt — run both together

---

## FIX 1 — QuickChips Horizontal Scroll (do this first)

### Diagnosis

The QuickChips component has the correct scroll CSS — `overflow-x-auto`,
`whitespace-nowrap`, `[&::-webkit-scrollbar]:hidden` — but the chips are
being cut off at the screen edge instead of scrolling.

The cause is the **parent container in `HomeClient.tsx`** which wraps
QuickChips inside a div that has either:
- `overflow-hidden` applied (clips the scroll region), or
- No explicit width constraint, causing the flex row to not expand beyond
  the viewport

There are also two defensive fixes needed inside `QuickChips.tsx` itself.

### Fix A — QuickChips.tsx (defensive hardening)

Open `components/filters/QuickChips.tsx` and make these changes:

1. Add `flex-nowrap` explicitly to the container — even though `whitespace-nowrap`
   is on the buttons, the flex container itself needs to be told not to wrap:
   Change: `className="flex gap-2 overflow-x-auto px-4 py-2 [&::-webkit-scrollbar]:hidden"`
   To:     `className="flex flex-nowrap gap-2 overflow-x-auto px-4 py-2 [&::-webkit-scrollbar]:hidden"`

2. Add `-mx-0` and ensure the container width is not being constrained.
   The container must be allowed to be wider than the viewport internally
   even though it only shows one viewport width at a time.

3. Add `shrink-0` to each button so chips cannot compress:
   Change: `className={\`whitespace-nowrap rounded-full...\`}`
   To:     `className={\`shrink-0 whitespace-nowrap rounded-full...\`}`

### Fix B — HomeClient.tsx (the root cause)

Open `components/HomeClient.tsx` and find where `<QuickChips>` is rendered.
Inspect the wrapper div around it.

Remove any `overflow-hidden` from that wrapper or any ancestor div that
wraps the QuickChips component. `overflow-hidden` on a parent kills the
child's ability to scroll horizontally.

If the wrapper div has classes like `overflow-hidden`, `overflow-x-hidden`,
or is inside a container with those classes, remove them.

The correct wrapper for QuickChips should be:
```tsx
{/* Quick chips — browse mode only */}
{!isSearchMode && (
  <div className="w-full">
    <QuickChips onChipSelect={(q) => { setSearchQuery(q); runSearch(q) }} />
  </div>
)}
```

No `overflow-hidden`, no `overflow-x-hidden`, no fixed height that could clip.

### Fix C — Verify the TagFilter has the same fix

The screenshot also shows the TagFilter row (`sexy · cozy · chic · loud...`)
is similarly cut off. Open `components/filters/TagFilter.tsx` and apply the
same pattern — confirm the scroll container has:
- `flex flex-nowrap` (not just `flex`)
- `overflow-x-auto`
- `[&::-webkit-scrollbar]:hidden`
- Each tag button has `shrink-0`

If any of these are missing, add them.

### Verify the QuickChips fix

Start the dev server and check:
- [ ] All 8 chips are accessible by swiping right
- [ ] No chips are cut off at the screen edge
- [ ] The row does not wrap onto a second line
- [ ] Swiping feels smooth with no visible scrollbar
- [ ] TagFilter row also scrolls correctly

---

## FIX 2 — Related Places Carousel Redesign

## CONTEXT

The related places section already exists in `app/place/[id]/page.tsx`.
Current implementation:
- Fixed `w-48` cards in `aspect-[3/4]`
- Basic `overflow-x-auto` horizontal scroll
- No scroll snap
- No peek effect
- Name overlaid on image only
- No neighbourhood or tag context

This prompt replaces that section with a polished Airbnb-style peek carousel.
Do NOT change anything else in the file — only the related places section.

---

## WHAT TO BUILD

### The Airbnb Peek Pattern

The defining characteristic: the next card is always **partially visible** on the
right edge of the screen. This signals "there is more" without arrows or dots.

```
|  Card 1 — full    |  Card 2 — 20% peeking  →
```

Achieved by:
- Container: `overflow-x-auto scroll-smooth` with `-mx-4 px-4`
- Each card: `min-w-[72vw]` on mobile — wide enough to fill most of the screen,
  narrow enough that the next card peeks in at ~20%
- Scroll snap: `scroll-snap-type: x mandatory` on container,
  `scroll-snap-align: start` on each card
- No visible scrollbar: `[&::-webkit-scrollbar]:hidden`
- Gap between cards: `gap-4` — generous, not tight

### Card Dimensions

Each related place card:
- Width: `min-w-[72vw]` — fills ~72% of viewport, peek is ~20% (accounting for gap)
- Aspect ratio: `aspect-[4/3]` — landscape, cinematic, different from the main feed
  cards which are portrait `aspect-[3/4]`. The landscape ratio makes this section
  feel like a different layer of discovery.
- Border radius: `rounded-2xl` — consistent with the rest of the app

### Card Content

Each card has two distinct zones:

**Zone 1 — Image (full bleed)**
- Full-bleed photography fills the card
- Gradient overlay: `bg-gradient-to-t from-black/75 via-black/20 to-transparent`
- On hover (desktop): image scales to `scale-105` with `duration-500`

**Zone 2 — Text overlay (bottom of image)**
- Place name: display font, `text-base font-bold text-white`, truncated to one line
- Neighbourhood + city: `text-xs text-white/65`, truncated
- Tag pills: 1–2 taste tags rendered as small pills directly on the image
  Style: `bg-white/15 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded-full`
  These float above the gradient at bottom-left, above the name
  Maximum 2 tags — do not overflow

**No text below the card** — unlike the main feed PlaceCard, everything lives
inside the image. This is intentional — the carousel is a visual tease, not
a full listing.

### Section Header

Replace the current heading with a two-part header:

Left side:
- Label: `MORE LIKE THIS` — `text-[10px] font-semibold uppercase tracking-widest text-warm-gray-mid`
- Heading: `in {place.city_name}` — display font, `text-xl font-bold text-foreground`
  Stacked, not inline

Right side:
- A subtle scroll hint: `text-xs text-warm-gray-mid` showing `→ swipe`
  Only visible when there are more than 2 related places
  Hidden on desktop (only meaningful on touch)

Header layout: `flex items-end justify-between mb-4`

### Fallback

If `related.length === 0`: render nothing (same as current — no empty state needed here).
If `related.length === 1`: render the single card without the peek pattern
(it would just sit alone — that's fine, no special handling needed).

---

## EXACT CODE CHANGES

Only modify the related places section in `app/place/[id]/page.tsx`.

Replace this block:
```tsx
{/* Related places */}
{related.length > 0 && (
  <div className="mt-8">
    <p className="mb-3 font-display text-xl font-semibold text-foreground">
      More like this in {place.city_name}
    </p>
    <div className="-mx-4 overflow-x-auto px-4">
      <div className="flex gap-3 pb-2">
        {related.map((r) => (
          <Link
            key={r.id}
            href={`/place/${r.id}`}
            className="w-48 flex-shrink-0 group block"
          >
            <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-stone-100">
              {r.thumbnail_url ? (
                <PlaceImage
                  src={r.thumbnail_url}
                  alt={r.name}
                  sizes="192px"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-stone-200 to-stone-300" />
              )}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-2 pt-6">
                <p className="truncate font-display text-xs font-semibold text-white">{r.name}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  </div>
)}
```

With this:
```tsx
{/* Related places — peek carousel */}
{related.length > 0 && (
  <div className="mt-10">
    {/* Section header */}
    <div className="flex items-end justify-between mb-4 px-0">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-warm-gray-mid">
          More like this
        </p>
        <p className="font-display text-xl font-bold text-foreground leading-tight">
          in {place.city_name}
        </p>
      </div>
      {related.length > 2 && (
        <p className="text-xs text-warm-gray-mid pb-0.5 sm:hidden">swipe →</p>
      )}
    </div>

    {/* Peek carousel */}
    <div
      className="-mx-4 overflow-x-auto [&::-webkit-scrollbar]:hidden scroll-smooth"
      style={{ scrollSnapType: 'x mandatory' }}
    >
      <div className="flex gap-4 px-4 pb-3">
        {related.map((r) => {
          const cardTags = (r.taste_tags ?? []).slice(0, 2)
          const cardLocation = r.neighbourhood
            ? `${r.neighbourhood} · ${r.city_name}`
            : r.city_name

          return (
            <Link
              key={r.id}
              href={`/place/${r.id}`}
              className="group block flex-shrink-0"
              style={{ minWidth: '72vw', scrollSnapAlign: 'start' }}
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-stone-100">
                {r.thumbnail_url ? (
                  <PlaceImage
                    src={r.thumbnail_url}
                    alt={r.name}
                    sizes="72vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-stone-200 to-stone-300" />
                )}

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

                {/* Tag pills — float above name */}
                {cardTags.length > 0 && (
                  <div className="absolute bottom-10 left-3 flex gap-1.5">
                    {cardTags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] text-white backdrop-blur-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Name + location */}
                <div className="absolute inset-x-0 bottom-0 p-3">
                  <p className="truncate font-display text-base font-bold text-white">
                    {r.name}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-white/65">
                    {cardLocation}
                  </p>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  </div>
)}
```

---

## AFTER IMPLEMENTING

**Step 1 — Type check:**
```
Run tsc --noEmit and confirm zero errors.
```

**Step 2 — Visual check:**
Start the dev server, navigate to any place detail page that has related places,
and take a screenshot. Verify:
- [ ] Cards are wide — taking up ~72% of the screen width
- [ ] The next card is peeking in from the right at ~20%
- [ ] Landscape `aspect-[4/3]` ratio — wider than tall
- [ ] Tag pills visible floating above the place name
- [ ] Gradient overlay makes text legible over any image
- [ ] Section header has two-line stacked treatment with "More like this" label above city name
- [ ] "swipe →" hint visible on mobile, hidden on desktop

**Step 3 — Scroll behaviour check:**
Swipe the carousel. Verify:
- [ ] Cards snap to position — they don't stop mid-card
- [ ] Scrolling is smooth, not janky
- [ ] No visible scrollbar

**Step 4 — Edge cases:**
Navigate to a place with only 1 related result. Verify the single card renders
correctly without the peek effect (it will just sit alone — that is correct).

Navigate to a place with 0 related results. Verify the section does not render at all.

---

## QUICKCHIPS HORIZONTAL SCROLL FIX

The quick chips row is cut off at the screen edge and does not scroll.
The QuickChips.tsx component itself is correctly written — `overflow-x-auto`
and `whitespace-nowrap` are both present on the buttons. The bug is in
HomeClient.tsx.

**Exact cause:**

The `<QuickChips />` component in `HomeClient.tsx` is wrapped inside a parent
`<div>` that has `px-4` padding (or `overflow-hidden`). This constrains the
scroll container to the padded inner width — chips that extend beyond that
boundary are clipped rather than scrolled to.

`overflow-x-auto` on a child is always defeated by a constrained or
`overflow-hidden` parent. The chip row needs to bleed to the full viewport width.

**Fix 1 — HomeClient.tsx (primary fix):**

Find the `<QuickChips />` usage in HomeClient.tsx. It will look something like:

```tsx
// LIKELY CURRENT — chips trapped inside a padded wrapper
<div className="px-4 ...">
  <QuickChips onChipSelect={...} />
</div>
```

Remove the wrapping `px-4` div around QuickChips entirely — or if other elements
share that wrapper, extract QuickChips out of it so it sits at the full
`flex flex-col` root level with no padding parent:

```tsx
// CORRECT — chips rendered at root level, no padding parent
<QuickChips onChipSelect={(q) => { setSearchQuery(q); runSearch(q) }} />
```

QuickChips already applies its own `px-4` internally on the scroll container,
so no padding is lost.

**Fix 2 — QuickChips.tsx (belt and braces):**

Add `flex-nowrap` explicitly to prevent any edge case wrapping, and extend the
scroll area to bleed past the screen edges with negative margin:

```tsx
// BEFORE
<div className="flex gap-2 overflow-x-auto px-4 py-2 [&::-webkit-scrollbar]:hidden">

// AFTER
<div className="flex flex-nowrap gap-2 overflow-x-auto px-4 py-2 [&::-webkit-scrollbar]:hidden">
```

The addition of `flex-nowrap` ensures chips never wrap to a second line under
any circumstance — the browser is forced to scroll instead.

**Fix 3 — Add right-edge fade hint:**

Add a fade on the right edge to signal that more chips exist off-screen.
This is the Airbnb category chip pattern. Update QuickChips.tsx:

```tsx
export default function QuickChips({ onChipSelect }: QuickChipsProps) {
  return (
    <div className="relative">
      {/* Right-edge scroll hint */}
      <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-background to-transparent z-10" />

      <div className="flex flex-nowrap gap-2 overflow-x-auto px-4 py-2 [&::-webkit-scrollbar]:hidden">
        {CHIPS.map(({ label, query, tint }) => (
          <button
            key={label}
            onClick={() => onChipSelect(query)}
            className={`whitespace-nowrap rounded-full border border-border px-4 py-2.5 text-sm font-medium text-warm-gray-mid transition-colors active:scale-95 active:bg-accent active:text-white active:border-accent ${tint ?? 'bg-background'}`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
```

**Verify the fix:**
- Swipe right — all 8 chips are reachable: Date night · Brunch · Quiet ·
  Girls' night · Solo reset · Late night · Coffee · Spa
- No chip is clipped at the right edge on load
- Right-edge gradient fade is visible
- Tapping any chip triggers a search
- `tsc --noEmit` passes with zero errors

---

## IF SCROLL SNAP ISN'T WORKING

Tailwind does not include `scroll-snap-type` and `scroll-snap-align` as standard
utility classes in all configurations. If the snap behaviour isn't working,
use inline styles as shown in the code above (`style={{ scrollSnapType: 'x mandatory' }}`
and `style={{ scrollSnapAlign: 'start' }}`). This is the one exception to the
no-inline-styles rule — CSS scroll snap properties require it when Tailwind
config doesn't include them.

Alternatively, add to `tailwind.config.ts`:
```ts
extend: {
  ...existing extensions...,
}
// and in the plugins or via arbitrary values in the className:
// [scroll-snap-type:x_mandatory] and [scroll-snap-align:start]
```

Using Tailwind arbitrary value syntax is also valid:
```tsx
className="[scroll-snap-type:x_mandatory]"  // on container
className="[scroll-snap-align:start]"        // on each card
```
Use whichever approach is consistent with the rest of the codebase.
