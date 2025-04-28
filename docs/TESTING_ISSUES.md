# TESTING_ISSUES.md

## Approach Update (2024-06)

- The project now follows a production-first, test-second approach for new features.
- Test skeletons are only created in advance if a feature is high-risk or likely to cause regressions.
- This ensures that tests are always written against the real, user-facing implementation.

## Known Issues
- See previous entries for ongoing and resolved issues.
- Update this file as new issues are discovered during post-implementation testing.

---

## Systematic Test Remediation Plan (2024-06)

### Widespread Issues Identified
- **React act(...) Warnings:** Many tests trigger warnings about state updates not wrapped in act(...), especially with Radix UI and form components. This can cause flakiness and unreliable results.
- **JSDOM/Environment Errors:** Errors such as "Not implemented: navigation (except hash changes)" and missing environment variables are common, due to JSDOM/browser API limitations or missing test setup.
- **Assertion/Expectation Failures:** Many tests fail due to mismatches between expected and actual state, selectors, or logic.
- **Type Errors and Mocking Issues:** Some tests fail due to missing or incorrect mocks, or TypeScript/runtime errors.

### Remediation Plan
1. **Batch-Fix React act(...) Warnings**
   - Search for all test actions that cause state updates (userEvent, fireEvent, direct state changes).
   - Wrap these actions in `await act(async () => { ... })` or `await waitFor(...)` as appropriate.
   - Apply this fix across all test files.

2. **Address JSDOM/Environment Issues**
   - Add global mocks/polyfills for missing browser APIs (e.g., navigation) in the test setup file.
   - Ensure all required environment variables are set or mocked for tests.

3. **Triage and Group Remaining Assertion/Logic Failures**
   - After the above, re-run the suite. Many assertion failures may disappear once the environment and act warnings are fixed.
   - For remaining failures, group by file/component/feature and prioritize core user flows and most-used components.
   - Fix or update tests to match current app logic, or fix real bugs if found.

4. **Document and Track Progress**
   - Maintain a running markdown file (e.g., TEST_FAILURES.md) with categories of failures, files/tests affected, and status.

5. **Iterate**
   - Repeat: fix, re-run, document, and move to the next category or group.

---

**This plan is designed to maximize impact and reduce noise, making it easier to identify and fix real issues in the codebase.**

## For Detailed Test Findings and Coverage Gaps

- For the latest test run results and actionable findings, see [`docs/Testing_Findings.md`](./Testing_Findings.md).
- For the canonical list of missing tests and coverage gaps, see [`docs/GAP_ANALYSIS.md`](./GAP_ANALYSIS.md).
