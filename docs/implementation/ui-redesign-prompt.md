# Vibe Index — UI/UX Redesign Prompt
## For Claude Code · Uses frontend-design skill · Iterates with Playwright

---

## BEFORE YOU WRITE A SINGLE LINE OF CODE

Read `/mnt/skills/public/frontend-design/SKILL.md` in full.
Internalize the design thinking framework before proceeding.
This is not optional — the skill contains critical aesthetic guidance.

---

## DESIGN BRIEF

You are redesigning the Vibe Index mobile app — a place discovery product
that sits between TikTok and Google Maps. Users search by vibe, intent and
moment rather than category. Think: "dim cocktails for a second date tonight"
not "bar + London."

**The audience:** Style-conscious, experience-driven people aged 22–38.
They use TikTok for discovery but want something with taste and structure.
They appreciate quality, curation, and products that respect their intelligence.

**The tone to hit:** Editorial luxury meets street culture.
Think a high-end magazine that also has a nightlife section.
Confident. Considered. Slightly cinematic.

---

## DESIGN INSPIRATION: AIRBNB (LOOSE)

Do NOT copy Airbnb. Borrow what makes it feel premium:

- **Card quality:** Full-bleed photography, generous image ratios, no visual clutter
- **Typography hierarchy:** Clear distinction between display text and body — one does the heavy lifting, the other gets out of the way
- **Whitespace as a design element:** Breathing room makes things feel curated not crammed
- **Micro-interactions:** Subtle hover states, smooth transitions — the UI responds to you
- **Trust signals:** Location, neighbourhood, small details that say "someone thought about this"
- **The search bar:** Airbnb's search is an invitation, not a utility. It has presence.

Then diverge — Vibe Index is more editorial, more nocturnal, more cultural.
Airbnb is holidays. Vibe Index is tonight.

---

## WHAT IS WRONG WITH THE CURRENT UI

Study the current screenshot and components. These are the specific problems to solve:

1. **The grid is too uniform** — two equal columns of identical card sizes creates a
   catalogue feel, not a discovery feel. It looks like a database, not a curated edit.

2. **Cards lack visual hierarchy** — name, location, description, and tags all fight for
   attention at the same weight. Nothing pulls the eye first.

3. **The search bar disappears** — it is styled like a utility input, not the hero element
   of the product. It should command the screen.

4. **Colour has no identity** — `#FF4D4D` accent is used sparingly but the overall palette
   is grey-on-white with no warmth, depth, or personality.

5. **Typography is generic** — Geist is clean but characterless for a discovery product.
   There is no display font doing editorial work.

6. **The header is too small** — "Vibe." as a tiny bold text does not establish the brand.

7. **Tags look like UI debris** — the small grey badge pills at the bottom of cards feel
   like metadata, not the defining feature of the product.

8. **No sense of atmosphere** — the current design could be any app. It has no mood.
   A discovery app about vibes should itself have a vibe.

---

## DESIGN DIRECTION TO PURSUE

**Aesthetic:** Warm editorial dark-light hybrid. Think: off-white paper stock with
rich dark accents. Not full dark mode. Not bright white. Something in between —
cream/warm white backgrounds, near-black text, one vivid accent.

**Colour palette — choose from this direction, do not copy exactly:**
- Background: warm off-white (`#FAF9F7` or similar — not pure white)
- Primary text: near-black with warmth (`#1A1814` or similar)
- Accent: a single vivid colour that feels editorial — deep terracotta, rich amber,
  or electric coral. NOT generic red, NOT purple. It should feel like a magazine
  pull quote colour. You decide — commit to it.
- Surface cards: pure white with subtle shadow, creating lift off the warm background
- Secondary text: warm mid-grey, not cold grey

**Typography — select a pairing, do not use Geist or Inter:**
- Display/headings: something with character — a serif with modernity (e.g. Playfair Display,
  Cormorant Garamond, DM Serif Display) OR a distinctive grotesque (e.g. Syne, Cabinet
  Grotesk, Clash Display). It must feel editorial.
