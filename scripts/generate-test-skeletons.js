import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Generates skeleton test files for flows/components listed in the manual verification checklist that are missing tests.
 * Reads: docs/MANUAL_VERIFICATION_CHECKLIST.md
 * Writes: e2e/*.Skeleton.e2e.test.ts, src/tests/integration/*.Skeleton.integration.test.tsx, docs/GENERATED_TEST_SKELETONS_REPORT.md
 */

// --- CONFIG ---
const CHECKLIST_PATH = path.join(__dirname, '../docs/MANUAL_VERIFICATION_CHECKLIST.md');
const E2E_DIR = path.join(__dirname, '../e2e');
const INTEGRATION_DIR = path.join(__dirname, '../src/tests/integration');
const REPORT_PATH = path.join(__dirname, '../docs/GENERATED_TEST_SKELETONS_REPORT.md');
const TEST_FILE_PATTERNS = [/\.e2e\.test\.ts$/, /\.spec\.ts$/, /\.test\.tsx?$/];

// --- HELPERS ---
function getAllTestFiles(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  for (const file of fs.readdirSync(dir)) {
    const full = path.join(dir, file);
    if (fs.statSync(full).isDirectory()) {
      results = results.concat(getAllTestFiles(full));
    } else if (TEST_FILE_PATTERNS.some((pat) => pat.test(file))) {
      results.push(full);
    }
  }
  return results;
}

function extractFlowsFromChecklist(md) {
  const flows = [];
  const tableRegex = /\|([^\n]+)\|([^\n]+)\|([^\n]+)\|([^\n]+)\|([^\n]+)\|([^\n]+)\|([^\n]+)\|([^\n]+)\|/g;
  let match;
  while ((match = tableRegex.exec(md))) {
    const flow = match[1].trim();
    if (flow && flow !== 'Flow / Screen / Component' && flow !== '**Entry Point**') {
      flows.push(flow);
    }
  }
  return Array.from(new Set(flows));
}

function fuzzyMatch(flow, testFiles) {
  const keywords = flow.toLowerCase().split(/\W+/).filter(Boolean);
  return testFiles.filter((file) => {
    const lc = file.toLowerCase();
    return keywords.some((kw) => lc.includes(kw));
  });
}

function groupFlows(flows) {
  // Simple grouping by first word or area keyword
  const groups = {};
  flows.forEach((flow) => {
    let key = flow.split(' ')[0].toLowerCase();
    if (key === 'entry') key = flow.split(' ')[1]?.toLowerCase() || 'misc';
    if (!groups[key]) groups[key] = [];
    groups[key].push(flow);
  });
  return groups;
}

function inferTestType(flow) {
  // Heuristic: navigation, multi-step, or cross-component flows => E2E
  const e2eKeywords = ['navigate', 'flow', 'wizard', 'onboarding', 'login', 'register', 'profile', 'settings', 'dashboard', 'subscription', 'payment', 'mfa', 'account', 'export', 'logs', 'team', 'org', 'sso', 'recovery'];
  const lower = flow.toLowerCase();
  return e2eKeywords.some((kw) => lower.includes(kw)) ? 'e2e' : 'integration';
}

function cleanGroupName(group) {
  // Remove special characters, leading/trailing dashes/slashes, kebab-case
  let cleaned = group.replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-+|-+$/g, '').toLowerCase();
  if (!cleaned || cleaned === '-') return 'misc';
  return cleaned;
}

function getTestFilePath(group, type) {
  const safeGroup = cleanGroupName(group);
  if (type === 'e2e') {
    return path.join(E2E_DIR, `${safeGroup}.Skeleton.e2e.test.ts`);
  } else {
    return path.join(INTEGRATION_DIR, `${safeGroup}.Skeleton.integration.test.tsx`);
  }
}

function getTestFileHeader(type) {
  if (type === 'e2e') {
    return `import { test, expect } from '@playwright/test';\n\n`;
  } else {
    return `import React from 'react';\nimport { render, screen } from '@testing-library/react';\nimport { describe, it, expect } from 'vitest';\n\n`;
  }
}

function isFormLike(flow) {
  // More robust: match any actionable flow
  return /form|editor|component|login|confirmation|deletion|verify|reset|recovery|invite|accept|reject|activate|reactivate|disable|enable|delete|remove|add|update|change|submit|save|send|confirm|approve|decline|error|fail|success/i.test(flow);
}

