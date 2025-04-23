TESTING_FINDINGS.md
Summary of Current Test Failures and Issues (2024-06)
This document records the results of the latest test run, highlights key failures, and provides actionable recommendations for addressing them. It should be updated as issues are resolved or new problems are discovered.
1. UI/Component Test Failures
Data Export (Company & Personal):
Tests expect a success message after clicking "Download", but only error messages ("Failed to export...") are rendered.
Possible causes: Export logic is not mocked, or test setup does not simulate a successful export.
Action: Mock export/download logic in tests to simulate both success and failure.
Profile Verification:
Test fails due to multiple elements matching /verified/i.
Action: Use getAllByText or a more specific matcher in the test.
Remove Member Dialog:
Test cannot find the text Please type "remove" to confirm or Failed to remove member.
Possible cause: Text is split across elements or not rendered as expected.
Action: Use a function matcher or query by role/label; check if the UI renders the text as expected.
2. Store/State Management Test Failures
Auth Store Tests:
useAuthStore.getState and useAuthStore.setState are not functions.
Indicates a mismatch between the test and the actual store implementation (possibly due to a refactor or import path issue).
Action:
Investigate import paths and ensure tests use the correct, up-to-date store implementation.
Check for changes in the store API (e.g., if using Zustand, ensure the store exposes getState/setState).
3. Unhandled Rejections/Timeouts
Some tests (e.g., search-filter-flow.test.tsx, ProfileTypeConversion.test.tsx) are timing out or running out of memory.
Action:
Check for infinite loops, unmocked async calls, or very large test data.
Run problematic tests individually to isolate the cause.
4. General Recommendations
Prioritize fixing store/state management test issues, as these may affect many other tests.
After each fix, re-run only the affected test files to verify the fix before running the full suite again.
Update docs/TESTING_ISSUES.md as issues are resolved or new ones are found.
This file should be maintained alongside TESTING.md and TESTING_ISSUES.md for a complete view of the testing landscape.
