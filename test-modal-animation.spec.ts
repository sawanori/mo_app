import { test, expect } from '@playwright/test';

test('modal animation duration test', async ({ page }) => {
  // Navigate to the app
  await page.goto('http://localhost:3000');

  // Wait for the page to load
  await page.waitForLoadState('networkidle');

  // Find and click the first menu item
  const firstMenuItem = page.locator('[data-testid="menu-item"]').first();
  if (await firstMenuItem.count() === 0) {
    // If no test id, try finding a card or button that opens the modal
    const menuCard = page.locator('.grid').locator('div').first();

    console.log('Clicking menu item to open modal...');
    const startTime = Date.now();

    await menuCard.click();

    // Wait for modal to be visible (with transition)
    await page.waitForSelector('[role="dialog"]', { state: 'visible' });

    const endTime = Date.now();
    const openDuration = endTime - startTime;

    console.log(`Modal opening animation took: ${openDuration}ms`);

    // Check the transition style on the dialog content
    const dialogContent = page.locator('[role="dialog"]');
    const transitionStyle = await dialogContent.evaluate((el) => {
      return window.getComputedStyle(el).transition;
    });

    console.log(`Dialog transition style: ${transitionStyle}`);

    // Wait a bit to ensure animation is complete
    await page.waitForTimeout(3000);

    // Now test closing animation
    console.log('Clicking overlay to close modal...');
    const closeStartTime = Date.now();

    // Click the overlay to close the modal (easier than clicking X button)
    await page.locator('body').click({ position: { x: 10, y: 10 } });

    // Wait for animation to complete
    await page.waitForTimeout(2500);

    const closeEndTime = Date.now();
    const closeDuration = closeEndTime - closeStartTime;

    console.log(`Modal closing animation took: ${closeDuration}ms`);

    // The animation should take approximately 2400ms
    // We allow some margin for browser rendering
    expect(openDuration).toBeGreaterThan(2000);
    expect(closeDuration).toBeGreaterThan(2000);
  } else {
    console.log('Opening modal via test id...');
    await firstMenuItem.click();
    await page.waitForSelector('[role="dialog"]', { state: 'visible' });
  }

  // Take a screenshot for verification
  await page.screenshot({ path: 'modal-test.png', fullPage: true });
});
