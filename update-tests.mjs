import { readdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';

async function findTestFiles(dir) {
  const files = await readdir(dir, { withFileTypes: true });
  const testFiles = [];

  for (const file of files) {
    const path = join(dir, file.name);
    if (file.isDirectory()) {
      testFiles.push(...await findTestFiles(path));
    } else if (file.name.match(/\.(test|spec)\.(js|jsx|ts|tsx)$/)) {
      testFiles.push(path);
    }
  }

  return testFiles;
}

async function updateFile(filePath) {
  console.log(`Processing ${filePath}`);
  let content = await readFile(filePath, 'utf8');

  // Replace Jest imports with Vitest
  content = content.replace(/import\s*{\s*jest\s*}\s*from\s*['"]@jest\/globals['"];?/g, 'import { vi } from "vitest";');
  content = content.replace(/import\s*\*\s*as\s*jest\s*from\s*['"]@jest\/globals['"];?/g, 'import { vi } from "vitest";');

  // Replace jest functions with vi equivalents
  content = content.replace(/jest\.fn\(\)/g, 'vi.fn()');
  content = content.replace(/jest\.mock\(/g, 'vi.mock(');
  content = content.replace(/jest\.spyOn\(/g, 'vi.spyOn(');
  content = content.replace(/jest\.clearAllMocks\(\)/g, 'vi.clearAllMocks()');
  content = content.replace(/jest\.resetAllMocks\(\)/g, 'vi.resetAllMocks()');
  content = content.replace(/jest\.restoreAllMocks\(\)/g, 'vi.restoreAllMocks()');

  // Add imports if they don't exist
  if (!content.includes('import { beforeEach }') && content.includes('beforeEach(')) {
    content = 'import { beforeEach } from "vitest";\n' + content;
  }
  if (!content.includes('import { afterEach }') && content.includes('afterEach(')) {
    content = 'import { afterEach } from "vitest";\n' + content;
  }
  if (!content.includes('import { describe }') && content.includes('describe(')) {
    content = 'import { describe } from "vitest";\n' + content;
  }
  if (!content.includes('import { it }') && content.includes('it(')) {
    content = 'import { it } from "vitest";\n' + content;
  }
  if (!content.includes('import { test }') && content.includes('test(')) {
    content = 'import { test } from "vitest";\n' + content;
  }
  if (!content.includes('import { expect }') && content.includes('expect(')) {
    content = 'import { expect } from "vitest";\n' + content;
  }

  await writeFile(filePath, content);
  console.log(`Updated ${filePath}`);
}

async function main() {
  try {
    const testFiles = await findTestFiles('.');
    console.log(`Found ${testFiles.length} test files`);
    
    for (const file of testFiles) {
      await updateFile(file);
    }
    
    console.log('All test files have been updated to use Vitest syntax');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main(); 