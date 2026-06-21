# iCline release automation — gated Dev / Beta / Stable channels
# Usage:
#   .\scripts\release-icline.ps1 -Channel Dev              # build VSIX only
#   .\scripts\release-icline.ps1 -Channel Beta -Version 0.1.11-beta.1
#   .\scripts\release-icline.ps1 -Channel Stable -Version 0.1.12 -PublishMarketplace
#   .\scripts\release-icline.ps1 -Channel Stable -SkipSmokeCheck -MaintainerApproval "ปล่อย 0.1.12 เป็น Stable ได้เลย"

param(
    [Parameter(Mandatory = $false)]
    [ValidateSet("Dev", "Beta", "Stable")]
    [string]$Channel = "Dev",
    [string]$Version = "",
    [string]$MaintainerApproval = "",
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
$DevBuildStatePath = Join-Path $RepoRoot ".icline\dev-build.json"
$ManifestPath = Join-Path $ExtRoot "scripts\icline-docs.manifest.json"

function Get-GitHubRepoCoordinates {
    $manifest = Get-Content $ManifestPath -Raw | ConvertFrom-Json
    return @{
        Owner = $manifest.github.owner
        Repo = $manifest.github.repo
    }
}

function Get-GitHubApiErrorMessage {
    param($ErrorRecord)
    if (-not $ErrorRecord.Exception.Response) {
        return $ErrorRecord.Exception.Message
    }
    try {
        $stream = $ErrorRecord.Exception.Response.GetResponseStream()
        if (-not $stream) { return $ErrorRecord.Exception.Message }
        $reader = New-Object System.IO.StreamReader($stream)
        $body = $reader.ReadToEnd()
        $reader.Close()
        if ($body.Trim()) { return $body }
    } catch {
        # fall through
    }
    return $ErrorRecord.Exception.Message
}

function Get-GitHubReleaseToken {
    if ($env:GITHUB_TOKEN) { return $env:GITHUB_TOKEN.Trim() }
    if ($env:GH_TOKEN) { return $env:GH_TOKEN.Trim() }
    $credText = "protocol=https`nhost=github.com`n`n" | git -C $RepoRoot credential fill 2>$null
    if (-not $credText) { return $null }
    return (($credText -split "`n" | Where-Object { $_ -like "password=*" }) -replace "password=","").Trim()
}

function Get-PackageVersion {
    return (Get-Content $PackageJson -Raw | ConvertFrom-Json).version
}

function Set-PackageVersion {
    param([string]$NewVersion)
    node -e @"
const fs = require('fs');
const p = process.argv[1];
const pkg = JSON.parse(fs.readFileSync(p, 'utf8'));
pkg.version = process.argv[2];
fs.writeFileSync(p, JSON.stringify(pkg, null, '\t') + '\n', 'utf8');
"@ $PackageJson $NewVersion
    if ($LASTEXITCODE -ne 0) { throw "Failed to set package.json version to $NewVersion" }
}

function Get-BaseReleaseVersion {
    param([string]$Ver)
    if ($Ver -match '^(.+?)-dev\.\d+$') { return $Matches[1] }
    return $Ver
}

function Read-DevBuildState {
    if (-not (Test-Path $DevBuildStatePath)) {
        return [pscustomobject]@{ releaseVersion = ""; buildNumber = 0 }
    }
    return Get-Content $DevBuildStatePath -Raw | ConvertFrom-Json
}

function Write-DevBuildState {
    param($State)
    $dir = Split-Path $DevBuildStatePath
    New-Item -ItemType Directory -Force -Path $dir | Out-Null
    $json = [pscustomobject]@{
        releaseVersion = $State.releaseVersion
        buildNumber = [int]$State.buildNumber
    } | ConvertTo-Json -Compress
    $utf8NoBom = New-Object System.Text.UTF8Encoding $false
    [System.IO.File]::WriteAllText($DevBuildStatePath, $json, $utf8NoBom)
}

function Bump-DevPackageVersion {
    $pkg = Get-Content $PackageJson -Raw | ConvertFrom-Json
    $base = Get-BaseReleaseVersion $pkg.version
    $state = Read-DevBuildState
    if ($state.releaseVersion -ne $base) {
        $state.releaseVersion = $base
        $state.buildNumber = 0
    }
    $state.buildNumber = [int]$state.buildNumber + 1
    Write-DevBuildState $state
    $newVer = "$base-dev.$($state.buildNumber)"
    Set-PackageVersion -NewVersion $newVer
    Write-Host "Dev build: $newVer (build #$($state.buildNumber) for release $base)" -ForegroundColor Green
}

function Reset-DevBuildCounter {
    param([string]$ReleaseVersion)
    $state = Read-DevBuildState
    $state.releaseVersion = $ReleaseVersion
    $state.buildNumber = 0
    Write-DevBuildState $state
    Write-Host "Dev build counter reset for release $ReleaseVersion"
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

if ($Channel -eq "Stable" -and $SkipSmokeCheck -and -not $MaintainerApproval.Trim()) {
    throw 'Stable + -SkipSmokeCheck requires -MaintainerApproval with approval text'
}

if ($Channel -in @("Beta", "Stable") -and -not $SkipSmokeCheck) {
    $smokeChannel = if ($Channel -eq "Beta") { "Beta" } else { "Stable" }
    Write-Host "==> Running smoke test gate ($smokeChannel)..."
    & $SmokeScript -Channel $smokeChannel
    if ($LASTEXITCODE -ne 0) { throw "Smoke test gate failed. ใช้ -SkipSmokeCheck เฉพาะ Dev/Beta ภายใน (ไม่แนะนำ)." }
}

if ($Version) {
    Set-PackageVersion -NewVersion $Version
    Write-Host "Bumped package.json version to $Version"
} elseif ($Channel -eq "Dev") {
    Bump-DevPackageVersion
} elseif ($Channel -eq "Stable") {
    $current = Get-PackageVersion
    $base = Get-BaseReleaseVersion $current
    if ($current -ne $base) {
        Set-PackageVersion -NewVersion $base
        Write-Host "Stable: normalized package.json version to $base"
    }
    Reset-DevBuildCounter -ReleaseVersion $base
}

$ver = Get-PackageVersion
Assert-VersionMatchesChannel -Ver $ver -Ch $Channel

if ($MaintainerApproval.Trim()) {
    $approvalsDir = Join-Path $RepoRoot "releases\approvals"
    New-Item -ItemType Directory -Force -Path $approvalsDir | Out-Null
    $approvalFile = Join-Path $approvalsDir "v$ver-$Channel.txt"
    $approvalText = @(
        "version: $ver"
        "channel: $Channel"
        "approved_at: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"
        "approval: $MaintainerApproval"
        "skip_smoke_check: $SkipSmokeCheck"
    ) -join "`n"
    Set-Content -Path $approvalFile -Value $approvalText -Encoding UTF8
    Write-Host "==> Maintainer approval recorded: $approvalFile" -ForegroundColor Green
}

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
        git commit -m "release(icline): v$ver - $Channel channel"
        git push origin main
    } else {
        Write-Host "Nothing to commit."
    }
    Pop-Location
}

