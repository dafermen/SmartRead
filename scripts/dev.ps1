[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$manifestPath = Join-Path $projectRoot 'manifest.json'

if (-not (Test-Path -LiteralPath $manifestPath)) {
  throw "SmartRead manifest was not found at: $manifestPath"
}

$chromeCandidates = @(
  (Join-Path $env:LOCALAPPDATA 'Google\Chrome\Application\chrome.exe'),
  (Join-Path $env:ProgramFiles 'Google\Chrome\Application\chrome.exe'),
  (Join-Path ${env:ProgramFiles(x86)} 'Google\Chrome\Application\chrome.exe')
)

$chromePath = $chromeCandidates |
  Where-Object { $_ -and (Test-Path -LiteralPath $_) } |
  Select-Object -First 1

if (-not $chromePath) {
  throw 'Google Chrome was not found. Install Chrome or load SmartRead manually from chrome://extensions.'
}

Start-Process -FilePath $chromePath -ArgumentList 'chrome://extensions/'

Write-Host ''
Write-Host 'SmartRead development page opened in Chrome.'
Write-Host "Project: $projectRoot"
Write-Host 'If SmartRead is already loaded, select Reload on its extension card.'
Write-Host 'After content-script changes, refresh the web page being tested.'
