import { test, expect } from '@playwright/test';

test('smoke test', async ({ page }) => {
  await page.goto('/');
  expect(await page.title()).not.toBe('');
}); 