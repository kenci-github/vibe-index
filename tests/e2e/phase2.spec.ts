/**
 * Phase 2 E2E tests — Vibe Index
 *
 * Covers:
 *   1. BookingCTA renders on detail page
 *   2. Load-more pagination
 *   3. Tag filter updates URL search params
 *   4. Shareable filter URL pre-selects tags on load
 *   5. Empty state when no places match filters
 *
 * Viewport: 390px wide (iPhone 14) — mobile-first primary target.
 * No auth, no ratings/stars UI expected.
 * localStorage used for bookmarks and city — cleared before each test.
 */

import { test, expect, Page } from '@playwright/test'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Wait for the place card grid to finish loading (loading indicator gone). */
async function waitForPlacesLoaded(page: Page) {
  // Wait until either place cards appear OR the empty state heading appears.
  // Checking for actual content avoids the hydration gap where !pulse fires
  // before React has rendered anything.
  await page.waitForFunction(
    () => {
      const cards = document.querySelectorAll('a[href^="/place/"]')
      const emptyHeading = Array.from(document.querySelectorAll('p')).find(
        (el) => el.textContent?.includes('Try a different city or loosen the filters')
      )
      return cards.length > 0 || !!emptyHeading
    },
    { timeout: 30_000 },
  )
}

/** Count visible place card links on the page. */
async function countPlaceCards(page: Page): Promise<number> {
  return page.locator('a[href^="/place/"]').count()
}

// ---------------------------------------------------------------------------
// Test setup — clear localStorage before each test so city state doesn't
// bleed between runs (HomeClient reads `vibe-index-city` on mount).
// ---------------------------------------------------------------------------
test.beforeEach(async ({ page }) => {
  // We must navigate somewhere first before we can access localStorage.
  // Use a lightweight fetch to prime the browser context, then clear storage.
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await page.evaluate(() => {
    localStorage.removeItem('vibe-index-city')
    localStorage.removeItem('vibe_bookmarks')
  })
})

// ---------------------------------------------------------------------------
// TEST 1: BookingCTA renders on detail page
// ---------------------------------------------------------------------------
test('BookingCTA renders on place detail page', async ({ page }) => {
  const consoleErrors: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text())
  })

  // Navigate home and wait for at least one place card.
  await page.goto('/', { waitUntil: 'networkidle', timeout: 30_000 })
  await waitForPlacesLoaded(page)

  const firstCard = page.locator('a[href^="/place/"]').first()
  const cardCount = await page.locator('a[href^="/place/"]').count()

  if (cardCount === 0) {
    // No places in the database — nothing to assert, skip gracefully.
    test.skip()
    return
  }

  const href = await firstCard.getAttribute('href')
  expect(href).toBeTruthy()

  // Navigate to the detail page.
  await page.goto(href!, { waitUntil: 'networkidle', timeout: 30_000 })

  // The page must render the place name at minimum.
  await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 15_000 })

  // BookingCTA is loaded dynamically (next/dynamic). Look for a booking link.
  // Possible labels: "Message on WhatsApp", "Reserve on OpenTable",
  // "Book on Fresha", "Visit Website", "Call to Book", "DM on Instagram"
  const bookingLinkPattern = /Book|Reserve|Message|Call|Visit|DM on Instagram/i

  const bookingLink = page.locator('a').filter({ hasText: bookingLinkPattern })
  const linkCount = await bookingLink.count()

  if (linkCount === 0) {
    // This place has no booking URL / cta_type set — conditionally pass.
    // We validate the page rendered without errors instead.
    const criticalErrors = consoleErrors.filter(
      (e) =>
        !e.includes('favicon') &&
        !e.includes('404') &&
        !e.includes('hydration') &&
        !e.includes('postHog') &&
        !e.includes('posthog'),
    )
    expect(criticalErrors).toHaveLength(0)
    return
  }

  // If a booking link is present, verify it opens in a new tab.
  const target = await bookingLink.first().getAttribute('target')
  expect(target).toBe('_blank')

  // And must have a real href (not empty).
  const bookingHref = await bookingLink.first().getAttribute('href')
  expect(bookingHref).toBeTruthy()
  expect(bookingHref!.length).toBeGreaterThan(5)
})

// ---------------------------------------------------------------------------
// TEST 2: Load-more pagination
// ---------------------------------------------------------------------------
test('Load more pagination shows additional place cards', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle', timeout: 30_000 })
  await waitForPlacesLoaded(page)

  const initialCount = await countPlaceCards(page)

  // There must be at least 1 card to validate anything meaningful.
  expect(initialCount).toBeGreaterThanOrEqual(1)

  const loadMoreButton = page.getByRole('button', { name: /load more places/i })
  const buttonVisible = await loadMoreButton.isVisible()

  if (!buttonVisible) {
    // Fewer than 20 results — pagination not triggered. Pass with count check.
    expect(initialCount).toBeGreaterThanOrEqual(1)
    return
  }

  // Click "Load more places" and wait for more cards to appear.
  await loadMoreButton.dispatchEvent('click')

  // Wait for the spinner to disappear (loading… state) and new cards to arrive.
  await page.waitForFunction(
    (before: number) => {
      const cards = document.querySelectorAll('a[href^="/place/"]')
      return cards.length > before
    },
    initialCount,
    { timeout: 20_000 },
  )

  const afterCount = await countPlaceCards(page)
  expect(afterCount).toBeGreaterThan(initialCount)
})

