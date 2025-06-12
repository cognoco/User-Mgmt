#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('🧪 Fixing Testing Infrastructure Issues...\n');

// Find all test files
const testFiles = glob.sync('**/*.test.{ts,tsx}', { 
  ignore: ['node_modules/**', 'dist/**', '.next/**'] 
});

let fixedFiles = 0;
let totalFixes = 0;

testFiles.forEach(filePath => {
  const content = fs.readFileSync(filePath, 'utf8');
  let newContent = content;
  let fileChanged = false;

  // Fix 1: Add vi import if missing but vi is used
  if (content.includes('vi.') && !content.includes("import { vi }")) {
    const importMatch = content.match(/^(import.*from ['"][^'"]*vitest['"];?\s*)/m);
    if (importMatch) {
      newContent = newContent.replace(importMatch[1], importMatch[1].replace('vitest', 'vitest\';\nimport { vi } from \'vitest'));
    } else if (content.includes("import")) {
      // Add vi import at the top
      newContent = `import { vi } from 'vitest';\n${newContent}`;
    }
    fileChanged = true;
    totalFixes++;
  }

  // Fix 2: Add expect import if missing
  if (content.includes('expect(') && !content.includes("import { expect }") && !content.includes("import { describe, it, expect }")) {
    if (content.includes("import { describe, it }")) {
      newContent = newContent.replace("import { describe, it }", "import { describe, it, expect }");
    } else if (content.includes("from 'vitest'")) {
      newContent = newContent.replace("from 'vitest'", ", expect } from 'vitest'");
    }
    fileChanged = true;
    totalFixes++;
  }

  // Fix 3: Replace jest.fn() with vi.fn()
  newContent = newContent.replace(/jest\.fn\(\)/g, 'vi.fn()');
  if (newContent !== content) fileChanged = true;

  // Fix 4: Replace jest mocking patterns
  newContent = newContent.replace(/jest\.mock\(/g, 'vi.mock(');
  newContent = newContent.replace(/jest\.spyOn\(/g, 'vi.spyOn(');
  if (newContent !== content) fileChanged = true;

  // Fix 5: Add proper vitest globals if needed
  if (content.includes('describe(') && !content.includes("import { describe }")) {
    const vitestImport = newContent.match(/import { ([^}]*) } from ['"]vitest['"]/);
    if (vitestImport) {
      const imports = vitestImport[1].split(',').map(s => s.trim());
      if (!imports.includes('describe')) imports.push('describe');
      if (!imports.includes('it') && content.includes('it(')) imports.push('it');
      if (!imports.includes('beforeEach') && content.includes('beforeEach(')) imports.push('beforeEach');
      if (!imports.includes('afterEach') && content.includes('afterEach(')) imports.push('afterEach');
      
      newContent = newContent.replace(vitestImport[0], `import { ${imports.join(', ')} } from 'vitest'`);
      fileChanged = true;
      totalFixes++;
    }
  }

  if (fileChanged) {
    fs.writeFileSync(filePath, newContent);
    fixedFiles++;
    console.log(`✅ Fixed: ${filePath}`);
  }
});

console.log(`\n🎉 Testing Infrastructure Fix Complete!`);
console.log(`📁 Files processed: ${testFiles.length}`);
console.log(`🔧 Files fixed: ${fixedFiles}`);
console.log(`⚡ Total fixes applied: ${totalFixes}`);
console.log(`\n🏃‍♂️ Run this next: npm run type-check\n`); 