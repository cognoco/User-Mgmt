import { test, Page } from '@playwright/test';
import { loginAs } from '@/e2e/utils/auth';

const USER_EMAIL = process.env.E2E_USER_EMAIL || 'user@example.com';
const USER_PASSWORD = process.env.E2E_USER_PASSWORD || 'password123';

test.describe('UI Elements Check', () => {
  let page: Page;
  
  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    await loginAs(page, USER_EMAIL, USER_PASSWORD);
    await page.goto('/settings');
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('Log all UI elements', async () => {
    // Log all headings
    const headings = await page.$$eval('h1, h2, h3, h4, h5, h6', elements => 
      elements.map(el => ({
        tag: el.tagName.toLowerCase(),
        text: el.textContent?.trim(),
        id: el.id || null,
        class: el.className || null
      }))
    );
    console.log('=== Headings ===');
    console.log(JSON.stringify(headings, null, 2));

    // Log all buttons
    const buttons = await page.$$eval('button, [role="button"]', elements => 
      elements.map(el => ({
        text: el.textContent?.trim(),
        id: el.id || null,
        class: el.className || null,
        type: el.getAttribute('type'),
        'aria-label': el.getAttribute('aria-label'),
        'data-testid': el.getAttribute('data-testid')
      }))
    );
    console.log('=== Buttons ===');
    console.log(JSON.stringify(buttons, null, 2));

    // Log all sections
    const sections = await page.$$eval('section, [role="region"], .card, .panel, .box', elements => 
      elements.map(el => ({
        tag: el.tagName.toLowerCase(),
        text: el.textContent?.trim().substring(0, 100) + '...',
        id: el.id || null,
        class: el.className || null
      }))
    );
    console.log('=== Sections ===');
    console.log(JSON.stringify(sections, null, 2));

    // Take a screenshot for visual reference
    await page.screenshot({ path: 'debug-settings-page.png', fullPage: true });
    console.log('Screenshot saved as debug-settings-page.png');
  });
});
