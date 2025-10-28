import { test, expect } from '@playwright/test';

test.describe('Sticky Sidebar Visual Test', () => {
  test('visual verification of sticky behavior', async ({ page }) => {
    await page.goto('http://localhost:3001');
    await page.waitForSelector('[data-testid="sidebar-subcategories"]');

    // Take initial screenshot
    await page.screenshot({
      path: 'test-results/sticky-01-initial.png',
      fullPage: false
    });

    // Scroll down 500px
    await page.evaluate(() => window.scrollBy(0, 500));
    await page.waitForTimeout(300);
    await page.screenshot({
      path: 'test-results/sticky-02-scroll-500.png',
      fullPage: false
    });

    // Scroll down 1000px total
    await page.evaluate(() => window.scrollBy(0, 500));
    await page.waitForTimeout(300);
    await page.screenshot({
      path: 'test-results/sticky-03-scroll-1000.png',
      fullPage: false
    });

    // Scroll down 1500px total
    await page.evaluate(() => window.scrollBy(0, 500));
    await page.waitForTimeout(300);
    await page.screenshot({
      path: 'test-results/sticky-04-scroll-1500.png',
      fullPage: false
    });

    // Scroll down 2000px total
    await page.evaluate(() => window.scrollBy(0, 500));
    await page.waitForTimeout(300);
    await page.screenshot({
      path: 'test-results/sticky-05-scroll-2000.png',
      fullPage: false
    });

    const sidebar = page.locator('[data-testid="sidebar-subcategories"]');
    const rect = await sidebar.boundingBox();
    console.log('Final sidebar position:', rect);
  });
});