- Body/UI: a clean, refined sans-serif that does not compete (e.g. DM Sans, Plus Jakarta Sans,
  Instrument Sans). Available via Google Fonts — add to `app/layout.tsx`.

**Card layout — break the uniform grid:**
Use a mixed editorial grid rather than two equal columns:
- First card in each section: full-width hero card (aspect ratio 16/9 or wider)
  with large overlaid typography
- Remaining cards: two-column grid with taller aspect ratio (3/4)
- Every 5th card: a wide accent card that breaks the rhythm
This creates the feeling of a curated editorial spread, not a product catalogue.

**PlaceCard redesign — specific requirements:**
- Image takes up at least 65% of the card visually
- Place name: large, bold, uses the display font, overlaid on image bottom
- Location line: small, warm grey, below the card (not on image)
- Tags: redesigned as small filled pills with the accent colour at low opacity
  (e.g. `bg-accent/10 text-accent`) — they should feel like mood indicators not metadata
- "Matched for" line in search mode: styled as a glowing accent line, not italic grey text
- Bookmark button: refined, minimal — outline heart that fills on save
- Featured badge: replace red pill with a subtle gold/amber ribbon or dot — "curated" not "featured"
- Hover state: slight scale up on image + shadow deepens (desktop)

**Search bar redesign — specific requirements:**
- Height: at least 52px — this is the hero element, give it presence
- Background: white with a warm shadow — it should lift off the page
- Border: none in default state, accent colour border on focus
- Placeholder text: styled in a lighter weight, italicised — it should read like an invitation
- Search icon: replaced with a small ✦ symbol or spark icon to match the brand
- The bar should feel like the opening line of a conversation, not a form field

**Quick chips redesign:**
- Larger, more generous padding — feel like tappable cards not small pills
- Subtle background tint that reflects the chip's mood (e.g. "Date night" gets a
  warm rose tint, "Late night" gets a deep charcoal tint)
- Selected state: filled with accent colour, white text
- Unselected: warm off-white background, warm grey text

**Header redesign:**
- "Vibe Index" wordmark — use the display font, larger, more presence
- Add a subtle tagline below on first load: "Find places by feel"
  in the body font, light weight, warm grey
- Bookmark icon: replaced with a more refined outlined heart or collection icon

**Interpretation strip (after search):**
- More visual presence — this is the moment the app "understands" the user
- Style as a soft accent-tinted banner: `bg-accent/8` with accent text
- The ✦ symbol before the interpretation text
- Result count as a small pill badge, not plain text

**Empty states:**
- Replace the MapPin icon with something more evocative — a compass, a spark, a location dot
- Heading and body copy should feel human, not system-generated
- "No matches found" → "Nothing here yet for that vibe"
- "No places found" → "Try a different city or loosen the filters"

---
## REVIEW
Discuss the grid approach before implementing.
---

## FILES TO MODIFY

Redesign these files. Preserve all existing logic, state management, props,
and data fetching exactly. Only change visual/styling code:

1. **`components/places/PlaceCard.tsx`** — full redesign per card spec above
2. **`components/HomeClient.tsx`** — layout structure, header, grid layout, empty states
3. **`app/layout.tsx`** — add new Google Fonts, update CSS variables for new palette
4. **`app/globals.css`** — update colour tokens, add any new utility classes needed

Also redesign these screens to match the new system:
5. **`app/place/[id]/page.tsx`** — detail page: hero image full-width, tags redesigned,
   BookingCTA styled to match new accent, related places strip
6. **`app/saved/page.tsx`** — saved places: same card system, city grouping headers
   styled with display font
7. **`app/submit/page.tsx`** — submission form: inputs styled to match new design system,
   consistent with the editorial aesthetic

Do NOT change:
- Any TypeScript types
- Any data fetching logic
- Any Supabase queries
- Any API routes
- CLAUDE.md

---

## IMPLEMENTATION STEPS

