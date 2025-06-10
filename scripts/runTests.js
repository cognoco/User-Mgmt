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
 *   - Prints all Vitest output, including errors
 *   - At the end, prints a summary of failed test files (if any)
 */

import { spawnSync } from 'child_process';
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

const result = spawnSync(vitestBin, cmdArgs, {
  stdio: 'inherit',
  shell: true,
});

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

if (result.error) {
  console.error('Error running Vitest:', result.error);
  process.exit(1);
}

process.exit(result.status); 