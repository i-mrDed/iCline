# Apply GitHub repository topics from apps/vscode/scripts/icline-docs.manifest.json
# Usage: .\scripts\set-github-repo-topics.ps1 [-DryRun]

param([switch]$DryRun)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$ManifestPath = Join-Path $Root "apps\vscode\scripts\icline-docs.manifest.json"

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
    Write-Host "[DryRun] Would apply topics via GitHub API PUT repos/$owner/$repo/topics"
    exit 0
}

$payload = @{ names = $topics } | ConvertTo-Json -Compress

if (Get-Command gh -ErrorAction SilentlyContinue) {
    $tmp = Join-Path $env:TEMP "icline-github-topics.json"
    Set-Content -Path $tmp -Value $payload -Encoding UTF8NoBOM
    gh api --method PUT "repos/$owner/$repo/topics" --input $tmp
    Remove-Item $tmp -Force -ErrorAction SilentlyContinue
} else {
    $credText = "protocol=https`nhost=github.com`n`n" | git -C $Root credential fill 2>$null
    if (-not $credText) {
        throw "GitHub credentials not found. Run gh auth login or configure git credential for github.com."
    }
    $token = ($credText -split "`n" | Where-Object { $_ -like "password=*" }) -replace "password=",""
    $headers = @{
        Authorization = "Bearer $token"
        Accept        = "application/vnd.github+json"
        "X-GitHub-Api-Version" = "2022-11-28"
    }
    Invoke-RestMethod -Uri "https://api.github.com/repos/$owner/$repo/topics" -Method Put -Headers $headers -Body ([System.Text.Encoding]::UTF8.GetBytes($payload)) -ContentType "application/json; charset=utf-8" | Out-Null
}

Write-Host "GitHub topics updated."