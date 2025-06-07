// fix-import-paths.cjs
// Node.js script to fix incorrect @/src/ and @/app/ imports/exports
// Usage: node fix-import-paths.cjs

const fs = require('fs');
const path = require('path');

const exts = ['.ts', '.tsx', '.js'];
const root = process.cwd();
let changedFiles = 0;

function shouldProcess(file) {
  return exts.includes(path.extname(file));
}

function processFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  // Fix both @/src/ -> @/ and @/app/ -> @app/
  let newContent = content.replace(/(['"])@\/src\//g, '$1@/');
  newContent = newContent.replace(/(['"])@\/app\//g, '$1@app/');
  if (newContent !== content) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    changedFiles++;
    console.log('Fixed:', filePath);
  }
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === '.git') continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
    } else if (shouldProcess(fullPath)) {
      processFile(fullPath);
    }
  }
}

walk(root);
console.log(`\nImport path fix complete. Files changed: ${changedFiles}`);