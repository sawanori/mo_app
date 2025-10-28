import { test, expect, devices } from '@playwright/test';

/**
 * Hero section width measurement test
 * Tests if the hero section is causing horizontal overflow
 */

test.use({
  ...devices['iPhone 12'],
});

test.describe('Hero Section Width Measurement', () => {

  test('Measure all component widths', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');

    const viewportWidth = page.viewportSize()!.width;
    console.log(`\n=== Viewport Width: ${viewportWidth}px ===\n`);

    // Measure each component width
    const components = [
      { selector: 'body', name: 'Body' },
      { selector: 'nav', name: 'Navigation' },
      { selector: 'footer', name: 'Footer' },
      { selector: '[class*="hero"]', name: 'Hero Section (class)' },
      { selector: '.embla', name: 'Carousel (.embla)' },
      { selector: '[data-testid^="hero-"]', name: 'Hero Carousel' },
    ];

    for (const { selector, name } of components) {
      try {
        const element = page.locator(selector).first();

        if (await element.count() > 0) {
          const box = await element.boundingBox();

          if (box) {
            const exceedsViewport = box.width > viewportWidth;
            const status = exceedsViewport ? '❌ EXCEEDS' : '✓ OK';

            console.log(`${status} ${name}:`);
            console.log(`  Width: ${box.width}px`);
            console.log(`  X position: ${box.x}px`);
            console.log(`  Right edge: ${box.x + box.width}px`);

            if (exceedsViewport) {
              console.log(`  ⚠️  Exceeds by: ${box.width - viewportWidth}px`);
            }
            console.log('');
          }
        } else {
          console.log(`⚠️  ${name}: Not found\n`);
        }
      } catch (error) {
        console.log(`❌ ${name}: Error - ${error}\n`);
      }
    }

    // Measure document scroll width
    const scrollWidth = await page.evaluate(() => {
      return {
        documentWidth: document.documentElement.scrollWidth,
        documentClientWidth: document.documentElement.clientWidth,
        bodyWidth: document.body.scrollWidth,
        bodyClientWidth: document.body.clientWidth,
      };
    });

    console.log('=== Document Measurements ===');
    console.log(`Document scroll width: ${scrollWidth.documentWidth}px`);
    console.log(`Document client width: ${scrollWidth.documentClientWidth}px`);
    console.log(`Body scroll width: ${scrollWidth.bodyWidth}px`);
    console.log(`Body client width: ${scrollWidth.bodyClientWidth}px`);

    const hasHorizontalScroll = scrollWidth.documentWidth > scrollWidth.documentClientWidth;
    console.log(`\n${hasHorizontalScroll ? '❌' : '✓'} Horizontal scroll: ${hasHorizontalScroll ? 'YES' : 'NO'}`);

    if (hasHorizontalScroll) {
      console.log(`⚠️  Overflow by: ${scrollWidth.documentWidth - scrollWidth.documentClientWidth}px\n`);
    }

    // Find the widest element
    const widestElement = await page.evaluate(() => {
      const allElements = document.querySelectorAll('*');
      let widest = { width: 0, tag: '', className: '', id: '' };

      allElements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.width > widest.width) {
          widest = {
            width: rect.width,
            tag: el.tagName.toLowerCase(),
            className: el.className || '',
            id: el.id || '',
          };
        }
      });

      return widest;
    });

    console.log('\n=== Widest Element ===');
    console.log(`Tag: <${widestElement.tag}>`);
    console.log(`Class: ${widestElement.className}`);
    console.log(`ID: ${widestElement.id}`);
    console.log(`Width: ${widestElement.width}px`);

    if (widestElement.width > viewportWidth) {
      console.log(`❌ Exceeds viewport by: ${widestElement.width - viewportWidth}px`);
    }

    // Take a screenshot for visual inspection
    await page.screenshot({
      path: 'tests/screenshots/width-debug.png',
      fullPage: true,
    });

    console.log('\n📸 Screenshot saved: tests/screenshots/width-debug.png\n');
  });

  test('Measure hero-section specific elements', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');

    const viewportWidth = page.viewportSize()!.width;

    // Wait for hero section to load
    await page.waitForTimeout(1500);

    // Find all hero-related elements
    const heroElements = await page.evaluate(() => {
      const results: Array<{
        selector: string;
        width: number;
        x: number;
        className: string;
      }> = [];

      // Find carousel-related elements
      const carouselElements = document.querySelectorAll('[class*="carousel"], [class*="embla"], [class*="hero"]');

      carouselElements.forEach((el, index) => {
        const rect = el.getBoundingClientRect();
        results.push({
          selector: `${el.tagName.toLowerCase()}[${index}]`,
          width: rect.width,
          x: rect.x,
          className: el.className,
        });
      });

      return results;
    });

    console.log('\n=== Hero/Carousel Elements ===\n');

    heroElements.forEach((el, index) => {
      const exceedsViewport = el.width > viewportWidth;
      const status = exceedsViewport ? '❌' : '✓';

      console.log(`${status} Element ${index + 1}:`);
      console.log(`  Selector: ${el.selector}`);
      console.log(`  Class: ${el.className.substring(0, 80)}...`);
      console.log(`  Width: ${el.width}px`);
      console.log(`  X: ${el.x}px`);

      if (exceedsViewport) {
        console.log(`  ⚠️  Exceeds by: ${el.width - viewportWidth}px`);
      }
      console.log('');
    });
  });
});
