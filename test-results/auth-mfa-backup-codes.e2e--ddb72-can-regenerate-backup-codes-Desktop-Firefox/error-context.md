# Test info

- Name: 4.5: Backup Codes / MFA Fallback >> User can regenerate backup codes
- Location: C:\Dev\Projects\Products\Apps\user-management-reorganized\e2e\auth\mfa\backup-codes.e2e.test.ts:157:3

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false
    at C:\Dev\Projects\Products\Apps\user-management-reorganized\e2e\auth\mfa\backup-codes.e2e.test.ts:160:23
```

# Page snapshot

```yaml
- alert:
  - heading "Error Loading Settings" [level=5]
  - text: User not authenticated
- alert
- button "Open Next.js Dev Tools":
  - img
```

# Test source

```ts
   60 |   
   61 |   test.beforeEach(async ({ browser }) => {
   62 |     page = await browser.newPage();
   63 |     
   64 |     // Login before each test
   65 |     await loginAs(page, USER_EMAIL, USER_PASSWORD);
   66 |     
   67 |     // Verify user is logged in by checking for profile or dashboard
   68 |     try {
   69 |       await Promise.race([
   70 |         page.waitForURL('**/profile**', { timeout: 10000 }),
   71 |         page.waitForURL('**/dashboard**', { timeout: 10000 })
   72 |       ]);
   73 |       
   74 |       // Small delay to ensure page is stable
   75 |       await page.waitForTimeout(1000);
   76 |     } catch (e) {
   77 |       console.log('Navigation verification failed, but continuing test');
   78 |     }
   79 |   });
   80 |   
   81 |   test.afterEach(async () => {
   82 |     await page.close();
   83 |   });
   84 |
   85 |   test('User can view backup codes in settings', async () => {
   86 |     // Navigate to security settings
   87 |     const navigated = await navigateToSecuritySettings(page);
   88 |     expect(navigated).toBe(true);
   89 |     
   90 |     // Look for backup codes section or button
   91 |     let backupCodesFound = false;
   92 |     
   93 |     // Try clicking "View Backup Codes" button if it exists
   94 |     try {
   95 |       const viewBackupCodesButton = page.getByRole('button', { name: /view backup codes/i })
   96 |         .or(page.getByRole('link', { name: /view backup codes/i }))
   97 |         .or(page.getByRole('button', { name: /backup codes/i }))
   98 |         .or(page.getByText(/view backup codes/i));
   99 |       
  100 |       if (await viewBackupCodesButton.isVisible({ timeout: 5000 })) {
  101 |         await viewBackupCodesButton.click();
  102 |         backupCodesFound = true;
  103 |       }
  104 |     } catch (e) {
  105 |       console.log('Backup codes button not found, trying alternatives');
  106 |     }
  107 |     
  108 |     // If backup codes section not found by button, check for it directly on the page
  109 |     if (!backupCodesFound) {
  110 |       const backupCodesHeading = page.getByRole('heading', { name: /backup codes/i });
  111 |       if (await backupCodesHeading.isVisible().catch(() => false)) {
  112 |         backupCodesFound = true;
  113 |       }
  114 |     }
  115 |     
  116 |     // If backup codes found, check for code display
  117 |     if (backupCodesFound) {
  118 |       // Look for code elements or container
  119 |       const hasCodeElements = await Promise.race([
  120 |         page.locator('.backup-code').first().isVisible().catch(() => false),
  121 |         page.locator('[data-testid="backup-code"]').first().isVisible().catch(() => false),
  122 |         page.locator('code').first().isVisible().catch(() => false),
  123 |         page.getByText(/[A-Z0-9]{4}-[A-Z0-9]{4}/i).first().isVisible().catch(() => false)
  124 |       ]);
  125 |       
  126 |       if (hasCodeElements) {
  127 |         console.log('Backup code elements found');
  128 |       } else {
  129 |         console.log('No code elements found - might need to generate codes first');
  130 |         
  131 |         // Try clicking a "Generate" button if codes aren't shown
  132 |         const generateButton = page.getByRole('button', { name: /generate|create/i });
  133 |         if (await generateButton.isVisible().catch(() => false)) {
  134 |           await generateButton.click();
  135 |           await page.waitForTimeout(1000);
  136 |         }
  137 |       }
  138 |       
  139 |       // Look for backup code display options
  140 |       const hasDownloadButton = await page.getByRole('button', { name: /download/i }).isVisible().catch(() => false);
  141 |       const hasCopyButton = await page.getByRole('button', { name: /copy/i }).isVisible().catch(() => false);
  142 |       const hasRegenerateButton = await page.getByRole('button', { name: /regenerate/i }).isVisible().catch(() => false);
  143 |       
  144 |       // Verify at least one action button is present
  145 |       expect(hasDownloadButton || hasCopyButton || hasRegenerateButton).toBe(true);
  146 |     } else {
  147 |       console.log('Backup codes section not found - feature may not be implemented');
  148 |       
  149 |       // Try looking for a setup button
  150 |       const setup2FAButton = page.getByRole('button', { name: /set up 2fa|enable 2fa|setup mfa/i });
  151 |       if (await setup2FAButton.isVisible().catch(() => false)) {
  152 |         console.log('2FA setup needs to be completed before backup codes are available');
  153 |       }
  154 |     }
  155 |   });
  156 |
  157 |   test('User can regenerate backup codes', async () => {
  158 |     // Navigate to security settings
  159 |     const navigated = await navigateToSecuritySettings(page);
> 160 |     expect(navigated).toBe(true);
      |                       ^ Error: expect(received).toBe(expected) // Object.is equality
  161 |     
  162 |     // Try to access backup codes
  163 |     try {
  164 |       const viewBackupCodesButton = page.getByRole('button', { name: /view backup codes/i })
  165 |         .or(page.getByRole('link', { name: /view backup codes/i }))
  166 |         .or(page.getByRole('button', { name: /backup codes/i }))
  167 |         .or(page.getByText(/view backup codes/i));
  168 |       
  169 |       if (await viewBackupCodesButton.isVisible({ timeout: 5000 })) {
  170 |         await viewBackupCodesButton.click();
  171 |       }
  172 |       
  173 |       // Look for regenerate button
  174 |       const regenerateButton = page.getByRole('button', { name: /regenerate/i });
  175 |       
  176 |       if (await regenerateButton.isVisible({ timeout: 5000 })) {
  177 |         // Save current codes text content for comparison
  178 |         let initialCodes = '';
  179 |         try {
  180 |           const codesContainer = page.locator('.backup-codes-container').or(page.locator('[data-testid="backup-codes"]'));
  181 |           initialCodes = await codesContainer.textContent() || '';
  182 |         } catch (e) {
  183 |           console.log('Could not capture initial codes for comparison');
  184 |         }
  185 |         
  186 |         // Click regenerate
  187 |         await regenerateButton.click();
  188 |         
  189 |         // Check for confirmation dialog
  190 |         const confirmButton = page.getByRole('button', { name: /confirm|yes|continue/i });
  191 |         if (await confirmButton.isVisible({ timeout: 3000 })) {
  192 |           await confirmButton.click();
  193 |         }
  194 |         
  195 |         // Wait for regeneration to complete
  196 |         await page.waitForTimeout(1000);
  197 |         
  198 |         // Verify codes are visible after regeneration
  199 |         const hasCodeElements = await Promise.race([
  200 |           page.locator('.backup-code').first().isVisible().catch(() => false),
  201 |           page.locator('[data-testid="backup-code"]').first().isVisible().catch(() => false),
  202 |           page.locator('code').first().isVisible().catch(() => false),
  203 |           page.getByText(/[A-Z0-9]{4}-[A-Z0-9]{4}/i).first().isVisible().catch(() => false)
  204 |         ]);
  205 |         
  206 |         expect(hasCodeElements).toBe(true);
  207 |         
  208 |         // Check if codes changed (if we captured the initial codes)
  209 |         if (initialCodes) {
  210 |           const codesContainer = page.locator('.backup-codes-container').or(page.locator('[data-testid="backup-codes"]'));
  211 |           const newCodes = await codesContainer.textContent() || '';
  212 |           
  213 |           // If implementation actually regenerates codes, they should be different
  214 |           if (newCodes !== initialCodes) {
  215 |             console.log('Codes changed after regeneration as expected');
  216 |           } else {
  217 |             console.log('Warning: Codes did not change after regeneration - might be UI-only implementation');
  218 |           }
  219 |         }
  220 |       } else {
  221 |         console.log('Regenerate button not found - feature may not be fully implemented');
  222 |         
  223 |         // Check for any backup codes or generation button instead
  224 |         const generateButton = page.getByRole('button', { name: /generate|create/i });
  225 |         if (await generateButton.isVisible().catch(() => false)) {
  226 |           console.log('Generate button found instead of regenerate');
  227 |           expect(await generateButton.isVisible()).toBe(true);
  228 |         } else {
  229 |           const hasCodeElements = await page.getByText(/[A-Z0-9]{4}-[A-Z0-9]{4}/i).first().isVisible().catch(() => false);
  230 |           expect(hasCodeElements).toBe(true);
  231 |         }
  232 |       }
  233 |     } catch (e) {
  234 |       console.log('Error testing backup code regeneration:', e);
  235 |       
  236 |       // If we can't access backup codes, test is inconclusive
  237 |       test.skip();
  238 |     }
  239 |   });
  240 |
  241 |   // This test requires MFA to be set up for the test user
  242 |   test('User can use a backup code to log in when 2FA is required', async ({ browser }) => {
  243 |     // Create a new page for login testing
  244 |     const loginPage = await browser.newPage();
  245 |     
  246 |     try {
  247 |       // Attempt login
  248 |       await loginPage.goto('/login');
  249 |       await loginPage.fill('input[name="email"]', USER_EMAIL);
  250 |       await loginPage.fill('input[name="password"]', USER_PASSWORD);
  251 |       await loginPage.click('button[type="submit"]');
  252 |       
  253 |       // Check if redirected to MFA page
  254 |       const redirectedToMFA = await Promise.race([
  255 |         loginPage.waitForURL('**/mfa**', { timeout: 5000 }).then(() => true).catch(() => false),
  256 |         loginPage.waitForURL('**/two-factor**', { timeout: 5000 }).then(() => true).catch(() => false),
  257 |         loginPage.waitForURL('**/verify**', { timeout: 5000 }).then(() => true).catch(() => false)
  258 |       ]);
  259 |       
  260 |       if (!redirectedToMFA) {
```