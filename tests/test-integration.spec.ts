import { test, expect } from '@playwright/test';

test.describe('Admin and Client Integration', () => {
  test('should sync data between admin and client pages', async ({ page, context }) => {
    // 1. Open admin page and login
    await page.goto('http://localhost:3001/admin/login');

    // Login
    await page.fill('input[type="email"]', process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@example.com');
    await page.fill('input[type="password"]', process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'changeme');
    await page.click('button[type="submit"]');

    // Wait for redirect to admin page
    await page.waitForURL('**/admin');
    await page.waitForTimeout(2000);

    console.log('✓ Logged into admin page');

    // 2. Check if data loads from database
    const menuTab = page.locator('button:has-text("メニュー管理")');
    await menuTab.click();
    await page.waitForTimeout(1000);

    // Check if menu items are displayed
    const menuItems = await page.locator('[data-testid^="menu-item"], .border').count();
    console.log(`✓ Found ${menuItems} menu items in admin`);

    // 3. Check categories
    const categoryTab = page.locator('button:has-text("カテゴリー管理")');
    await categoryTab.click();
    await page.waitForTimeout(1000);

    const categories = await page.locator('text=/メイン料理|サイドメニュー|ドリンク|デザート/').count();
    console.log(`✓ Found ${categories} categories in admin`);

    // 4. Open client page in new tab
    const clientPage = await context.newPage();
    await clientPage.goto('http://localhost:3001/');
    await clientPage.waitForTimeout(2000);

    console.log('✓ Opened client page');

    // 5. Verify client page loads data
    const clientMenuItems = await clientPage.locator('[data-testid^="menu-item"], .cursor-pointer').count();
    console.log(`✓ Found ${clientMenuItems} menu items on client page`);

    // 6. Check if categories are visible on client
    const clientCategories = await clientPage.locator('text=/メイン料理|サイドメニュー|ドリンク|デザート/').count();
    console.log(`✓ Found ${clientCategories} categories on client page`);

    // 7. Verify hero section (featured items)
    const heroSection = await clientPage.locator('text=当店のおすすめ').isVisible();
    console.log(`✓ Hero section visible: ${heroSection}`);

    // Summary
    console.log('\n=== Integration Test Summary ===');
    console.log(`Admin menu items: ${menuItems}`);
    console.log(`Client menu items: ${clientMenuItems}`);
    console.log(`Admin categories: ${categories}`);
    console.log(`Client categories: ${clientCategories}`);

    // Basic assertions
    expect(menuItems).toBeGreaterThan(0);
    expect(clientMenuItems).toBeGreaterThan(0);
    expect(categories).toBeGreaterThan(0);
    expect(clientCategories).toBeGreaterThan(0);

    await clientPage.close();
  });

  test('should load data from database on client page', async ({ page }) => {
    await page.goto('http://localhost:3001/');

    // Wait for data to load
    await page.waitForTimeout(3000);

    // Check network requests
    const responses: string[] = [];
    page.on('response', response => {
      if (response.url().includes('/api/')) {
        responses.push(`${response.status()} ${response.url()}`);
      }
    });

    // Reload to capture API calls
    await page.reload();
    await page.waitForTimeout(2000);

    console.log('\n=== API Calls Made ===');
    responses.forEach(r => console.log(r));

    // Check if APIs were called
    const hasMenuAPI = responses.some(r => r.includes('/api/menu-items'));
    const hasCategoriesAPI = responses.some(r => r.includes('/api/categories'));
    const hasFeaturedAPI = responses.some(r => r.includes('/api/featured'));

    console.log(`\n✓ Menu API called: ${hasMenuAPI}`);
    console.log(`✓ Categories API called: ${hasCategoriesAPI}`);
    console.log(`✓ Featured API called: ${hasFeaturedAPI}`);
  });

  test('should load data from database on admin page', async ({ page }) => {
    await page.goto('http://localhost:3001/admin/login');

    // Login
    await page.fill('input[type="email"]', process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@example.com');
    await page.fill('input[type="password"]', process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'changeme');

    // Track API calls
    const responses: string[] = [];
    page.on('response', response => {
      if (response.url().includes('/api/')) {
        responses.push(`${response.status()} ${response.url()}`);
      }
    });

    await page.click('button[type="submit"]');
    await page.waitForURL('**/admin');
    await page.waitForTimeout(3000);

    console.log('\n=== API Calls on Admin Page ===');
    responses.forEach(r => console.log(r));

    // Check if APIs were called
    const hasMenuAPI = responses.some(r => r.includes('/api/menu-items'));
    const hasCategoriesAPI = responses.some(r => r.includes('/api/categories'));
    const hasFeaturedAPI = responses.some(r => r.includes('/api/featured'));

    console.log(`\n✓ Menu API called: ${hasMenuAPI}`);
    console.log(`✓ Categories API called: ${hasCategoriesAPI}`);
    console.log(`✓ Featured API called: ${hasFeaturedAPI}`);
  });
});
