import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { stringSimilarity } from 'string-similarity-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DOCS_DIR = path.join(__dirname, '../docs');
const REPORT_PATH = path.join(DOCS_DIR, 'OBSOLETE_FILES_REPORT.md');
const CHECKLIST_PATH = path.join(DOCS_DIR, 'MANUAL_VERIFICATION_CHECKLIST.md');
const SCRIPTS_DIR = path.join(__dirname, '../scripts');
const TESTS_DIR = path.join(__dirname, '../src/tests');
const E2E_DIR = path.join(__dirname, '../e2e');
const COMPONENTS_DIR = path.join(__dirname, '../src/components');
const PACKAGE_JSON = path.join(__dirname, '../package.json');

const FUZZY_THRESHOLD = 0.7;

/**
 * Scans the codebase for obsolete, redundant, or unused test files, scripts, and components.
 * Reads: docs/MANUAL_VERIFICATION_CHECKLIST.md, all test/component/script files
 * Writes: docs/OBSOLETE_FILES_REPORT.md (report of unused/obsolete files)
 */

function getAllFiles(dir, filter = () => true) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  for (const file of fs.readdirSync(dir)) {
    const full = path.join(dir, file);
    if (fs.statSync(full).isDirectory()) {
      results = results.concat(getAllFiles(full, filter));
    } else if (filter(full)) {
      results.push(full);
    }
  }
  return results;
}

