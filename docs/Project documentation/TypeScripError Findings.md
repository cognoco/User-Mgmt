# TypeScript Error Findings

## 1. 'Cannot find namespace vi' in Test Files

### Issue
- TypeScript could not find the `vi` namespace (and other Vitest globals like `expect`, `it`, `describe`) in test files, even though Vitest was installed and test files imported `vi` from 'vitest'.
- Errors included:
  - `Cannot find namespace 'vi'`
  - `Cannot find name 'expect'`, `it`, `describe`, etc.

### Root Cause
- TypeScript was not loading the correct Vitest type definitions for test files.
- The `tsconfig.test.json` and `tsconfig.json` were not optimally configured to ensure Vitest globals were available everywhere needed.

### Solution
- Updated both `tsconfig.json` and `tsconfig.test.json`:
  - Changed `"types"` to `["vitest", "@testing-library/jest-dom"]` (removed `vitest/globals`).
  - Added `"moduleResolution": "node"` to `tsconfig.test.json`.
  - Expanded the `include` array in `tsconfig.test.json` to cover all relevant folders: `src`, `app`, `tests`, `e2e`, and all test file patterns.
- Ran a clean build and type check with:
  ```powershell
  Remove-Item -Recurse -Force .\node_modules\.vite, .\node_modules\.tsbuildinfo, .\dist, .\build; npx tsc --noEmit -p tsconfig.test.json
  ```
- Restarted the editor/IDE to ensure new config was picked up.

### Result
- All Vitest globals (`vi`, `expect`, `it`, `describe`, etc.) are now recognized by TypeScript in all test files.

---

## 2. TypeScript Syntax in .js Files

### Issue
- TypeScript reported errors like:
  - `'interface' declarations can only be used in TypeScript files.`
  - `Type annotations can only be used in TypeScript files.`
- These errors occurred in files with a `.js` extension that contained TypeScript-specific syntax (interfaces, type annotations).

### Root Cause
- TypeScript syntax is only valid in `.ts` or `.tsx` files, not `.js` files.

### Solution
- Rename affected files from `.js` to `.ts` or `.tsx` (if they contain JSX).
- Update all imports to use the new file extension if necessary.
- Re-run the type check to confirm resolution.

---

## 3. Methodology: How to Systematically Diagnose TypeScript Errors

> **Team Instructions:**
> Please review this report carefully. Namespace errors (like with `vi` or other globals) require deep analysis. This issue was attempted to be fixed four times, and what seemed to be the fix never was—so be extra careful. Fixes in one place can introduce issues elsewhere. **Before making any fix, always read at least 2-3 failing files and 2-3 files of the same type that are not failing to compare and analyze the issue properly. Never assume you have found the issue before you PROPERLY investigate and verify!**

When facing persistent or unclear TypeScript errors, follow this structured approach to avoid jumping to conclusions and to quickly identify the true root cause:

### 1. **Read the Full Error Message**
   - Carefully review the entire error output, not just the first line. Look for file paths, line numbers, and suggested fixes.

### 2. **Identify Patterns**
   - Are errors isolated to certain files, file types, or locations (e.g., only test files, only `.js` files)?
   - Do multiple errors share a common theme (e.g., missing globals, type incompatibility, config issues)?
   - **Explicitly:** Before any fix, read at least 2-3 failing files and 2-3 similar files that are not failing. Compare their structure, imports, and context to understand the real difference.

### 3. **Check TypeScript Configuration**
   - Review all relevant `tsconfig.json` files (including test-specific configs).
   - Verify `types`, `include`, `exclude`, `module`, and `moduleResolution` fields.
   - Ensure test files are included by the correct config.

### 4. **Check for Stale or Conflicting Files**
   - Look for leftover type definition files (e.g., `vitest-globals.d.ts`) or old config files in subfolders.
   - Clean build artifacts and caches before re-testing.

### 5. **Confirm File Extensions and Syntax**
   - Ensure files using TypeScript syntax have `.ts` or `.tsx` extensions.
   - Check for accidental use of TypeScript features in `.js` files.

### 6. **Restart Your Editor/IDE**
   - Editors may cache old config or type information. Restart to force a refresh after config changes.

### 7. **Test Incremental Changes**
   - Make one change at a time (e.g., update `types`, then re-test) to isolate the effect of each adjustment.
   - **Be aware:** Fixes in one place can introduce issues in another. After each change, re-check a sample of both previously failing and passing files.

### 8. **Consult Documentation and Community**
   - Reference official docs for TypeScript, Vitest, and your stack.
   - Search for error messages on GitHub, Stack Overflow, or relevant forums.

### 9. **Document Findings and Solutions**
   - Keep a log of what you tried, what worked, and what didn't. This helps avoid repeating steps and speeds up future troubleshooting.

### 10. **Mindset Tips**
   - Don't assume the first "obvious" fix is correct—verify with evidence.
   - Be methodical and patient; deep issues often have subtle causes.
   - Collaborate and ask for a second opinion if stuck.

---

**Summary:**
- Use a systematic, evidence-based approach to diagnose TypeScript errors.
- Avoid quick fixes without understanding the underlying cause.
- Always compare multiple failing and non-failing files before acting.
- Document your process for future reference and team knowledge sharing.
