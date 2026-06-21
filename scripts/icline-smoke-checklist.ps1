# iCline pre-release smoke test gate (interactive)
# Usage: .\scripts\icline-smoke-checklist.ps1 [-Channel Beta|Stable]

param(
    [ValidateSet("Beta", "Stable")]
    [string]$Channel = "Stable"
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "=== iCline Smoke Test Checklist ($Channel) ===" -ForegroundColor Cyan
Write-Host "ตอบ y/n แต่ละข้อ — Stable ต้องผ่านทุกข้อ (ยกเว้นข้อ 8 สำหรับ Beta)"
Write-Host ""

$items = @(
    @{ Id = 1; Text = "เปิด sidebar / Activity Bar ไม่มี error"; Required = $true },
    @{ Id = 2; Text = "Sign in xAI Grok (OAuth หรือ API key) สำเร็จ"; Required = $true },
    @{ Id = 3; Text = "เลือกโมเดล Grok (เช่น Composer 2.5 Fast) แล้วแชทได้"; Required = $true },
    @{ Id = 4; Text = "ไม่มี warning 'attempt_completion without result' ซ้ำๆ"; Required = $true },
    @{ Id = 5; Text = "Agent ใช้ tool อ่าน/แก้ไฟล์ได้ (ถ้ารอบนี้แก้ส่วน agent)"; Required = ($Channel -eq "Stable") },
    @{ Id = 6; Text = "Reload Window แล้ว settings ยังอยู่"; Required = $true },
    @{ Id = 7; Text = "ไม่มี extension เก่าซ้ำ (icline.icline / i-mrDed.iCline)"; Required = $true },
    @{ Id = 8; Text = "ใช้งานจริงอย่างน้อย 30 นาที (Stable: 1 วัน)"; Required = ($Channel -eq "Stable") }
)

$failed = @()
foreach ($item in $items) {
    if (-not $item.Required) { continue }
    $answer = Read-Host "$($item.Id). $($item.Text) [y/n]"
    if ($answer -notmatch '^[yY]') {
        $failed += $item
    }
}

Write-Host ""
if ($failed.Count -gt 0) {
    Write-Host "FAILED: ยังไม่ผ่าน $($failed.Count) ข้อ — ห้ามปล่อย $Channel" -ForegroundColor Red
    foreach ($f in $failed) { Write-Host "  - $($f.Text)" -ForegroundColor Yellow }
    exit 1
}

Write-Host "PASSED: smoke checklist ครบ — พร้อมปล่อย $Channel" -ForegroundColor Green
exit 0