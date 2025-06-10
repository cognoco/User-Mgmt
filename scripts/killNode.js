/**
 * Kills all Node.js processes except itself to clean up orphaned dev servers.
 * Reads: none
 * Writes: removes .port.lock if present
 * Output: Console output of killed processes and lock file removal.
 */

import { exec } from 'child_process';
import os from 'os';
import fs from 'fs';
import path from 'path';

// Get current process ID
const currentPid = process.pid;

console.log(`Current process ID: ${currentPid}`);
console.log('Searching for Node.js processes to terminate...');

// Determine the command based on OS
const isWindows = os.platform() === 'win32';
const cmd = isWindows
  ? `powershell "Get-Process | Where-Object {$_.ProcessName -eq 'node' -and $_.Id -ne ${currentPid}} | ForEach-Object { Write-Host 'Killing node process: $($_.Id)'; Stop-Process -Id $_.Id -Force }"`
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
  
  // Common development ports to check
  const ports = [3000, 3001, 3002, 5173];

  function freePorts() {
    if (isWindows) {
      ports.forEach((port) => {
        // Use netstat to find process using the port
        exec(`netstat -ano | findstr :${port}`, (err, stdout) => {
          if (stdout) {
            const lines = stdout.split('\n').filter(Boolean);
            lines.forEach((line) => {
              const match = line.match(/\s+(\d+)\s*$/); // PID is last number
              if (match) {
                const pid = match[1];
                if (pid && pid !== currentPid.toString()) {
                  console.log(`Port ${port} is in use by process ID: ${pid}`);
                  exec(`taskkill /PID ${pid} /F`, (killErr) => {
                    if (!killErr) {
                      console.log(`  Process ${pid} terminated successfully.`);
                    } else {
                      console.log(`  Failed to terminate process ${pid}: ${killErr.message}`);
                    }
                  });
                }
              }
            });
          } else {
            console.log(`Port ${port} is not in use.`);
          }
        });
      });
    } else {
      ports.forEach((port) => {
        exec(`lsof -i :${port} -t`, (err, stdout) => {
          if (stdout) {
            const pids = stdout.split('\n').filter(Boolean);
            pids.forEach((pid) => {
              if (pid && pid !== currentPid.toString()) {
                console.log(`Port ${port} is in use by process ID: ${pid}`);
                exec(`kill -9 ${pid}`, (killErr) => {
                  if (!killErr) {
                    console.log(`  Process ${pid} terminated successfully.`);
                  } else {
                    console.log(`  Failed to terminate process ${pid}: ${killErr.message}`);
                  }
                });
              }
            });
          } else {
            console.log(`Port ${port} is not in use.`);
          }
        });
      });
    }
  }

  // Run port cleanup after killing node processes
  setTimeout(() => {
    console.log('\nChecking for common development ports in use...');
    freePorts();
    // Clean up lock files (already called in exec callback, but safe to call again)
    cleanupLockFiles();
  }, 2000);
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