# Test info

- Name: smoke test
- Location: C:\Dev\Projects\Products\Apps\user-management-reorganized\e2e\smoke.spec.ts:3:1

# Error details

```
Error: expect(received).not.toBe(expected) // Object.is equality

Expected: not ""
    at C:\Dev\Projects\Products\Apps\user-management-reorganized\e2e\smoke.spec.ts:5:34
```

# Test source

```ts
  1 | import { test, expect } from '@playwright/test';
  2 |
  3 | test('smoke test', async ({ page }) => {
  4 |   await page.goto('/');
> 5 |   expect(await page.title()).not.toBe('');
    |                                  ^ Error: expect(received).not.toBe(expected) // Object.is equality
  6 | }); 
```