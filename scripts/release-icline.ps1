# iCline release automation — sync docs, build VSIX, commit, push, GitHub Release
# Usage: .\scripts\release-icline.ps1 [-Version 0.1.8] [-SkipBuild] [-SkipPush] [-SkipRelease]

param(
    [string]$Version = "",
    [switch]$SkipBuild,
    [switch]$SkipPush,
    [switch]$SkipRelease
)

$ErrorActionPreference = "Stop"
$RepoRoot = Split-Path -Parent $PSScriptRoot
$ExtRoot = Join-Path $RepoRoot "apps\vscode"
$PackageJson = Join-Path $ExtRoot "package.json"
$Changelog = Join-Path $ExtRoot "CHANGELOG.md"
$SyncScript = Join-Path $ExtRoot "scripts\sync-icline-docs.mjs"

function Get-PackageVersion {
    return (Get-Content $PackageJson -Raw | ConvertFrom-Json).version
}

if ($Version) {
    $pkg = Get-Content $PackageJson -Raw | ConvertFrom-Json
    $pkg.version = $Version
    $pkg | ConvertTo-Json -Depth 100 | Set-Content $PackageJson -Encoding UTF8
    Write-Host "Bumped package.json version to $Version"
}

Write-Host "==> Syncing docs..."
Push-Location $ExtRoot
node $SyncScript
if (-not $SkipBuild) {
    $ver = Get-PackageVersion
    $vsixOut = "dist\i-mrded.iCline-$ver.vsix"
    Write-Host "==> Building VSIX -> $vsixOut"
    npm run package:vsix -- --out $vsixOut
}
Pop-Location

$ver = Get-PackageVersion
$vsixPath = Join-Path $ExtRoot "dist\i-mrded.iCline-$ver.vsix"

if (-not $SkipPush) {
    Write-Host "==> Git commit + push..."
    Push-Location $RepoRoot
    git add -A
    $status = git status --porcelain
    if ($status) {
        git commit -m "release(icline): v$ver — docs sync and VSIX build"
        git push origin main
    } else {
        Write-Host "Nothing to commit."
    }
    Pop-Location
}

if (-not $SkipRelease) {
    if (-not (Test-Path $vsixPath)) {
        throw "VSIX not found: $vsixPath (run without -SkipBuild)"
    }

    Write-Host "==> Creating GitHub Release v$ver..."
    $changelog = Get-Content $Changelog -Raw
    $extractJs = @"
import { extractChangelogSection } from './apps/vscode/scripts/sync-icline-docs.mjs';
import fs from 'fs';
const changelog = fs.readFileSync('./apps/vscode/CHANGELOG.md','utf8');
const section = extractChangelogSection(changelog, '$ver') ?? 'See CHANGELOG.md';
const body = `## iCline v$ver\n\n` + section + `\n\n### Install\n\`\`\`powershell\ncode --install-extension i-mrded.iCline-$ver.vsix --force\n\`\`\`\nThen **Developer: Reload Window**.`;
console.log(body);
"@
    $releaseBody = node -e $extractJs 2>$null
    if (-not $releaseBody) {
        $releaseBody = "## iCline v$ver`n`nSee [CHANGELOG](https://github.com/i-mrDed/iCline/blob/main/apps/vscode/CHANGELOG.md).`n`nInstall: ``code --install-extension i-mrded.iCline-$ver.vsix --force``"
    }

    $credText = "protocol=https`nhost=github.com`n`n" | git credential fill 2>$null
    if (-not $credText) { throw "GitHub credentials not found. Login via Git Credential Manager first." }
    $token = ($credText -split "`n" | Where-Object { $_ -like "password=*" }) -replace "password=",""

    $headers = @{
        Authorization = "Bearer $token"
        Accept = "application/vnd.github+json"
        "X-GitHub-Api-Version" = "2022-11-28"
    }
    $payload = @{
        tag_name = "v$ver"
        name = "iCline v$ver"
        body = $releaseBody
        draft = $false
    } | ConvertTo-Json

    try {
        $release = Invoke-RestMethod -Uri "https://api.github.com/repos/i-mrDed/iCline/releases" -Method Post -Headers $headers -Body $payload -ContentType "application/json; charset=utf-8"
    } catch {
        Write-Host "Release may already exist — attempting asset upload to latest v$ver..."
        $release = Invoke-RestMethod -Uri "https://api.github.com/repos/i-mrDed/iCline/releases/tags/v$ver" -Headers $headers
    }

    $uploadUrl = $release.upload_url -replace "\{.*\}", "?name=i-mrded.iCline-$ver.vsix"
    $uploadHeaders = @{
        Authorization = "Bearer $token"
        Accept = "application/vnd.github+json"
        "Content-Type" = "application/octet-stream"
    }
    Invoke-RestMethod -Uri $uploadUrl -Method Post -Headers $uploadHeaders -InFile $vsixPath | Out-Null
    Write-Host "Release: $($release.html_url)"
}

Write-Host ""
Write-Host "Done. iCline v$ver"
Write-Host "User install: code --install-extension i-mrded.iCline-$ver.vsix --force"