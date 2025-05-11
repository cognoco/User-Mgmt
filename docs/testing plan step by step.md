# Test Remediation – Step-by-Step Plan (2024-06)

This plan turns the high-level "Systematic Test Remediation Plan" in `docs/TESTING_ISSUES.md` into **concrete, check-box tasks** that can be carried out sequentially by developers _and_ QA engineers.  Each task focuses on a single root-cause category so we avoid shotgun-debugging individual tests.

---

## 0. Preparation & Ground Rules

- [ ] **Create a dedicated branch** `test/fix-suite-2024-06` and keep feature work off this branch.
- [ ] **Freeze non-test PRs** while the suite is red to prevent regression noise.
- [ ] Ensure everyone has read:
  - `docs/TESTING.md`
  - `docs/TESTING_ISSUES.md`
  - These step-by-step instructions.

---

## 1. Baseline & Failure Categorisation  (Owner: QA)

- [ ] Run `pnpm test --run --reporter=json > tmp/test-baseline.json` to capture the current snapshot.
- [ ] Use [`vitest-friendly-console`](https://github.com/vitest-dev/vitest/tree/main/packages/friendly-console) or any reporter to group failures by **file** and **error kind**.
- [ ] Update `docs/Testing_Findings.md` with:  
  `### 2024-06-Baseline`  
  Paste aggregated numbers (e.g. *40 translation misses*, *22 act warnings*, *18 mocking errors*, etc.).

> Why?  Gives us a measurable starting point and lets us prove progress.

---

## 2. Global Test Environment Hardening  (Owner: Dev)

**Goal:** Remove noisy environment errors that cascade into many test failures.

| Sub-task | Checklist |
| --- | --- |
| **2-A. React 18 act warnings** | 1. Wrap all `userEvent.*` and direct store mutations in `await act(async () => { … })` inside `src/tests/__helpers__/testUtils.tsx`.  <br/>2. Export `user` helper that auto-wraps. |
| **2-B. JSDOM polyfills** | 1. Extend `vitest.setup.ts` with polyfills for `window.scrollTo`, `IntersectionObserver`, `ResizeObserver`, and `navigator.clipboard`.  <br/>2. Stub `window.location.assign` & `replace`. |
| **2-C. Next.js router/navigation mocks** | 1. In `__mocks__/next-router.ts`, mock `useRouter`, `usePathname`, `useSearchParams` to avoid "Not implemented: navigation" errors.  <br/>2. Register mock in `vitest.setup.ts`. |
| **2-D. Env-var plumbing** | 1. Load `.env.test` via `dotenv/config` in `vitest.setup.ts`.  <br/>2. Provide fall-backs for critical env vars (e.g. `SUPABASE_URL`). |

When all sub-tasks are done:  
- [ ] Re-run suite & update baseline – expect ~20-30% drop in failures.

---

## 3. Mocking Infrastructure Upgrades (Owner: Dev)

### 3-A. Supabase Query-Builder Chain Mock

- [ ] Refactor `src/tests/mocks/supabase.ts` to export a **factory** that returns (**select**, **insert**, **update**, **delete**, **eq**, **then**) chainable mocks as per example in `TESTING_ISSUES.md`.
- [ ] Update all tests that import this mock to use the new factory.

### 3-B. Axios vs. MSW

- [ ] Replace MSW handlers that target axios with `vi.spyOn(api, 'post'|'get'|...)` in failing tests, per guidance.
- [ ] Document this in `docs/TESTING.md#axios-mocking`.

Once done:  
- [ ] Re-run suite – translation & DOM-query failures should now dominate.

---

## 4. i18n / Translation Fixes  (Owner: Dev + i18n PO)

Many "Unable to find text" errors stem from missing translation keys or the i18next test backend not being initialised.

- [ ] Ensure `tests/i18nTestInit.ts` instantiates **i18next** with `resources: { en: translationJson }` and `lng:'en'`.
- [ ] Add any **missing keys** spotted in failing tests to `src/locales/en/translation.json` (or mark TODO for product owner).
- [ ] Add utility `renderWithI18n` that wraps `I18nextProvider`.

Re-run suite – expect a **large** chunk of component tests to pass.

---

## 5. Shared Test Utilities Consolidation  (Owner: Dev)

- [ ] Create `src/tests/__helpers__/renderWithProviders.tsx` that mounts:
  - Theme Provider
  - QueryClientProvider (react-query)
  - Redux/Zustand Provider (if needed) – use in-memory stores
  - I18next Provider (from step 4)
- [ ] Refactor component & integration tests to import this helper instead of local wrappers.

Result: eliminates duplicated provider setup and reduces per-test boilerplate.

---

## 6. Rate-Limit Middleware Tests  (Owner: Dev specialised in backend)

The _rate-limit_ suite is failing due to an un-mocked in-memory store (likely Redis).

- [ ] Introduce `src/tests/mocks/rateLimitStore.ts` – simple Map with TTL.
- [ ] Inject via DI: modify middleware to accept `store` param with default to real implementation.
- [ ] In tests, pass mock store so we can advance fake timers & assert calls.

Re-run only `vitest run src/middleware/__tests__/rate-limit.test.ts` – should be green.

---

## 7. High-Priority Component Suites  (Owner: Front-end Dev)

We target the suites **blocking E2E flows** first.

| Suite | Root Cause | Fix |
| --- | --- | --- |
| `AdminDashboard` | Skeleton query selector returns 0 | Add `data-testid="skeleton"` to Skeleton component or adjust selector. |
| `User Preferences Flow` | Supabase mock `.select` chain | Covered by Step 3-A. |
| `Theme Settings` | Same as above + missing `user_preferences` keys | Covered by Steps 3 & 4. |

Mark each suite ✅ in this doc when fixed.

---

## 8. Long-Tail Failures & Regression Guard  (Owner: Dev + QA)

- [ ] Iterate over remaining red tests; open **small PRs** per component/middleware to keep review scope tight.
- [ ] Add **Vitest coverage threshold** (e.g. `statements > 70%`) in `vitest.config.ts` once suite passes.
- [ ] Configure **CI job** `pnpm test --run` and block merge on failure.

---

## 9. Close-Out  

- [ ] Remove `test/fix-suite-2024-06` branch once merged into `main`.
- [ ] Update `docs/TESTING_ISSUES.md` – move solved items to **Resolved 2024-06**.
- [ ] Celebrate! 🥳

---

### Progress Tracker

Copy the table below into your PR description and keep it up to date.

| Step | Status | Owner | Notes |
| --- | --- | --- | --- |
| 0. Prep | ⬜ | | |
| 1. Baseline | ⬜ | | |
| 2. Env Hardening | ⬜ | | |
| 3. Mocking | ⬜ | | |
| 4. i18n | ⬜ | | |
| 5. Shared Utils | ⬜ | | |
| 6. Rate-Limit | ⬜ | | |
| 7. Component Suites | ⬜ | | |
| 8. Long-Tail | ⬜ | | |
| 9. Close-Out | ⬜ | | |

---

> **Reminder:** Follow the "one-functionality-per-PR" rule – each checkbox should land in its own PR unless it is a trivial change.
Reference: 
Failed Test Files:
  - src\hooks\__tests__\usePayment.test.ts
  - src\hooks\__tests__\usePermission.test.tsx
  - src\hooks\__tests__\useSubscription.test.ts
  - src\middleware\__tests__\audit-log.test.ts
  - src\middleware\__tests__\auth.test.js
  - src\middleware\__tests__\csrf.test.ts
  - src\middleware\__tests__\index.test.ts
  - src\middleware\__tests__\permissions.test.ts
  - src\middleware\__tests__\rate-limit.test.ts
  - src\components\audit\__tests__\AuditLogViewer.test.tsx
  - src\components\admin\__tests__\AdminDashboard.test.tsx
  - src\components\admin\__tests__\RoleManagementPanel.test.tsx
  - src\components\profile\__tests__\ProfilePrivacySettings.test.tsx
  - src\components\auth\__tests__\BusinessSSOSetup.test.tsx
  - src\components\auth\__tests__\DomainBasedOrgMatching.test.tsx
  - src\components\auth\__tests__\IDPConfiguration.test.tsx
  - src\components\auth\__tests__\OrganizationSSO.test.tsx
  - src\lib\database\__tests__\database.test.tsx
  - src\lib\database\__tests__\supabase.test.tsx
  - src\lib\rbac\__tests__\roleService.test.ts
  - src\lib\stores\__tests__\subscription.store.test.ts
  - src\lib\auth\__tests__\mfa\mfa.test.ts
  - src\lib\auth\__tests__\mfa\setup.test.tsx
  - src\lib\auth\__tests__\sso\business-sso.test.tsx
  - src\lib\auth\__tests__\sso\personal-sso.test.tsx
  - src\lib\auth\__tests__\session\business-policies.test.tsx
  - src\tests\integration\account-switching-flow.test.tsx
  - src\tests\integration\admin-users-flow.test.tsx
  - src\tests\integration\api-error-messages.test.tsx
  - src\tests\integration\backup.integration.test.tsx
  - src\tests\integration\collaboration-flow.test.tsx
  - src\tests\integration\connected-accounts.integration.test.tsx
  - src\tests\integration\data-management-flow.test.tsx
  - src\tests\integration\empty-states.test.tsx
  - src\tests\integration\error-recovery-flow.test.tsx
  - src\tests\integration\export-import-flow.test.tsx
  - src\tests\integration\feedback-submission-flow.test.tsx
  - src\tests\integration\file-upload-flow.test.tsx
  - src\tests\integration\notification-flow.test.tsx
  - src\tests\integration\password-reset-flow.test.tsx
  - src\tests\integration\theme-settings-flow.test.tsx
  - src\tests\integration\user-preferences-flow.test.tsx
