/**
 * Auth Import Path Migration Script
 * 
 * This script specifically migrates auth-related import paths to the new architecture pattern.
 * It focuses on updating imports from the old auth store to the new hooks and services.
 * 
 * Usage:
 * node scripts/migrate-auth-imports.js
 * 
 * Options:
 * --dry-run: Only show what would be changed without making actual changes
 * --verbose: Show detailed information about each change
 * --path=<directory>: Only process files in the specified directory
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Parse command line arguments
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const verbose = args.includes('--verbose');
const pathArg = args.find(arg => arg.startsWith('--path='));
const rootDir = pathArg 
  ? path.resolve(pathArg.split('=')[1]) 
  : path.resolve(__dirname, '..');

// Configuration
const fileExtensions = ['.ts', '.tsx', '.js', '.jsx'];
const excludeDirs = ['node_modules', '.next', 'out', 'dist', '.git'];

// Auth-specific import mappings
const authImportMappings = [
  // Auth store to hooks
  {
    pattern: /import\s+\{\s*useAuthStore\s*\}\s+from\s+['"]@\/lib\/stores\/auth\.store['"]/g,
    replacement: `import { useAuth } from '@/hooks/auth/useAuth'`
  },
  {
    pattern: /import\s+\{\s*useAuthStore\s+as\s+(\w+)\s*\}\s+from\s+['"]@\/lib\/stores\/auth\.store['"]/g,
    replacement: `import { useAuth as $1 } from '@/hooks/auth/useAuth'`
  },
  // Auth store to hooks (kebab-case version)
  {
    pattern: /import\s+\{\s*useAuthStore\s*\}\s+from\s+['"]@\/lib\/stores\/auth-store['"]/g,
    replacement: `import { useAuth } from '@/hooks/auth/useAuth'`
  },
  // Auth types
  {
    pattern: /import\s+\{([^}]+)\}\s+from\s+['"]@\/types\/auth['"]/g,
    replacement: `import {$1} from '@/core/auth/models'`
  },
  // Auth utils
  {
    pattern: /import\s+\{([^}]+)\}\s+from\s+['"]@\/utils\/auth['"]/g,
    replacement: `import {$1} from '@/services/auth/auth-utils'`
  },
  // Auth components
  {
    pattern: /import\s+\{([^}]+)\}\s+from\s+['"]@\/components\/auth\/([A-Z][a-zA-Z0-9]*)['"]/g,
    replacement: (match, imports, component) => {
      const kebabComponent = component.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
      return `import {${imports}} from '@/ui/styled/auth/${kebabComponent}'`;
    }
  }
];

// Function to process a file
function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    let hasChanges = false;
    
    // Apply each mapping
    for (const mapping of authImportMappings) {
      const newContent = content.replace(mapping.pattern, mapping.replacement);
      
      if (newContent !== content) {
        hasChanges = true;
        content = newContent;
      }
    }
    
    // Also update usage of useAuthStore to useAuth
    if (hasChanges) {
      // Replace direct usage of useAuth() with useAuth()
      content = content.replace(/useAuthStore\(\)/g, 'useAuth()');
      
      // Replace references to the store in mock setups
      content = content.replace(/vi\.mock\(['"]@\/lib\/stores\/auth\.store['"].*\{\s*useAuthStore:/gs, 
        match => match.replace('useAuthStore:', 'useAuth:'));
    }
    
    // Report and save changes
    if (hasChanges) {
      console.log(`[${dryRun ? 'DRY RUN' : 'UPDATED'}] ${filePath}`);
      
      if (verbose) {
        // Use git diff-like output to show changes
        const tempFile = `${filePath}.new`;
        fs.writeFileSync(tempFile, content, 'utf8');
        try {
          const diff = execSync(`git diff --no-index -- "${filePath}" "${tempFile}"`).toString();
          console.log(diff);
        } catch (e) {
          // git diff returns non-zero exit code when there are differences
          console.log(e.stdout.toString());
        }
        fs.unlinkSync(tempFile);
      }
      
      if (!dryRun) {
        fs.writeFileSync(filePath, content, 'utf8');
      }
      
      return 1; // Count as a change
    }
    
    return 0; // No changes
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return 0;
  }
}

// Function to walk the directory tree
function walkDir(dir, callback) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Skip excluded directories
      if (excludeDirs.includes(file) || file.startsWith('.')) {
        return;
      }
      
      walkDir(filePath, callback);
    } else if (stat.isFile()) {
      const ext = path.extname(file);
      if (fileExtensions.includes(ext)) {
        callback(filePath);
      }
    }
  });
}

// Main execution
console.log(`Starting auth import path migration ${dryRun ? '(DRY RUN)' : ''}`);
console.log(`Scanning directory: ${rootDir}`);

let totalFiles = 0;
let changedFiles = 0;

walkDir(rootDir, (filePath) => {
  totalFiles++;
  changedFiles += processFile(filePath);
});

console.log('\nMigration Summary:');
console.log(`Total files scanned: ${totalFiles}`);
console.log(`Files with changes: ${changedFiles}`);

if (dryRun && changedFiles > 0) {
  console.log('\nThis was a dry run. Run without --dry-run to apply changes.');
}