function getStarterLogic(flow, type) {
  const lower = flow.toLowerCase();
  const commonFields = [
    { label: /email/i, value: 'test@example.com' },
    { label: /password/i, value: 'Password123' },
    { label: /first name/i, value: 'Test' },
    { label: /last name/i, value: 'User' },
    { label: /theme/i, value: 'dark' },
    { label: /language/i, value: 'en' },
    { label: /items per page/i, value: '25' },
    { label: /date format/i, value: 'DD/MM/YYYY' },
    { label: /timezone/i, value: 'Europe/London' },
    { label: /name/i, value: 'Test User' },
    { label: /bio/i, value: 'Test bio' },
    { label: /location/i, value: 'Test location' },
    { label: /company/i, value: 'Test Company' },
    { label: /position/i, value: 'Manager' },
    { label: /industry/i, value: 'Tech' },
    { label: /company size/i, value: '50-100' }
  ];
  // Special actionable flows
  if (/login/.test(lower)) {
    if (type === 'e2e') {
      return [
        "await page.goto('/login');",
        "await page.fill('input[name=\"email\"]', 'user@example.com');",
        "await page.fill('input[name=\"password\"]', 'password123');",
        "await page.click('button[type=\"submit\"]'); // or use getByRole('button', { name: /login|sign in/i })",
        "// TODO: Assert login success (redirect, user menu, etc.)",
        "// await expect(page.locator('text=Profile')).toBeVisible();"
      ].join('\n  ');
    } else {
      return [
        "// render(<LoginForm />);",
        "// await user.type(screen.getByLabelText(/email/i), 'user@example.com');",
        "// await user.type(screen.getByLabelText(/password/i), 'password123');",
        "// await user.click(screen.getByRole('button', { name: /login|sign in/i }));",
        "// expect(screen.getByText(/profile|dashboard|logout/i)).toBeInTheDocument();"
      ].join('\n  ');
    }
  }
  if (/reset/.test(lower)) {
    if (type === 'e2e') {
      return [
        "await page.goto('/forgot-password');",
        "await page.fill('input[name=\"email\"]', 'user@example.com');",
        "await page.click('button[type=\"submit\"]'); // or use getByRole('button', { name: /reset/i })",
        "// TODO: Assert reset email sent message",
        "// await expect(page.locator('text=reset email sent')).toBeVisible();"
      ].join('\n  ');
    } else {
      return [
        "// render(<ResetPasswordForm />);",
        "// await user.type(screen.getByLabelText(/email/i), 'user@example.com');",
        "// await user.click(screen.getByRole('button', { name: /reset/i }));",
        "// expect(screen.getByText(/reset email sent/i)).toBeInTheDocument();"
      ].join('\n  ');
    }
  }
  if (/invite|accept/.test(lower)) {
    if (type === 'e2e') {
      return [
        "await page.goto('/invite'); // or relevant invite page",
        "// TODO: Fill in invite fields and submit",
        "// await page.fill('input[name=\"email\"]', 'invitee@example.com');",
        "await page.click('button[type=\"submit\"]'); // or use getByRole('button', { name: /invite|accept/i })",
        "// TODO: Assert invite sent/accepted message",
        "// await expect(page.locator('text=invite sent|accepted')).toBeVisible();"
      ].join('\n  ');
    } else {
      return [
        "// render(<InviteForm />);",
        "// await user.type(screen.getByLabelText(/email/i), 'invitee@example.com');",
        "// await user.click(screen.getByRole('button', { name: /invite|accept/i }));",
        "// expect(screen.getByText(/invite sent|accepted/i)).toBeInTheDocument();"
      ].join('\n  ');
    }
  }
  if (/delete|deletion|remove/.test(lower)) {
    if (type === 'e2e') {
      return [
        "// TODO: Navigate to the relevant page",
        "// await page.goto('/settings'); // or relevant page",
        "// TODO: Click delete/remove button",
        "await page.click('button[type=\"button\"]'); // or use getByRole('button', { name: /delete|remove/i })",
        "// TODO: Confirm deletion if needed",
        "// await page.click('button', { name: /confirm|yes|delete/i });",
        "// TODO: Assert deletion success message",
        "// await expect(page.locator('text=deleted|removed|success')).toBeVisible();"
      ].join('\n  ');
    } else {
      return [
        "// render(<DeleteDialog />);",
        "// await user.click(screen.getByRole('button', { name: /delete|remove/i }));",
        "// await user.click(screen.getByRole('button', { name: /confirm|yes|delete/i }));",
        "// expect(screen.getByText(/deleted|removed|success/i)).toBeInTheDocument();"
      ].join('\n  ');
    }
  }
  if (/verify|confirmation|confirm/.test(lower)) {
    if (type === 'e2e') {
      return [
        "// TODO: Navigate to the relevant page",
        "// await page.goto('/verify'); // or relevant page",
        "// TODO: Click verify/confirm button",
        "await page.click('button[type=\"submit\"]'); // or use getByRole('button', { name: /verify|confirm/i })",
        "// TODO: Assert verification/confirmation message",
        "// await expect(page.locator('text=verified|confirmed|success')).toBeVisible();"
      ].join('\n  ');
    } else {
      return [
        "// render(<VerifyDialog />);",
        "// await user.click(screen.getByRole('button', { name: /verify|confirm/i }));",
        "// expect(screen.getByText(/verified|confirmed|success/i)).toBeInTheDocument();"
      ].join('\n  ');
    }
  }
  if (/error|fail/.test(lower)) {
    if (type === 'e2e') {
      return [
        "// TODO: Trigger error condition",
        "// await ...",
        "// TODO: Assert error message",
        "await expect(page.locator('text=error|failed|problem')).toBeVisible();"
      ].join('\n  ');
    } else {
      return [
        "// TODO: Trigger error condition",
        "// ...",
        "// expect(screen.getByText(/error|failed|problem/i)).toBeInTheDocument();"
      ].join('\n  ');
    }
  }
  if (/success/.test(lower)) {
    if (type === 'e2e') {
      return [
        "// TODO: Trigger success condition",
        "// await ...",
        "// TODO: Assert success message",
        "await expect(page.locator('text=success|completed|done')).toBeVisible();"
      ].join('\n  ');
    } else {
      return [
        "// TODO: Trigger success condition",
        "// ...",
        "// expect(screen.getByText(/success|completed|done/i)).toBeInTheDocument();"
      ].join('\n  ');
    }
  }
  // Fallback to form logic if isFormLike
  if (isFormLike(flow)) {
    if (type === 'e2e') {
      const fieldLines = commonFields.map(f => `await page.fill('input[name="${f.label.source.replace(/\\/g, '')}"]', '${f.value}'); // Guess or adjust`);
      const buttonLine = "await page.click('button[type=\"submit\"]'); // or use getByRole('button', { name: /submit|save|create account|login/i })";
      return [
        '// TODO: Navigate to the form page',
        "// await page.goto('/path-to-form');",
        '// TODO: Fill in form fields (guessed from codebase)',
        ...fieldLines,
        '// TODO: Submit the form',
        buttonLine,
        '// TODO: Assert success or error message',
        "await expect(page.locator('.success')).toBeVisible();"
      ].join('\n  ');
    } else {
      const fieldLines = commonFields.map(f => `// await user.type(screen.getByLabelText(${f.label}), '${f.value}'); // Guess or adjust`);
      const buttonLine = "// await user.click(screen.getByRole('button', { name: /submit|save|create account|login/i }));";
      return [
        '// TODO: Render the form component',
        '// render(<FormComponent />);',
        '// TODO: Fill in fields using userEvent (guessed from codebase)',
        ...fieldLines,
        '// TODO: Submit the form',
        buttonLine,
        '// TODO: Assert success or error message',
        "// expect(screen.getByText(/success/i)).toBeInTheDocument();"
      ].join('\n  ');
    }
  }
  // Navigation flows
  if (/navigate|redirect|page loads|entry point|visit|go to|panel|dashboard|settings|profile|payment/.test(lower)) {
    if (type === 'e2e') {
      // Try to extract a path or use a common one
      let url = "'/' // TODO: Set correct path";
      if (lower.includes('profile')) url = "'/profile'";
      else if (lower.includes('settings')) url = "'/settings'";
      else if (lower.includes('payment')) url = "'/payment'";
      else if (lower.includes('dashboard')) url = "'/dashboard'";
      return [
        `await page.goto(${url});`,
        "// TODO: Replace with actual selector for heading or key element",
        lower.includes('profile') ? "await expect(page.locator('h1')).toContainText('Profile');" :
        lower.includes('settings') ? "await expect(page.locator('h1')).toContainText('Settings');" :
        lower.includes('payment') ? "await expect(page.locator('h1')).toContainText('Payment');" :
        lower.includes('dashboard') ? "await expect(page.locator('h1')).toContainText('Dashboard');" :
        "await expect(page.locator('h1')).toBeVisible();"
      ].join('\n  ');
    } else {
      return [
        "// TODO: Render the component and check for heading or key element",
        "// Example:",
        lower.includes('profile') ? "// expect(screen.getByRole('heading', { name: /profile/i })).toBeInTheDocument();" :
        lower.includes('settings') ? "// expect(screen.getByRole('heading', { name: /settings/i })).toBeInTheDocument();" :
        lower.includes('payment') ? "// expect(screen.getByRole('heading', { name: /payment/i })).toBeInTheDocument();" :
        lower.includes('dashboard') ? "// expect(screen.getByRole('heading', { name: /dashboard/i })).toBeInTheDocument();" :
        "// expect(screen.getByRole('heading')).toBeInTheDocument();"
      ].join('\n  ');
    }
  }
  // Payment flows
  if (/payment|pay|card|billing|checkout/.test(lower)) {
    if (type === 'e2e') {
      return [
        '// TODO: Navigate to the payment page',
        "await page.goto('/payment');",
        '// TODO: Fill in payment fields (guessing common field names)',
        "await page.fill('input[name=\"cardNumber\"]', '4111111111111111'); // Guess",
        "await page.fill('input[name=\"expiration\"]', '12/25'); // Guess",
        "await page.fill('input[name=\"cvv\"]', '123'); // Guess",
        '// TODO: Click the pay button',
        "await page.click('button[type=\"submit\"]'); // or use getByRole('button', { name: /pay/i })",
        '// TODO: Assert payment success message',
        "await expect(page.locator('.success')).toBeVisible();"
      ].join('\n  ');
    } else {
      return [
        '// TODO: Render the payment form component',
        '// render(<PaymentForm />);',
        '// TODO: Fill in payment fields using userEvent (guessing field names)',
        "// await user.type(screen.getByLabelText(/card number/i), '4111111111111111'); // Guess",
        "// await user.type(screen.getByLabelText(/expiration/i), '12/25'); // Guess",
        "// await user.type(screen.getByLabelText(/cvv/i), '123'); // Guess",
        '// TODO: Click the pay button',
        "// await user.click(screen.getByRole('button', { name: /pay/i }));",
        '// TODO: Assert payment success message',
        "// expect(screen.getByText(/payment successful/i)).toBeInTheDocument();"
      ].join('\n  ');
    }
  }
  // Toggle/switch flows
  if (/toggle|switch|change|select|enable|disable|preference|setting|privacy|theme|notification/.test(lower)) {
    if (type === 'e2e') {
      const checkboxLine = "await page.click('input[type=\"checkbox\"]'); // or use getByRole('checkbox', { name: /toggle|accept terms|report/i })";
      return [
        '// TODO: Navigate to the relevant page',
        "// await page.goto('/path-to-settings');",
        '// TODO: Click the toggle/switch (guessed from codebase)',
        checkboxLine,
        '// TODO: Assert the state change',
        "await expect(page.locator('input[type=\"checkbox\"]')).toBeChecked();"
      ].join('\n  ');
    } else {
      const checkboxLine = "// await user.click(screen.getByRole('checkbox', { name: /toggle|accept terms|report/i }));";
      return [
        '// TODO: Render the settings component',
        '// render(<SettingsComponent />);',
        '// TODO: Click the toggle/switch using userEvent (guessed from codebase)',
        checkboxLine,
        '// TODO: Assert the state change',
        "// expect(screen.getByRole('checkbox')).toBeChecked();"
      ].join('\n  ');
    }
  }
  // Default fallback
  return [
    "// TODO: Implement this flow based on MANUAL_VERIFICATION_CHECKLIST.md"
  ].join('\n  ');
}

