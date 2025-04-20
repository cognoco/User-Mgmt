/**
 * Script to kill all Node.js processes except itself
 * Useful for cleaning up orphaned processes when development servers don't shut down properly
 */

import { exec } from 'child_process';
import os from 'os';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get current process ID
const currentPid = process.pid;

console.log(`Current process ID: ${currentPid}`);
console.log('Searching for Node.js processes to terminate...');

// Determine the command based on OS
const isWindows = os.platform() === 'win32';
const cmd = isWindows
  ? `powershell "Get-Process | Where-Object {$_.ProcessName -eq 'node' -and $_.Id -ne ${currentPid}} | ForEach-Object { Write-Host \\\"Killing node process: $($_.Id)\\\"; Stop-Process -Id $_.Id -Force }"`
  : `ps aux | grep node | grep -v ${currentPid} | grep -v grep | awk '{print $2}' | xargs -r kill -9`;

// Execute the command
exec(cmd, (error, stdout, stderr) => {
  if (error) {
    if (error.message && (error.message.includes('no process found') || error.message.includes('not found'))) {
      console.log('No Node.js processes found to terminate.');
    } else {
      console.error(`Error executing command: ${error?.message || 'Unknown error'}`);
    }
    return;
  }
  
  if (stderr) {
    console.error(`Command stderr: ${stderr}`);
    return;
  }
  
  if (stdout && stdout.trim()) {
    console.log(`Command output: ${stdout}`);
  }
  
  console.log('Node.js processes have been terminated successfully.');
  
  // Also clean up any lock files
  cleanupLockFiles();
});

// Clean up lock files
function cleanupLockFiles() {
  const lockFilePath = path.join(process.cwd(), '.port.lock');
  
  try {
    if (fs.existsSync(lockFilePath)) {
      fs.unlinkSync(lockFilePath);
      console.log(`Removed lock file: ${lockFilePath}`);
    }
  } catch (err) {
    console.error(`Error removing lock file: ${err.message}`);
  }
} 