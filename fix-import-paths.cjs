#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Update imports in a single file according to Architecture Guidelines
function updateImportsInFile(filePath, rootDir) {
  const content = fs.readFileSync(filePath, 'utf8');
  let newContent = content;
  let changeCount = 0;
  
  const currentDir = path.dirname(filePath);
  
  // Comprehensive regex to match all import/export/require statements
  const importExportPatterns = [
    // import statements: import ... from 'path'
    /(import\s+[^'"`]*from\s+)(['"`])([^'"`]+?)(['"`])/g,
    // export statements: export ... from 'path'
    /(export\s+[^'"`]*from\s+)(['"`])([^'"`]+?)(['"`])/g,
    // export * from 'path'
    /(export\s*\*\s*from\s+)(['"`])([^'"`]+?)(['"`])/g,
    // require statements: require('path')
    /(require\s*\(\s*)(['"`])([^'"`]+?)(['"`])(\s*\))/g,
    // dynamic import: import('path')
    /(import\s*\(\s*)(['"`])([^'"`]+?)(['"`])(\s*\))/g
  ];
  
  // Process each pattern separately for better control
  for (const pattern of importExportPatterns) {
    newContent = newContent.replace(pattern, (match, prefix, openQuote, originalImportPath, closeQuote, suffix = '') => {
      // Skip npm packages (they don't start with . or @/)
      if (!originalImportPath.startsWith('.') && !originalImportPath.startsWith('@/')) {
        return match;
      }
      
      let newImportPath = originalImportPath;
      let changed = false;
      
      // Convert relative imports to @/ pattern (Architecture Guidelines requirement)
      if ((originalImportPath.startsWith('./') || originalImportPath.startsWith('../')) && !originalImportPath.includes('node_modules')) {
        try {
          const resolvedPath = path.resolve(currentDir, originalImportPath);
          const relativePath = path.relative(rootDir, resolvedPath);
          
          // Only convert if it's within our project structure
          if (!relativePath.startsWith('..') && !path.isAbsolute(relativePath)) {
            const newAbsolutePath = `@/${relativePath}`;
            if (newAbsolutePath !== originalImportPath) {
              newImportPath = newAbsolutePath;
              changed = true;
            }
          }
        } catch (error) {
          // Keep original path if resolution fails
        }
      }
      
      if (changed) {
        changeCount++;
        console.log(`    Updated: ${originalImportPath} → ${newImportPath}`);
        return `${prefix}${openQuote}${newImportPath}${closeQuote}${suffix}`;
      }
      
      return match;
    });
  }
  
  return { newContent, hasChanges: changeCount > 0, changeCount };
}

// Update imports in all TypeScript/JavaScript files
function updateImports(rootDir) {
  console.log('📦 Updating import and export statements to use @/ paths...');
  
  let updatedFiles = 0;
  let totalUpdates = 0;
  
  try {
    const command = `find "${rootDir}" -type f 2>/dev/null | grep -E "\\.(ts|tsx|js|jsx)$" | grep -v ".git" | grep -v "node_modules" | grep -v "playwright-report" | grep -v "generated"`;
    const files = execSync(command, { encoding: 'utf8' }).trim().split('\n').filter(f => f.length > 0);
    
    console.log(`Found ${files.length} files to process...`);
    
    for (const filePath of files) {
      try {
        const result = updateImportsInFile(filePath, rootDir);
        
        if (result.hasChanges) {
          fs.writeFileSync(filePath, result.newContent);
          updatedFiles++;
          totalUpdates += result.changeCount;
          console.log(`  ✅ Updated ${result.changeCount} import/export statements in ${path.relative(rootDir, filePath)}`);
        }
      } catch (error) {
        console.error(`  ❌ Error updating ${filePath}: ${error.message}`);
      }
    }
  } catch (error) {
    console.error('Error finding files for import updates:', error.message);
  }
  
  return { updatedFiles, totalUpdates };
}

// Dry run - show what would be changed
function dryRun(rootDir) {
  console.log('🔍 Scanning for files with relative imports to convert to @/ paths...\n');
  
  let filesWithChanges = 0;
  let totalChanges = 0;
  
  try {
    const command = `find "${rootDir}" -type f 2>/dev/null | grep -E "\\.(ts|tsx|js|jsx)$" | grep -v ".git" | grep -v "node_modules" | grep -v "playwright-report" | grep -v "generated"`;
    const files = execSync(command, { encoding: 'utf8' }).trim().split('\n').filter(f => f.length > 0);
    
    console.log(`Found ${files.length} files to scan...`);
    console.log('\n🔄 Import Path Conversion Preview:');
    console.log('==================================');
    
    for (const filePath of files) {
      try {
        const result = updateImportsInFile(filePath, rootDir);
        
        if (result.hasChanges) {
          filesWithChanges++;
          totalChanges += result.changeCount;
          console.log(`\n📁 ${path.relative(rootDir, filePath)} (${result.changeCount} changes)`);
        }
      } catch (error) {
        console.error(`  ❌ Error scanning ${filePath}: ${error.message}`);
      }
    }
    
    if (filesWithChanges === 0) {
      console.log('\n✅ No relative imports found that need conversion to @/ paths!');
    } else {
      console.log(`\n📊 Summary:`);
      console.log(`- Files with changes: ${filesWithChanges}`);
      console.log(`- Total import conversions: ${totalChanges}`);
      console.log(`- Converts relative imports (./,../) to @/ absolute imports`);
      console.log(`- Follows Architecture Guidelines: @/ maps to project root`);
    }
  } catch (error) {
    console.error('Error scanning files:', error.message);
  }
}

// Execute the import updates
function execute(rootDir) {
  console.log('🚀 Executing import path conversions...\n');
  
  const results = updateImports(rootDir);
  
  console.log(`\n✅ Import path conversion completed!`);
  console.log(`   Files updated: ${results.updatedFiles}`);
  console.log(`   Import/export statements converted: ${results.totalUpdates}`);
  
  if (results.updatedFiles > 0) {
    console.log(`\n⚠️  Important: Please review the changes and test your application.`);
    console.log(`   All relative imports have been converted to @/ absolute imports.`);
  }
}

// Main function
function main() {
  const args = process.argv.slice(2);
  const rootDir = '/mnt/c/Dev/Projects/Products/Apps/user-management-reorganized';
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Import Path Fixer - Architecture Guidelines Compliance
=====================================================

This script converts all relative imports to @/ absolute imports according to Architecture Guidelines.

Key Features:
- Converts relative imports (./,../) to @/ absolute imports
- Follows Architecture Guidelines: @/ maps to project root
- Handles all import patterns: import, export, require, dynamic imports
- Skips npm packages and external dependencies
- Excludes generated, node_modules, .git, and playwright-report folders

Usage:
  node fix-import-paths.cjs [options]

Options:
  --dry-run     Preview changes without executing them (default)
  --execute     Execute the import path conversions
  --help, -h    Show this help message

Examples:
  node fix-import-paths.cjs --dry-run     # Preview all changes
  node fix-import-paths.cjs --execute     # Execute import conversions

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
    
    console.log('⚠️  WARNING: This will update import paths in your files!');
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
  updateImportsInFile,
  updateImports,
  dryRun,
  execute
};