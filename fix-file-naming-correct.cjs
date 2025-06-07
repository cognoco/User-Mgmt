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

// Get specific directory kebab-case files
function findKebabCaseFiles(rootDir, includePatterns = ['src']) {
  const files = [];
  
  for (const pattern of includePatterns) {
    const searchDir = path.join(rootDir, pattern);
    try {
      const command = `find "${searchDir}" -name "*-*" -type f 2>/dev/null | grep -E "\\.(ts|tsx|js|jsx)$" | grep -v ".git" | grep -v "node_modules"`;
      const output = execSync(command, { encoding: 'utf8' }).trim();
      if (output) {
        files.push(...output.split('\n').filter(f => f.length > 0));
      }
    } catch (error) {
      // Pattern might not exist, continue
    }
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

// Update imports in a single file - only replace imports that definitely point to renamed files
function updateImportsInFile(filePath, fileMapping, rootDir) {
  const content = fs.readFileSync(filePath, 'utf8');
  let newContent = content;
  let changeCount = 0;
  
  const currentDir = path.dirname(filePath);
  
  // Find all import/require/export statements (both relative and absolute with @/ alias)
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
    
    let resolvedImportPath;
    
    if (importPath.startsWith('@/')) {
      // Handle absolute imports with @/ alias
      // @/ maps to project root directory according to the architecture guidelines
      const relativePath = importPath.substring(2); // Remove '@/'
      resolvedImportPath = path.resolve(rootDir, relativePath);
    } else {
      // Handle relative imports
      try {
        resolvedImportPath = path.resolve(currentDir, importPath);
      } catch (error) {
        continue; // Skip invalid paths
      }
    }
    
    // Check if this resolved path matches any of our old file paths (with or without extension)
    for (const [oldPath, newPath] of fileMapping) {
      const oldPathWithoutExt = oldPath.replace(/\.(ts|tsx|js|jsx)$/, '');
      const resolvedWithoutExt = resolvedImportPath.replace(/\.(ts|tsx|js|jsx)$/, '');
      
      // Check if the import points to this specific file
      // Handle cases where import might have extension or not
      const isMatch = resolvedWithoutExt === oldPathWithoutExt || 
                     resolvedImportPath === oldPath ||
                     resolvedImportPath === oldPathWithoutExt ||
                     (resolvedImportPath + '.ts') === oldPath ||
                     (resolvedImportPath + '.tsx') === oldPath ||
                     (resolvedImportPath + '.js') === oldPath ||
                     (resolvedImportPath + '.jsx') === oldPath;
      
      if (isMatch) {
        let newImportPath;
        
        if (importPath.startsWith('@/')) {
          // For @/ imports, maintain the absolute import style
          const newPathWithoutExt = newPath.replace(/\.(ts|tsx|js|jsx)$/, '');
          const rootRelativePath = path.relative(rootDir, newPathWithoutExt);
          newImportPath = `@/${rootRelativePath}`;
        } else {
          // For relative imports, maintain the relative import style
          const newPathWithoutExt = newPath.replace(/\.(ts|tsx|js|jsx)$/, '');
          const newRelativePath = path.relative(currentDir, newPathWithoutExt);
          newImportPath = newRelativePath.startsWith('.') ? newRelativePath : `./${newRelativePath}`;
        }
        
        // Replace the import/export path in the full match
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
function updateImports(rootDir, fileMapping, includePatterns) {
  console.log('📦 Updating import and export statements...');
  
  let updatedFiles = 0;
  let totalUpdates = 0;
  
  for (const pattern of includePatterns) {
    const searchDir = path.join(rootDir, pattern);
    try {
      const command = `find "${searchDir}" -type f 2>/dev/null | grep -E "\\.(ts|tsx|js|jsx)$" | grep -v ".git" | grep -v "node_modules"`;
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
      // Directory might not exist, continue
    }
  }
  
  return { updatedFiles, totalUpdates };
}

// Dry run - show what would be changed
function dryRun(rootDir, focusedMode = true) {
  console.log('🔍 Scanning for kebab-case files...\n');
  
  const includePatterns = focusedMode ? 
    ['src', 'app', 'config'] : 
    ['.'];
  
  const kebabFiles = findKebabCaseFiles(rootDir, includePatterns);
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
function execute(rootDir, focusedMode = true) {
  console.log('🚀 Executing file renames and import updates...\n');
  
  const includePatterns = focusedMode ? 
    ['src', 'app', 'config'] : 
    ['.'];
  
  const kebabFiles = findKebabCaseFiles(rootDir, includePatterns);
  const fileMapping = createFileMapping(kebabFiles);
  
  if (fileMapping.size === 0) {
    console.log('✅ No files need renaming!');
    return;
  }
  
  // First, update all import statements
  const importResults = updateImports(rootDir, fileMapping, includePatterns);
  
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
File Naming Convention Fixer (Path-Specific)
============================================

This script converts kebab-case file names to camelCase and updates import/export statements
using path resolution to ensure only the correct imports and exports are updated.

Key Features:
- Path-specific import replacement (no global string replacement)
- Handles multiple files with same name in different directories
- Only updates imports and exports that actually point to the renamed files
- Handles both import and re-export statements

Usage:
  node fix-file-naming-correct.cjs [options]

Options:
  --dry-run     Preview changes without executing them (default)
  --execute     Execute the file renames and import updates
  --full        Include all files (not just src/, app/, config/)
  --help, -h    Show this help message

Examples:
  node fix-file-naming-correct.cjs --dry-run         # Preview core files
  node fix-file-naming-correct.cjs --execute         # Execute changes

⚠️  WARNING: Always run --dry-run first and review the changes!
`);
    return;
  }
  
  const focusedMode = !args.includes('--full');
  
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
        execute(rootDir, focusedMode);
      } else {
        console.log('Operation cancelled.');
      }
    });
  } else {
    dryRun(rootDir, focusedMode);
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
  updateImportsInFile,
  updateImports,
  dryRun,
  execute
};