# Script to merge types directories and clean up duplicates

# 1. Compare errors.ts files
$srcLibTypesErrors = Get-Content "src\lib\types\errors.ts" -Raw
$srcTypesErrors = Get-Content "src\types\errors.ts" -Raw

if ($srcLibTypesErrors -eq $srcTypesErrors) {
    Write-Host "errors.ts files are identical. Safe to remove the duplicate."
    Remove-Item "src\lib\types\errors.ts"
} else {
    Write-Host "WARNING: errors.ts files are different. Please manually compare and merge:"
    Write-Host "File 1: src\lib\types\errors.ts"
    Write-Host "File 2: src\types\errors.ts"
    exit 1
}

# 2. Remove the now-empty src/lib/types directory
if ((Get-ChildItem "src\lib\types" -Force | Measure-Object).Count -eq 0) {
    Remove-Item "src\lib\types" -Recurse -Force
    Write-Host "Removed empty src\lib\types directory"
} else {
    Write-Host "WARNING: src\lib\types still contains files. Please check manually."
    exit 1
}

# 3. Remove the duplicate user-management-reorganized directory
if (Test-Path "user-management-reorganized") {
    Write-Host "WARNING: Found nested user-management-reorganized directory."
    Write-Host "Please verify this directory is a duplicate before removing."
    Write-Host "To remove it, uncomment the next line and run the script again."
    # Remove-Item "user-management-reorganized" -Recurse -Force
}

Write-Host "Script completed. Please review any warnings above." 