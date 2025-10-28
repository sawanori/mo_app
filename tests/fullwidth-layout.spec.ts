import { test, expect, devices } from '@playwright/test';

/**
 * Full-width layout test for mobile devices
 * Tests that all pages display content edge-to-edge without side margins
 */

// Configure for mobile viewport
test.use({
  ...devices['iPhone 12'],
  // iPhone 12 dimensions: 390x844
});

test.describe('Full-width layout on mobile', () => {

  test.beforeEach(async ({ page }) => {
    // Start from the home page
    await page.goto('http://localhost:3000');
    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');
  });

  test('Home page - Body should be full width', async ({ page }) => {
    // Get viewport width
    const viewportSize = page.viewportSize();
    expect(viewportSize).not.toBeNull();
    const viewportWidth = viewportSize!.width;

    // Check body width
    const bodyWidth = await page.evaluate(() => {
      return document.body.offsetWidth;
    });

    console.log(`Viewport width: ${viewportWidth}px, Body width: ${bodyWidth}px`);

    // Body should be equal to viewport width (no horizontal margins)
    expect(bodyWidth).toBe(viewportWidth);
  });

  test('Home page - Navigation should be full width', async ({ page }) => {
    const viewportWidth = page.viewportSize()!.width;

    // Find navigation element
    const nav = page.locator('nav').first();
    await expect(nav).toBeVisible();

    // Get navigation width
    const navBox = await nav.boundingBox();
    expect(navBox).not.toBeNull();

    console.log(`Navigation width: ${navBox!.width}px, Viewport: ${viewportWidth}px`);

    // Navigation should be full width (allowing 1px tolerance for rounding)
    expect(Math.abs(navBox!.width - viewportWidth)).toBeLessThanOrEqual(1);

    // Navigation should start at x=0 (left edge)
    expect(navBox!.x).toBe(0);
  });

  test('Home page - Hero section should be full width', async ({ page }) => {
    const viewportWidth = page.viewportSize()!.width;

    // Wait for hero section to load
    await page.waitForSelector('[data-testid="hero-carousel"], .hero-section, .embla', {
      timeout: 5000
    }).catch(() => {
      console.log('Hero section not found with standard selectors, trying alternative...');
    });

    // Try to find carousel container
    const heroSection = page.locator('.embla, [data-testid="hero-carousel"]').first();

    if (await heroSection.count() > 0) {
      const heroBox = await heroSection.boundingBox();

      if (heroBox) {
        console.log(`Hero section width: ${heroBox.width}px, Viewport: ${viewportWidth}px`);

        // Hero section should be full width
        expect(Math.abs(heroBox.width - viewportWidth)).toBeLessThanOrEqual(1);

        // Should start at x=0
        expect(heroBox.x).toBe(0);
      }
    } else {
      console.log('Hero section not found, skipping width check');
    }
  });

  test('Home page - Main container should not have max-width constraint', async ({ page }) => {
    // Check that there's no container with max-width limiting the content
    const hasMaxWidthContainer = await page.evaluate(() => {
      const elements = document.querySelectorAll('[class*="max-w"], [class*="container"]');

      for (const el of elements) {
        const styles = window.getComputedStyle(el);
        const maxWidth = styles.maxWidth;

        // Check if max-width is set to a specific pixel/rem value (not 100% or none)
        if (maxWidth && maxWidth !== 'none' && !maxWidth.includes('100%')) {
          const maxWidthPx = parseFloat(maxWidth);
          // If max-width is less than viewport, it's constraining
          if (maxWidthPx < window.innerWidth) {
            return {
              found: true,
              element: el.className,
              maxWidth: maxWidth
            };
          }
        }
      }

      return { found: false };
    });

    console.log('Max-width container check:', hasMaxWidthContainer);

    // We don't want constraining max-width on mobile
    expect(hasMaxWidthContainer.found).toBe(false);
  });

  test('Home page - Content should not have horizontal padding beyond minimal', async ({ page }) => {
    const viewportWidth = page.viewportSize()!.width;

    // Check main content container padding
    const mainContent = page.locator('main, [role="main"], .flex.flex-col').first();

    if (await mainContent.count() > 0) {
      const padding = await mainContent.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return {
          left: parseFloat(styles.paddingLeft),
          right: parseFloat(styles.paddingRight),
          total: parseFloat(styles.paddingLeft) + parseFloat(styles.paddingRight)
        };
      });

      console.log(`Content padding: ${padding.total}px (left: ${padding.left}px, right: ${padding.right}px)`);

      // Total horizontal padding should be minimal (≤ 24px for px-3 on both sides)
      expect(padding.total).toBeLessThanOrEqual(24);
    }
  });

  test('Cart page - Should be full width', async ({ page }) => {
    await page.goto('http://localhost:3000/cart');
    await page.waitForLoadState('networkidle');

    const viewportWidth = page.viewportSize()!.width;
    const bodyWidth = await page.evaluate(() => document.body.offsetWidth);

    console.log(`Cart page - Viewport: ${viewportWidth}px, Body: ${bodyWidth}px`);
    expect(bodyWidth).toBe(viewportWidth);

    // Check for constraining containers
    const hasConstraint = await page.evaluate(() => {
      const containers = document.querySelectorAll('.container, [class*="max-w-md"], [class*="max-w-4xl"]');
      return containers.length > 0;
    });

    // Should not have constraining containers
    expect(hasConstraint).toBe(false);
  });

  test('Payment page - Should be full width', async ({ page }) => {
    await page.goto('http://localhost:3000/payment');
    await page.waitForLoadState('networkidle');

    const viewportWidth = page.viewportSize()!.width;
    const bodyWidth = await page.evaluate(() => document.body.offsetWidth);

    console.log(`Payment page - Viewport: ${viewportWidth}px, Body: ${bodyWidth}px`);
    expect(bodyWidth).toBe(viewportWidth);
  });

  test('Order history page - Should be full width', async ({ page }) => {
    await page.goto('http://localhost:3000/order-history');
    await page.waitForLoadState('networkidle');

    const viewportWidth = page.viewportSize()!.width;
    const bodyWidth = await page.evaluate(() => document.body.offsetWidth);

    console.log(`Order history - Viewport: ${viewportWidth}px, Body: ${bodyWidth}px`);
    expect(bodyWidth).toBe(viewportWidth);
  });

  test('Account page - Should be full width', async ({ page }) => {
    await page.goto('http://localhost:3000/account');
    await page.waitForLoadState('networkidle');

    const viewportWidth = page.viewportSize()!.width;
    const bodyWidth = await page.evaluate(() => document.body.offsetWidth);

    console.log(`Account page - Viewport: ${viewportWidth}px, Body: ${bodyWidth}px`);
    expect(bodyWidth).toBe(viewportWidth);
  });

  test('Visual regression - No horizontal scrollbar', async ({ page }) => {
    // Check all main pages for horizontal scrollbar
    const pages = [
      '/',
      '/cart',
      '/payment',
      '/order-history',
      '/account'
    ];

    for (const path of pages) {
      await page.goto(`http://localhost:3000${path}`);
      await page.waitForLoadState('networkidle');

      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });

      console.log(`${path} - Has horizontal scroll: ${hasHorizontalScroll}`);
      expect(hasHorizontalScroll).toBe(false);
    }
  });

  test('Landscape orientation - Should maintain full width', async ({ page }) => {
    // Rotate to landscape (swap width and height)
    await page.setViewportSize({ width: 844, height: 390 });
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');

    const viewportWidth = 844;
    const bodyWidth = await page.evaluate(() => document.body.offsetWidth);

    console.log(`Landscape - Viewport: ${viewportWidth}px, Body: ${bodyWidth}px`);
    expect(bodyWidth).toBe(viewportWidth);
  });
});

test.describe('Visual comparison - Before/After', () => {

  test('Take screenshots of all pages for visual verification', async ({ page }) => {
    // Use iPhone 12 viewport
    await page.setViewportSize(devices['iPhone 12'].viewport);
    const pages = [
      { path: '/', name: 'home' },
      { path: '/cart', name: 'cart' },
      { path: '/payment', name: 'payment' },
      { path: '/order-history', name: 'order-history' },
      { path: '/account', name: 'account' },
    ];

    for (const { path, name } of pages) {
      await page.goto(`http://localhost:3000${path}`);
      await page.waitForLoadState('networkidle');

      // Wait a bit for any animations
      await page.waitForTimeout(500);

      await page.screenshot({
        path: `tests/screenshots/${name}-fullwidth.png`,
        fullPage: true
      });

      console.log(`Screenshot saved: ${name}-fullwidth.png`);
    }
  });
});