function getTestBlock(flow, type) {
  const starter = getStarterLogic(flow, type);
  if (type === 'e2e') {
    return `test.skip('${flow}', async ({ page }) => {\n  ${starter}\n});\n`;
  } else {
    return `it.skip('${flow}', async () => {\n  ${starter}\n});\n`;
  }
}

// --- MAIN ---
const checklistMd = fs.readFileSync(CHECKLIST_PATH, 'utf8');
const flows = extractFlowsFromChecklist(checklistMd);
const testFiles = [
  ...getAllTestFiles(E2E_DIR),
  ...getAllTestFiles(INTEGRATION_DIR),
];

// Identify missing tests
const missing = flows.filter((flow) => fuzzyMatch(flow, testFiles).length === 0);
const grouped = groupFlows(missing);

let report = `# Generated Test Skeletons Report\n\n`;
report += `The following test skeletons were generated for missing flows (all tests are skipped by default):\n\n`;

Object.entries(grouped).forEach(([group, flows]) => {
  // Infer test type by majority
  const type = inferTestType(group);
  const filePath = getTestFilePath(group, type);
  let content = getTestFileHeader(type);
  if (type === 'e2e') {
    content += `test.describe('${group} Flows', () => {\n`;
    flows.forEach((flow) => {
      content += '  ' + getTestBlock(flow, type).replace(/\n/g, '\n  ') + '\n';
    });
    content += `});\n`;
  } else {
    content += `describe('${group} Flows', () => {\n`;
    flows.forEach((flow) => {
      content += '  ' + getTestBlock(flow, type).replace(/\n/g, '\n  ') + '\n';
    });
    content += `});\n`;
  }
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, 'utf8');
  report += `- **${group}**: ${filePath.replace(process.cwd() + path.sep, '')} (${flows.length} test(s))\n`;
  flows.forEach((flow) => {
    report += `  - ${flow}\n`;
  });
});

fs.writeFileSync(REPORT_PATH, report, 'utf8');
console.log(`\nTest skeletons generated. See ${REPORT_PATH} for summary.\n`); 