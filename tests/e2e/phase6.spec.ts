import { test, expect } from '@playwright/test'

// ─── Real data from Supabase ─────────────────────────────────────────────────
// Bar Tausend (Berlin) — category: 'drink', featured: true → always first in feed
const DRINK_PLACE_ID = '0cdc7ae9-215c-448c-949e-0d470c1bd9ba'
const DRINK_PLACE_NAME = 'Bar Tausend'

// ─── Helpers ──────────────────────────────────────────────────────────────────
async function waitForFeedLoaded(page: import('@playwright/test').Page) {
  await page.waitForSelector('a[href^="/place/"]', { timeout: 25_000 })
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION A — Category filter (browse mode)
// ─────────────────────────────────────────────────────────────────────────────

// ─── TEST A1: Category label on place cards ───────────────────────────────────
test('category label shows on place cards in filtered feed', async ({ page }) => {
  await page.goto('/?category=drink')
  await waitForFeedLoaded(page)

  const cards = page.locator('a[href^="/place/"]')
  await expect(cards.first()).toBeVisible()

  // Non-hero cards (index 1+) show the category label below them.
  // The label renders as "{emoji} {label}" e.g. "🍸 Drinks".
  await expect(page.getByText('🍸 Drinks').first()).toBeVisible({ timeout: 10_000 })
})

// ─── TEST A2: Category pill on place detail page ──────────────────────────────
test('category pill visible on place detail page', async ({ page }) => {
  await page.goto(`/place/${DRINK_PLACE_ID}`)
  await expect(page.getByRole('heading', { name: DRINK_PLACE_NAME })).toBeVisible({ timeout: 10_000 })
  await expect(page.getByText('🍸 Drinks').first()).toBeVisible()
})

// ─── TEST A3: "See more" link on detail page ──────────────────────────────────
test('"See more Drinks places" link navigates to category-filtered feed', async ({ page }) => {
  await page.goto(`/place/${DRINK_PLACE_ID}`)
  await expect(page.getByRole('heading', { name: DRINK_PLACE_NAME })).toBeVisible({ timeout: 10_000 })

  const seeMoreLink = page.getByRole('link', { name: /see more drinks places/i })
  await expect(seeMoreLink).toBeVisible()

  await seeMoreLink.dispatchEvent('click')
  await page.waitForURL(/\?category=drink/, { timeout: 8_000 })
  await waitForFeedLoaded(page)
  expect(await page.locator('a[href^="/place/"]').count()).toBeGreaterThan(0)
})

// ─── TEST A4: ?category URL param filters the feed ────────────────────────────
test('?category=drink URL param filters feed to drink places only', async ({ page }) => {
  await page.goto('/?category=drink')
  await waitForFeedLoaded(page)

  const cards = page.locator('a[href^="/place/"]')
  expect(await cards.count()).toBeGreaterThan(0)

  // Featured drink place (Bar Tausend) always sorts first
  const href = await cards.first().getAttribute('href')
  expect(href).toBe(`/place/${DRINK_PLACE_ID}`)
})

// ─── TEST A5: Category + taste tag combined ───────────────────────────────────
test('?category=drink&taste=sexy combined filter shows results or empty state', async ({ page }) => {
  const consoleErrors: string[] = []
  page.on('console', (msg) => {
    if (
      msg.type() === 'error' &&
      !msg.text().includes('favicon') &&
      !msg.text().includes('404') &&
      !msg.text().includes('posthog')
    ) {
      consoleErrors.push(msg.text())
    }
  })

  await page.goto('/?category=drink&taste=sexy')
  await page.waitForSelector(
    'a[href^="/place/"], :text("No places match your current selection")',
    { timeout: 15_000 }
  )

  const cards = page.locator('a[href^="/place/"]')
  const hasCards = (await cards.count()) > 0
  const hasEmpty = await page.getByText(/No places match your current selection/i).isVisible().catch(() => false)
  expect(hasCards || hasEmpty).toBe(true)

  await page.waitForTimeout(500)
  expect(consoleErrors).toHaveLength(0)
})

// ─────────────────────────────────────────────────────────────────────────────
// SECTION B — Search-first layout (Phase 6 revised)
// ─────────────────────────────────────────────────────────────────────────────

// ─── TEST B1: Search bar renders as first interactive element ─────────────────
test('search bar is visible near top with correct placeholder', async ({ page }) => {
  await page.goto('/')
  await waitForFeedLoaded(page)

  const searchInput = page.locator('input[placeholder*="dim cocktails"]').first().first()
  await expect(searchInput).toBeVisible({ timeout: 8_000 })

  // Input is near the top — its bounding box Y should be small
  const box = await searchInput.boundingBox()
  expect(box).not.toBeNull()
  expect(box!.y).toBeLessThan(250)
})

// ─── TEST B2: CategoryChips row is visible below search ───────────────────────
test('CategoryChips row renders below search with chips', async ({ page }) => {
  await page.goto('/')
  await waitForFeedLoaded(page)

  // Chips have aria-pressed (toggleable buttons)
  const chips = page.locator('button[aria-pressed]')
  await expect(chips.first()).toBeVisible({ timeout: 8_000 })
  expect(await chips.count()).toBeGreaterThan(3)

  // Specific chip labels are present
  await expect(page.getByRole('button', { name: /date night/i }).first()).toBeVisible()
  await expect(page.getByRole('button', { name: /brunch/i }).first()).toBeVisible()
})

// ─── TEST B3: Chip tap updates URL params and filters feed ────────────────────
test('clicking Date night chip sets ?intent=date URL param', async ({ page }) => {
  await page.goto('/')
  await waitForFeedLoaded(page)

  const dateChip = page.getByRole('button', { name: /date night/i }).first()
  await expect(dateChip).toBeVisible()
  await dateChip.click()

  // URL should update to include intent=date
  await page.waitForURL(/intent=date/, { timeout: 8_000 })

  // Feed re-loads with filtered results (or empty state)
  await page.waitForSelector(
    'a[href^="/place/"], :text("No places match")',
    { timeout: 15_000 }
  )
})

// ─── TEST B4: Search returns results with interpretation strip ────────────────
test('natural language search returns results and shows interpretation strip', async ({ page }) => {
  await page.goto('/')
  await waitForFeedLoaded(page)

  const searchInput = page.locator('input[placeholder*="dim cocktails"]').first()
  await searchInput.click()
  await searchInput.fill('cozy date night drinks')
  await searchInput.press('Enter')

  // Loading state appears
  await expect(page.getByText(/finding your vibe/i)).toBeVisible({ timeout: 5_000 })

  // Wait for results
  await waitForFeedLoaded(page)

  // InterpretationStrip renders — target the one that contains ✦
  const strip = page.locator('[aria-live="polite"]').filter({ hasText: '✦' }).first()
  await expect(strip).toBeVisible({ timeout: 10_000 })
  await expect(strip).toContainText('✦')

  // Results count badge is visible inside strip
  await expect(strip.locator('span').first()).toBeVisible()
})

// ─── TEST B5: CategoryChips hidden in search mode ────────────────────────────
test('CategoryChips are hidden while in search mode', async ({ page }) => {
  await page.goto('/')
  await waitForFeedLoaded(page)

  // Chips visible before search
  const dateChip = page.getByRole('button', { name: /date night/i }).first()
  await expect(dateChip).toBeVisible()

  // Trigger search
  const searchInput = page.locator('input[placeholder*="dim cocktails"]').first()
  await searchInput.fill('cozy date night')
  await searchInput.press('Enter')
  await waitForFeedLoaded(page)

  // After search: chips should be hidden
  await expect(dateChip).not.toBeVisible({ timeout: 5_000 })
})

// ─── TEST B6: Clear search restores browse mode ───────────────────────────────
test('clearing search via interpretation strip restores browse mode', async ({ page }) => {
  await page.goto('/')
  await waitForFeedLoaded(page)

  // Run a search
  const searchInput = page.locator('input[placeholder*="dim cocktails"]').first()
  await searchInput.fill('cozy date night')
  await searchInput.press('Enter')
  await waitForFeedLoaded(page)

  // InterpretationStrip is visible — target specifically the one with ✦
  const strip = page.locator('[aria-live="polite"]').filter({ hasText: '✦' }).first()
  await expect(strip).toBeVisible({ timeout: 10_000 })

  // Click Clear button on the strip
  const clearBtn = strip.getByRole('button', { name: /clear/i })
  await clearBtn.click()

  // Strip is gone
  await expect(strip).not.toBeVisible({ timeout: 5_000 })

  // Chips are back
  await expect(page.getByRole('button', { name: /date night/i }).first()).toBeVisible()

  // Search input is cleared
  await expect(searchInput).toHaveValue('')
})

// ─── TEST B7: "Matched for:" line on cards in search mode ────────────────────
test('"Matched for:" reason line appears on cards in search mode', async ({ page }) => {
  await page.goto('/')
  await waitForFeedLoaded(page)

  const searchInput = page.locator('input[placeholder*="dim cocktails"]').first()
  await searchInput.fill('intimate dim date night')
  await searchInput.press('Enter')
  await waitForFeedLoaded(page)

  // At least one card should show the ✦ Matched for: line
  const matchLine = page.locator('text=/Matched for:/').first()
  await expect(matchLine).toBeVisible({ timeout: 10_000 })
})

// ─── TEST B8: No JS errors during search flow ─────────────────────────────────
test('search flow produces no console errors', async ({ page }) => {
  const consoleErrors: string[] = []
  page.on('console', (msg) => {
    if (
      msg.type() === 'error' &&
      !msg.text().includes('favicon') &&
      !msg.text().includes('404') &&
      !msg.text().includes('posthog')
    ) {
      consoleErrors.push(msg.text())
    }
  })

  await page.goto('/')
  await waitForFeedLoaded(page)

  const searchInput = page.locator('input[placeholder*="dim cocktails"]').first()
  await searchInput.fill('spa wellness solo')
  await searchInput.press('Enter')
  await waitForFeedLoaded(page)

  // Clear via X button on search input
  const clearX = page.getByRole('button', { name: /clear search/i })
  await clearX.click()

  await page.waitForTimeout(500)
  expect(consoleErrors).toHaveLength(0)
})
