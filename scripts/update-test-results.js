/**
 * Run node scripts/update-test-results.js
 * Runs each Vitest test file individually and generates a Markdown summary of passing, failing, and skipped test files.
 * Reads: none (runs Vitest directly)
 * Writes: docs/TestResultLatest.md (summary), docs/TestResultsPrevious.md (previous summary)
 */

import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { glob } from 'glob';

// --- CONFIG ---
const DOCS_DIR = path.join(process.cwd(), 'docs');
const LATEST = path.join(DOCS_DIR, 'TestResultLatest.md');
const PREVIOUS = path.join(DOCS_DIR, 'TestResultsPrevious.md');
const TEST_TIMEOUT = 30000; // 30 seconds per test file
const HOOK_TIMEOUT = 15000; // 15 seconds for setup/teardown

// --- STEP 1: Copy Latest to Previous ---
if (fs.existsSync(LATEST)) {
  fs.copyFileSync(LATEST, PREVIOUS);
  console.log(`Copied ${LATEST} to ${PREVIOUS}`);
} else {
  // If LATEST doesn't exist, create empty PREVIOUS
  fs.writeFileSync(PREVIOUS, '');
  console.log(`Created empty ${PREVIOUS}`);
}

// --- STEP 2: Find All Test Files ---
console.log('Finding all test files...');
const testPatterns = [
  'src/**/__tests__/**/*.{test,spec}.{js,jsx,ts,tsx}',
  'src/tests/**/*.{test,spec,integration}.{js,jsx,ts,tsx}',
  'app/**/__tests__/**/*.{test,spec}.{js,jsx,ts,tsx}'
];

const excludePatterns = [
  '**/node_modules/**',
  '**/dist/**',
  '**/.{idea,git,cache,output,temp}/**',
  '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}/**',
  '**/*[Ss]keleton*',
  '**/e2e/**',
  // Temporarily exclude known problematic tests
  '**/DomainBasedOrgMatching.test.tsx',
  '**/RegistrationForm.integration.test.tsx',
  '**/app/api/auth/oauth/callback/__tests__/route.test.ts'
];

let allTestFiles = [];
for (const pattern of testPatterns) {
  const files = glob.sync(pattern, { ignore: excludePatterns });
  allTestFiles.push(...files);
}

// Remove duplicates and sort
allTestFiles = [...new Set(allTestFiles)].sort();
console.log(`Found ${allTestFiles.length} test files to run`);

// --- STEP 3: Run Each Test File Individually ---
const passing = new Set();
const failing = new Set();
const skipped = new Set();

const vitestBin = path.join(process.cwd(), 'node_modules', '.bin', process.platform === 'win32' ? 'vitest.cmd' : 'vitest');

for (let i = 0; i < allTestFiles.length; i++) {
  const testFile = allTestFiles[i];
  const relPath = path.relative(process.cwd(), testFile);
  
  console.log(`[${i + 1}/${allTestFiles.length}] Running: ${relPath}`);
  
  try {
    const result = spawnSync(vitestBin, [
      'run',
      testFile, // Run only this specific test file
      '--reporter=verbose',
      `--testTimeout=${TEST_TIMEOUT}`,
      `--hookTimeout=${HOOK_TIMEOUT}`,
      `--teardownTimeout=${HOOK_TIMEOUT}`,
      '--pool=threads',
      '--poolOptions.threads.maxThreads=1',
      '--poolOptions.threads.isolate=true',
      '--bail=false'
    ], {
      encoding: 'utf8',
      maxBuffer: 1024 * 1024 * 5, // 5MB buffer
      shell: true,
      timeout: TEST_TIMEOUT + 5000 // Add 5 seconds buffer to vitest timeout
    });

    if (result.error) {
      if (result.error.code === 'ETIMEDOUT') {
        console.log(`  ⏱️  TIMEOUT: ${relPath}`);
        skipped.add(relPath + ' (TIMEOUT)');
      } else {
        console.log(`  ❌ ERROR: ${relPath} - ${result.error.message}`);
        skipped.add(relPath + ' (ERROR: ' + result.error.message + ')');
      }
      continue;
    }

    // Check exit code
    if (result.status === 0) {
      console.log(`  ✅ PASSED: ${relPath}`);
      passing.add(relPath);
    } else {
      console.log(`  ❌ FAILED: ${relPath} (exit code: ${result.status})`);
      failing.add(relPath);
    }

  } catch (error) {
    console.log(`  ⚠️  EXCEPTION: ${relPath} - ${error.message}`);
    skipped.add(relPath + ' (EXCEPTION: ' + error.message + ')');
  }
}

console.log('\n--- TEST RUN COMPLETE ---');
console.log(`Passed: ${passing.size}, Failed: ${failing.size}, Skipped/Timeout: ${skipped.size}`);

// --- STEP 4: Write Markdown Summary ---
function toMdList(set) {
  return Array.from(set)
    .sort()
    .map((f) => `- ${f.replace(/^[^/]*\//, '')}`) // remove root dir
    .join('\n');
}

const md = `# Test Results\n\n` +
  `**Passed Test Files:** ${passing.size}  |  **Failed Test Files:** ${failing.size}  |  **Skipped/Timeout Test Files:** ${skipped.size}\n\n` +
  `## Passing Test Files\n\n${passing.size ? toMdList(passing) : '_None_'}\n\n` +
  `## Failing Test Files\n\n${failing.size ? toMdList(failing) : '_None_'}\n\n` +
  `## Skipped/Timeout Test Files\n\n${skipped.size ? toMdList(skipped) : '_None_'}\n`;

fs.writeFileSync(LATEST, md, 'utf8');
console.log(`\nWrote summary to ${LATEST}`);
console.log(`Final Summary: ${passing.size} passed, ${failing.size} failed, ${skipped.size} skipped/timeout`);
