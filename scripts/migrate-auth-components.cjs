// migrate-auth-components.cjs
const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Run for the auth domain
const DOMAINS = ['auth'];

// Root project directory (2 levels up from scripts folder)
const PROJECT_ROOT = path.resolve(__dirname, '..');

/**
 * Moves components from src/components/{domain} to src/ui/styled/{domain}
 * Also creates a headless version in src/ui/headless/{domain} if it doesn't exist
 */
function moveDomain(domain) {
  try {
    const srcDir = path.join(PROJECT_ROOT, 'src', 'components', domain);
    const styledDestDir = path.join(PROJECT_ROOT, 'src', 'ui', 'styled', domain);
    const headlessDestDir = path.join(PROJECT_ROOT, 'src', 'ui', 'headless', domain);

    if (!fs.existsSync(srcDir)) {
      console.log(`Source folder not found: ${srcDir}`);
      return;
    }

    // Create destination directories if they don't exist
    if (!fs.existsSync(styledDestDir)) {
      fs.mkdirSync(styledDestDir, { recursive: true });
      console.log(`Created styled directory: ${styledDestDir}`);
    }

    if (!fs.existsSync(headlessDestDir)) {
      fs.mkdirSync(headlessDestDir, { recursive: true });
      console.log(`Created headless directory: ${headlessDestDir}`);
    }

    // Copy files to styled directory (not move yet, to be safe)
    const files = fs.readdirSync(srcDir);
    
    files.forEach(item => {
      if (item === '__tests__') {
        // Handle test directory separately
        const srcTestDir = path.join(srcDir, item);
        const styledTestDir = path.join(styledDestDir, item);
        const headlessTestDir = path.join(headlessDestDir, item);
        
        if (!fs.existsSync(styledTestDir)) {
          fs.mkdirSync(styledTestDir, { recursive: true });
        }
        
        if (!fs.existsSync(headlessTestDir)) {
          fs.mkdirSync(headlessTestDir, { recursive: true });
        }
        
        // Copy test files to styled directory
        if (fs.existsSync(srcTestDir) && fs.statSync(srcTestDir).isDirectory()) {
          fs.readdirSync(srcTestDir).forEach(testFile => {
            const srcTestPath = path.join(srcTestDir, testFile);
            const styledTestPath = path.join(styledTestDir, testFile);
            
            if (fs.statSync(srcTestPath).isFile()) {
              fs.copyFileSync(srcTestPath, styledTestPath);
              console.log(`Copied test: ${srcTestPath} -> ${styledTestPath}`);
            }
          });
        }
      } else if (fs.statSync(path.join(srcDir, item)).isFile()) {
        // Handle regular files
        const srcPath = path.join(srcDir, item);
        const styledDestPath = path.join(styledDestDir, item);
        
        fs.copyFileSync(srcPath, styledDestPath);
        console.log(`Copied: ${srcPath} -> ${styledDestPath}`);
      }
    });

    console.log(`Successfully processed ${domain} domain`);
  } catch (error) {
    console.error(`Error processing ${domain} domain:`, error);
  }
}

/**
 * Updates import paths in all .ts/.tsx files
 */
function updateImports(domain) {
  try {
    // Include app directory in the search as well
    const files = glob.sync(path.join(PROJECT_ROOT, '{src,app}', '**', '*.{ts,tsx}'));
    const oldPath = `@/components/${domain}`;
    const newPath = `@/ui/styled/${domain}`;
    
    // Also handle relative imports
    const relativeImportRegex = new RegExp(`['"]\.\.?/.+?/components/${domain}`, 'g');
    
    let updatedCount = 0;
    
    files.forEach(file => {
      let content = fs.readFileSync(file, 'utf8');
      let updated = false;
      
      // Replace alias imports (@/components/...)
      if (content.includes(oldPath)) {
        content = content.replace(new RegExp(oldPath, 'g'), newPath);
        updated = true;
      }
      
      // Replace relative imports (../../components/...)
      if (relativeImportRegex.test(content)) {
        // Reset the regex lastIndex
        relativeImportRegex.lastIndex = 0;
        
        // Calculate the relative path to the new location
        const relativePath = path.relative(
          path.dirname(file),
          path.join(PROJECT_ROOT, 'src', 'ui', 'styled', domain)
        ).replace(/\\/g, '/');
        
        // Replace each match with the correct relative path
        content = content.replace(relativeImportRegex, match => {
          const quote = match[0]; // Capture the quote type (' or ")
          return `${quote}${relativePath}`;
        });
        
        updated = true;
      }
      
      if (updated) {
        fs.writeFileSync(file, content, 'utf8');
        updatedCount++;
        console.log(`Updated imports in: ${file}`);
      }
    });
    
    console.log(`Updated imports in ${updatedCount} files for ${domain} domain`);
  } catch (error) {
    console.error(`Error updating imports for ${domain} domain:`, error);
  }
}

// MAIN
console.log('Starting migration for auth domain...');

DOMAINS.forEach(domain => {
  console.log(`Processing ${domain} domain...`);
  moveDomain(domain);
  updateImports(domain);
});

console.log('Migration complete! Files have been copied to the new location but not removed from the original location for safety.');
console.log('Please verify the migration before removing the original files.');