if (-not $SkipRelease) {
    $gh = Get-GitHubRepoCoordinates
    $releasesApi = "https://api.github.com/repos/$($gh.Owner)/$($gh.Repo)/releases"
    $prLabel = if ($Channel -eq "Beta") { "yes" } else { "no" }
    Write-Host "==> Creating GitHub Release v$ver (prerelease=$prLabel)..."
    $isPrerelease = $Channel -eq "Beta"

    $extractScript = Join-Path $env:TEMP "icline-release-notes-$ver.mjs"
    $extractSource = @"
import { extractChangelogSection } from '$($SyncScript.Replace('\', '/'))';
import fs from 'node:fs';
const ver = process.argv[2];
const changelog = fs.readFileSync('$($Changelog.Replace('\', '/'))', 'utf8');
const section = extractChangelogSection(changelog, ver) ?? 'See CHANGELOG.md';
const body = '## iCline v' + ver + '\n\n' + section + '\n\n### Install\n```powershell\ncode --install-extension i-mrdedchai.iCline-' + ver + '.vsix --force\n```\nThen **Developer: Reload Window**.';
process.stdout.write(body);
"@
    $utf8NoBom = New-Object System.Text.UTF8Encoding $false
    [System.IO.File]::WriteAllText($extractScript, $extractSource, $utf8NoBom)
    $releaseBody = node $extractScript $ver 2>$null
    if (-not $releaseBody) {
        $releaseBody = "## iCline v$ver`n`nSee [CHANGELOG](https://github.com/$($gh.Owner)/$($gh.Repo)/blob/main/apps/vscode/CHANGELOG.md)."
    }

    $bodyFile = Join-Path $env:TEMP "icline-release-body-$ver.md"
    [System.IO.File]::WriteAllText($bodyFile, $releaseBody, $utf8NoBom)

    $token = Get-GitHubReleaseToken
    if (-not $token) {
        throw "GitHub token not found. Set GITHUB_TOKEN (or GH_TOKEN), or configure git credentials for github.com."
    }

    $headers = @{
        Authorization = "Bearer $token"
        Accept = "application/vnd.github+json"
        "X-GitHub-Api-Version" = "2022-11-28"
    }
    $payloadObj = @{
        tag_name = "v$ver"
        target_commitish = "main"
        name = "iCline v$ver"
        body = (Get-Content $bodyFile -Raw)
        draft = $false
        prerelease = $isPrerelease
    }
    $payload = $payloadObj | ConvertTo-Json -Depth 5 -Compress

    $release = $null
    try {
        $release = Invoke-RestMethod -Uri $releasesApi -Method Post -Headers $headers -Body ([System.Text.Encoding]::UTF8.GetBytes($payload)) -ContentType "application/json; charset=utf-8"
    } catch {
        $createError = Get-GitHubApiErrorMessage $_
        Write-Host "Create release failed: $createError" -ForegroundColor Yellow
        Write-Host "Trying existing release for tag v$ver..."
        try {
            $release = Invoke-RestMethod -Uri "$releasesApi/tags/v$ver" -Headers $headers
        } catch {
            $lookupError = Get-GitHubApiErrorMessage $_
            throw @"
GitHub Release v$ver failed.

Create error:
$createError

Lookup error:
$lookupError

Tips:
- Ensure the token has 'repo' scope and org SSO is authorized for $($gh.Owner).
- Or create the release manually: https://github.com/$($gh.Owner)/$($gh.Repo)/releases/new
- Then upload: $vsixPath
"@
        }
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