param(
  [ValidateSet('install', 'dev', 'pack')]
  [string]$Action = 'pack',
  [switch]$DebugWeb,
  [switch]$DebugMouse
)

$ErrorActionPreference = 'Stop'

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
if (-not (Test-Path (Join-Path $repoRoot 'package.json'))) {
  throw 'package.json not found. Run this script from the repo.'
}
Set-Location $repoRoot

function Require-Command([string]$name) {
  if (-not (Get-Command $name -ErrorAction SilentlyContinue)) {
    throw "Missing required command: $name. Install it and retry."
  }
}

Require-Command node
Require-Command npm

Write-Host "Node:" (node -v)
Write-Host "NPM :" (npm -v)

if (Test-Path (Join-Path $repoRoot 'package-lock.json')) {
  Write-Host "Installing deps (npm ci)..."
  npm ci
} else {
  Write-Host "Installing deps (npm install)..."
  npm install
}

Write-Host "Rebuilding native deps for Electron..."
npm run rebuild:electron

switch ($Action) {
  'install' {
    Write-Host "Dependencies installed."
    exit 0
  }
  'dev' {
    if ($DebugWeb) { $env:PPHC_DEBUG_WEB = '1' }
    if ($DebugMouse) { $env:PPHC_DEBUG_MOUSE = '1' }
    npm run dev
  }
  'pack' {
    npm run pack:win
    Write-Host "Build output: dist\\"
  }
}
