const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// First, remove Jest-related dependencies
try {
  execSync('npm uninstall jest @types/jest jest-environment-jsdom @jest/globals');
} catch (e) {
  console.log('Jest dependencies not found or already removed');
}

function findTestFiles(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  const testFiles = [];

  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    if (file.isDirectory()) {
      testFiles.push(...findTestFiles(fullPath));
    } else if (file.name.match(/\.(test|spec)\.(js|jsx|ts|tsx)$/) || 
               file.name.match(/^__mocks__.*\.(js|ts)$/)) {
      testFiles.push(fullPath);
    }
  }

  return testFiles;
}

function updateFile(filePath) {
  console.log(`Processing ${filePath}`);
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace Jest imports
  content = content.replace(
    /import\s*{\s*jest\s*}\s*from\s*['"]@jest\/globals['"];?/g,
    'import { vi } from "vitest";'
  );
  content = content.replace(
    /import\s*\*\s*as\s*jest\s*from\s*['"]@jest\/globals['"];?/g,
    'import { vi } from "vitest";'
  );

  // Replace jest.fn() with vi.fn()
  content = content.replace(/jest\.fn\(\)/g, 'vi.fn()');
  content = content.replace(/jest\.fn\((.*?)\)/g, 'vi.fn($1)');

  // Replace jest.mock() with vi.mock()
  content = content.replace(/jest\.mock\((.*?)\)/g, 'vi.mock($1)');

  // Replace jest.spyOn() with vi.spyOn()
  content = content.replace(/jest\.spyOn\((.*?)\)/g, 'vi.spyOn($1)');

  // Replace other jest methods
  content = content.replace(/jest\.clearAllMocks\(\)/g, 'vi.clearAllMocks()');
  content = content.replace(/jest\.resetAllMocks\(\)/g, 'vi.resetAllMocks()');
  content = content.replace(/jest\.restoreAllMocks\(\)/g, 'vi.restoreAllMocks()');
  content = content.replace(/jest\.useFakeTimers\(\)/g, 'vi.useFakeTimers()');
  content = content.replace(/jest\.useRealTimers\(\)/g, 'vi.useRealTimers()');
  content = content.replace(/jest\.runAllTimers\(\)/g, 'vi.runAllTimers()');
  content = content.replace(/jest\.advanceTimersByTime\((.*?)\)/g, 'vi.advanceTimersByTime($1)');

  // Add imports if they don't exist
  const imports = ['beforeEach', 'afterEach', 'describe', 'it', 'test', 'expect'];
  imports.forEach(imp => {
    if (!content.includes(`import { ${imp} }`) && content.includes(`${imp}(`)) {
      content = `import { ${imp} } from "vitest";\n${content}`;
    }
  });

  // Update mock implementations
  content = content.replace(/mockImplementation\((.*?)\)/g, (match, p1) => {
    // If the implementation is an arrow function or regular function, keep it as is
    if (p1.includes('=>') || p1.includes('function')) {
      return `mockImplementation(${p1})`;
    }
    // Otherwise, wrap it in an arrow function
    return `mockImplementation(() => ${p1})`;
  });

  // Update file paths in mock imports
  content = content.replace(
    /require\(['"]\.\.(\/__mocks__\/.*)['"]\)/g,
    "require('$1')"
  );

  fs.writeFileSync(filePath, content);
  console.log(`Updated ${filePath}`);
}

// Find and process all test files
const testFiles = findTestFiles('.');
console.log(`Found ${testFiles.length} files to process`);

testFiles.forEach(file => {
  try {
    updateFile(file);
  } catch (error) {
    console.error(`Error processing ${file}:`, error);
  }
});

console.log('Migration completed. Please review the changes and run your tests.'); 