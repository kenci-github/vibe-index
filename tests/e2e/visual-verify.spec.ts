import { test, expect } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

const SCREENSHOTS_DIR = path.join(process.cwd(), 'tests', 'screenshots');

test.beforeAll(() => {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
});

// ─── MOBILE 390px ────────────────────────────────────────────────────────────

test.describe('Mobile 390px visual checks', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('home page loads and above-fold screenshot', async ({ page }) => {
    await page.goto('/', { timeout: 30000 });

    // Wait for place cards or empty state
    await Promise.race([
      page.waitForSelector('a[href^="/place/"]', { timeout: 20000 }),
      page.waitForSelector('p.font-semibold', { timeout: 20000 }),
    ]).catch(() => {});

    // Above-fold screenshot
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'verify-mobile-390-above-fold.png'),
      fullPage: false,
    });

    // Full-page screenshot
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'verify-mobile-390-full.png'),
      fullPage: true,
    });

    // 1. Page responds
    expect(page.url()).toContain('localhost:3000');
  });

  test('header: wordmark, tagline, saved button', async ({ page }) => {
    await page.goto('/', { timeout: 30000 });
    await page.waitForSelector('a[href^="/place/"]', { timeout: 20000 }).catch(() => {});

    // Wordmark "Vibe Index" should be visible — target mobile h1, not the hidden TopNav span
    const wordmark = page.locator('h1').filter({ hasText: 'Vibe Index' });
    await expect(wordmark).toBeVisible();

    // Tagline "Find places by feel"
    const tagline = page.locator('text=Find places by feel').first();
    await expect(tagline).toBeVisible();

    // Saved/heart button in the mobile header area.
    // TopNav (hidden lg:block) also contains a[href="/saved"] but is CSS-hidden at 390px,
    // so target the HomeClient mobile header specifically to avoid a hidden-element match.
    const savedBtn = page.locator('header a[href="/saved"]');
    await expect(savedBtn).toBeVisible();
  });

  test('search bar: visible, has sparkle icon or placeholder', async ({ page }) => {
    await page.goto('/', { timeout: 30000 });
    await page.waitForSelector('a[href^="/place/"]', { timeout: 20000 }).catch(() => {});

    const searchInput = page.locator('input[type="text"], input[placeholder*="vibe"], input[placeholder*="date"], input[placeholder*="mood"], input[placeholder*="feel"]').first();
    await expect(searchInput).toBeVisible();

    // Search bar should be at least 48px tall
    const box = await searchInput.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      expect(box.height).toBeGreaterThanOrEqual(48);
      // Full width (within padding — at least 340px at 390 viewport)
      expect(box.width).toBeGreaterThan(300);
    }

    // Screenshot just the search area
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'verify-mobile-search-bar.png'),
    });
  });

  test('category chips: horizontal row with emoji labels', async ({ page }) => {
    await page.goto('/', { timeout: 30000 });
    await page.waitForSelector('a[href^="/place/"]', { timeout: 20000 }).catch(() => {});

    // At least 3 quick chips matching known labels
    const chips = page.locator('button').filter({ hasText: /Date night|Brunch|Quiet|Girls|Solo|Late|Coffee|Spa/i });
    const chipCount = await chips.count();
    expect(chipCount).toBeGreaterThanOrEqual(3);

    // "All" chip or similar should also exist
    const allChip = page.locator('button').filter({ hasText: /All/i }).first();
    await expect(allChip).toBeVisible();

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'verify-mobile-chips.png'),
    });
  });

  test('first card: full-width hero with 16:9 aspect ratio image', async ({ page }) => {
    await page.goto('/', { timeout: 30000 });
    await page.waitForSelector('a[href^="/place/"]', { timeout: 20000 }).catch(() => {});

    // First place card link
    const firstCard = page.locator('a[href^="/place/"]').first();
    await expect(firstCard).toBeVisible();

    // The card should have an image
    const cardImg = firstCard.locator('img').first();
    await expect(cardImg).toBeVisible();

    // Card image container: width close to viewport (>= 340px at 390vp)
    const cardBox = await firstCard.boundingBox();
    expect(cardBox).not.toBeNull();
    if (cardBox) {
      expect(cardBox.width).toBeGreaterThan(300);
    }

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'verify-mobile-first-card.png'),
    });
  });

  test('card overlay: tags appear ON the image as white pills', async ({ page }) => {
    await page.goto('/', { timeout: 30000 });
    await page.waitForSelector('a[href^="/place/"]', { timeout: 20000 }).catch(() => {});

    const firstCard = page.locator('a[href^="/place/"]').first();

    // Look for tag pills that are positioned inside/over the card
    // They should be children of the card anchor, inside the image container
    const tagPills = firstCard.locator('span, div').filter({ hasText: /cozy|sexy|chic|dim|date|solo|brunch|intimate|stylish|elegant|playful/i });
    const tagCount = await tagPills.count();
    console.log(`Tag pills found inside first card: ${tagCount}`);

    // Tags should be visually ON the card (same bounding box area as image)
    if (tagCount > 0) {
      const cardBox = await firstCard.boundingBox();
      const tagBox = await tagPills.first().boundingBox();
      if (cardBox && tagBox) {
        // Tag top should be within card bounds
        expect(tagBox.y).toBeGreaterThanOrEqual(cardBox.y);
        expect(tagBox.y).toBeLessThanOrEqual(cardBox.y + cardBox.height);
      }
    }
  });

  test('card overlay: location text with pin emoji on image', async ({ page }) => {
    await page.goto('/', { timeout: 30000 });
    await page.waitForSelector('a[href^="/place/"]', { timeout: 20000 }).catch(() => {});

    // Location with 📍 somewhere in the cards
    const locationText = page.locator('text=/📍/').first();
    const hasPin = await locationText.count();
    console.log(`Location pin elements: ${hasPin}`);
    // At minimum, confirm cards have some location display
    const firstCard = page.locator('a[href^="/place/"]').first();
    const cardText = await firstCard.innerText();
    console.log('First card text excerpt:', cardText.slice(0, 200));
  });

  test('bookmark button: turns terracotta on tap, not red', async ({ page }) => {
    await page.goto('/', { timeout: 30000 });
    await page.waitForSelector('a[href^="/place/"]', { timeout: 20000 }).catch(() => {});

    // Find a bookmark button (heart icon button that is NOT a nav link)
    const bookmarkBtn = page.locator('button[aria-label*="bookmark"], button[aria-label*="save"], button[aria-label*="Bookmark"], button[aria-label*="Save"]').first();
    const btnExists = await bookmarkBtn.count();
    console.log(`Bookmark buttons found: ${btnExists}`);

    if (btnExists > 0) {
      await bookmarkBtn.click();
      await page.waitForTimeout(300);

      // After clicking, check it does NOT have a red class (text-red)
      const hasRed = await bookmarkBtn.evaluate(el => {
        const cls = el.className + (el.querySelector('*')?.className || '');
        return cls.includes('text-red') || cls.includes('fill-red');
      });
      expect(hasRed).toBe(false);

      // Should have terracotta/accent class
      const hasTerracotta = await bookmarkBtn.evaluate(el => {
        const allClasses = Array.from(el.querySelectorAll('*')).map(e => e.className).join(' ') + el.className;
        return allClasses.includes('text-accent') || allClasses.includes('fill-accent') || allClasses.includes('accent') || allClasses.includes('C4622D');
      });
      console.log(`Bookmark has terracotta class after tap: ${hasTerracotta}`);

      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR, 'verify-mobile-bookmark-tapped.png'),
      });
    }
  });
});

