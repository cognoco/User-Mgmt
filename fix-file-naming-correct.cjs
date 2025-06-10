#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Convert kebab-case to camelCase
function kebabToCamelCase(str) {
  return str.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
}

// Convert kebab-case filename to camelCase, preserving extensions and special parts
function convertFileName(fileName) {
  const ext = path.extname(fileName);
  const baseName = path.basename(fileName, ext);
  
  // Handle test/spec files separately
  if (baseName.includes('.test') || baseName.includes('.spec') || baseName.includes('.e2e')) {
    const parts = baseName.split('.');
    const mainName = parts[0];
    const suffixes = parts.slice(1);
    
    const convertedMain = kebabToCamelCase(mainName);
    return convertedMain + '.' + suffixes.join('.') + ext;
  }
  
  // Handle .d.ts files
  if (baseName.endsWith('.d')) {
    const mainName = baseName.slice(0, -2);
    const convertedMain = kebabToCamelCase(mainName);
    return convertedMain + '.d' + ext;
  }
  
  // Regular files
  return kebabToCamelCase(baseName) + ext;
}

// Get ALL kebab-case files recursively
function findKebabCaseFiles(rootDir) {
  const files = [];
  
  try {
    const command = `find "${rootDir}" -name "*-*" -type f 2>/dev/null | grep -E "\\.(ts|tsx|js|jsx)$" | grep -v ".git" | grep -v "node_modules" | grep -v "playwright-report" | grep -v "generated"`;
    const output = execSync(command, { encoding: 'utf8' }).trim();
    if (output) {
      files.push(...output.split('\n').filter(f => f.length > 0));
    }
  } catch (error) {
    console.error('Error finding files:', error.message);
  }
  
  return [...new Set(files)]; // Remove duplicates
}

// Create mapping of old path to new path
function createFileMapping(files) {
  const mapping = new Map();
  
  for (const filePath of files) {
    const dir = path.dirname(filePath);
    const fileName = path.basename(filePath);
    
    if (!fileName.includes('-')) {
      continue;
    }
    
    const newFileName = convertFileName(fileName);
    const newFilePath = path.join(dir, newFileName);
    
    if (newFileName !== fileName) {
      mapping.set(filePath, newFilePath);
    }
  }
  
  return mapping;
}

// Create reverse mapping for import resolution
function createImportMapping(fileMapping, rootDir) {
  const importMapping = new Map();
  
  for (const [oldPath, newPath] of fileMapping) {
    // Store mappings without extensions for import resolution
    const oldWithoutExt = oldPath.replace(/\.(ts|tsx|js|jsx)$/, '');
    const newWithoutExt = newPath.replace(/\.(ts|tsx|js|jsx)$/, '');
    
    importMapping.set(oldWithoutExt, newWithoutExt);
    
    // Also store with common extensions
    for (const ext of ['.ts', '.tsx', '.js', '.jsx']) {
      importMapping.set(oldWithoutExt + ext, newWithoutExt);
    }
  }
  
  return importMapping;
}

