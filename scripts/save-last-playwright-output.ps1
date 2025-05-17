# Auto-rename e2e_report.js to e2e_report.ps1 if it exists
$jsPath = "scripts/e2e_report.js"
$ps1Path = "scripts/e2e_report.ps1"
if (Test-Path $jsPath) {
    Rename-Item -Path $jsPath -NewName "e2e_report.ps1" -Force
    Write-Host "Renamed e2e_report.js to e2e_report.ps1."
}

# Main logic: find last Playwright test, rerun, save output
$lastTestCmd = (Get-History | Where-Object { $_.CommandLine -like "*npx playwright test*" } | Select-Object -Last 1).CommandLine

if (-not $lastTestCmd) {
    Write-Host "No previous Playwright test command found in history."
    exit 1
}

if ($lastTestCmd -match "npx playwright test\s+([^\s]+\.test\.[tj]sx?)") {
    $testFile = $matches[1]
    Write-Host "Re-running last test: $testFile"
    npx playwright test $testFile --reporter=list | Out-File -Encoding utf8 playwright-last-output.txt
    Write-Host "Output saved to playwright-last-output.txt"
} else {
    Write-Host "Could not extract test file from last command."
    exit 1
} 