# PowerShell script to update test files from Jest to Vitest
$ErrorActionPreference = "Stop"

# Function to update test file content
function Update-TestFile {
    param (
        [string]$filePath
    )
    
    Write-Host "Processing $filePath"
    
    # Read file content
    $content = Get-Content $filePath -Raw
    
    # Replace Jest imports with Vitest
    $content = $content -replace "import \{ jest \} from '@jest/globals';", "import { vi } from 'vitest';"
    $content = $content -replace "import \* as jest from '@jest/globals';", "import { vi } from 'vitest';"
    
    # Replace jest.fn() with vi.fn()
    $content = $content -replace "jest\.fn\(\)", "vi.fn()"
    
    # Replace jest.mock() with vi.mock()
    $content = $content -replace "jest\.mock\(", "vi.mock("
    
    # Replace jest.spyOn() with vi.spyOn()
    $content = $content -replace "jest\.spyOn\(", "vi.spyOn("
    
    # Replace jest.clearAllMocks() with vi.clearAllMocks()
    $content = $content -replace "jest\.clearAllMocks\(\)", "vi.clearAllMocks()"
    
    # Replace jest.resetAllMocks() with vi.resetAllMocks()
    $content = $content -replace "jest\.resetAllMocks\(\)", "vi.resetAllMocks()"
    
    # Replace jest.restoreAllMocks() with vi.restoreAllMocks()
    $content = $content -replace "jest\.restoreAllMocks\(\)", "vi.restoreAllMocks()"
    
    # Replace beforeEach/afterEach if they don't have imports
    if (-not ($content -match "import.*beforeEach.*from")) {
        $content = $content -replace "beforeEach\(", "import { beforeEach } from 'vitest'`nbeforeEach("
    }
    if (-not ($content -match "import.*afterEach.*from")) {
        $content = $content -replace "afterEach\(", "import { afterEach } from 'vitest'`nafterEach("
    }
    
    # Replace describe/it/test if they don't have imports
    if (-not ($content -match "import.*describe.*from")) {
        $content = $content -replace "describe\(", "import { describe } from 'vitest'`ndescribe("
    }
    if (-not ($content -match "import.*it.*from")) {
        $content = $content -replace "it\(", "import { it } from 'vitest'`nit("
    }
    if (-not ($content -match "import.*test.*from")) {
        $content = $content -replace "test\(", "import { test } from 'vitest'`ntest("
    }
    
    # Replace expect if it doesn't have an import
    if (-not ($content -match "import.*expect.*from")) {
        $content = $content -replace "expect\(", "import { expect } from 'vitest'`nexpect("
    }
    
    # Save updated content
    $content | Set-Content $filePath -NoNewline
    Write-Host "Updated $filePath"
}

# Find all test files
$testFiles = Get-ChildItem -Path . -Recurse -Include "*.test.js", "*.test.jsx", "*.test.ts", "*.test.tsx"

# Process each test file
foreach ($file in $testFiles) {
    Update-TestFile $file.FullName
}

Write-Host "All test files have been updated to use Vitest syntax." 