import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- CONFIG ---
const CHECKLIST_PATH = path.join(__dirname, '../docs/MANUAL_VERIFICATION_CHECKLIST.md');
const E2E_DIR = path.join(__dirname, '../e2e');
const TESTS_DIR = path.join(__dirname, '../src/tests');
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

// --- MAIN ---
/**
 * Compares the manual verification checklist (docs/MANUAL_VERIFICATION_CHECKLIST.md) with actual test files to identify missing test coverage.
 * Reads: docs/MANUAL_VERIFICATION_CHECKLIST.md, all test files in e2e/ and src/tests/
 * Writes: none (outputs gap analysis report to the console)
 */
const checklistMd = fs.readFileSync(CHECKLIST_PATH, 'utf8');
const flows = extractFlowsFromChecklist(checklistMd);
const testFiles = [
  ...getAllTestFiles(E2E_DIR),
  ...getAllTestFiles(TESTS_DIR),
];

console.log('\n=== GAP ANALYSIS REPORT ===\n');
console.log('| Flow/Component | Test File(s) Found | Gap? |');
console.log('|----------------|--------------------|------|');

let gapCount = 0;
flows.forEach((flow) => {
  const matches = fuzzyMatch(flow, testFiles);
  const gap = matches.length === 0 ? 'YES' : '';
  if (gap === 'YES') gapCount++;
  console.log(`| ${flow} | ${matches.map(f => path.relative(process.cwd(), f)).join(', ') || '-'} | ${gap} |`);
});
console.log(`\nTotal Gaps: ${gapCount}`);
console.log('\nDone.'); 