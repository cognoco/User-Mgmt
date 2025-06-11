Typescript errors:
Count: (npx tsc --noEmit 2>&1 | Measure-Object).Count
Make a file with details: npx tsc --noEmit > typescript-errors.txt 2>&1

Search code base:
1. Example 1: his will list any line in the project that does an import from node modules, showing the filename, line number, and the line itself.Replace the list of modules as needed (nodemailer, fs, child_process, net, dns, etc.)

Get-ChildItem -Recurse -Include *.js,*.ts,*.jsx,*.tsx | 
Select-String -Pattern "from\s+['""](nodemailer|fs|child_process|net|dns)['""]" |
Select-Object Filename, LineNumber, Line

2. Example 2: Find all files that contain string - in this case the string is "use client"
Get-ChildItem -Recurse -Include *.js,*.ts,*.jsx,*.tsx | 
Select-String -Pattern "^['""]use client['""]" |
Select-Object Filename, LineNumber, Line


3 Example 3: Find all imports in the project
Get-ChildItem -Recurse -Include *.js,*.ts,*.jsx,*.tsx | 
Select-String -Pattern "from\s+['""]" |
Select-Object Filename, LineNumber, Line

4. Example 4: Find imports in client components only: 
# Store list of client files:
$clientFiles = Get-ChildItem -Recurse -Include *.js,*.ts,*.jsx,*.tsx | 
    Select-String -Pattern "^['""]use client['""]" | 
    Select-Object -ExpandProperty Path | 
    Get-Unique

# Now search those files for Node.js-only module imports
foreach ($file in $clientFiles) {
    Select-String -Path $file -Pattern "from\s+['""](nodemailer|fs|child_process|net|dns)['""]" |
        Select-Object Filename, LineNumber, Line
}

Commands for Testing



4. Basic commands:
remove something - like the nodes: Remove-Item -Recurse -Force ./node_modules
npm install
npm run lint 2>&1 | head -30
npm run build 2>&1 | head -50

Git commands:
List all local branches. Current branch is highlighted with asterix: git branch
Switch branch to main: git checkout main
Create a branch and switch to it: git checkout -b <new-branch-name>
to see commited/uncommited and untracked files: git status
To see the difference between commited and not: git diff