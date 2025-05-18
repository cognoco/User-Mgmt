# Test info

- Name: 4.5: Backup Codes / MFA Fallback >> User can view backup codes in settings
- Location: C:\Dev\Projects\Products\Apps\user-management-reorganized\e2e\auth\mfa\backup-codes.e2e.test.ts:85:3

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false
    at C:\Dev\Projects\Products\Apps\user-management-reorganized\e2e\auth\mfa\backup-codes.e2e.test.ts:88:23
```

# Page snapshot

```yaml
- heading "Settings" [level=1]
- heading "Language" [level=2]
- text: settings.language
- combobox "settings.language"
- heading "Appearance" [level=2]
- text: Theme
- combobox "Theme" [disabled]
- paragraph: Theme selection coming soon.
- heading "Notifications" [level=2]
- heading "Notifications" [level=3]
- text: settings.preferences.emailNotifications
- paragraph: settings.preferences.emailNotificationsDesc
- switch "settings.preferences.emailNotifications" [checked] [disabled]
- text: settings.preferences.pushNotifications
- paragraph: settings.preferences.pushNotificationsDesc
- switch "settings.preferences.pushNotifications" [checked] [disabled]
- text: Marketing Communications
- paragraph: Receive occasional updates about new features and offers.
- switch "Marketing Communications" [disabled]
- heading "Data & Privacy" [level=2]
- heading "gdpr.export.title" [level=3]
- paragraph: gdpr.export.description
- button "gdpr.export.buttonText"
- paragraph: gdpr.export.helpText
- heading "gdpr.delete.title" [level=3]
- paragraph: gdpr.delete.description
- button "gdpr.delete.buttonText"
- paragraph: gdpr.delete.helpText
- link "View Privacy Policy":
  - /url: /docs/PRIVACY_POLICY.md
```

# Test source

```ts
   1 | import { test, expect, Page } from '@playwright/test';
   2 | import { loginAs } from '../../utils/auth';
   3 |
   4 | // --- Constants and Test Data --- //
   5 | const USER_EMAIL = process.env.E2E_USER_EMAIL || 'user@example.com';
   6 | const USER_PASSWORD = process.env.E2E_USER_PASSWORD || 'password123';
   7 |
   8 | // Example backup codes for reference/testing
   9 | const SAMPLE_BACKUP_CODES = [
   10 |   'ABCD-1234',
   11 |   'EFGH-5678',
   12 |   'IJKL-9012',
   13 |   'MNOP-3456',
   14 |   'QRST-7890',
   15 |   'UVWX-2345',
   16 |   'YZAB-6789',
   17 |   'CDEF-0123',
   18 |   'GHIJ-4567',
   19 |   'KLMN-8901',
   20 | ];
   21 |
   22 | /**
   23 |  * Helper function to navigate to security settings with fallbacks
   24 |  */
   25 | async function navigateToSecuritySettings(page: Page): Promise<boolean> {
   26 |   // Try multiple paths to security settings
   27 |   try {
   28 |     // First try direct navigation to security settings
   29 |     await page.goto('/settings/security');
   30 |     await page.waitForLoadState('domcontentloaded');
   31 |     
   32 |     // Check if security section is visible
   33 |     const securityHeading = page.getByRole('heading', { name: /security|backup codes|2fa|mfa/i });
   34 |     if (await securityHeading.isVisible().catch(() => false)) {
   35 |       return true;
   36 |     }
   37 |     
   38 |     // If not found, try main settings page and look for tabs/links
   39 |     await page.goto('/settings');
   40 |     await page.waitForLoadState('domcontentloaded');
   41 |     
   42 |     // Try clicking security tab if it exists
   43 |     try {
   44 |       await page.getByRole('tab', { name: /security/i }).click({ timeout: 3000 });
   45 |       return true;
   46 |     } catch (e) {
   47 |       // Try clicking security link if tabs don't exist
   48 |       await page.getByRole('link', { name: /security/i }).click({ timeout: 3000 });
   49 |       return true;
   50 |     }
   51 |   } catch (e) {
   52 |     console.log('Error navigating to security settings:', e);
   53 |     return false;
   54 |   }
   55 | }
   56 |
   57 | // --- Test Suite --- //
   58 | test.describe('4.5: Backup Codes / MFA Fallback', () => {
   59 |   let page: Page;
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
>  88 |     expect(navigated).toBe(true);
      |                       ^ Error: expect(received).toBe(expected) // Object.is equality
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
  160 |     expect(navigated).toBe(true);
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
```