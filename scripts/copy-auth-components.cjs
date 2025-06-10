// copy-auth-components.cjs
const fs = require('fs');
const path = require('path');

// Root project directory
const PROJECT_ROOT = path.resolve(__dirname, '..');
const domain = 'auth';

// Paths
const srcDir = path.join(PROJECT_ROOT, 'src', 'components', domain);
const styledDestDir = path.join(PROJECT_ROOT, 'src', 'ui', 'styled', domain);
const headlessDestDir = path.join(PROJECT_ROOT, 'src', 'ui', 'headless', domain);

// Ensure destination directories exist
if (!fs.existsSync(styledDestDir)) {
  fs.mkdirSync(styledDestDir, { recursive: true });
  console.log(`Created styled directory: ${styledDestDir}`);
}

if (!fs.existsSync(headlessDestDir)) {
  fs.mkdirSync(headlessDestDir, { recursive: true });
  console.log(`Created headless directory: ${headlessDestDir}`);
}

// Copy files to styled directory
const files = fs.readdirSync(srcDir);
console.log(`Found ${files.length} items in source directory`);

files.forEach(item => {
  const srcPath = path.join(srcDir, item);
  
  // Skip if it's not a file or directory
  if (!fs.existsSync(srcPath)) {
    return;
  }
  
  const isDirectory = fs.statSync(srcPath).isDirectory();
  
  if (isDirectory) {
    // Handle directories like __tests__
    if (item === '__tests__') {
      const srcTestDir = srcPath;
      const styledTestDir = path.join(styledDestDir, item);
      
      // Create test directory if it doesn't exist
      if (!fs.existsSync(styledTestDir)) {
        fs.mkdirSync(styledTestDir, { recursive: true });
        console.log(`Created test directory: ${styledTestDir}`);
      }
      
      // Copy test files
      if (fs.existsSync(srcTestDir)) {
        const testFiles = fs.readdirSync(srcTestDir);
        testFiles.forEach(testFile => {
          const srcTestPath = path.join(srcTestDir, testFile);
          const styledTestPath = path.join(styledTestDir, testFile);
          
          if (fs.statSync(srcTestPath).isFile()) {
            fs.copyFileSync(srcTestPath, styledTestPath);
            console.log(`Copied test file: ${testFile}`);
          }
        });
      }
    }
  } else {
    // Handle regular files
    const styledDestPath = path.join(styledDestDir, item);
    
    fs.copyFileSync(srcPath, styledDestPath);
    console.log(`Copied file: ${item}`);
  }
});

console.log('Migration complete! Files have been copied to the new location but not removed from the original location for safety.');
console.log('Please verify the migration before removing the original files.');