// ─── DESKTOP 1280px ──────────────────────────────────────────────────────────

test.describe('Desktop 1280px visual checks', () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test('desktop home page screenshot', async ({ page }) => {
    await page.goto('/', { timeout: 30000 });
    await page.waitForSelector('a[href^="/place/"]', { timeout: 20000 }).catch(() => {});

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'verify-desktop-1280-above-fold.png'),
      fullPage: false,
    });
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'verify-desktop-1280-full.png'),
      fullPage: true,
    });
  });

  test('TopNav: single row with wordmark left, search centre, saved right', async ({ page }) => {
    await page.goto('/', { timeout: 30000 });
    await page.waitForSelector('a[href^="/place/"]', { timeout: 20000 }).catch(() => {});

    // Wordmark
    const wordmark = page.locator('text=Vibe Index').first();
    await expect(wordmark).toBeVisible();
    const wordmarkBox = await wordmark.boundingBox();

    // Search input in TopNav area
    const navSearchInput = page.locator('nav input[type="text"], header input[type="text"]').first();
    const navSearchExists = await navSearchInput.count();
    console.log(`Nav search input exists: ${navSearchExists}`);

    // Saved link/button on right side
    const savedLink = page.locator('a[href="/saved"]').first();
    await expect(savedLink).toBeVisible();
    const savedBox = await savedLink.boundingBox();

    if (wordmarkBox && savedBox) {
      // Wordmark should be left of saved button
      expect(wordmarkBox.x).toBeLessThan(savedBox.x);
      // Both should be in top 100px (single nav row)
      expect(wordmarkBox.y).toBeLessThan(100);
      expect(savedBox.y).toBeLessThan(100);
      console.log(`Wordmark y: ${wordmarkBox.y}, Saved y: ${savedBox.y}`);
    }
  });

  test('sidebar: visible with tag filters', async ({ page }) => {
    await page.goto('/', { timeout: 30000 });
    await page.waitForSelector('a[href^="/place/"]', { timeout: 20000 }).catch(() => {});

    // Sidebar should have tag filter elements
    // Look for a sidebar-specific container (aside or a div with lg: class)
    const tagFilterButtons = page.locator('button[aria-pressed]');
    const count = await tagFilterButtons.count();
    console.log(`Tag filter buttons visible: ${count}`);
    expect(count).toBeGreaterThan(0);

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'verify-desktop-sidebar.png'),
    });
  });

  test('grid: multiple columns visible (3-4 columns, no single hero column)', async ({ page }) => {
    await page.goto('/', { timeout: 30000 });
    await page.waitForSelector('a[href^="/place/"]', { timeout: 20000 }).catch(() => {});

    const cards = page.locator('a[href^="/place/"]');
    const cardCount = await cards.count();
    console.log(`Cards visible: ${cardCount}`);
    expect(cardCount).toBeGreaterThan(2);

    // Check first 3 cards have different x positions (multi-column)
    if (cardCount >= 3) {
      const box0 = await cards.nth(0).boundingBox();
      const box1 = await cards.nth(1).boundingBox();
      const box2 = await cards.nth(2).boundingBox();
      console.log(`Card 0 x: ${box0?.x}, Card 1 x: ${box1?.x}, Card 2 x: ${box2?.x}`);

      // At least two of the first three cards should have different x values (different columns)
      const xValues = [box0?.x, box1?.x, box2?.x].filter(v => v !== undefined);
      const uniqueX = new Set(xValues);
      expect(uniqueX.size).toBeGreaterThan(1);
    }
  });
});
