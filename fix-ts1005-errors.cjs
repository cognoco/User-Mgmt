#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Fix TS1005 errors caused by corrupted import/export statements
function fixTS1005InFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  let newContent = content;
  let changeCount = 0;
  
  // Pattern to match import/export statements with corrupted endings
  // Matches: 'path'numbers; or "path"numbers; or 'path'numbers (without semicolon) etc.
  const corruptedImportPatterns = [
    // import ... from 'path'numbers;
    /(import\s+[^'"`]*from\s+)(['"`])([^'"`]+?)(['"`])(\d+)(;)/g,
    // export ... from 'path'numbers;
    /(export\s+[^'"`]*from\s+)(['"`])([^'"`]+?)(['"`])(\d+)(;)/g,
    // export * from 'path'numbers;
    /(export\s*\*\s*from\s+)(['"`])([^'"`]+?)(['"`])(\d+)(;)/g,
    // require('path')numbers
    /(require\s*\(\s*)(['"`])([^'"`]+?)(['"`])(\d+)(\s*\))/g,
    // import('path')numbers
    /(import\s*\(\s*)(['"`])([^'"`]+?)(['"`])(\d+)(\s*\))/g,
    // import ... from 'path'numbers (without semicolon)
    /(import\s+[^'"`]*from\s+)(['"`])([^'"`]+?)(['"`])(\d+)(\s)/g,
    // export ... from 'path'numbers (without semicolon) 
    /(export\s+[^'"`]*from\s+)(['"`])([^'"`]+?)(['"`])(\d+)(\s)/g,
    // export * from 'path'numbers (without semicolon)
    /(export\s*\*\s*from\s+)(['"`])([^'"`]+?)(['"`])(\d+)(\s)/g
  ];
  
  for (const pattern of corruptedImportPatterns) {
    newContent = newContent.replace(pattern, (match, prefix, openQuote, importPath, closeQuote, numbers, suffix) => {
      changeCount++;
      const fixed = `${prefix}${openQuote}${importPath}${closeQuote}${suffix}`;
      console.log(`    Fixed: ${importPath}${closeQuote}${numbers}${suffix} → ${importPath}${closeQuote}${suffix}`);
      return fixed;
    });
  }
  
  return { newContent, hasChanges: changeCount > 0, changeCount };
}

// Process all TypeScript/JavaScript files
function fixTS1005Errors(rootDir) {
  console.log('🔧 Fixing TS1005 errors (corrupted import/export statements)...');
  
  let updatedFiles = 0;
  let totalFixes = 0;
  
  try {
    const command = `find "${rootDir}" -type f 2>/dev/null | grep -E "\\.(ts|tsx|js|jsx)$" | grep -v ".git" | grep -v "node_modules" | grep -v "playwright-report" | grep -v "generated"`;
    const files = execSync(command, { encoding: 'utf8' }).trim().split('\n').filter(f => f.length > 0);
    
    console.log(`Scanning ${files.length} files for TS1005 errors...`);
    
    for (const filePath of files) {
      try {
        const result = fixTS1005InFile(filePath);
        
        if (result.hasChanges) {
          fs.writeFileSync(filePath, result.newContent);
          updatedFiles++;
          totalFixes += result.changeCount;
          console.log(`  ✅ Fixed ${result.changeCount} TS1005 errors in ${path.relative(rootDir, filePath)}`);
        }
      } catch (error) {
        console.error(`  ❌ Error processing ${filePath}: ${error.message}`);
      }
    }
  } catch (error) {
    console.error('Error finding files:', error.message);
  }
  
  return { updatedFiles, totalFixes };
}

// Dry run - show what would be fixed
function dryRun(rootDir) {
  console.log('🔍 Scanning for TS1005 errors (corrupted import/export statements)...\n');
  
  let filesWithErrors = 0;
  let totalErrors = 0;
  
  try {
    const command = `find "${rootDir}" -type f 2>/dev/null | grep -E "\\.(ts|tsx|js|jsx)$" | grep -v ".git" | grep -v "node_modules" | grep -v "playwright-report" | grep -v "generated"`;
    const files = execSync(command, { encoding: 'utf8' }).trim().split('\n').filter(f => f.length > 0);
    
    console.log(`Scanning ${files.length} files for TS1005 errors...`);
    console.log('\n🔄 TS1005 Error Fixes Preview:');
    console.log('===============================');
    
    for (const filePath of files) {
      try {
        const result = fixTS1005InFile(filePath);
        
        if (result.hasChanges) {
          filesWithErrors++;
          totalErrors += result.changeCount;
          console.log(`\n📁 ${path.relative(rootDir, filePath)} (${result.changeCount} errors)`);
        }
      } catch (error) {
        console.error(`  ❌ Error scanning ${filePath}: ${error.message}`);
      }
    }
    
    if (filesWithErrors === 0) {
      console.log('\n✅ No TS1005 errors found!');
    } else {
      console.log(`\n📊 Summary:`);
      console.log(`- Files with TS1005 errors: ${filesWithErrors}`);
      console.log(`- Total corrupted import/export statements: ${totalErrors}`);
      console.log(`- These are caused by extra numbers at the end of import paths`);
      console.log(`- Example: '@/path/to/file'123; → '@/path/to/file';`);
    }
  } catch (error) {
    console.error('Error scanning files:', error.message);
  }
}

// Execute the fixes
function execute(rootDir) {
  console.log('🚀 Executing TS1005 error fixes...\n');
  
  const results = fixTS1005Errors(rootDir);
  
  console.log(`\n✅ TS1005 error fixing completed!`);
  console.log(`   Files updated: ${results.updatedFiles}`);
  console.log(`   Corrupted import/export statements fixed: ${results.totalFixes}`);
  
  if (results.updatedFiles > 0) {
    console.log(`\n⚠️  Important: Please review the changes and test your application.`);
    console.log(`   Run TypeScript compiler to verify all TS1005 errors are resolved.`);
  }
}

// Main function
function main() {
  const args = process.argv.slice(2);
  const rootDir = '/mnt/c/Dev/Projects/Products/Apps/user-management-reorganized';
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
TS1005 Error Fixer
==================

This script fixes TS1005 TypeScript errors caused by corrupted import/export statements.
TS1005 errors occur when import paths have extra characters (usually numbers) at the end.

Examples of what gets fixed:
- import Component from '@/path/to/file'123;  →  import Component from '@/path/to/file';
- export { data } from '@/lib/utils'456;      →  export { data } from '@/lib/utils';
- require('@/services/api'789)               →  require('@/services/api')

Usage:
  node fix-ts1005-errors.cjs [options]

Options:
  --dry-run     Preview changes without executing them (default)
  --execute     Execute the TS1005 error fixes
  --help, -h    Show this help message

Examples:
  node fix-ts1005-errors.cjs --dry-run     # Preview all fixes
  node fix-ts1005-errors.cjs --execute     # Execute fixes

⚠️  Always run --dry-run first and commit your changes before --execute!
`);
    return;
  }
  
  if (args.includes('--execute')) {
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    console.log('⚠️  WARNING: This will modify import/export statements in your files!');
    console.log('   Make sure you have committed your current changes.');
    rl.question('\nDo you want to continue? (y/N): ', (answer) => {
      rl.close();
      if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
        execute(rootDir);
      } else {
        console.log('Operation cancelled.');
      }
    });
  } else {
    dryRun(rootDir);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  fixTS1005InFile,
  fixTS1005Errors,
  dryRun,
  execute
};