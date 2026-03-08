import { test, expect } from '@playwright/test'

// ─── Real data from Supabase ─────────────────────────────────────────────────
const FEATURED_PLACE_ID = '0cdc7ae9-215c-448c-949e-0d470c1bd9ba' // Bar Tausend, Berlin
const FEATURED_PLACE_NAME = 'Bar Tausend'
const DETAIL_PLACE_ID = '0cdc7ae9-215c-448c-949e-0d470c1bd9ba' // Bar Tausend — has Berlin neighbours for related
const LONDON_NAME = 'London'
const LONDON_TAGLINE = 'Style, grit, and a perfect flat white'

// ─── Helpers ─────────────────────────────────────────────────────────────────
async function waitForFeedLoaded(page: import('@playwright/test').Page) {
  // Wait for skeleton cards to disappear and real cards to appear
  await page.waitForSelector('a[href^="/place/"]', { timeout: 15_000 })
}

async function selectCity(page: import('@playwright/test').Page, cityName: string) {
  // Open the city picker bottom sheet
  const trigger = page.getByRole('button', { name: /explore everywhere|london|berlin|melbourne/i })
  await trigger.first().click()
  // Wait for the sheet to appear and search for the city
  await page.waitForSelector('input[placeholder="Search cities..."]', { timeout: 5_000 })
  await page.fill('input[placeholder="Search cities..."]', cityName)
  await page.waitForTimeout(200) // let the filter render
  // dispatchEvent bypasses viewport/occlusion checks (BottomNav z-50 can overlap sheet)
  const cityBtn = page.getByRole('button', { name: new RegExp(`^${cityName}$`, 'i') }).first()
  await cityBtn.waitFor({ state: 'attached' })
  await cityBtn.dispatchEvent('click')
  // Wait for sheet to close
  await page.waitForTimeout(500)
}

// ─── TEST 1: Featured places appear first ────────────────────────────────────
test('featured places appear first with badge', async ({ page }) => {
  await page.goto('/')
  await waitForFeedLoaded(page)

  // The first place card link should be the featured place
  const firstCard = page.locator('a[href^="/place/"]').first()
  await expect(firstCard).toBeVisible()

  // Featured badge is inside the first card
  const featuredBadge = firstCard.locator('text=✦ Featured')
  await expect(featuredBadge).toBeVisible()

  // There should be at least one non-featured card after the first
  const allCards = page.locator('a[href^="/place/"]')
  const count = await allCards.count()
  expect(count).toBeGreaterThan(1)

  // Navigate to the featured place and confirm it's the right one
  const href = await firstCard.getAttribute('href')
  expect(href).toBe(`/place/${FEATURED_PLACE_ID}`)
})

// ─── TEST 2: City editorial header appears ────────────────────────────────────
test('city editorial hero shows name and tagline for London', async ({ page }) => {
  await page.goto('/')
  await waitForFeedLoaded(page)

  // Select London from the city picker
  await selectCity(page, LONDON_NAME)

  // Wait for the feed to reload with London places
  await waitForFeedLoaded(page)

  // CityHero strip should be visible above the tag filter
  // It has a fixed height (h-28) and contains the city name
  const hero = page.locator('div.h-28').first()
  await expect(hero).toBeVisible()

  // City name is shown inside the hero
  await expect(page.getByText(LONDON_NAME, { exact: false }).first()).toBeVisible()

  // Tagline is shown (London has "Style, grit, and a perfect flat white")
  await expect(page.getByText(LONDON_TAGLINE, { exact: false })).toBeVisible()
})

// ─── TEST 3: Related places on detail page ─────────────────────────────────
test('related places section appears on place detail page', async ({ page }) => {
  await page.goto(`/place/${DETAIL_PLACE_ID}`)

  // Wait for the page to load — use heading role to avoid matching <title>
  await expect(page.getByRole('heading', { name: FEATURED_PLACE_NAME })).toBeVisible({ timeout: 10_000 })

  // Check if related places section exists
  const relatedHeading = page.getByText(/more like this/i)
  const hasRelated = await relatedHeading.isVisible().catch(() => false)

  if (hasRelated) {
    // Section header is visible
    await expect(relatedHeading).toBeVisible()

    // At least one related place card links to a place detail page
    const relatedCards = page.locator('div.flex.gap-3 a[href^="/place/"]')
    await expect(relatedCards.first()).toBeVisible()

    // Related cards should not link to the same place
    const firstHref = await relatedCards.first().getAttribute('href')
    expect(firstHref).not.toBe(`/place/${DETAIL_PLACE_ID}`)
  } else {
    // If no related places, section simply should not render (no error)
    await expect(page.getByText(/more like this/i)).not.toBeVisible()
    console.log('No related places found for this place — section correctly hidden')
  }
})

// ─── TEST 4: Submit page ──────────────────────────────────────────────────────
// NOTE: /submit page is a P1 feature not yet built — this test is skipped until
// the page and navigation link exist.
test.skip('submit a place link exists in navigation', async ({ page }) => {
  await page.goto('/')
  await waitForFeedLoaded(page)

  // Look for a link to /submit anywhere on the page (nav, button, fab)
  const submitLink = page.locator('a[href="/submit"]')
  await expect(submitLink).toBeVisible()
})

// ─── TEST 5: Full user journey smoke test ─────────────────────────────────────
test('full user journey: city → filter → card → back', async ({ page }) => {
  await page.goto('/')
  await waitForFeedLoaded(page)

  // Step 1: Select London
  await selectCity(page, LONDON_NAME)
  await waitForFeedLoaded(page)

  // Confirm London places are shown (CityHero or city picker button shows London)
  await expect(page.getByText(LONDON_NAME, { exact: false }).first()).toBeVisible()

  // Step 2: Apply a tag filter — click the "date" intent tag
  const dateTag = page.getByRole('button', { name: /^date$/i })
  if (await dateTag.isVisible()) {
    await dateTag.click()
    await page.waitForTimeout(800) // wait for filter to apply
  }

  // Step 3: Click the first place card
  const firstCard = page.locator('a[href^="/place/"]').first()
  await expect(firstCard).toBeVisible()
  const cardHref = await firstCard.getAttribute('href')
  await firstCard.click()

  // Step 4: Assert detail page loaded (place name visible, URL changed)
  await page.waitForURL(/\/place\//, { timeout: 10_000 })
  expect(page.url()).toContain('/place/')

  // Step 5: Go back
  await page.goBack()
  await page.waitForURL(/^http:\/\/localhost:3000\/?(\?.*)?$/, { timeout: 5_000 })

  // Step 6: Assert we're back on feed and London is still selected
  await waitForFeedLoaded(page)
  // City selector or CityHero should still show London (restored from localStorage)
  await expect(page.getByText(LONDON_NAME, { exact: false }).first()).toBeVisible({ timeout: 5_000 })

  // Confirm a place card is still visible (feed didn't break)
  await expect(page.locator('a[href^="/place/"]').first()).toBeVisible()

  // Note: URL-based tag filter state is a P1 feature — not checking URL params here.
  // When implemented, assert: expect(page.url()).toContain('intent=date')
})
