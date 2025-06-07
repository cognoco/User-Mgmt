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

// Create path-aware import mapping
function createPathAwareImportMapping(fileMapping, rootDir) {
  const importMapping = new Map();
  
  for (const [oldPath, newPath] of fileMapping) {
    const oldBaseName = path.basename(oldPath, path.extname(oldPath));
    const newBaseName = path.basename(newPath, path.extname(newPath));
    const directory = path.dirname(oldPath);
    
    // Store mapping with full path context to avoid conflicts
    const mappingKey = `${directory}:${oldBaseName}`;
    importMapping.set(mappingKey, {
      oldBaseName,
      newBaseName,
      directory,
      oldPath,
      newPath
    });
  }
  
  return importMapping;
}

// Update imports in a single file with path-aware replacement
function updateImportsInFile(filePath, pathAwareMapping, rootDir) {
  const content = fs.readFileSync(filePath, 'utf8');
  let newContent = content;
  let hasChanges = false;
  
  const currentDir = path.dirname(filePath);
  
  // Find all import/require statements
  const importRegex = /(?:import\s+.*?\s+from\s+['"`]([^'"`]+)['"`]|require\s*\(\s*['"`]([^'"`]+)['"`]\s*\))/g;
  
  let match;
  const replacements = [];
  
  while ((match = importRegex.exec(content)) !== null) {
    const importPath = match[1] || match[2];
    const fullMatch = match[0];
    const matchIndex = match.index;
    
    // Skip absolute imports and npm packages
    if (!importPath.startsWith('.')) {
      continue;
    }
    
    // Resolve the import path relative to current file
    const resolvedPath = path.resolve(currentDir, importPath);
    
    // Check if this resolved path matches any of our file mappings
    for (const [mappingKey, mapping] of pathAwareMapping) {
      const targetPathWithoutExt = path.resolve(mapping.directory, mapping.oldBaseName);
      
      // Check if the resolved import path (without extension) matches our target
      if (resolvedPath === targetPathWithoutExt || 
          resolvedPath === targetPathWithoutExt + '.ts' ||
          resolvedPath === targetPathWithoutExt + '.tsx' ||
          resolvedPath === targetPathWithoutExt + '.js' ||
          resolvedPath === targetPathWithoutExt + '.jsx') {
        
        // Calculate the new relative path
        const newTargetPath = path.resolve(mapping.directory, mapping.newBaseName);
        const newRelativePath = path.relative(currentDir, newTargetPath);
        
        // Ensure the path starts with ./ if it's in the same directory
        const normalizedNewPath = newRelativePath.startsWith('.') ? newRelativePath : `./${newRelativePath}`;
        
        // Create the replacement
        const newImportStatement = fullMatch.replace(importPath, normalizedNewPath);
        
        replacements.push({
          original: fullMatch,
          replacement: newImportStatement,
          index: matchIndex
        });
        
        hasChanges = true;
      }
    }
  }
  
  // Apply replacements in reverse order to maintain indices
  replacements.sort((a, b) => b.index - a.index);
  
  for (const replacement of replacements) {
    newContent = newContent.substring(0, replacement.index) + 
                replacement.replacement + 
                newContent.substring(replacement.index + replacement.original.length);
  }
  
  return { newContent, hasChanges, replacements: replacements.length };
}

// Update imports in all TypeScript/JavaScript files with path awareness
function updateImportsPathAware(rootDir, pathAwareMapping, includePatterns) {
  console.log('📦 Updating import statements with path awareness...');
  
  let updatedFiles = 0;
  let totalUpdates = 0;
  
  for (const pattern of includePatterns) {
    const searchDir = path.join(rootDir, pattern);
    try {
      const command = `find "${searchDir}" -type f 2>/dev/null | grep -E "\\.(ts|tsx|js|jsx)$" | grep -v ".git" | grep -v "node_modules"`;
      const files = execSync(command, { encoding: 'utf8' }).trim().split('\n').filter(f => f.length > 0);
      
      for (const filePath of files) {
        try {
          const result = updateImportsInFile(filePath, pathAwareMapping, rootDir);
          
          if (result.hasChanges) {
            fs.writeFileSync(filePath, result.newContent);
            updatedFiles++;
            totalUpdates += result.replacements;
            console.log(`  ✅ Updated ${result.replacements} imports in ${path.relative(rootDir, filePath)}`);
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

// Dry run - show what would be changed with conflict detection
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
  
  // Check for potential conflicts
  const baseNameCounts = new Map();
  for (const [oldPath, newPath] of fileMapping) {
    const newBaseName = path.basename(newPath, path.extname(newPath));
    if (!baseNameCounts.has(newBaseName)) {
      baseNameCounts.set(newBaseName, []);
    }
    baseNameCounts.get(newBaseName).push({ oldPath, newPath });
  }
  
  const conflicts = Array.from(baseNameCounts.entries()).filter(([name, paths]) => paths.length > 1);
  
  if (conflicts.length > 0) {
    console.log('⚠️  POTENTIAL CONFLICTS DETECTED:');
    console.log('================================');
    for (const [baseName, paths] of conflicts) {
      console.log(`${baseName}:`);
      for (const { oldPath, newPath } of paths) {
        console.log(`  - ${path.relative(rootDir, oldPath)} → ${path.relative(rootDir, newPath)}`);
      }
      console.log('');
    }
  }
  
  console.log('🔄 File Renames Preview (showing first 20):');
  console.log('===========================================');
  let count = 0;
  for (const [oldPath, newPath] of fileMapping) {
    if (count >= 20) {
      console.log(`... and ${fileMapping.size - 20} more files`);
      break;
    }
    const oldName = path.basename(oldPath);
    const newName = path.basename(newPath);
    const relativePath = path.relative(rootDir, path.dirname(oldPath));
    console.log(`${relativePath}/${oldName} → ${newName}`);
    count++;
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`- Files to rename: ${fileMapping.size}`);
  console.log(`- Potential naming conflicts: ${conflicts.length}`);
  console.log(`\nNote: Path-aware import replacement will prevent incorrect substitutions`);
}

// Execute the renames and import updates with safety checks
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
  
  // Create path-aware import mapping
  const pathAwareMapping = createPathAwareImportMapping(fileMapping, rootDir);
  
  // First, update all import statements using path-aware replacement
  const importResults = updateImportsPathAware(rootDir, pathAwareMapping, includePatterns);
  
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
  console.log(`   Import statements updated: ${importResults.totalUpdates} in ${importResults.updatedFiles} files`);
  
  if (success > 0) {
    console.log(`\n⚠️  Important: Please review the changes and test your application.`);
    console.log(`   Some complex import patterns might need manual adjustment.`);
  }
}

// Main function
function main() {
  const args = process.argv.slice(2);
  const rootDir = '/mnt/c/Dev/Projects/Products/Apps/user-management-reorganized';
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
File Naming Convention Fixer (Safe Version)
===========================================

This script converts kebab-case file names to camelCase and updates import statements
with path-aware replacement to prevent conflicts between files with same names.

Usage:
  node fix-file-naming-safe.cjs [options]

Options:
  --dry-run     Preview changes without executing them (default)
  --execute     Execute the file renames and import updates
  --full        Include all files (not just src/, app/, config/)
  --help, -h    Show this help message

Safety Features:
  - Path-aware import replacement prevents incorrect substitutions
  - Conflict detection for files with same target names
  - Relative path resolution to avoid cross-directory conflicts

Examples:
  node fix-file-naming-safe.cjs --dry-run         # Preview core files
  node fix-file-naming-safe.cjs --dry-run --full  # Preview all files
  node fix-file-naming-safe.cjs --execute         # Execute changes

⚠️  WARNING: Always run --dry-run first and review the changes!
⚠️  Consider making a git commit before running --execute
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
  createPathAwareImportMapping,
  updateImportsPathAware,
  updateImportsInFile,
  dryRun,
  execute
};