**Step 1 — Design token decisions (do this first, before any code)**

State your design decisions explicitly before writing code:
- Chosen accent colour + hex value + reasoning
- Chosen display font + why it fits the brief
- Chosen body font + pairing rationale
- One sentence describing the overall aesthetic direction

**Step 2 — Global tokens**

Update `app/globals.css` and `app/layout.tsx`:
- Set new CSS custom properties: `--accent`, `--background`, `--foreground`,
  `--surface`, `--muted`, `--muted-foreground`
- Add Google Fonts import with correct weights
- Update Tailwind config if needed for new font families

**Step 3 — PlaceCard.tsx**

Redesign the card component per the spec above.
After writing the code, describe what the card will look like in one sentence.

**Step 4 — HomeClient.tsx**

Redesign the layout:
- Header with new wordmark and tagline
- Search bar with new styling
- Quick chips with mood tints
- Mixed editorial grid (full-width hero + two-column)
- Redesigned empty states

**Step 5 — Detail, Saved, Submit pages**

Apply the design system consistently across all remaining screens.

**Step 6 — Screenshot and self-review**

Take a screenshot of the running app at `http://localhost:3000`.
Review against the design brief. Identify any of these failure modes:
- Does it still look like a generic app? → Fix typography first
- Does the grid feel like a catalogue? → Adjust card sizing
- Does the search bar feel like a utility? → Increase size and presence
- Are the tags still debris? → Redesign pill styling
- Is the colour palette warm or is it still cold grey? → Check background and surface colours

---

## ITERATION LOOP WITH PLAYWRIGHT

After completing Step 6, run the following visual regression checks using Playwright.
Fix any failures before considering the redesign complete.

**Install if not already present:**
```
npx playwright install chromium
```

**Create `tests/e2e/design-check.spec.ts`:**

```typescript
import { test, expect } from '@playwright/test'

const BASE = 'http://localhost:3000'

test.use({ viewport: { width: 390, height: 844 } }) // iPhone 14 viewport

test('home feed renders with new design system', async ({ page }) => {
  await page.goto(BASE)
  await page.waitForLoadState('networkidle')

  // Screenshot for manual review
  await page.screenshot({ path: 'tests/screenshots/home-feed.png', fullPage: true })

  // Search bar has presence — tall enough
  const searchInput = page.locator('input[type="text"], input[placeholder*="vibe"], input[placeholder*="date"], input[placeholder*="mood"]').first()
  await expect(searchInput).toBeVisible()
  const inputBox = await searchInput.boundingBox()
  expect(inputBox?.height).toBeGreaterThan(48) // minimum 48px height

  // Place cards are visible
  const cards = page.locator('a[href*="/place/"]')
  await expect(cards.first()).toBeVisible()

  // First card should be wider (hero card) — wider than half the viewport
  const firstCard = await cards.first().boundingBox()
  expect(firstCard?.width).toBeGreaterThan(300) // hero card wider than half of 390px viewport
})

test('place cards have image and text overlay', async ({ page }) => {
  await page.goto(BASE)
  await page.waitForLoadState('networkidle')

  const firstCard = page.locator('a[href*="/place/"]').first()
  await expect(firstCard).toBeVisible()

  // Image is present
  const img = firstCard.locator('img').first()
  await expect(img).toBeVisible()

  // Place name is visible on or below card
  const cardText = await firstCard.textContent()
  expect(cardText?.length).toBeGreaterThan(3)
})

test('quick chips are visible and tappable', async ({ page }) => {
  await page.goto(BASE)
  await page.waitForLoadState('networkidle')
  await page.screenshot({ path: 'tests/screenshots/quick-chips.png' })

  // At least 3 chips visible
  const chips = page.locator('button').filter({ hasText: /Date night|Brunch|Quiet|Girls|Solo|Late|Coffee|Spa/i })
  expect(await chips.count()).toBeGreaterThanOrEqual(3)
})

test('search returns results with interpretation strip', async ({ page }) => {
  await page.goto(BASE)
  await page.waitForLoadState('networkidle')

  const searchInput = page.locator('input').first()
  await searchInput.click()
  await searchInput.fill('cozy date night drinks')
  await searchInput.press('Enter')
  await page.waitForTimeout(2000)

  await page.screenshot({ path: 'tests/screenshots/search-results.png' })

  // Interpretation strip visible
  const strip = page.locator('text=/Showing results|Matched|✦/i').first()
  await expect(strip).toBeVisible()

  // Results visible
  const results = page.locator('a[href*="/place/"]')
  expect(await results.count()).toBeGreaterThan(0)
})

test('place detail page uses new design system', async ({ page }) => {
  await page.goto(BASE)
  await page.waitForLoadState('networkidle')

  // Click first place card
  const firstCard = page.locator('a[href*="/place/"]').first()
  const href = await firstCard.getAttribute('href')
  await page.goto(BASE + href)
  await page.waitForLoadState('networkidle')
  await page.screenshot({ path: 'tests/screenshots/place-detail.png', fullPage: true })

  // Place name visible
  const heading = page.locator('h1, [class*="font-bold"], [class*="display"]').first()
  await expect(heading).toBeVisible()
})

test('saved page uses new design system', async ({ page }) => {
  await page.goto(`${BASE}/saved`)
  await page.waitForLoadState('networkidle')
  await page.screenshot({ path: 'tests/screenshots/saved-page.png', fullPage: true })
  // Page loads without error
  await expect(page.locator('body')).toBeVisible()
})

test('submit page uses new design system', async ({ page }) => {
  await page.goto(`${BASE}/submit`)
  await page.waitForLoadState('networkidle')
  await page.screenshot({ path: 'tests/screenshots/submit-page.png', fullPage: true })
  // Form inputs visible and styled
  const inputs = page.locator('input, textarea, select')
  expect(await inputs.count()).toBeGreaterThan(2)
})
```

