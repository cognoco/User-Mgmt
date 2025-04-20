/**
 * Helper script to detect the currently running backend port
 * Used by the frontend to connect to the backend API
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec, execSync } from 'child_process';

console.log(`[${new Date().toISOString()}] get-backend-port.js script started.`);

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');
const projectDir = path.join(rootDir, 'project');
const lockFilePath = path.join(rootDir, '.port.lock');
const lastPortFilePath = path.join(rootDir, '.last-backend-port');
const currentPortFilePath = path.join(projectDir, '.backend-port');
const viteCachePath = path.join(projectDir, 'node_modules', '.vite');

// Try to find the port from the lock file
function getPortFromLockFile() {
  console.log(`[${new Date().toISOString()}] Checking lock file: ${lockFilePath}`);
  try {
    if (fs.existsSync(lockFilePath)) {
      const lockData = JSON.parse(fs.readFileSync(lockFilePath, 'utf8'));
      if (lockData && lockData.port) {
        console.log(`[${new Date().toISOString()}] Found port ${lockData.port} in lock file.`);
        return lockData.port;
      }
      console.log(`[${new Date().toISOString()}] Lock file exists but contains no port.`);
    } else {
      console.log(`[${new Date().toISOString()}] Lock file does not exist.`);
    }
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Error reading lock file:`, err);
  }
  return null;
}

// Try to find the port from running processes
function findPortFromNetstat() {
  console.log(`[${new Date().toISOString()}] Attempting to find port using netstat/lsof...`);
  return new Promise((resolve) => {
    const cmd = process.platform === 'win32'
      ? `netstat -ano | findstr "LISTENING" | findstr /E /C:"node.exe"`
      : `lsof -i -P -n | grep LISTEN | grep node`;
    console.log(`[${new Date().toISOString()}] Executing command: ${cmd}`);
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.error(`[${new Date().toISOString()}] Error executing netstat/lsof: ${error.message}`);
        return resolve(null);
      }
      if (stderr) {
         if (process.platform !== 'win32' || !stderr.includes('FINDSTR: Cannot open')) {
             console.error(`[${new Date().toISOString()}] Stderr from netstat/lsof: ${stderr}`);
         }
        return resolve(null);
      }
      const lines = stdout.split('\n').filter(Boolean);
      console.log(`[${new Date().toISOString()}] Output from netstat/lsof:`, lines.join(' | '));
      const portRegex = process.platform === 'win32'
        ? /(?:127\.0\.0\.1|0\.0\.0\.0|::):(\d+)/
        : /\*:(\d+)/;
      for (const line of lines) {
        const match = line.match(portRegex);
        if (match && match[1]) {
          const port = parseInt(match[1], 10);
          if ([3000, 3001, 3030, 3040, 3050, 3060, 3070].includes(port)) {
            console.log(`[${new Date().toISOString()}] Found potential backend port ${port} from netstat/lsof.`);
            return resolve(port);
          }
        }
      }
      console.log(`[${new Date().toISOString()}] No suitable port found in netstat/lsof output.`);
      resolve(null);
    });
  });
}

// Helper to read the last used port
function getLastUsedPort() {
  try {
    if (fs.existsSync(lastPortFilePath)) {
      const port = fs.readFileSync(lastPortFilePath, 'utf8').trim();
      console.log(`[${new Date().toISOString()}] Read last used port: ${port}`);
      return port ? parseInt(port, 10) : null;
    }
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Error reading last port file:`, err);
  }
  return null;
}

// Helper to write the last used port
function writeLastUsedPort(port) {
  try {
    fs.writeFileSync(lastPortFilePath, port.toString());
    console.log(`[${new Date().toISOString()}] Wrote current port ${port} to ${lastPortFilePath}`);
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Error writing last port file:`, err);
  }
}

// Helper to clear Vite cache
function clearViteCache() {
  console.log(`[${new Date().toISOString()}] Attempting to clear Vite cache at: ${viteCachePath}`);
  if (fs.existsSync(viteCachePath)) {
    try {
      execSync(`npx rimraf ${viteCachePath}`, { stdio: 'inherit' });
      console.log(`[${new Date().toISOString()}] Vite cache cleared successfully.`);
    } catch (err) {
      console.error(`[${new Date().toISOString()}] Error clearing Vite cache:`, err);
    }
  } else {
    console.log(`[${new Date().toISOString()}] Vite cache directory not found, skipping clearance.`);
  }
}

// Combined Backend Port Detection Logic with Wait-and-Retry
async function getBackendPort(maxRetries = 15, retryDelayMs = 2000) { // Retry for ~30 seconds
  console.log(`[${new Date().toISOString()}] Starting backend port detection (Max Retries: ${maxRetries}, Delay: ${retryDelayMs}ms)`);

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    console.log(`[${new Date().toISOString()}] Detection attempt ${attempt}/${maxRetries}...`);

    // 1. Check Lock File
    const lockFilePort = getPortFromLockFile();
    if (lockFilePort) {
      console.log(`[${new Date().toISOString()}] SUCCESS: Using backend port ${lockFilePort} from lock file.`);
      return lockFilePort;
    }

    // 2. Check Netstat (Less reliable immediately after start, but worth a check)
    const netstatPort = await findPortFromNetstat();
    if (netstatPort) {
      console.log(`[${new Date().toISOString()}] SUCCESS: Using backend port ${netstatPort} found via netstat.`);
      return netstatPort;
    }

    // 3. Try Fetching test endpoint from potential ports
    const portsToTest = [3030, 3040, 3050, 3060, 3070, 3000, 3001]; // Prioritize preferred
    console.log(`[${new Date().toISOString()}] Attempting to fetch from ports: ${portsToTest.join(', ')}`);
    for (const port of portsToTest) {
      console.log(`[${new Date().toISOString()}] Trying port ${port}...`);
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1500); // Shorter timeout for faster check
        const response = await fetch(`http://localhost:${port}/api/test-cors`, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        if (response.ok) {
          console.log(`[${new Date().toISOString()}] SUCCESS: Successfully connected to backend on port ${port}`);
          return port;
        } else {
          console.log(`[${new Date().toISOString()}] Received non-OK status ${response.status} from port ${port}`);
        }
      } catch (err) {
        if (err.name === 'AbortError') {
          console.log(`[${new Date().toISOString()}] Fetch timed out for port ${port}`);
        } else {
          // More verbose logging for connection refused during retry loop
          console.log(`[${new Date().toISOString()}] Fetch error for port ${port}: ${err.message}`);
        }
      }
    } // End of port fetch loop

    // If not found and not the last attempt, wait and retry
    if (attempt < maxRetries) {
      console.log(`[${new Date().toISOString()}] Backend not found yet. Waiting ${retryDelayMs}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, retryDelayMs));
    } else {
       console.log(`[${new Date().toISOString()}] Maximum retries reached.`);
    }

  } // End of retry loop

  // Fallback if all retries fail
  const fallbackPort = 3030;
  console.warn(`[${new Date().toISOString()}] Could not find running backend port after all retries! Defaulting to ${fallbackPort}`);
  return fallbackPort;
}

// Main function
async function run() {
  const lastPort = getLastUsedPort();
  const currentPort = await getBackendPort();

  if (currentPort === null) {
     console.error(`[${new Date().toISOString()}] FATAL: Could not determine backend port.`);
     process.exit(1);
  }

  console.log(`[${new Date().toISOString()}] Last used port: ${lastPort}, Current backend port: ${currentPort}`);

  if (lastPort !== null && currentPort !== lastPort) {
    console.log(`[${new Date().toISOString()}] Backend port changed (${lastPort} -> ${currentPort}). Clearing Vite cache.`);
    clearViteCache();
  } else if (lastPort === null) {
      console.log(`[${new Date().toISOString()}] No previous port recorded, skipping cache clear.`);
  } else {
      console.log(`[${new Date().toISOString()}] Backend port (${currentPort}) has not changed, skipping cache clear.`);
  }

  try {
    fs.writeFileSync(currentPortFilePath, currentPort.toString());
    console.log(`[${new Date().toISOString()}] Wrote current port ${currentPort} to ${currentPortFilePath} for Vite.`);
  } catch (err) {
     console.error(`[${new Date().toISOString()}] Error writing current port file for Vite:`, err);
  }

  writeLastUsedPort(currentPort);

  process.stdout.write(currentPort.toString());
  console.log(`[${new Date().toISOString()}] get-backend-port.js script finished.`);
}

run(); 