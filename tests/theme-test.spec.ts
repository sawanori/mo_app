import { test, expect } from '@playwright/test';

test.describe('Theme Integration Test', () => {
  test('should change theme from admin and reflect on client page', async ({ page, context }) => {
    console.log('\n=== Testing Theme Integration ===');

    // 1. Open admin page and login
    await page.goto('http://localhost:3001/admin/login');
    await page.fill('input[type="email"]', process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@example.com');
    await page.fill('input[type="password"]', process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'changeme');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/admin');
    await page.waitForTimeout(2000);

    console.log('✓ Logged into admin page');

    // 2. Check current theme (should be part1 by default)
    const part1Radio = page.locator('#theme-part1');
    const isChecked = await part1Radio.isChecked();
    console.log(`✓ Current theme Part1 checked: ${isChecked}`);

    // 3. Change to Part2 theme (click the label for better compatibility)
    const part2Label = page.locator('label[for="theme-part2"]');
    await part2Label.click();
    await page.waitForTimeout(1000);

    console.log('✓ Changed theme to Part2');

    // 4. Open client page in new tab
    const clientPage = await context.newPage();
    await clientPage.goto('http://localhost:3001/');
    await clientPage.waitForTimeout(2000);

    console.log('✓ Opened client page');

    // 5. Check if client page has the gray background (part2)
    const bodyStyle = await clientPage.evaluate(() => {
      const body = document.querySelector('body > div > div');
      if (!body) return null;
      const styles = window.getComputedStyle(body);
      return {
        backgroundColor: styles.backgroundColor,
        color: styles.color,
      };
    });

    console.log(`✓ Client page background: ${bodyStyle?.backgroundColor}`);
    console.log(`✓ Client page text color: ${bodyStyle?.color}`);

    // Part2 should have gray background (rgb(105, 99, 99) = #696363)
    // Allow some tolerance for RGB values
    const bgColor = bodyStyle?.backgroundColor || '';
    const isGrayBackground = bgColor.includes('105') || bgColor.includes('696363');

    console.log(`✓ Is gray background (Part2): ${isGrayBackground}`);
    expect(isGrayBackground).toBe(true);

    // 6. Change back to Part1
    await page.bringToFront();
    const part1Label = page.locator('label[for="theme-part1"]');
    await part1Label.click();
    await page.waitForTimeout(1000);
    console.log('✓ Changed back to Part1');

    // 7. Reload client page and check if it's white background
    await clientPage.reload();
    await clientPage.waitForTimeout(2000);

    const bodyStylePart1 = await clientPage.evaluate(() => {
      const body = document.querySelector('body > div > div');
      if (!body) return null;
      const styles = window.getComputedStyle(body);
      return {
        backgroundColor: styles.backgroundColor,
        color: styles.color,
      };
    });

    console.log(`✓ Client page background (Part1): ${bodyStylePart1?.backgroundColor}`);
    console.log(`✓ Client page text color (Part1): ${bodyStylePart1?.color}`);

    // Part1 should have white background (rgb(255, 255, 255))
    const bgColorPart1 = bodyStylePart1?.backgroundColor || '';
    const isWhiteBackground = bgColorPart1.includes('255, 255, 255') || bgColorPart1.includes('ffffff');

    console.log(`✓ Is white background (Part1): ${isWhiteBackground}`);
    expect(isWhiteBackground).toBe(true);

    console.log('\n✅ Theme changes correctly between admin and client\n');

    await clientPage.close();
  });

  test('should persist theme after page reload', async ({ page }) => {
    console.log('\n=== Testing Theme Persistence ===');

    // 1. Login to admin
    await page.goto('http://localhost:3001/admin/login');
    await page.fill('input[type="email"]', process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@example.com');
    await page.fill('input[type="password"]', process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'changeme');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/admin');
    await page.waitForTimeout(2000);

    // 2. Set theme to Part2
    const part2Label = page.locator('label[for="theme-part2"]');
    await part2Label.click();
    await page.waitForTimeout(1000);
    console.log('✓ Set theme to Part2');

    // 3. Go to client page
    await page.goto('http://localhost:3001/');
    await page.waitForTimeout(2000);

    // 4. Check background is gray
    let bodyStyle = await page.evaluate(() => {
      const body = document.querySelector('body > div > div');
      if (!body) return null;
      return window.getComputedStyle(body).backgroundColor;
    });
    console.log(`✓ Initial background: ${bodyStyle}`);

    // 5. Reload page
    await page.reload();
    await page.waitForTimeout(2000);

    // 6. Check background is still gray
    bodyStyle = await page.evaluate(() => {
      const body = document.querySelector('body > div > div');
      if (!body) return null;
      return window.getComputedStyle(body).backgroundColor;
    });
    console.log(`✓ After reload background: ${bodyStyle}`);

    const isGray = (bodyStyle || '').includes('105') || (bodyStyle || '').includes('696363');
    expect(isGray).toBe(true);

    console.log('✅ Theme persists after reload\n');
  });
});
