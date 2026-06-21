# Apply GitHub repository topics from apps/vscode/scripts/icline-docs.manifest.json
# Usage: .\scripts\set-github-repo-topics.ps1 [-DryRun]

param([switch]$DryRun)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$ManifestPath = Join-Path $Root "apps\vscode\scripts\icline-docs.manifest.json"

if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    throw "GitHub CLI (gh) is required. Install from https://cli.github.com/ and run gh auth login."
}

$manifest = Get-Content $ManifestPath -Raw | ConvertFrom-Json
$owner = $manifest.github.owner
$repo = $manifest.github.repo
$topics = @($manifest.github.topics)

if ($topics.Count -eq 0) {
    throw "No github.topics defined in icline-docs.manifest.json"
}
if ($topics.Count -gt 20) {
    throw "GitHub allows at most 20 topics (got $($topics.Count))"
}

Write-Host "Repo: $owner/$repo"
Write-Host "Topics ($($topics.Count)): $($topics -join ', ')"

if ($DryRun) {
    Write-Host "[DryRun] Would apply topics via gh api PUT repos/$owner/$repo/topics"
    exit 0
}

$payload = @{ names = $topics } | ConvertTo-Json -Compress
$tmp = Join-Path $env:TEMP "icline-github-topics.json"
Set-Content -Path $tmp -Value $payload -Encoding UTF8NoBOM
gh api --method PUT "repos/$owner/$repo/topics" --input $tmp
Remove-Item $tmp -Force -ErrorAction SilentlyContinue
Write-Host "GitHub topics updated."