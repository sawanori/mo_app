import { test, expect } from '@playwright/test';

test.describe('Video Menu Item Test', () => {
  test('should display video menu item correctly', async ({ page }) => {
    console.log('\n=== Testing Video Menu Item ===');

    // 1. Go to client page
    await page.goto('http://localhost:3001/');
    await page.waitForTimeout(2000);

    console.log('✓ Loaded client page');

    // 2. Click on メイン料理 category
    await page.click('button:has-text("メイン料理")');
    await page.waitForTimeout(1000);

    console.log('✓ Clicked メイン料理 category');

    // 3. Check if video element exists in the menu
    const videoElements = await page.locator('video').count();
    console.log(`✓ Found ${videoElements} video elements`);

    // 4. Check if video has correct attributes
    if (videoElements > 0) {
      const firstVideo = page.locator('video').first();

      const isAutoplay = await firstVideo.evaluate((video: HTMLVideoElement) => video.autoplay);
      const isLoop = await firstVideo.evaluate((video: HTMLVideoElement) => video.loop);
      const isMuted = await firstVideo.evaluate((video: HTMLVideoElement) => video.muted);
      const hasPlaysInline = await firstVideo.evaluate((video: HTMLVideoElement) => video.playsInline);

      console.log(`✓ Video autoplay: ${isAutoplay}`);
      console.log(`✓ Video loop: ${isLoop}`);
      console.log(`✓ Video muted: ${isMuted}`);
      console.log(`✓ Video playsInline: ${hasPlaysInline}`);

      expect(isAutoplay).toBe(true);
      expect(isLoop).toBe(true);
      expect(isMuted).toBe(true);
      expect(hasPlaysInline).toBe(true);
    }

    // 5. Find the video menu item by name
    const videoMenuItem = page.locator('text=特製ハンバーガー（動画）');
    const isVisible = await videoMenuItem.isVisible();
    console.log(`✓ Video menu item visible: ${isVisible}`);
    expect(isVisible).toBe(true);

    // 6. Click on the video menu item to open modal
    const menuCard = page.locator('text=特製ハンバーガー（動画）').locator('..').locator('..');
    await menuCard.click();
    await page.waitForTimeout(1000);

    console.log('✓ Clicked on video menu item');

    // 7. Check if modal has video
    const modalVideo = page.locator('div[role="dialog"] video');
    const modalVideoCount = await modalVideo.count();
    console.log(`✓ Modal has ${modalVideoCount} video element(s)`);

    if (modalVideoCount > 0) {
      const modalIsAutoplay = await modalVideo.evaluate((video: HTMLVideoElement) => video.autoplay);
      const modalIsLoop = await modalVideo.evaluate((video: HTMLVideoElement) => video.loop);

      console.log(`✓ Modal video autoplay: ${modalIsAutoplay}`);
      console.log(`✓ Modal video loop: ${modalIsLoop}`);

      expect(modalIsAutoplay).toBe(true);
      expect(modalIsLoop).toBe(true);
    }

    // Take screenshot
    await page.screenshot({ path: 'test-results/video-menu-modal.png' });
    console.log('✓ Screenshot saved');

    console.log('\n✅ Video menu item test completed\n');
  });

  test('should verify video menu item in database', async ({ request }) => {
    console.log('\n=== Testing Video Menu in Database ===');

    const response = await request.get('http://localhost:3001/api/menu-items');
    expect(response.ok()).toBeTruthy();

    const menuItems = await response.json();

    // Find video items
    const videoItems = menuItems.filter((item: any) => item.mediaType === 'video');

    console.log(`✓ Total menu items: ${menuItems.length}`);
    console.log(`✓ Video menu items: ${videoItems.length}`);

    if (videoItems.length > 0) {
      videoItems.forEach((item: any) => {
        console.log(`  - ${item.name} (mediaType: ${item.mediaType})`);
        console.log(`    URL: ${item.image}`);
      });
    }

    expect(videoItems.length).toBeGreaterThan(0);

    console.log('\n✅ Video menu items exist in database\n');
  });
});