**Run the tests:**
```
mkdir -p tests/screenshots
npx playwright test tests/e2e/design-check.spec.ts --reporter=list
```

**After running, review the screenshots in `tests/screenshots/`.**
For each screenshot, assess against these criteria:

| Check | Pass condition |
|---|---|
| Typography | Display font visible in headings/wordmark |
| Colour | Warm background tone (not pure white), vivid accent present |
| Search bar | Tall, prominent, clearly the hero element |
| Cards | Mixed grid — at least one full-width card visible |
| Tags | Accent-tinted pills, not grey outline badges |
| Overall | Feels editorial and considered, not generic |

**If any check fails, fix the specific issue and re-run the screenshot test.**
Do not move on until all 6 criteria pass visually.

---

## DESIGN QUALITY BAR

The redesign is complete when:

1. A new user opening the app for the first time understands it is a curated
   discovery product, not a generic listing app — within 2 seconds
2. The search bar invites them to type, not instructs them to search
3. The card grid feels like browsing a magazine spread, not scanning a spreadsheet
4. The colour palette has warmth and identity — someone could describe it in
   one word ("warm", "editorial", "cinematic")
5. All 7 Playwright screenshot tests pass and the screenshots confirm the above
6. `tsc --noEmit` passes with zero errors
7. `next build` completes successfully

---

## FINAL STEP — UPDATE CLAUDE.md

After the redesign passes all checks, update `CLAUDE.md`:

```
## Design System (Redesigned — Session [N])
Accent: [chosen hex] — [colour name]
Background: [chosen hex] — warm off-white
Foreground: [chosen hex] — warm near-black
Display font: [chosen font] — headings, wordmark, card titles
Body font: [chosen font] — UI, labels, descriptions
Card grid: mixed editorial layout — hero card (full-width) + two-column grid
Tag pills: bg-accent/10 text-accent (filled low-opacity, not outline)
Search bar: min-height 52px, white surface, accent border on focus
```

Replace the old:
```
Accent: #FF4D4D. Background: #FAFAFA. Font: Geist.
```
