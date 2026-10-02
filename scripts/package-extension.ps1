[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$manifest = Get-Content -LiteralPath (Join-Path $projectRoot 'manifest.json') -Raw | ConvertFrom-Json
$version = [string]$manifest.version
if ($version -notmatch '^\d+\.\d+\.\d+$') { throw "Invalid manifest version: $version" }

$distRoot = Join-Path $projectRoot 'dist'
$packageName = "SmartRead-$version"
$stagePath = Join-Path $distRoot $packageName
$zipPath = Join-Path $distRoot "$packageName.zip"
$allowedItems = @(
  'manifest.json',
  'background',
  'content-script',
  'popup',
  'docs',
  'README.md'
)
$iconFiles = @('icon16.png','icon32.png','icon48.png','icon128.png')

New-Item -ItemType Directory -Path $distRoot -Force | Out-Null
if (Test-Path -LiteralPath $stagePath) { Remove-Item -LiteralPath $stagePath -Recurse -Force }
if (Test-Path -LiteralPath $zipPath) { Remove-Item -LiteralPath $zipPath -Force }
New-Item -ItemType Directory -Path $stagePath | Out-Null

foreach ($item in $allowedItems) {
  $source = Join-Path $projectRoot $item
  if (-not (Test-Path -LiteralPath $source)) { throw "Required package item is missing: $item" }
  Copy-Item -LiteralPath $source -Destination $stagePath -Recurse
}

$stageIcons = Join-Path $stagePath 'icons'
New-Item -ItemType Directory -Path $stageIcons | Out-Null
foreach ($iconFile in $iconFiles) {
  $iconSource = Join-Path (Join-Path $projectRoot 'icons') $iconFile
  if (-not (Test-Path -LiteralPath $iconSource)) { throw "Required icon is missing: $iconFile" }
  Copy-Item -LiteralPath $iconSource -Destination $stageIcons
}

$requiredFiles = @(
  'manifest.json',
  'background/service-worker.js',
  'content-script/reader-core.js',
  'content-script/content-script.js',
  'popup/popup.html',
  'popup/popup.css',
  'popup/popup.js',
  'icons/icon16.png',
  'icons/icon32.png',
  'icons/icon48.png',
  'icons/icon128.png',
  'docs/index.html',
  'docs/app.js',
  'docs/portal.css',
  'docs/AGENTS.md',
  'docs/CURRENT_STATUS.md',
  'docs/ARCHITECTURE.md',
  'docs/DEVELOPMENT.md',
  'docs/TESTING.md',
  'docs/CHANGELOG.md'
)
foreach ($relativePath in $requiredFiles) {
  if (-not (Test-Path -LiteralPath (Join-Path $stagePath $relativePath))) { throw "Package validation failed. Missing: $relativePath" }
}

Compress-Archive -Path (Join-Path $stagePath '*') -DestinationPath $zipPath -CompressionLevel Optimal
Write-Host "Created $zipPath"
