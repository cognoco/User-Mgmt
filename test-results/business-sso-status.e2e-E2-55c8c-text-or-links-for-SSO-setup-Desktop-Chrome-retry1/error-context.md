# Test info

- Name: E2E: Business SSO Status Display >> should display help text or links for SSO setup
- Location: C:\Dev\Projects\Products\Apps\user-management-reorganized\e2e\business-sso-status.e2e.test.ts:76:3

# Error details

```
Error: Timed out 5000ms waiting for expect(locator).toBeVisible()

Locator: getByText(/configure your identity provider|need help setting up/i)
Expected: visible
Received: <element(s) not found>
Call log:
  - expect.toBeVisible with timeout 5000ms
  - waiting for getByText(/configure your identity provider|need help setting up/i)

    at C:\Dev\Projects\Products\Apps\user-management-reorganized\e2e\business-sso-status.e2e.test.ts:79:28
```

# Page snapshot

```yaml
- heading "404" [level=1]
- heading "This page could not be found." [level=2]
- alert
- button "Open Next.js Dev Tools":
  - img
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test';
   2 |
   3 | // TODO: SETUP: Implement helper for admin login
   4 | // async function loginAsOrgAdmin(page) { ... }
   5 | // TODO: SETUP: Implement helper for setting SSO status for an org
   6 | // async function setOrgSsoStatus(orgId: string, enabled: boolean, config?: any) { ... }
   7 |
   8 | test.describe('E2E: Business SSO Status Display', () => {
   9 |   // TODO: VERIFY CONFIG: Adjust URL for organization SSO settings page
  10 |   const ORG_SSO_SETTINGS_URL = '/organization/settings/sso';
  11 |   const TEST_ORG_ID = 'test-org-status';
  12 |
  13 |   test.beforeEach(async ({ page }) => {
  14 |     // --- START Org/User Setup ---
  15 |     // TODO: SETUP: Replace placeholders with actual setup calls.
  16 |     // Ensure the test org (TEST_ORG_ID) exists.
  17 |     // Login as an admin for that org.
  18 |     // Example: await ensureOrgExists(TEST_ORG_ID);
  19 |     // Example: await loginAsOrgAdmin(page, TEST_ORG_ID);
  20 |     console.log('Placeholder: Execute Org Admin login & Org setup here...');
  21 |     // --- END Org/User Setup ---
  22 |
  23 |     // Navigate to the SSO configuration/status page
  24 |     await page.goto(ORG_SSO_SETTINGS_URL);
  25 |     await expect(page).toHaveURL(ORG_SSO_SETTINGS_URL);
  26 |   });
  27 |
  28 |   test('should display correct SSO status when enabled', async ({ page }) => {
  29 |     // --- START Test Specific Setup ---
  30 |     // TODO: SETUP: Ensure SSO is ENABLED for TEST_ORG_ID before this test runs.
  31 |     // Example: await setOrgSsoStatus(TEST_ORG_ID, true, { type: 'SAML', ... });
  32 |     console.log(`SETUP Dependency: SSO must be ENABLED for org ${TEST_ORG_ID}`);
  33 |     // --- END Test Specific Setup ---
  34 |
  35 |     await page.reload(); // Ensure page reflects the setup state
  36 |
  37 |     // TODO: VERIFY SELECTOR: Update locator for the main status indicator element
  38 |     const statusIndicator = page.getByTestId('sso-status-indicator'); // Example using data-testid
  39 |     await expect(statusIndicator).toBeVisible();
  40 |     // TODO: VERIFY TEXT: Verify the exact text indicating an enabled state
  41 |     await expect(statusIndicator).toContainText(/enabled|active/i);
  42 |
  43 |     // Optional: Assert related config details are shown (e.g., IDP type)
  44 |     // TODO: VERIFY SELECTOR/TEXT: Check if IDP type (SAML/OIDC) is displayed when enabled
  45 |     // const idpTypeDisplay = page.getByTestId('sso-idp-type');
  46 |     // await expect(idpTypeDisplay).toContainText(/SAML|OIDC/i);
  47 |   });
  48 |
  49 |   test('should display correct SSO status when disabled', async ({ page }) => {
  50 |     // --- START Test Specific Setup ---
  51 |     // TODO: SETUP: Ensure SSO is DISABLED for TEST_ORG_ID before this test runs.
  52 |     // Example: await setOrgSsoStatus(TEST_ORG_ID, false);
  53 |     console.log(`SETUP Dependency: SSO must be DISABLED for org ${TEST_ORG_ID}`);
  54 |     // --- END Test Specific Setup ---
  55 |
  56 |     await page.reload(); // Ensure page reflects the setup state
  57 |
  58 |     // TODO: VERIFY SELECTOR: Update locator for the main status indicator element
  59 |     const statusIndicator = page.getByTestId('sso-status-indicator'); 
  60 |     await expect(statusIndicator).toBeVisible();
  61 |     // TODO: VERIFY TEXT: Verify the exact text indicating a disabled state
  62 |     await expect(statusIndicator).toContainText(/disabled|inactive/i);
  63 |   });
  64 |
  65 |   test('should display health/error status after login attempts (if applicable)', async ({ page }) => {
  66 |     // TODO: COMPLEX TEST: This likely requires more involved setup/mocking.
  67 |     // Consider breaking into smaller, more focused tests if health monitoring is complex.
  68 |     // Steps:
  69 |     // 1. SETUP: Ensure SSO is enabled.
  70 |     // 2. ACTION: Simulate successful/failed SSO logins for users in the org (likely requires API calls or complex UI mocks).
  71 |     // 3. VERIFY: Navigate to status page & check for health indicators (last login timestamp, error logs/messages).
  72 |     console.log('TODO: Implement complex health/error status test');
  73 |     expect(page).toBeDefined(); // Placeholder
  74 |   });
  75 |
  76 |   test('should display help text or links for SSO setup', async ({ page }) => {
  77 |     // TODO: VERIFY SELECTOR: Update locator for a specific help text section/paragraph
  78 |     const helpText = page.getByText(/configure your identity provider|need help setting up/i); 
> 79 |     await expect(helpText).toBeVisible();
     |                            ^ Error: Timed out 5000ms waiting for expect(locator).toBeVisible()
  80 |
  81 |     // TODO: VERIFY SELECTOR: Update locator for a documentation link
  82 |     const docLink = page.getByRole('link', { name: /sso documentation|learn more/i });
  83 |     await expect(docLink).toBeVisible();
  84 |     // TODO: VERIFY URL/PATTERN: Check the href attribute if necessary
  85 |     // await expect(docLink).toHaveAttribute('href', /.*\/docs\/sso/);
  86 |
  87 |     // Add checks for other specific help elements or contact links if applicable
  88 |   });
  89 | }); 
```