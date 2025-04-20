# PowerShell script to kill all Node.js processes
Write-Host "Searching for Node.js processes to terminate..."

# Get all node processes
$nodeProcesses = Get-Process | Where-Object { $_.ProcessName -eq "node" }

if ($nodeProcesses.Count -eq 0) {
    Write-Host "No Node.js processes found to terminate."
}
else {
    Write-Host "Found $($nodeProcesses.Count) Node.js processes to terminate:"
    
    foreach ($process in $nodeProcesses) {
        Write-Host "  - Process ID: $($process.Id), Start Time: $($process.StartTime)"
        
        try {
            # Kill the process
            Stop-Process -Id $process.Id -Force
            Write-Host "    Terminated successfully."
        }
        catch {
            Write-Host "    Failed to terminate: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    
    Write-Host "All Node.js processes have been terminated."
}

# Also check for port 3000, 3001, 3002, 5173
Write-Host "`nChecking for common development ports in use..."
$ports = @(3000, 3001, 3002, 5173)

foreach ($port in $ports) {
    $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    
    if ($connections) {
        foreach ($conn in $connections) {
            Write-Host "Port $port is in use by process ID: $($conn.OwningProcess)"
            
            $process = Get-Process -Id $conn.OwningProcess -ErrorAction SilentlyContinue
            if ($process) {
                Write-Host "  Process name: $($process.ProcessName)"
                
                try {
                    # Kill the process
                    Stop-Process -Id $conn.OwningProcess -Force
                    Write-Host "  Process terminated successfully."
                }
                catch {
                    Write-Host "  Failed to terminate: $($_.Exception.Message)" -ForegroundColor Red
                }
            }
        }
    }
    else {
        Write-Host "Port $port is not in use."
    }
}

Write-Host "`nPort cleanup completed."

# Remove any lock files
$lockFile = Join-Path $PSScriptRoot "../.port.lock"
if (Test-Path $lockFile) {
    Remove-Item $lockFile -Force
    Write-Host "Removed lock file: $lockFile"
} 