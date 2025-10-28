import { test } from '@playwright/test';

test('Check current sticky behavior', async ({ page }) => {
  await page.goto('http://localhost:3001');
  await page.waitForTimeout(2000); // Wait for data to load

  const sidebar = page.locator('[data-testid="sidebar-subcategories"]');

  // Initial state - before scrolling
  const initialRect = await sidebar.boundingBox();
  const initialScrollY = await page.evaluate(() => window.scrollY);

  console.log('\n=== INITIAL STATE ===');
  console.log('ScrollY:', initialScrollY);
  console.log('Sidebar top (Y):', initialRect?.y);
  console.log('Sidebar height:', initialRect?.height);

  // Take screenshot
  await page.screenshot({ path: 'test-results/check-01-initial.png' });

  // Scroll to bring sidebar top to viewport top
  const scrollToSidebarTop = initialRect ? initialRect.y : 1400;
  console.log('\n=== SCROLLING TO:', scrollToSidebarTop, 'px ===');
  await page.evaluate((amount) => window.scrollTo(0, amount), scrollToSidebarTop);
  await page.waitForTimeout(500);

  const afterScrollRect = await sidebar.boundingBox();
  const afterScrollY = await page.evaluate(() => window.scrollY);

  console.log('\n=== AFTER SCROLL (sidebar should be at top) ===');
  console.log('ScrollY:', afterScrollY);
  console.log('Sidebar top (Y):', afterScrollRect?.y);
  console.log('Expected: Y should be 0 (at viewport top)');
  console.log('Actual behavior:', afterScrollRect?.y === 0 ? '✓ STICKY WORKING' : '✗ NOT STICKY');

  await page.screenshot({ path: 'test-results/check-02-at-top.png' });

  // Continue scrolling 1000px more
  console.log('\n=== SCROLLING 1000px MORE ===');
  await page.evaluate(() => window.scrollBy(0, 1000));
  await page.waitForTimeout(500);

  const finalRect = await sidebar.boundingBox();
  const finalScrollY = await page.evaluate(() => window.scrollY);

  console.log('\n=== AFTER CONTINUED SCROLL ===');
  console.log('ScrollY:', finalScrollY);
  console.log('Sidebar top (Y):', finalRect?.y);
  console.log('Expected: Y should still be 0 (sticky at top)');
  console.log('Actual behavior:', finalRect?.y === 0 ? '✓ STAYING STICKY' : '✗ LOST STICKY');

  await page.screenshot({ path: 'test-results/check-03-continued.png' });

  // Check computed styles
  const styles = await sidebar.evaluate((el) => {
    const computed = window.getComputedStyle(el);
    return {
      position: computed.position,
      top: computed.top,
      height: computed.height,
      maxHeight: computed.maxHeight,
    };
  });

  console.log('\n=== COMPUTED STYLES ===');
  console.log(JSON.stringify(styles, null, 2));
});
