/**
 * Fix useAuth Import Path Script
 * 
 * This script fixes the incorrect import paths for useAuth in the codebase.
 * It changes '@/hooks/auth/useAuth' to '@/hooks/useAuth'
 * 
 * Usage:
 * node scripts/fix-useauth-imports.cjs
 * 
 * Options:
 * --dry-run: Only show what would be changed without making actual changes
 * --verbose: Show detailed information about each change
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Parse command line arguments
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const verbose = args.includes('--verbose');
const rootDir = path.resolve(__dirname, '..');

// Configuration
const fileExtensions = ['.ts', '.tsx', '.js', '.jsx', '.cjs'];
const excludeDirs = ['node_modules', '.next', 'out', 'dist', '.git'];

// Function to process a file
function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    
    // Replace incorrect import paths
    const newContent = content.replace(
      /import\s+\{\s*useAuth(\s+as\s+[^}]+)?\s*\}\s+from\s+['"]@\/hooks\/auth\/useAuth['"]/g,
      (match, asClause) => {
        return `import { useAuth${asClause || ''} } from '@/hooks/useAuth'`;
      }
    );
    
    // Also fix paths in migration scripts
    const fixedMigrationContent = newContent.replace(
      /replacement:\s+`import\s+\{\s*useAuth(\s+as\s+\$1)?\s*\}\s+from\s+['"]@\/hooks\/auth\/useAuth['"]/g,
      (match, asClause) => {
        return `replacement: \`import { useAuth${asClause || ''} } from '@/hooks/useAuth'`;
      }
    );
    
    const hasChanges = fixedMigrationContent !== originalContent;
    
    // Report and save changes
    if (hasChanges) {
      console.log(`[${dryRun ? 'DRY RUN' : 'UPDATED'}] ${filePath}`);
      
      if (verbose) {
        // Use git diff-like output to show changes
        const tempFile = `${filePath}.new`;
        fs.writeFileSync(tempFile, fixedMigrationContent, 'utf8');
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
        fs.writeFileSync(filePath, fixedMigrationContent, 'utf8');
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
console.log(`Starting useAuth import path fix ${dryRun ? '(DRY RUN)' : ''}`);
console.log(`Scanning directory: ${rootDir}`);

let totalFiles = 0;
let changedFiles = 0;

walkDir(rootDir, (filePath) => {
  totalFiles++;
  changedFiles += processFile(filePath);
});

console.log('\nFix Summary:');
console.log(`Total files scanned: ${totalFiles}`);
console.log(`Files with changes: ${changedFiles}`);

if (dryRun && changedFiles > 0) {
  console.log('\nThis was a dry run. Run without --dry-run to apply changes.');
}
