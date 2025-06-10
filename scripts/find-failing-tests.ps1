# scripts/find-failing-tests.ps1
# To Run: powershell -ExecutionPolicy Bypass -File .\\scripts\\find-failing-tests.ps1

$outputFile = "vitest-output.txt"

# Run all tests and capture output
Write-Host "Running Vitest tests and capturing output to $outputFile..."
try {
    npx vitest run --reporter verbose | Out-File -Encoding utf8 $outputFile -ErrorAction Stop
    Write-Host "Test run complete. Analyzing output..."
}
catch {
    Write-Error "Failed to run Vitest or write to output file: $($_.Exception.Message)"
    exit 1
}

$lines = Get-Content $outputFile -ErrorAction SilentlyContinue
if (-not $lines) {
    Write-Error "Could not read test output from $outputFile, or the file is empty."
    exit 1
}

Write-Host "`n--- Failing Tests & Errors ---"

$currentTestFile = ""
$currentTestName = ""
$capturingError = $false
$currentErrorLines = [System.Collections.Generic.List[string]]::new()
$failCount = 0
$foundFailures = $false

foreach ($line in $lines) {
    $trimmedLine = $line.Trim()
    if ($trimmedLine -match '^FAIL\\s+([^>]+?)\\s*>\\s*(.+)$') {
        $foundFailures = $true
        # If we were capturing an error for a previous test, print it before starting a new one.
        if ($capturingError -and $currentErrorLines.Count -gt 0) {
            Write-Host "`nFAIL: $currentTestFile > $currentTestName"
            $errorMessage = $currentErrorLines -join "`n    "
            Write-Host "  Error:"
            Write-Host "    $errorMessage"
            
            $potentialCause = "N/A"
            if ($errorMessage -match 'i18n|translation|key|locale|language') { $potentialCause = "i18n" }
            if ($errorMessage -match 'mock|spy|vi\.fn|jest\.fn|called|toHaveBeenCalled|TestingLibraryElementError') { 
                $potentialCause = if ($potentialCause -eq "i18n") { "i18n & Mocking/DOM" } else { "Mocking/DOM" }
            }
            Write-Host "  Potential Cause: $potentialCause"
        }

        # Start capturing for the new failed test
        $currentTestFile = $Matches[1].Trim()
        $currentTestName = $Matches[2].Trim()
        $capturingError = $true
        $currentErrorLines.Clear()
        $failCount++
        continue 
    }

    if ($capturingError) {
        # Determine end of error block more reliably
        if ($line -match '^ (PASS|SKIP|TODO|RUNS|✓|✕|-{3,})' -or $line -match '⎯⎯⎯⎯ Unhandled Rejection ⎯⎯⎯⎯⎯' -or $line -match '^Tests: .* passed' -or $line -match '^Test Suites: .* passed') {
            if ($currentErrorLines.Count -gt 0) {
                Write-Host "`nFAIL: $currentTestFile > $currentTestName"
                $errorMessage = $currentErrorLines -join "`n    " 
                Write-Host "  Error:"
                Write-Host "    $errorMessage"

                $potentialCause = "N/A"
                if ($errorMessage -match 'i18n|translation|key|locale|language') { $potentialCause = "i18n" }
                if ($errorMessage -match 'mock|spy|vi\.fn|jest\.fn|called|toHaveBeenCalled|TestingLibraryElementError') {
                     $potentialCause = if ($potentialCause -eq "i18n") { "i18n & Mocking/DOM" } else { "Mocking/DOM" }
                }
                Write-Host "  Potential Cause: $potentialCause"
            }
            $capturingError = $false
            $currentErrorLines.Clear()
            
            # If this line itself is a *new* FAIL, it will be caught by the first if-condition in the next iteration.
        } elseif (-not [string]::IsNullOrWhiteSpace($line)) { # Only add non-empty/non-whitespace lines
            $currentErrorLines.Add($line.TrimStart()) 
        }
    }
}

# Print the last captured error if the file ended while capturing
if ($capturingError -and $currentErrorLines.Count -gt 0) {
    Write-Host "`nFAIL: $currentTestFile > $currentTestName"
    $errorMessage = $currentErrorLines -join "`n    "
    Write-Host "  Error:"
    Write-Host "    $errorMessage"
    $potentialCause = "N/A"
    if ($errorMessage -match 'i18n|translation|key|locale|language') { $potentialCause = "i18n" }
    if ($errorMessage -match 'mock|spy|vi\.fn|jest\.fn|called|toHaveBeenCalled|TestingLibraryElementError') {
        $potentialCause = if ($potentialCause -eq "i18n") { "i18n & Mocking/DOM" } else { "Mocking/DOM" }
    }
    Write-Host "  Potential Cause: $potentialCause"
}

if (-not $foundFailures) {
    Write-Host "No failing tests found in the output."
}

Write-Host "`nScript finished." 