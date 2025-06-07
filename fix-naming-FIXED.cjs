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

// Get all kebab-case files from all directories
function findKebabCaseFiles(rootDir) {
  const files = [];
  
  try {
    // Search the entire project (excluding node_modules, .git, etc.)
    const command = `find "${rootDir}" -name "*-*" -type f 2>/dev/null | grep -E "\\.(ts|tsx|js|jsx)$" | grep -v node_modules | grep -v ".git" | grep -v "test-results" | grep -v "playwright-report"`;
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

// Resolve import path to absolute file path
function resolveImportPath(importPath, currentDir, rootDir) {
  if (importPath.startsWith('@/')) {
    // @/ maps to project root (NOT src/) - THIS WAS THE KEY FIX
    const relativePath = importPath.substring(2); // Remove '@/'
    return path.resolve(rootDir, relativePath);
  } else if (importPath.startsWith('.')) {
    // Relative import
    return path.resolve(currentDir, importPath);
  }
  return null; // Skip npm packages
}

// Check if an import path matches a renamed file
function doesImportMatchFile(importPath, oldPath, newPath, currentDir, rootDir) {
  const resolvedImportPath = resolveImportPath(importPath, currentDir, rootDir);
  if (!resolvedImportPath) return false;
  
  const oldPathWithoutExt = oldPath.replace(/\.(ts|tsx|js|jsx)$/, '');
  const resolvedWithoutExt = resolvedImportPath.replace(/\.(ts|tsx|js|jsx)$/, '');
  
  // Check various combinations to handle imports with/without extensions
  return (
    resolvedWithoutExt === oldPathWithoutExt ||
    resolvedImportPath === oldPath ||
    resolvedImportPath === oldPathWithoutExt ||
    (resolvedImportPath + '.ts') === oldPath ||
    (resolvedImportPath + '.tsx') === oldPath ||
    (resolvedImportPath + '.js') === oldPath ||
    (resolvedImportPath + '.jsx') === oldPath
  );
}

// Generate new import path after file rename
function generateNewImportPath(importPath, oldPath, newPath, currentDir, rootDir) {
  if (importPath.startsWith('@/')) {
    // For @/ imports, maintain absolute import style
    const newPathWithoutExt = newPath.replace(/\.(ts|tsx|js|jsx)$/, '');
    const rootRelativePath = path.relative(rootDir, newPathWithoutExt); // FIXED: relative to root, not src
    return `@/${rootRelativePath}`;
  } else {
    // For relative imports, maintain relative import style
    const newPathWithoutExt = newPath.replace(/\.(ts|tsx|js|jsx)$/, '');
    const newRelativePath = path.relative(currentDir, newPathWithoutExt);
    return newRelativePath.startsWith('.') ? newRelativePath : `./${newRelativePath}`;
  }
}

// Update imports in a single file
function updateImportsInFile(filePath, fileMapping, rootDir) {
  const content = fs.readFileSync(filePath, 'utf8');
  let newContent = content;
  let changeCount = 0;
  
  const currentDir = path.dirname(filePath);
  
  // Find all import/require/export statements
  const importExportRegex = /(?:(?:import\s+.*?\s+from|export\s+.*?\s+from|export\s*\*\s*from)\s+['"`]([^'"`]+)['"`]|require\s*\(\s*['"`]([^'"`]+)['"`]\s*\))/g;
  
  let match;
  const replacements = [];
  
  while ((match = importExportRegex.exec(content)) !== null) {
    const importPath = match[1] || match[2];
    const fullMatch = match[0];
    const matchIndex = match.index;
    
    // Skip npm packages (don't start with . or @/)
    if (!importPath.startsWith('.') && !importPath.startsWith('@/')) {
      continue;
    }
    
    // Check if this import points to any of our renamed files
    for (const [oldPath, newPath] of fileMapping) {
      if (doesImportMatchFile(importPath, oldPath, newPath, currentDir, rootDir)) {
        const newImportPath = generateNewImportPath(importPath, oldPath, newPath, currentDir, rootDir);
        const newStatement = fullMatch.replace(importPath, newImportPath);
        
        replacements.push({
          index: matchIndex,
          length: fullMatch.length,
          replacement: newStatement
        });
        
        changeCount++;
        break; // Found the match, no need to check other mappings
      }
    }
  }
  
  // Apply replacements in reverse order to maintain correct indices
  replacements.sort((a, b) => b.index - a.index);
  
  for (const replacement of replacements) {
    newContent = newContent.substring(0, replacement.index) + 
                replacement.replacement + 
                newContent.substring(replacement.index + replacement.length);
  }
  
  return { newContent, hasChanges: changeCount > 0, changeCount };
}

// Update imports in all TypeScript/JavaScript files
function updateImports(rootDir, fileMapping) {
  console.log('📦 Updating import and export statements...');
  
  let updatedFiles = 0;
  let totalUpdates = 0;
  
  try {
    // Find all TS/JS files in the project
    const command = `find "${rootDir}" -type f 2>/dev/null | grep -E "\\.(ts|tsx|js|jsx)$" | grep -v node_modules | grep -v ".git" | grep -v "test-results" | grep -v "playwright-report"`;
    const files = execSync(command, { encoding: 'utf8' }).trim().split('\n').filter(f => f.length > 0);
    
    for (const filePath of files) {
      try {
        const result = updateImportsInFile(filePath, fileMapping, rootDir);
        
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
  
  console.log('🔄 File Renames Preview (first 30):');
  console.log('===================================');
  
  let count = 0;
  for (const [oldPath, newPath] of fileMapping) {
    if (count >= 30) break;
    const oldName = path.basename(oldPath);
    const newName = path.basename(newPath);
    console.log(`${path.relative(rootDir, oldPath)} → ${newName}`);
    count++;
  }
  
  if (fileMapping.size > 30) {
    console.log(`... and ${fileMapping.size - 30} more files`);
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`- Files to rename: ${fileMapping.size}`);
  console.log(`- FIXED: @/ alias now correctly maps to project root (not src/)`);
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
  
  // First, update all import statements
  const importResults = updateImports(rootDir, fileMapping);
  
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
File Naming Convention Fixer (FIXED VERSION)
============================================

FIXED: @/ alias now correctly maps to project root (not src/).

Usage:
  node fix-naming-FIXED.cjs [options]

Options:
  --dry-run     Preview changes without executing them (default)
  --execute     Execute the file renames and import updates
  --help, -h    Show this help message

⚠️  WARNING: Always run --dry-run first!
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