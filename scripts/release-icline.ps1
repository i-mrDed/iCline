# iCline release automation — gated Dev / Beta / Stable channels
# Usage:
#   .\scripts\release-icline.ps1 -Channel Dev              # build VSIX only
#   .\scripts\release-icline.ps1 -Channel Beta -Version 0.1.11-beta.1
#   .\scripts\release-icline.ps1 -Channel Stable -Version 0.1.11 -PublishMarketplace

param(
    [Parameter(Mandatory = $false)]
    [ValidateSet("Dev", "Beta", "Stable")]
    [string]$Channel = "Dev",
    [string]$Version = "",
    [switch]$SkipBuild,
    [switch]$SkipPush,
    [switch]$SkipRelease,
    [switch]$SkipSmokeCheck,
    [switch]$PublishMarketplace
)

$ErrorActionPreference = "Stop"
$RepoRoot = Split-Path -Parent $PSScriptRoot
$ExtRoot = Join-Path $RepoRoot "apps\vscode"
$PackageJson = Join-Path $ExtRoot "package.json"
$Changelog = Join-Path $ExtRoot "CHANGELOG.md"
$SyncScript = Join-Path $ExtRoot "scripts\sync-icline-docs.mjs"
$SmokeScript = Join-Path $RepoRoot "scripts\icline-smoke-checklist.ps1"

function Get-PackageVersion {
    return (Get-Content $PackageJson -Raw | ConvertFrom-Json).version
}

function Assert-VersionMatchesChannel {
    param([string]$Ver, [string]$Ch)
    if ($Ch -eq "Beta" -and $Ver -notmatch 'beta') {
        Write-Warning "Beta channel แนะนำให้ใช้ semver แบบ x.y.z-beta.N (ปัจจุบัน: $Ver)"
    }
    if ($Ch -eq "Stable" -and $Ver -match 'beta|alpha|rc') {
        throw "Stable channel ห้ามใช้เวอร์ชัน pre-release: $Ver"
    }
}

Write-Host "==> iCline release channel: $Channel" -ForegroundColor Cyan

if ($Channel -in @("Beta", "Stable") -and -not $SkipSmokeCheck) {
    $smokeChannel = if ($Channel -eq "Beta") { "Beta" } else { "Stable" }
    Write-Host "==> Running smoke test gate ($smokeChannel)..."
    & $SmokeScript -Channel $smokeChannel
    if ($LASTEXITCODE -ne 0) { throw "Smoke test gate failed. ใช้ -SkipSmokeCheck เฉพาะ Dev/Beta ภายใน (ไม่แนะนำ)." }
}

if ($Version) {
    $pkg = Get-Content $PackageJson -Raw | ConvertFrom-Json
    $pkg.version = $Version
    $pkg | ConvertTo-Json -Depth 100 | Set-Content $PackageJson -Encoding UTF8
    Write-Host "Bumped package.json version to $Version"
}

$ver = Get-PackageVersion
Assert-VersionMatchesChannel -Ver $ver -Ch $Channel

Write-Host "==> Syncing docs..."
Push-Location $ExtRoot
node $SyncScript
if (-not $SkipBuild) {
    $vsixOut = "dist\i-mrdedchai.iCline-$ver.vsix"
    Write-Host "==> Building VSIX -> $vsixOut"
    npm run package:vsix
}
Pop-Location

$vsixPath = Join-Path $ExtRoot "dist\i-mrdedchai.iCline-$ver.vsix"
if (-not (Test-Path $vsixPath)) {
    throw "VSIX not found: $vsixPath"
}

if ($Channel -eq "Dev") {
    Write-Host ""
    Write-Host "Dev build complete (no git release, no Marketplace)." -ForegroundColor Green
    Write-Host "Local install:"
    Write-Host "  code --install-extension `"$vsixPath`" --force"
    exit 0
}

if (-not $SkipPush) {
    Write-Host "==> Git commit + push..."
    Push-Location $RepoRoot
    git add -A
    $status = git status --porcelain
    if ($status) {
        git commit -m "release(icline): v$ver — $Channel channel"
        git push origin main
    } else {
        Write-Host "Nothing to commit."
    }
    Pop-Location
}

if (-not $SkipRelease) {
    Write-Host "==> Creating GitHub Release v$ver (pre-release: $($Channel -eq 'Beta'))..."
    $isPrerelease = $Channel -eq "Beta"

    $extractJs = @'
import { extractChangelogSection } from './apps/vscode/scripts/sync-icline-docs.mjs';
import fs from 'fs';
const ver = 'VER_PLACEHOLDER';
const changelog = fs.readFileSync('./apps/vscode/CHANGELOG.md','utf8');
const section = extractChangelogSection(changelog, ver) ?? 'See CHANGELOG.md';
const body = '## iCline v' + ver + '\n\n' + section + '\n\n### Install\n```powershell\ncode --install-extension i-mrdedchai.iCline-' + ver + '.vsix --force\n```\nThen **Developer: Reload Window**.';
console.log(body);
'@ -replace 'VER_PLACEHOLDER', $ver
    $releaseBody = node -e $extractJs 2>$null
    if (-not $releaseBody) {
        $releaseBody = "## iCline v$ver`n`nSee [CHANGELOG](https://github.com/i-mrDedchai/iCline/blob/main/apps/vscode/CHANGELOG.md)."
    }

    $credText = "protocol=https`nhost=github.com`n`n" | git -C $RepoRoot credential fill 2>$null
    if (-not $credText) { throw "GitHub credentials not found." }
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
        prerelease = $isPrerelease
    } | ConvertTo-Json

    try {
        $release = Invoke-RestMethod -Uri "https://api.github.com/repos/i-mrDedchai/iCline/releases" -Method Post -Headers $headers -Body $payload -ContentType "application/json; charset=utf-8"
    } catch {
        Write-Host "Release may already exist — uploading asset to v$ver..."
        $release = Invoke-RestMethod -Uri "https://api.github.com/repos/i-mrDedchai/iCline/releases/tags/v$ver" -Headers $headers
    }

    $uploadUrl = $release.upload_url -replace "\{.*\}", "?name=i-mrdedchai.iCline-$ver.vsix"
    $uploadHeaders = @{
        Authorization = "Bearer $token"
        Accept = "application/vnd.github+json"
        "Content-Type" = "application/octet-stream"
    }
    Invoke-RestMethod -Uri $uploadUrl -Method Post -Headers $uploadHeaders -InFile $vsixPath | Out-Null
    Write-Host "Release: $($release.html_url)"
}

if ($PublishMarketplace) {
    if ($Channel -eq "Dev") {
        throw "Dev channel cannot publish to Marketplace."
    }
    Write-Host "==> Publishing to VS Marketplace ($Channel)..."
    Push-Location $ExtRoot
    if ($Channel -eq "Beta") {
        npm run publish:marketplace:prerelease
    } else {
        npm run publish:marketplace
    }
    Pop-Location
} elseif ($Channel -eq "Stable") {
    Write-Host ""
    Write-Host "Stable release on GitHub is done. Marketplace NOT published (add -PublishMarketplace after final verification)." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Done. iCline v$ver [$Channel]"
Write-Host "VSIX: $vsixPath"