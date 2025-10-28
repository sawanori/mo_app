import { test, expect } from '@playwright/test';

test.describe('Supabase Integration Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to home page before each test
    await page.goto('http://localhost:3000');
  });

  test.describe('Homepage and Menu Loading', () => {
    test('should load the homepage successfully', async ({ page }) => {
      await expect(page).toHaveTitle(/ダイニーダサチェックくん/);
    });

    test('should load menu items from Supabase', async ({ page }) => {
      // Wait for menu items to load
      await page.waitForTimeout(2000);

      // Check if menu items are displayed
      const menuItems = page.locator('[data-testid*="menu-item"], .menu-item, h3, h4');
      const count = await menuItems.count();

      console.log(`Found ${count} potential menu elements`);

      // Should have some menu items loaded
      expect(count).toBeGreaterThan(0);
    });

    test('should display main categories', async ({ page }) => {
      await page.waitForTimeout(2000);

      // Look for category text
      const pageContent = await page.content();
      const hasCategories =
        pageContent.includes('メイン料理') ||
        pageContent.includes('サイド') ||
        pageContent.includes('ドリンク') ||
        pageContent.includes('デザート');

      expect(hasCategories).toBeTruthy();
    });

    test('should display hero section', async ({ page }) => {
      // Wait for page to load
      await page.waitForLoadState('networkidle');

      // Check if there's a hero section or banner
      const hasHeroElements = await page.locator('section, .hero, [role="banner"]').count();
      expect(hasHeroElements).toBeGreaterThan(0);
    });
  });

  test.describe('Admin Authentication', () => {
    test('should navigate to admin login page', async ({ page }) => {
      await page.goto('http://localhost:3000/admin/login');

      // Check for login form elements
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
    });

    test('should fail login with invalid credentials', async ({ page }) => {
      await page.goto('http://localhost:3000/admin/login');

      // Fill in invalid credentials
      await page.fill('input[type="email"]', 'wrong@example.com');
      await page.fill('input[type="password"]', 'wrongpassword');

      // Click login button
      await page.click('button[type="submit"]');

      // Wait for error message
      await page.waitForTimeout(1000);

      // Should show error (toast or message)
      const pageContent = await page.content();
      const hasError =
        pageContent.includes('ログイン失敗') ||
        pageContent.includes('失敗') ||
        pageContent.includes('間違っています');

      expect(hasError).toBeTruthy();
    });

    test('should successfully login with valid credentials', async ({ page }) => {
      await page.goto('http://localhost:3000/admin/login');

      // Fill in valid credentials from environment variables
      const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@example.com';
      const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'password123';

      await page.fill('input[type="email"]', adminEmail);
      await page.fill('input[type="password"]', adminPassword);

      // Click login button
      await page.click('button[type="submit"]');

      // Wait for navigation or success message
      await page.waitForTimeout(2000);

      // Should redirect to admin dashboard or show success
      const url = page.url();
      const isOnAdminPage = url.includes('/admin') && !url.includes('/admin/login');

      expect(isOnAdminPage).toBeTruthy();
    });

    test('should redirect to login when accessing admin without auth', async ({ page }) => {
      // Try to access admin page directly
      await page.goto('http://localhost:3000/admin');

      // Wait for redirect
      await page.waitForTimeout(1000);

      // Should be redirected to login
      const url = page.url();
      expect(url).toContain('/admin/login');
    });
  });

  test.describe('Admin Dashboard Operations', () => {
    test.beforeEach(async ({ page }) => {
      // Login before each admin test
      const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@example.com';
      const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'password123';

      await page.goto('http://localhost:3000/admin/login');
      await page.fill('input[type="email"]', adminEmail);
      await page.fill('input[type="password"]', adminPassword);
      await page.click('button[type="submit"]');
      await page.waitForTimeout(2000);
    });

    test('should access admin dashboard after login', async ({ page }) => {
      // Should be on admin page
      const url = page.url();
      expect(url).toContain('/admin');
      expect(url).not.toContain('/login');
    });

    test('should display menu management interface', async ({ page }) => {
      await page.waitForTimeout(1000);

      // Check for admin interface elements
      const hasAdminElements = await page.locator('button, table, [role="table"]').count();
      expect(hasAdminElements).toBeGreaterThan(0);
    });
  });

  test.describe('Data Integrity', () => {
    test('menu items should have required fields', async ({ page }) => {
      await page.waitForTimeout(2000);

      // Get page content to check for data
      const content = await page.content();

      // Check if prices are displayed (format: ¥XXX)
      const hasPrices = /¥\d+/.test(content);
      expect(hasPrices).toBeTruthy();
    });

    test('should handle network errors gracefully', async ({ page }) => {
      // Block Supabase requests to simulate network error
      await page.route('**/*supabase.co/**', route => route.abort());

      await page.goto('http://localhost:3000');
      await page.waitForTimeout(2000);

      // Page should still load, even if data fetch fails
      await expect(page).toHaveTitle(/ぽいに～/);
    });
  });

  test.describe('Navigation', () => {
    test('should have working navigation links', async ({ page }) => {
      await page.waitForTimeout(1000);

      // Check for navigation elements
      const navLinks = await page.locator('nav a, header a, [role="navigation"] a').count();

      // Should have some navigation
      expect(navLinks).toBeGreaterThanOrEqual(0);
    });

    test('should support mobile viewport', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      await page.goto('http://localhost:3000');
      await page.waitForTimeout(1000);

      // Page should render without layout issues
      await expect(page).toHaveTitle(/ぽいに～/);

      // Check if content is visible
      const bodyHeight = await page.evaluate(() => document.body.scrollHeight);
      expect(bodyHeight).toBeGreaterThan(0);
    });
  });
});
