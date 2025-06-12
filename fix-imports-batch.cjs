#!/usr/bin/env node

const fs = require('fs');
const glob = require('glob');

console.log('📦 Fixing Import/Module Resolution Issues...\n');

// Common import path fixes based on the error patterns
const importFixes = [
  // Core module path fixes
  { from: '@/core/accessControl/', to: '@/core/access-control/' },
  { from: '@/core/twoFactor/', to: '@/core/two-factor/' },
  { from: '@/core/companyNotification/', to: '@/core/company-notification/' },
  { from: '@/core/dataExport/', to: '@/core/data-export/' },
  { from: '@/core/profileVerification/', to: '@/core/profile-verification/' },
  { from: '@/core/resourceRelationship/', to: '@/core/resource-relationship/' },
  { from: '@/core/savedSearch/', to: '@/core/saved-search/' },
  
  // Service path fixes  
  { from: '@/services/resourceRelationship/', to: '@/services/resource-relationship/' },
  { from: '@/adapters/resourceRelationship/', to: '@/adapters/resource-relationship/' },
  
  // Common interface fixes
  { from: '/interfaces', to: '/index' },
  { from: '/models', to: '/index' },
];

// Find all TypeScript files
const tsFiles = glob.sync('**/*.{ts,tsx}', { 
  ignore: ['node_modules/**', 'dist/**', '.next/**', '*.d.ts'] 
});

let fixedFiles = 0;
let totalFixes = 0;

tsFiles.forEach(filePath => {
  const content = fs.readFileSync(filePath, 'utf8');
  let newContent = content;
  let fileChanged = false;

  // Apply import path fixes
  importFixes.forEach(fix => {
    const oldImport = newContent;
    newContent = newContent.replace(new RegExp(fix.from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), fix.to);
    if (newContent !== oldImport) {
      fileChanged = true;
      totalFixes++;
    }
  });

  // Fix missing ResourcePermission imports
  if (content.includes('ResourcePermission') && !content.includes('import.*ResourcePermission')) {
    const importSection = newContent.match(/import.*from ['"]@\/core\/permission.*['"];?\s*/);
    if (importSection) {
      newContent = newContent.replace(importSection[0], importSection[0].replace('from', ', ResourcePermission } from'));
    } else {
      // Add new import
      const firstImport = newContent.match(/^import.*$/m);
      if (firstImport) {
        newContent = newContent.replace(firstImport[0], `${firstImport[0]}\nimport type { ResourcePermission } from '@/core/permission';`);
      }
    }
    fileChanged = true;
    totalFixes++;
  }

  // Fix duplicate exports
  const duplicateExportRegex = /export.*\{.*(\w+).*\}.*\n.*export.*\{.*\1.*\}/g;
  newContent = newContent.replace(duplicateExportRegex, (match) => {
    return match.split('\n')[0]; // Keep first export, remove duplicate
  });
  if (newContent !== content) fileChanged = true;

  // Fix re-export type issues for isolatedModules
  newContent = newContent.replace(/export \{ ([^}]*) \}/g, (match, exports) => {
    const items = exports.split(',').map(item => item.trim());
    const typeItems = items.filter(item => item.includes('type ') || item.endsWith('Interface') || item.endsWith('Type'));
    const valueItems = items.filter(item => !typeItems.includes(item));
    
    let result = '';
    if (typeItems.length > 0) {
      result += `export type { ${typeItems.join(', ')} };\n`;
    }
    if (valueItems.length > 0) {
      result += `export { ${valueItems.join(', ')} }`;
    }
    return result || match;
  });
  if (newContent !== content) fileChanged = true;

  if (fileChanged) {
    fs.writeFileSync(filePath, newContent);
    fixedFiles++;
    console.log(`✅ Fixed: ${filePath}`);
  }
});

console.log(`\n🎉 Import/Module Resolution Fix Complete!`);
console.log(`📁 Files processed: ${tsFiles.length}`);
console.log(`🔧 Files fixed: ${fixedFiles}`);
console.log(`⚡ Total fixes applied: ${totalFixes}`);
console.log(`\n🏃‍♂️ Run this next: npm run type-check\n`); 