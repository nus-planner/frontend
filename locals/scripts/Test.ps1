Set-Alias -Name less -Value C:\"Program Files"\Git\usr\bin\less.exe
$env:TS_NODE_PROJECT = "locals\tsconfig.json" 
npx ts-node src\tests\index.ts .\locals\requirements\cs-2019.json .\locals\plans\cs-2019-1.json | less