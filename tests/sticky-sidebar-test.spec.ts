import { test, expect } from '@playwright/test';

test.describe('Sticky Sidebar', () => {
  test('should investigate sticky behavior', async ({ page }) => {
    // Navigate to the page
    await page.goto('http://localhost:3001');

    // Wait for the page to load
    await page.waitForSelector('[data-testid="sidebar-subcategories"]');

    // Get sidebar element (the aside itself should be sticky now)
    const sidebar = page.locator('[data-testid="sidebar-subcategories"]');

    // Get initial state
    const initialRect = await sidebar.boundingBox();
    const initialScrollY = await page.evaluate(() => window.scrollY);
    console.log('Initial state:');
    console.log('  - Sidebar Y:', initialRect?.y);
    console.log('  - Window scrollY:', initialScrollY);

    // Check if the sidebar (aside) has position: sticky
    const computedPosition = await sidebar.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        position: style.position,
        top: style.top,
        className: el.className,
      };
    });
    console.log('  - Sidebar computed style:', computedPosition);

    // Check parent elements for overflow
    const parentOverflow = await sidebar.evaluate((el) => {
      const parents = [];
      let current = el.parentElement;
      let level = 0;
      while (current && level < 5) {
        const style = window.getComputedStyle(current);
        parents.push({
          tag: current.tagName,
          overflow: style.overflow,
          overflowY: style.overflowY,
          overflowX: style.overflowX,
          position: style.position,
          className: current.className,
        });
        current = current.parentElement;
        level++;
      }
      return parents;
    });
    console.log('  - Parent elements overflow:', JSON.stringify(parentOverflow, null, 2));

    // Scroll down to bring sidebar to top (need to scroll past initial Y position)
    console.log('\n--- Scrolling to bring sidebar to viewport top ---');
    const scrollAmount = initialRect ? initialRect.y : 1346;
    await page.evaluate((amount) => window.scrollTo(0, amount), scrollAmount);
    await page.waitForTimeout(300);

    // Get state after scroll
    const afterScrollRect = await sidebar.boundingBox();
    const afterScrollY = await page.evaluate(() => window.scrollY);
    console.log(`\nAfter scrolling to ${scrollAmount}px:`);
    console.log('  - Sidebar Y:', afterScrollRect?.y);
    console.log('  - Window scrollY:', afterScrollY);
    console.log('  - Y position change:', afterScrollRect && initialRect ? afterScrollRect.y - initialRect.y : 'N/A');

    // Check if sidebar has sticky class
    const isStickyClass = await sidebar.evaluate((el) => {
      return el.className.includes('sticky');
    });
    console.log('  - Has sticky class:', isStickyClass);

    // Take screenshot after first scroll
    await page.screenshot({
      path: 'test-results/sticky-debug-1.png',
      fullPage: false
    });

    // Continue scrolling more
    console.log('\n--- Continue scrolling 500px more ---');
    await page.evaluate(() => window.scrollBy(0, 500));
    await page.waitForTimeout(300);

    const finalRect = await sidebar.boundingBox();
    const finalScrollY = await page.evaluate(() => window.scrollY);
    console.log('\nAfter additional 500px scroll:');
    console.log('  - Sidebar Y:', finalRect?.y);
    console.log('  - Window scrollY:', finalScrollY);

    // Take final screenshot
    await page.screenshot({
      path: 'test-results/sticky-debug-2.png',
      fullPage: false
    });

    // Verify sticky is working: sidebar should stay at top (Y near 0)
    if (finalRect) {
      console.log('\n✓ Expected: Sidebar Y should be near 0 (at viewport top)');
      console.log(`✓ Actual: Sidebar Y = ${finalRect.y}`);
    }
  });
});
