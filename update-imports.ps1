# Get all test files
$testFiles = Get-ChildItem -Path . -Recurse -Include *.test.js,*.test.ts,*.test.tsx

foreach ($file in $testFiles) {
    $content = Get-Content $file.FullName
    
    # Update import paths - handle multiple cases
    $content = $content | ForEach-Object {
        $_ -replace '\.\.\/\.\.\/src\/components', '\.\.\/\.\.\/components' `
           -replace '\.\.\/\.\.\/src\/lib', '\.\.\/\.\.\/lib' `
           -replace '\.\.\/\.\.\/project\/src\/', '\.\.\/\.\.\/src\/' `
           -replace '\.\.\/\.\.\/project\/', '\.\.\/\.\.\/src\/' `
           -replace '\.\.\/\.\.\/src\/', '\.\.\/\.\.\/src\/'
    }
    
    # Save the updated content
    $content | Set-Content $file.FullName
    
    Write-Host "Updated import paths in $($file.FullName)"
}

Write-Host "Import paths updated in all test files" 