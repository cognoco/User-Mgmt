
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
console.log('Running tests...');
const vitestBin = path.join(process.cwd(), 'node_modules', '.bin', process.platform === 'win32' ? 'vitest.cmd' : 'vitest');
const result = spawnSync(vitestBin, ['run', '--reporter=json', `--outputFile=${TEMP_JSON}`], {
  encoding: 'utf8',
  maxBuffer: 1024 * 1024 * 10,
  shell: true,
});

if (result.error) {
  console.error('Error running tests:', result.error);
  process.exit(1);
}

if (!fs.existsSync(TEMP_JSON)) {
  fs.writeFileSync(LATEST, 'Error: Vitest did not produce a JSON output file.\n');
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

// Use the 'testResults' array and check the 'status' and 'name' fields
if (Array.isArray(vitestJson.testResults)) {
  for (const file of vitestJson.testResults) {
    if (!file.name || !file.status) continue;
    const relPath = path.relative(process.cwd(), file.name);
    if (file.status === 'passed') {
      passing.add(relPath);
    } else if (file.status === 'failed') {
      failing.add(relPath);
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
  `**Passed Test Files:** ${passing.size}  |  **Failed Test Files:** ${failing.size}\n\n` +
  `## Passing Test Files\n\n${passing.size ? toMdList(passing) : '_None_'}\n\n## Failing Test Files\n\n${failing.size ? toMdList(failing) : '_None_'}\n`;

fs.writeFileSync(LATEST, md, 'utf8');
console.log(`Wrote summary to ${LATEST}`);

// Clean up temp file
try { fs.unlinkSync(TEMP_JSON); } catch (e) { /* ignore error if file does not exist */ }
