# Needs less.exe to run (which should be available with a Git Bash installation)
Set-Alias -Name less -Value C:\"Program Files"\Git\usr\bin\less.exe
$env:TS_NODE_PROJECT = "tsconfig.compile.json" 
npx ts-node src\tests\index.ts .\locals\requirements\cs-2019.json .\locals\plans\cs-2019-2.json | less