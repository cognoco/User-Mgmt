# scripts/find-i18nerrors.ps1
# To Run: powershell -ExecutionPolicy Bypass -File .\scripts\find-i18nerrors.ps1

# scripts/find-i18nerrors.ps1
# To Run: powershell -ExecutionPolicy Bypass -File .\scripts\find-i18nerrors.ps1

# Run all tests and capture output
npx vitest run --reporter verbose | Out-File -Encoding utf8 vitest-output.txt

Write-Host "Unique i18n-related test errors (with counts):"

$patterns = @(
    "expected.*(common\.|org\.|profile\.|settings\.)",
    "t is not a function",
    "Cannot read property 't'",
    "translation key",
    "not found: .*common\.",
    "not found: .*org\.",
    "not found: .*profile\.",
    "not found: .*settings\.",
    "Received:.*common\.",
    "Received:.*org\.",
    "Received:.*profile\.",
    "Received:.*settings\.",
    "i18n",
    "translation"
)

# Find all matches
$matches = Select-String -Path vitest-output.txt -Pattern $patterns
$matches = $matches | Where-Object { $_.Line -notmatch 'i18nNamespace' }
$matches | Group-Object -Property Line | Sort-Object Count -Descending | ForEach-Object {
    "{0,5}x {1}" -f $_.Count, $_.Name
}

Write-Host "`nSummary of failing tests (with main error message):"

# Parse the test output for failures and error messages
$lines = Get-Content vitest-output.txt
$failures = @()
for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match '^ FAIL (.+) > (.+)$') {
        $testFile = $matches[1]
        $testName = $matches[2]
        # Look ahead for the first error message (skip empty/comment lines)
        $errorMsg = ""
        for ($j = $i + 1; $j -lt $lines.Count; $j++) {
            if ($lines[$j] -match '^(TestingLibraryElementError|AssertionError|TypeError|Error): (.+)$') {
                $errorMsg = $matches[2]
                break
            }
            # Stop if we hit another test or summary line
            if ($lines[$j] -match '^ (PASS|FAIL|SKIP|RUNS|TODO) ') { break }
        }
        $failures += [PSCustomObject]@{
            File = $testFile
            Test = $testName
            Error = $errorMsg
        }
    }
}

if ($failures.Count -eq 0) {
    Write-Host "No failing tests found."
} else {
    foreach ($fail in $failures) {
        Write-Host "- $($fail.File) > $($fail.Test)"
        if ($fail.Error) {
            Write-Host "    Error: $($fail.Error)"
        }
    }
}

# --- Extract missing i18n keys ---
$missingKeys = [System.Collections.Generic.List[String]]::new()
foreach ($line in $lines) {
    # Extract missing i18n keys (uses $Matches from these specific -match operations)
    if ($line -match 'Unable to find an element with the text: ([\w.:-]+)') { $missingKeys.Add($Matches[1]) }
    if ($line -match 'Unable to find a label with the text of: \[i18n:([^]]+)\]') { $missingKeys.Add($Matches[1]) }
    if ($line -match 'Unable to find an element with the text: \[i18n:([^]]+)\]') { $missingKeys.Add($Matches[1]) }
    if ($line -match 'Unable to find an element with the text: ''([^'']+)''') { $missingKeys.Add($Matches[1]) }
}
$missingKeys = $missingKeys | Sort-Object -Unique

Write-Host "`nMissing i18n keys:"
$missingKeys | ForEach-Object { Write-Host "- $_" }