# Sync official Cline into iCline fork safely (preserves iCline-specific commits).
# Usage: powershell -ExecutionPolicy Bypass -File scripts/sync-upstream.ps1

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

if (-not (Test-Path ".git")) {
    Write-Error "Run from the iCline git root (cline-temp)."
}

$upstream = git remote | Select-String -Pattern "^upstream$"
if (-not $upstream) {
    Write-Host "Adding upstream remote -> https://github.com/cline/cline.git"
    git remote add upstream https://github.com/cline/cline.git
}

Write-Host "Fetching upstream..."
git fetch upstream --tags

$branch = git rev-parse --abbrev-ref HEAD
Write-Host "Merging upstream/main into $branch ..."
git merge upstream/main --no-edit

$ManifestPath = Join-Path $Root "apps\vscode\scripts\icline-docs.manifest.json"
if (Test-Path $ManifestPath) {
    $upstreamPkg = git show "upstream/main:apps/vscode/package.json" 2>$null
    $upstreamVersion = if ($upstreamPkg) { ($upstreamPkg | ConvertFrom-Json).version } else { "unknown" }
    $manifest = Get-Content $ManifestPath -Raw | ConvertFrom-Json
    if (-not $manifest.upstreamCline) {
        $manifest | Add-Member -NotePropertyName upstreamCline -NotePropertyValue ([pscustomobject]@{})
    }
    $manifest.upstreamCline.syncedVersion = $upstreamVersion
    $manifest.upstreamCline.syncedAt = (Get-Date -Format "yyyy-MM-dd")
    $manifest.upstreamCline.repo = "https://github.com/cline/cline"
    $manifest | ConvertTo-Json -Depth 10 | Set-Content $ManifestPath -Encoding UTF8
    Write-Host "Updated upstreamCline.syncedVersion -> v$upstreamVersion in icline-docs.manifest.json"
    Write-Host "  Run: cd apps/vscode && npm run sync:docs"
}

Write-Host ""
Write-Host "Upstream merge complete. Next steps:"
Write-Host "  1. Resolve conflicts — keep src/icline/** and xAI OAuth files"
Write-Host "  2. cd apps/vscode && npm install && npm run protos && npm run sync:docs"
Write-Host "  3. npx tsc --noEmit"
Write-Host "  4. Tag and publish iCline release (.vsix) to your GitHub releases"