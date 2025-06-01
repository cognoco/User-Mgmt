/**
 * Run node scripts/update-test-results.js
 * Runs all Vitest tests and generates a Markdown summary of passing and failing test files.
 * Reads: none (runs Vitest directly)
 * Writes: docs/TestResultLatest.md (summary), docs/TestResultsPrevious.md (previous summary)
 */

import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import os from 'os';

// --- CONFIG ---
const DOCS_DIR = path.join(process.cwd(), 'docs');
const LATEST = path.join(DOCS_DIR, 'TestResultLatest.md');
const PREVIOUS = path.join(DOCS_DIR, 'TestResultsPrevious.md');
const TEMP_JSON = path.join(os.tmpdir(), `vitest-results-${Date.now()}.json`);

// --- STEP 1: Copy Latest to Previous ---
if (fs.existsSync(LATEST)) {
  fs.copyFileSync(LATEST, PREVIOUS);
  console.log(`Copied ${LATEST} to ${PREVIOUS}`);
} else {
  // If LATEST doesn't exist, create empty PREVIOUS
  fs.writeFileSync(PREVIOUS, '');
  console.log(`Created empty ${PREVIOUS}`);
}

// --- STEP 2: Run Vitest with JSON Reporter to File ---
console.log('Running tests with aggressive timeouts...');
const vitestBin = path.join(process.cwd(), 'node_modules', '.bin', process.platform === 'win32' ? 'vitest.cmd' : 'vitest');

// Run with aggressive timeouts and limited threads
const result = spawnSync(vitestBin, [
  'run', 
  '--reporter=json', 
  `--outputFile=${TEMP_JSON}`,
  '--testTimeout=8000',    // 8 second timeout per test
  '--hookTimeout=3000',    // 3 second timeout for hooks
  '--teardownTimeout=3000', // 3 second timeout for teardown
  '--pool=threads',
  '--poolOptions.threads.maxThreads=2', // Limit to 2 threads to reduce contention
  '--poolOptions.threads.isolate=true',
  '--bail=false'           // Don't stop on first failure
], {
  encoding: 'utf8',
  maxBuffer: 1024 * 1024 * 20, // Increase buffer size
  shell: true,
  timeout: 300000  // 5 minute timeout for entire test run
});

console.log('Test run completed with exit code:', result.status);
if (result.stdout) {
  console.log('STDOUT:', result.stdout.substring(0, 500) + '...');
}
if (result.stderr) {
  console.log('STDERR:', result.stderr.substring(0, 500) + '...');
}

if (result.error) {
  console.error('Error running tests:', result.error);
  if (result.error.code === 'ETIMEDOUT') {
    console.log('Tests timed out after 5 minutes - some tests are likely stuck');
  }
}

// Check if JSON file was created
if (!fs.existsSync(TEMP_JSON)) {
  const errorMsg = `Error: Vitest did not produce a JSON output file.\nExit code: ${result.status}\nError: ${result.error?.message || 'Unknown'}\n`;
  fs.writeFileSync(LATEST, errorMsg);
  console.log('No JSON output file found, but continuing...');
  
  // Try to create a basic summary from stdout if available
  if (result.stdout && result.stdout.includes('Test Files')) {
    const summary = extractSummaryFromStdout(result.stdout);
    fs.writeFileSync(LATEST, summary);
  }
  
  process.exit(1);
}

let vitestJson;
try {
  vitestJson = JSON.parse(fs.readFileSync(TEMP_JSON, 'utf8'));
} catch (e) {
  console.error('Failed to parse Vitest JSON output:', e);
  fs.writeFileSync(LATEST, 'Error: Failed to parse Vitest JSON output.\n');
  process.exit(1);
}

// --- STEP 3: Extract Passing and Failing Test Files ---
const passing = new Set();
const failing = new Set();
const skipped = new Set();

// Use the 'testResults' array and check the 'status' and 'name' fields
if (Array.isArray(vitestJson.testResults)) {
  for (const file of vitestJson.testResults) {
    if (!file.name || !file.status) continue;
    const relPath = path.relative(process.cwd(), file.name);
    if (file.status === 'passed') {
      passing.add(relPath);
    } else if (file.status === 'failed') {
      failing.add(relPath);
    } else if (file.status === 'skipped') {
      skipped.add(relPath);
    }
  }
} else if (Array.isArray(vitestJson.results)) {
  for (const file of vitestJson.results) {
    if (!file.file || !file.result) continue;
    const relPath = path.relative(process.cwd(), file.file);
    if (file.result === 'pass') {
      passing.add(relPath);
    } else if (file.result === 'fail') {
      failing.add(relPath);
    } else if (file.result === 'skip') {
      skipped.add(relPath);
    }
  }
} else if (Array.isArray(vitestJson)) {
  for (const file of vitestJson) {
    if (!file.file || !file.status) continue;
    const relPath = path.relative(process.cwd(), file.file);
    if (file.status === 'pass') {
      passing.add(relPath);
    } else if (file.status === 'fail') {
      failing.add(relPath);
    } else if (file.status === 'skip') {
      skipped.add(relPath);
    }
  }
}

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
console.log(`Wrote summary to ${LATEST}`);
console.log(`Summary: ${passing.size} passed, ${failing.size} failed, ${skipped.size} skipped/timeout`);

// Clean up temp file
try { fs.unlinkSync(TEMP_JSON); } catch (e) { /* ignore error if file does not exist */ }

// Helper function to extract summary from stdout when JSON fails
function extractSummaryFromStdout(stdout) {
  return `# Test Results (from stdout)\n\n${stdout}\n\nNote: JSON output failed, showing console output instead.\n`;
}
