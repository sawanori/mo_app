import { test, expect } from '@playwright/test';

test.describe('Database Integration Test', () => {
  test('should display database data on client page', async ({ page }) => {
    console.log('\n=== Testing Client Page ===');

    await page.goto('http://localhost:3001/');
    await page.waitForTimeout(3000);

    // Check if categories loaded
    const categoryButtons = await page.locator('button:has-text("メイン料理"), button:has-text("サイドメニュー"), button:has-text("ドリンク"), button:has-text("デザート")').count();
    console.log(`✓ Categories found: ${categoryButtons}`);

    // Check if featured section exists
    const heroSection = await page.locator('text=当店のおすすめ').isVisible();
    console.log(`✓ Featured section visible: ${heroSection}`);

    // Take screenshot
    await page.screenshot({ path: 'test-results/client-page.png', fullPage: true });

    expect(categoryButtons).toBeGreaterThan(0);
    expect(heroSection).toBe(true);

    console.log('✅ Client page displays database data correctly\n');
  });

  test('should display database data on admin page', async ({ page }) => {
    console.log('\n=== Testing Admin Page ===');

    await page.goto('http://localhost:3001/admin/login');

    // Login
    await page.fill('input[type="email"]', process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@example.com');
    await page.fill('input[type="password"]', process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'changeme');
    await page.click('button[type="submit"]');

    await page.waitForURL('**/admin');
    await page.waitForTimeout(3000);

    // Check if categories loaded
    const categoryElements = await page.locator('text=/メイン料理|サイド|ドリンク|デザート/').count();
    console.log(`✓ Categories found in admin: ${categoryElements}`);

    // Check subcategories
    const subCategoryElements = await page.locator('text=/揚げ物|肉料理|サラダ|スープ|ビール|ハイボール|ワイン|ソフトドリンク|アイス|ケーキ|パイ・タルト/').count();
    console.log(`✓ Subcategories found: ${subCategoryElements}`);

    // Take screenshot
    await page.screenshot({ path: 'test-results/admin-page.png', fullPage: true });

    expect(categoryElements).toBeGreaterThanOrEqual(4);
    expect(subCategoryElements).toBeGreaterThan(0);

    console.log('✅ Admin page displays database data correctly\n');
  });

  test('should make API calls correctly', async ({ page }) => {
    console.log('\n=== Testing API Calls ===');

    const apiCalls: string[] = [];

    page.on('response', response => {
      if (response.url().includes('/api/')) {
        const status = response.status();
        const url = response.url().split('http://localhost:3001')[1];
        apiCalls.push(`${status} ${url}`);
      }
    });

    // Visit client page
    await page.goto('http://localhost:3001/');
    await page.waitForTimeout(2000);

    console.log('\nAPI Calls on Client Page:');
    apiCalls.forEach(call => console.log(`  ${call}`));

    const hasMenuItems = apiCalls.some(call => call.includes('/api/menu-items') && call.startsWith('200'));
    const hasCategories = apiCalls.some(call => call.includes('/api/categories') && call.startsWith('200'));
    const hasFeatured = apiCalls.some(call => call.includes('/api/featured') && call.startsWith('200'));

    console.log(`\n✓ Menu Items API (200): ${hasMenuItems}`);
    console.log(`✓ Categories API (200): ${hasCategories}`);
    console.log(`✓ Featured API (200): ${hasFeatured}`);

    expect(hasMenuItems).toBe(true);
    expect(hasCategories).toBe(true);
    expect(hasFeatured).toBe(true);

    console.log('✅ All API calls successful\n');
  });

  test('should verify database content via API', async ({ request }) => {
    console.log('\n=== Testing Database Content ===');

    // Test menu items API
    const menuResponse = await request.get('http://localhost:3001/api/menu-items');
    expect(menuResponse.ok()).toBeTruthy();
    const menuItems = await menuResponse.json();
    console.log(`✓ Menu items in database: ${menuItems.length}`);

    // Test categories API
    const categoriesResponse = await request.get('http://localhost:3001/api/categories');
    expect(categoriesResponse.ok()).toBeTruthy();
    const categories = await categoriesResponse.json();
    console.log(`✓ Main categories in database: ${categories.length}`);

    const totalSubCategories = categories.reduce((sum: number, cat: any) => sum + cat.subCategories.length, 0);
    console.log(`✓ Subcategories in database: ${totalSubCategories}`);

    // Test featured API
    const featuredResponse = await request.get('http://localhost:3001/api/featured');
    expect(featuredResponse.ok()).toBeTruthy();
    const featured = await featuredResponse.json();
    console.log(`✓ Featured items: ${Object.keys(featured).length} slots`);

    // Detailed output
    console.log('\nMain Categories:');
    categories.forEach((cat: any) => {
      console.log(`  - ${cat.name} (${cat.subCategories.length} subcategories)`);
    });

    expect(menuItems.length).toBeGreaterThan(0);
    expect(categories.length).toBeGreaterThan(0);

    console.log('\n✅ Database contains correct data\n');
  });
});