function getTestBlocks(file) {
  // Parse describe/test/it block names (simple regex, not full AST)
  const content = fs.readFileSync(file, 'utf8');
  const blocks = [];
  const regex = /(describe|test|it)\s*\(\s*['"`]([^'"]+)['"`]/g;
  let match;
  while ((match = regex.exec(content))) {
    blocks.push({ name: match[2].toLowerCase(), content });
  }
  return blocks;
}

function extractFlowsFromChecklist(md) {
  const flows = [];
  const tableRegex = /\|([^\n]+)\|([^\n]+)\|([^\n]+)\|([^\n]+)\|([^\n]+)\|([^\n]+)\|([^\n]+)\|([^\n]+)\|/g;
  let match;
  while ((match = tableRegex.exec(md))) {
    const flow = match[1].trim();
    if (flow && flow !== 'Flow / Screen / Component' && flow !== '**Entry Point**') {
      flows.push(flow.toLowerCase());
    }
  }
  return Array.from(new Set(flows));
}

function normalizeName(name) {
  return name.replace(/[^a-z0-9]+/gi, '').toLowerCase();
}

// --- Main ---
const checklistMd = fs.readFileSync(CHECKLIST_PATH, 'utf8');
const flows = extractFlowsFromChecklist(checklistMd);
const normalizedFlows = flows.map(normalizeName);

// 1. Skeleton test files
const skeletonTests = getAllFiles(E2E_DIR, f => f.includes('Skeleton'))
  .concat(getAllFiles(TESTS_DIR, f => f.includes('Skeleton')));

// 2. Real test files
const realTests = getAllFiles(E2E_DIR, f => !f.includes('Skeleton') && f.match(/\.test\.(t|j)sx?$/))
  .concat(getAllFiles(TESTS_DIR, f => !f.includes('Skeleton') && f.match(/\.test\.(t|j)sx?$/)));

// 3. Fuzzy match skeletons to real tests
const coveredSkeletons = [];
const partialSkeletons = [];
const uncoveredSkeletons = [];
skeletonTests.forEach(skel => {
  const skelName = normalizeName(path.basename(skel).replace('Skeleton', ''));
  // Fuzzy match to real test file names
  const realFileMatches = realTests.map(rt => ({
    file: rt,
    score: stringSimilarity(skelName, normalizeName(path.basename(rt)))
  })).filter(m => m.score >= FUZZY_THRESHOLD);
  // Fuzzy match to describe/test/it block names
  let blockScore = 0;
  let blockContent = '';
  if (!realFileMatches.length) {
    for (const rt of realTests) {
      const blocks = getTestBlocks(rt);
      for (const b of blocks) {
        const score = stringSimilarity(skelName, normalizeName(b.name));
        if (score > blockScore) {
          blockScore = score;
          blockContent = b.content;
        }
      }
    }
  }
  if (realFileMatches.length > 0 || blockScore >= FUZZY_THRESHOLD) {
    // Optionally, compare content for key actions/assertions (basic string inclusion)
    let isPartial = false;
    if (blockContent) {
      const skelContent = fs.readFileSync(skel, 'utf8');
      // Check if at least one key action/assertion from skeleton is present in the real test block
      const keyActions = ['goto', 'fill', 'click', 'expect', 'type', 'getBy', 'toBeVisible', 'toBeInTheDocument'];
      const found = keyActions.some(action => blockContent.includes(action) && skelContent.includes(action));
      if (!found) isPartial = true;
    }
    if (isPartial) {
      partialSkeletons.push(skel);
    } else {
      coveredSkeletons.push(skel);
    }
  } else {
    uncoveredSkeletons.push(skel);
  }
});

// 4. Test files not referenced in checklist
const allTests = realTests.concat(skeletonTests);
const testsNotInChecklist = allTests.filter(f => {
  const base = normalizeName(path.basename(f));
  return !normalizedFlows.some(flow => base.includes(flow));
});

// 5. Scripts not referenced in package.json or docs
const scripts = getAllFiles(SCRIPTS_DIR, f => f.match(/\.(js|ts)$/));
const pkg = JSON.parse(fs.readFileSync(PACKAGE_JSON, 'utf8'));
const pkgScripts = Object.values(pkg.scripts || {}).join(' ');
const docsMd = getAllFiles(DOCS_DIR, f => f.endsWith('.md')).map(f => fs.readFileSync(f, 'utf8')).join(' ');
const unusedScripts = scripts.filter(f => {
  const base = path.basename(f);
  return !pkgScripts.includes(base) && !docsMd.includes(base);
});

// 6. Components not imported anywhere (best effort)
const components = getAllFiles(COMPONENTS_DIR, f => {
  // Exclude test files and files in __tests__
  const rel = path.relative(COMPONENTS_DIR, f);
  return f.match(/\.(tsx|ts|js|jsx)$/) &&
    !rel.includes('__tests__') &&
    !f.match(/\.(test|spec)\.(tsx|ts|js|jsx)$/);
});
const allCode = getAllFiles(path.join(__dirname, '..'), f => f.match(/\.(tsx|ts|js|jsx)$/)).map(f => fs.readFileSync(f, 'utf8')).join(' ');
const unusedComponents = components.filter(f => {
  const base = path.basename(f, path.extname(f));
  return !allCode.includes(base);
});

// --- Report ---
let report = `# Obsolete/Redundant Files Report\n\n`;
report += `## Skeleton Test Files Likely Covered by Real Tests (Fuzzy Match)\n`;
coveredSkeletons.forEach(f => { report += `- ${path.relative(process.cwd(), f)}\n`; });
if (!coveredSkeletons.length) report += 'None\n';

report += `\n## Skeleton Test Files Partial/Needs Review (Fuzzy Match, Logic Differs)\n`;
partialSkeletons.forEach(f => { report += `- ${path.relative(process.cwd(), f)}\n`; });
if (!partialSkeletons.length) report += 'None\n';

report += `\n## Skeleton Test Files Not Covered\n`;
uncoveredSkeletons.forEach(f => { report += `- ${path.relative(process.cwd(), f)}\n`; });
if (!uncoveredSkeletons.length) report += 'None\n';

report += `\n## Test Files Not Referenced in Checklist\n`;
testsNotInChecklist.forEach(f => { report += `- ${path.relative(process.cwd(), f)}\n`; });
if (!testsNotInChecklist.length) report += 'None\n';

report += `\n## Scripts Not Referenced in package.json or Docs\n`;
unusedScripts.forEach(f => { report += `- ${path.relative(process.cwd(), f)}\n`; });
if (!unusedScripts.length) report += 'None\n';

report += `\n## Components Not Imported Anywhere (Best Effort)\n`;
unusedComponents.forEach(f => { report += `- ${path.relative(process.cwd(), f)}\n`; });
if (!unusedComponents.length) report += 'None\n';

fs.writeFileSync(REPORT_PATH, report, 'utf8');
console.log(`\nObsolete/redundant files report written to ${REPORT_PATH}\n`); 