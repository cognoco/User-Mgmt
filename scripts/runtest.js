#!/usr/bin/env node

/**
 * Vitest Test Runner Script for the User Management System
 *
 * Usage Examples:
 *   node scripts/run-tests.js                # Run all tests
 *   node scripts/run-tests.js src/components # Run all tests in a directory
 *   node scripts/run-tests.js src/components/profile/__tests__/ProfileEditor.test.tsx # Run a single test file
 *   node scripts/run-tests.js src/components --watch # Run all tests in a directory in watch mode
 *   node scripts/run-tests.js --coverage     # Run all tests with coverage
 *   node scripts/run-tests.js -- --run <pattern> # Pass any extra Vitest CLI options after --
 *
 * This script:
 *   - Runs Vitest tests (all, a directory, or a single file)
 *   - Passes through any extra CLI options to Vitest
 *   - Prints only essential test failure information
 *   - At the end, prints a summary of failed test files (if any)
 */

import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import os from 'os';

// Parse arguments
const args = process.argv.slice(2);
let testTarget = '';
let vitestArgs = [];

// If the first arg is a directory or file, treat it as the test target
if (args[0] && !args[0].startsWith('-')) {
  testTarget = args[0];
  vitestArgs = args.slice(1);
} else {
  vitestArgs = args;
}

// Find Vitest binary
const vitestBin = path.join(process.cwd(), 'node_modules', '.bin', process.platform === 'win32' ? 'vitest.cmd' : 'vitest');

// Use a temp file for JSON output
const tempJson = path.join(os.tmpdir(), `vitest-run-${Date.now()}.json`);

// Build command
const cmdArgs = ['run'];
if (testTarget) cmdArgs.push(testTarget);
cmdArgs.push('--reporter=default', '--reporter=json', `--outputFile=${tempJson}`);
cmdArgs.push(...vitestArgs);

console.log(`Running: ${vitestBin} ${cmdArgs.join(' ')}`);

(async () => {
  let stdout = '';
  let stderr = '';

  const vitestProcess = spawn(vitestBin, cmdArgs, { shell: true });

  vitestProcess.stdout.on('data', (data) => {
    stdout += data.toString();
  });
  vitestProcess.stderr.on('data', (data) => {
    stderr += data.toString();
  });

  vitestProcess.on('close', (code) => {
    // Function to extract essential error information
    function extractErrorInfo(text) {
      const lines = text.split('\n');
      const errorBlocks = [];
      let currentBlock = [];
      let isErrorSection = false;
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        // Start of a test failure
        if (line.includes(' FAIL ') && line.includes('.test.')) {
          if (currentBlock.length) {
            errorBlocks.push(currentBlock);
            currentBlock = [];
          }
          isErrorSection = true;
          currentBlock.push('\n' + line.trim());
          continue;
        }
        // End of a test failure section (next FAIL or end of file)
        if (isErrorSection && (line.includes(' FAIL ') && line.includes('.test.'))) {
          if (currentBlock.length) {
            errorBlocks.push(currentBlock);
            currentBlock = [];
          }
          currentBlock.push('\n' + line.trim());
          continue;
        }
        // Collect up to 10 lines after FAIL
        if (isErrorSection && currentBlock.length < 11) {
          currentBlock.push(line.trim());
        }
        // If we've collected 10 lines, end this block
        if (isErrorSection && currentBlock.length === 11) {
          errorBlocks.push(currentBlock);
          currentBlock = [];
          isErrorSection = false;
        }
      }
      if (currentBlock.length) {
        errorBlocks.push(currentBlock);
      }
      // Join each block and separate by a line
      return errorBlocks.map(block => block.join('\n')).join('\n\n');
    }

    const errorOutput = stderr + stdout;
    const filtered = extractErrorInfo(errorOutput);
    if (filtered) {
      console.log('\n\x1b[31mTest Failures:\x1b[0m');
      console.log(filtered);
    }

    // Print failed test files summary
    if (fs.existsSync(tempJson)) {
      try {
        const vitestJson = JSON.parse(fs.readFileSync(tempJson, 'utf8'));
        let failedFiles = [];
        if (Array.isArray(vitestJson.testResults)) {
          failedFiles = vitestJson.testResults.filter(f => f.status === 'failed').map(f => f.name);
        } else if (Array.isArray(vitestJson.results)) {
          failedFiles = vitestJson.results.filter(f => f.result === 'fail').map(f => f.file);
        }
        if (failedFiles.length) {
          console.log('\n\x1b[31mFailed Test Files:\x1b[0m');
          failedFiles.forEach(f => console.log(`  - ${path.relative(process.cwd(), f)}`));
        } else {
          console.log('\n\x1b[32mAll test files passed!\x1b[0m');
        }
      } catch (e) {
        console.log('Could not parse Vitest JSON output for summary.');
      }
      try { fs.unlinkSync(tempJson); } catch (e) { /* ignore error if file does not exist */ }
    }

    if (code !== 0) {
      process.exit(code);
    }
  });
})();