<#
.SYNOPSIS
Copies missing files from the old project structure to the new reorganized structure,
based on the list provided in 'user-management-reorganized/docs/missing_files.md'.

.DESCRIPTION
This script reads the 'missing_files.md' file located in the 'docs' directory
of the reorganized project structure. It parses the "Files to Copy" section
to determine the source path (in the old structure, relative to the workspace root)
and the destination path (in the new 'user-management-reorganized' structure).

For each file pair:
- It checks if the destination file already exists.
- If the destination exists, it skips the file.
- If the destination does not exist, it ensures the destination directory exists (creating it if necessary)
  and then copies the file from the source to the destination.

It ignores the "Source Files Not Found in Old Listing" section of the markdown file.

.NOTES
Run this script from the root of the workspace directory
('/c:/Dev/Projects/Products/Apps/User managment module').
Ensure PowerShell execution policy allows running local scripts (e.g., Set-ExecutionPolicy RemoteSigned).
#>

param(
    [string]$MappingFile = "user-management-reorganized/docs/missing_files.md"
)

# Get the directory where the script is located to resolve relative paths
$ScriptDir = $PSScriptRoot
$WorkspaceRoot = Split-Path -Path $ScriptDir -Parent | Split-Path -Parent # Assumes script is in user-management-reorganized/scripts

Write-Host "Workspace Root identified as: $WorkspaceRoot"
Write-Host "Mapping file path: $MappingFile"

# Construct the full path to the mapping file relative to the workspace root
$FullMappingFilePath = Join-Path -Path $WorkspaceRoot -ChildPath $MappingFile
Write-Host "Attempting to read mapping file from: $FullMappingFilePath"


if (-not (Test-Path -Path $FullMappingFilePath -PathType Leaf)) {
    Write-Error "Mapping file not found at '$FullMappingFilePath'. Make sure the path is correct and the script is run from the workspace root."
    exit 1
}

$content = Get-Content -Path $FullMappingFilePath -Raw

# Extract the "Files to Copy" section (assuming it starts with ## Files to Copy and ends before ## Source Files Not Found...)
$filesToCopySection = $content -split '(?=## Source Files Not Found in Old Listing)' | Select-Object -First 1
$filesToCopySection = $filesToCopySection -split '(?=## Files to Copy)' | Select-Object -Last 1

# Regex to find source and destination lines
$regex = '- Source: `(?<source>.*?)`\s*- Destination: `(?<destination>.*?)`'
# Find all matches in the relevant section
$matches = [regex]::Matches($filesToCopySection, $regex)

if ($matches.Count -eq 0) {
    Write-Warning "No files listed under '## Files to Copy' in '$FullMappingFilePath'."
    exit 0
}

Write-Host "Found $($matches.Count) files to potentially copy..."

$filesCopied = 0
$filesSkipped = 0
$filesNotFound = 0

foreach ($match in $matches) {
    $sourceRelativePath = $match.Groups['source'].Value.Trim()
    # Destination path in the markdown is relative to the workspace root already
    $destinationRelativePath = $match.Groups['destination'].Value.Trim()

    # Construct full paths relative to the workspace root
    $sourceFullPath = Join-Path -Path $WorkspaceRoot -ChildPath $sourceRelativePath
    $destinationFullPath = Join-Path -Path $WorkspaceRoot -ChildPath $destinationRelativePath

    Write-Verbose "Processing: Source [$sourceRelativePath] -> Destination [$destinationRelativePath]"

    # Check if source file exists
    if (-not (Test-Path -Path $sourceFullPath -PathType Leaf)) {
        Write-Warning "Source file NOT FOUND: '$sourceFullPath'. Skipping."
        $filesNotFound++
        continue
    }

    # Check if destination file exists
    if (Test-Path -Path $destinationFullPath -PathType Leaf) {
        Write-Host "Destination file already exists: '$destinationRelativePath'. Skipping."
        $filesSkipped++
    } else {
        # Ensure destination directory exists
        $destinationDir = Split-Path -Path $destinationFullPath -Parent
        if (-not (Test-Path -Path $destinationDir -PathType Container)) {
            Write-Host "Creating destination directory: '$destinationDir'"
            try {
                New-Item -ItemType Directory -Force -Path $destinationDir -ErrorAction Stop | Out-Null
            } catch {
                Write-Error "Failed to create directory '$destinationDir'. Error: $($_.Exception.Message)"
                continue # Skip this file if directory creation fails
            }
        }

        # Copy the file
        Write-Host "Copying '$sourceRelativePath' -> '$destinationRelativePath'"
        try {
            Copy-Item -Path $sourceFullPath -Destination $destinationFullPath -Force -ErrorAction Stop
            $filesCopied++
        } catch {
            Write-Error "Failed to copy '$sourceFullPath' to '$destinationFullPath'. Error: $($_.Exception.Message)"
        }
    }
}

Write-Host "----------------------------------------"
Write-Host "File Copy Summary:"
Write-Host "- Files Copied: $filesCopied"
Write-Host "- Files Skipped (already exist): $filesSkipped"
Write-Host "- Source Files Not Found: $filesNotFound"
Write-Host "----------------------------------------"

# Pause execution to allow reading the output before the window closes
Read-Host "Press Enter to exit..." 