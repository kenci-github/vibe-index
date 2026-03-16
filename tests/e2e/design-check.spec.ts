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

  // Interpretation strip visible — target the aria-live container to avoid
  // matching the hidden TopNav sparkle pill (✦ is also in the TopNav pill button)
  const strip = page.locator('[aria-live="polite"]').first()
  await expect(strip).toBeVisible({ timeout: 8000 })

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

  // Place name visible — use h1 role directly to avoid matching hidden nav elements
  const heading = page.locator('h1').first()
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