// Update imports in a single file according to Architecture Guidelines
function updateImportsInFile(filePath, importMapping, rootDir) {
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
      // Skip npm packages
      if (!originalImportPath.startsWith('.') && !originalImportPath.startsWith('@/')) {
        return match;
      }
      
      let newImportPath = originalImportPath;
      let changed = false;
      
      // Step 1: Convert kebab-case to camelCase in the path
      const pathParts = originalImportPath.split('/');
      const convertedParts = pathParts.map(part => {
        if (part.includes('-') && !part.startsWith('.') && !part.startsWith('@')) {
          // Handle special extensions
          if (part.includes('.test') || part.includes('.spec') || part.includes('.e2e') || part.includes('.d.')) {
            const dotParts = part.split('.');
            const name = dotParts[0];
            const extensions = dotParts.slice(1);
            const convertedName = kebabToCamelCase(name);
            return [convertedName, ...extensions].join('.');
          } else {
            const ext = path.extname(part);
            const baseName = path.basename(part, ext);
            return kebabToCamelCase(baseName) + ext;
          }
        }
        return part;
      });
      
      newImportPath = convertedParts.join('/');
      if (newImportPath !== originalImportPath) {
        changed = true;
      }
      
      // Step 2: Check if this path maps to a renamed file (from our file mapping)
      let resolvedImportPath;
      if (newImportPath.startsWith('@/')) {
        const relativePath = newImportPath.substring(2);
        resolvedImportPath = path.resolve(rootDir, relativePath);
      } else {
        resolvedImportPath = path.resolve(currentDir, newImportPath);
      }
      
      // Check if this maps to a renamed file
      const mappedPath = importMapping.get(resolvedImportPath);
      if (mappedPath) {
        if (newImportPath.startsWith('@/')) {
          const newRelativePath = path.relative(rootDir, mappedPath);
          newImportPath = `@/${newRelativePath}`;
        } else {
          const newRelativePath = path.relative(currentDir, mappedPath);
          newImportPath = newRelativePath.startsWith('.') ? newRelativePath : `./${newRelativePath}`;
        }
        changed = true;
      }
      
      // Step 3: Convert relative imports to @/ pattern (Architecture Guidelines requirement)
      if ((newImportPath.startsWith('./') || newImportPath.startsWith('../')) && !newImportPath.includes('node_modules')) {
        try {
          const resolvedPath = path.resolve(currentDir, newImportPath);
          const relativePath = path.relative(rootDir, resolvedPath);
          
          // Only convert if it's within our project structure
          if (!relativePath.startsWith('..') && !path.isAbsolute(relativePath)) {
            const newAbsolutePath = `@/${relativePath}`;
            if (newAbsolutePath !== newImportPath) {
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
function updateImports(rootDir, importMapping) {
  console.log('📦 Updating import and export statements...');
  
  let updatedFiles = 0;
  let totalUpdates = 0;
  
  try {
    const command = `find "${rootDir}" -type f 2>/dev/null | grep -E "\\.(ts|tsx|js|jsx)$" | grep -v ".git" | grep -v "node_modules" | grep -v "playwright-report" | grep -v "generated"`;
    const files = execSync(command, { encoding: 'utf8' }).trim().split('\n').filter(f => f.length > 0);
    
    for (const filePath of files) {
      try {
        const result = updateImportsInFile(filePath, importMapping, rootDir);
        
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
  console.log('🔍 Scanning for kebab-case files...\n');
  
  const kebabFiles = findKebabCaseFiles(rootDir);
  console.log(`Found ${kebabFiles.length} kebab-case files\n`);
  
  const fileMapping = createFileMapping(kebabFiles);
  console.log(`📝 Files to rename: ${fileMapping.size}\n`);
  
  if (fileMapping.size === 0) {
    console.log('✅ No files need renaming!');
    return;
  }
  
  // Group by filename to show potential duplicates
  const filesByName = new Map();
  for (const [oldPath, newPath] of fileMapping) {
    const oldName = path.basename(oldPath);
    const newName = path.basename(newPath);
    
    if (!filesByName.has(oldName)) {
      filesByName.set(oldName, []);
    }
    filesByName.get(oldName).push({ oldPath, newPath, oldName, newName });
  }
  
  console.log('🔄 File Renames Preview:');
  console.log('========================');
  
  for (const [oldName, files] of filesByName) {
    if (files.length > 1) {
      console.log(`\n📁 Multiple files named "${oldName}":`);
      for (const file of files) {
        console.log(`   ${path.relative(rootDir, file.oldPath)} → ${file.newName}`);
      }
    } else {
      const file = files[0];
      console.log(`${path.relative(rootDir, file.oldPath)} → ${file.newName}`);
    }
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`- Files to rename: ${fileMapping.size}`);
  console.log(`- Uses path-specific import replacement to avoid conflicts`);
}

// Execute the renames and import updates
function execute(rootDir) {
  console.log('🚀 Executing file renames and import updates...\n');
  
  const kebabFiles = findKebabCaseFiles(rootDir);
  const fileMapping = createFileMapping(kebabFiles);
  
  if (fileMapping.size === 0) {
    console.log('✅ No files need renaming!');
    return;
  }
  
  console.log(`Found ${fileMapping.size} files to rename\n`);
  
  // Create import mapping for path resolution
  const importMapping = createImportMapping(fileMapping, rootDir);
  
  // First, update all import statements
  const importResults = updateImports(rootDir, importMapping);
  
  // Then, rename the files
  console.log('\n🔄 Renaming files...');
  let success = 0;
  let failed = 0;
  
  for (const [oldPath, newPath] of fileMapping) {
    try {
      const newDir = path.dirname(newPath);
      if (!fs.existsSync(newDir)) {
        fs.mkdirSync(newDir, { recursive: true });
      }
      
      fs.renameSync(oldPath, newPath);
      console.log(`  ✅ ${path.relative(rootDir, oldPath)} → ${path.basename(newPath)}`);
      success++;
    } catch (error) {
      console.error(`  ❌ Error renaming ${path.relative(rootDir, oldPath)}: ${error.message}`);
      failed++;
    }
  }
  
  console.log(`\n✅ File naming conversion completed!`);
  console.log(`   Files renamed: ${success} (${failed} failed)`);
  console.log(`   Import/export statements updated: ${importResults.totalUpdates} in ${importResults.updatedFiles} files`);
  
  if (success > 0) {
    console.log(`\n⚠️  Important: Please review the changes and test your application.`);
  }
}

// Main function
function main() {
  const args = process.argv.slice(2);
  const rootDir = '/mnt/c/Dev/Projects/Products/Apps/user-management-reorganized';
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Complete File Naming & Import Path Fixer
========================================

This script performs COMPLETE conversion according to Architecture Guidelines:
1. Renames ALL kebab-case files to camelCase
2. Converts ALL kebab-case import paths to camelCase
3. Converts ALL relative imports to @/ absolute imports (Architecture Guidelines)

Key Features:
- Finds ALL kebab-case files recursively across entire project
- Updates import/export statements comprehensively
- Converts relative imports (./,../) to @/ absolute imports
- Follows Architecture Guidelines: @/ maps to project root
- Handles all import patterns: import, export, require, dynamic imports

Usage:
  node fix-file-naming-correct.cjs [options]

Options:
  --dry-run     Preview changes without executing them (default)
  --execute     Execute the file renames and import updates
  --help, -h    Show this help message

Examples:
  node fix-file-naming-correct.cjs --dry-run     # Preview all changes
  node fix-file-naming-correct.cjs --execute     # Execute complete conversion

⚠️  WARNING: This will make comprehensive changes to follow Architecture Guidelines!
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
    
    console.log('⚠️  WARNING: This will rename files and update imports!');
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
  kebabToCamelCase,
  convertFileName,
  findKebabCaseFiles,
  createFileMapping,
  createImportMapping,
  updateImportsInFile,
  updateImports,
  dryRun,
  execute
};