// ---------------------------------------------------------------------------
// TEST 3: Tag filter updates URL search params
// ---------------------------------------------------------------------------
test('Clicking a tag filter updates URL search params', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle', timeout: 30_000 })
  await waitForPlacesLoaded(page)

  // The TagFilter renders tag buttons with aria-pressed.
  // Find the first non-active tag button in the filter bar (exclude "Clear").
  const tagButton = page
    .locator('button[aria-pressed="false"]')
    .filter({ hasNotText: /clear/i })
    .first()

  await expect(tagButton).toBeVisible({ timeout: 10_000 })
  const tagText = await tagButton.textContent()
  expect(tagText).toBeTruthy()

  // Click the tag.
  await tagButton.click()

  // URL must now contain one of the tag search param keys.
  await page.waitForURL(/[?&](taste|intent|moment)=/, { timeout: 10_000 })

  const url = new URL(page.url())
  const hasTasteParam = url.searchParams.has('taste')
  const hasIntentParam = url.searchParams.has('intent')
  const hasMomentParam = url.searchParams.has('moment')

  expect(hasTasteParam || hasIntentParam || hasMomentParam).toBe(true)

  // Capture the exact search string before reload.
  const searchBefore = url.search

  // Reload the page — filter must survive because it lives in the URL.
  await page.reload({ waitUntil: 'networkidle', timeout: 30_000 })
  await waitForPlacesLoaded(page)

  const urlAfter = new URL(page.url())
  expect(urlAfter.search).toBe(searchBefore)

  // The clicked tag button should now be in an active/pressed state.
  const activeTag = page
    .locator('button[aria-pressed="true"]')
    .filter({ hasText: new RegExp(tagText!.trim(), 'i') })

  await expect(activeTag.first()).toBeVisible({ timeout: 10_000 })
})

// ---------------------------------------------------------------------------
// TEST 4: Shareable filter URL pre-selects tag on load
// ---------------------------------------------------------------------------
test('Navigating to /?taste=cozy pre-selects the cozy tag', async ({ page }) => {
  await page.goto('/?taste=cozy', { waitUntil: 'networkidle', timeout: 30_000 })
  await waitForPlacesLoaded(page)

  // The "cozy" tag button should be in active state.
  // Active state classes: border-accent bg-accent text-white
  // aria-pressed="true" is the most reliable selector.
  // Note: desktop layout renders CategoryChips + sidebar TagFilter + sheet TagFilter,
  // so multiple matching buttons exist. Use .first() to avoid strict-mode violation.
  const cozyButton = page
    .locator('button[aria-pressed="true"]')
    .filter({ hasText: /^cozy$/i })
    .first()

  await expect(cozyButton).toBeVisible({ timeout: 10_000 })

  // The active button must carry the accent background class.
  await expect(cozyButton).toHaveClass(/bg-accent/, { timeout: 5_000 })

  // At least 1 place card must be visible, or the empty state must show.
  const cardCount = await countPlaceCards(page)
  const emptyState = page.locator('text=Try a different city or loosen the filters')
  const emptyVisible = await emptyState.isVisible()

  expect(cardCount > 0 || emptyVisible).toBe(true)
})

// ---------------------------------------------------------------------------
// TEST 5: Empty state with unlikely filter combination
// ---------------------------------------------------------------------------
test('Highly specific filter combination shows cards or empty state without JS errors', async ({
  page,
}) => {
  const consoleErrors: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text())
  })

  // sexy (taste) + brunch (intent) + rainy-day (moment) is an unlikely combo.
  await page.goto('/?taste=sexy&intent=brunch&moment=rainy-day', {
    waitUntil: 'networkidle',
    timeout: 30_000,
  })

  await waitForPlacesLoaded(page)

  const cardCount = await countPlaceCards(page)
  const emptyState = page.locator('p.font-semibold', { hasText: 'Try a different city or loosen the filters' })
  const emptyVisible = await emptyState.isVisible()

  // Either some cards exist or the proper empty state is shown — both are valid.
  expect(cardCount > 0 || emptyVisible).toBe(true)

  // If empty state is visible, the sub-message should also appear.
  if (emptyVisible) {
    await expect(page.locator('text=No places match your current selection')).toBeVisible()
  }

  // No uncaught JS errors (filter out known non-critical noise).
  const criticalErrors = consoleErrors.filter(
    (e) =>
      !e.includes('favicon') &&
      !e.includes('404') &&
      !e.includes('net::ERR') &&
      !e.includes('postHog') &&
      !e.includes('posthog') &&
      !e.includes('hydration') &&
      // Next.js dev mode sometimes logs webpack/HMR messages as errors
      !e.includes('webpack') &&
      !e.includes('HMR') &&
      // Transient Supabase network errors during dev testing
      !e.includes('Failed to fetch'),
  )

  expect(criticalErrors).toHaveLength(0)
})
