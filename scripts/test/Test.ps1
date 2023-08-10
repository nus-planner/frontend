# Needs less.exe to run (which should be available with a Git Bash installation)
param(
    [string]$RequirementsFile = ".\requirements_and_plans\requirements\2020\cs.json"
    [string]$StudyPlanFile = ".\requirements_and_plans\test_study_plans\cs-2020-ZhongFu.json"
)

Set-Alias -Name less -Value C:\"Program Files"\Git\usr\bin\less.exe
$env:TS_NODE_PROJECT = "tsconfig.compile.json" 
npx ts-node src\tests\index.ts "$RequirementsFile" "$StudyPlanFile" | less