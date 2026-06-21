# iCline — Maintainer & Session Handoff

> **จุดประสงค์:** ให้ maintainer, agent session ใหม่, หรือแชทอื่น รับงานต่อได้โดยไม่พึ่งประวัติแชทเดิม  
> **อัปเดตล่าสุด:** 2026-06-21 · **Stable ปัจจุบัน:** `0.1.14`  
> **Repo:** https://github.com/i-mrDedchai/iCline · **Workspace ท้องถิ่น:** `D:\.grok\iCline\cline-temp`

---

## 1. ภาพรวมโปรเจกต์

| รายการ | ค่า |
|--------|-----|
| **ชื่อ** | iCline — fork ของ [Cline](https://github.com/cline/cline) |
| **Extension ID** | `i-mrdedchai.iCline` |
| **Publisher (Marketplace)** | `i-mrdedchai` |
| **GitHub org/repo** | `i-mrDedchai/iCline` |
| **โค้ดหลัก extension** | `apps/vscode/` |
| **Upstream Cline (sync ล่าสุด)** | ดู `apps/vscode/scripts/icline-docs.manifest.json` → `upstreamCline` |

ติดตั้ง **คู่กับ** Cline official (`saoudrizwan.claude-dev`) ได้ — คนละ extension ID ไม่ชนกัน

---

## 2. สถานะ Stable ล่าสุด (อ้างอิงเมื่อเปิด session ใหม่)

| รายการ | ค่า |
|--------|-----|
| **เวอร์ชัน** | `0.1.14` |
| **GitHub Release** | https://github.com/i-mrDedchai/iCline/releases/tag/v0.1.14 |
| **Marketplace** | https://marketplace.visualstudio.com/items?itemName=i-mrdedchai.iCline |
| **Pointer สั้น** | `releases/STABLE.md` |

### สิ่งสำคัญใน 0.1.13–0.1.14 (บริบทแชทมิ.ย. 2026)

- **Chat quick Provider & Model picker** — `ChatModelPicker.tsx`, collapse providers, Thinking/Effort on hover, width 380px + options 148px
- **Dev build numbering** — `0.1.13-dev.N` ผ่าน `-Channel Dev`; About แสดง dev build
- **Release automation** — `scripts/release-icline.ps1` + Node publishers
- **0.1.14 fixes** — Marketplace README เต็มรูปแบบ, Windows webview defer load, README GitHub sync เมื่อ `-SkipPush`

---

## 3. โครงสร้างไฟล์สำคัญ (iCline-specific)

```
cline-temp/
├── README.md                    # หน้าแรก GitHub (sync เวอร์ชันจาก sync-icline-docs)
├── README.th.md
├── releases/
│   ├── STABLE.md                # pointer เวอร์ชัน Stable สาธารณะ
│   ├── MAINTAINER-HANDOFF.md    # เอกสารนี้
│   └── approvals/               # บันทึก MaintainerApproval ต่อ release
├── scripts/
│   ├── release-icline.ps1       # release หลัก (Dev / Beta / Stable)
│   ├── publish-github-release.mjs
│   ├── extract-release-notes.mjs
│   └── icline-smoke-checklist.ps1
└── apps/vscode/
    ├── package.json             # version แหล่งจริง
    ├── CHANGELOG.md
    ├── README.md                # เอกสาร extension เต็ม (GitHub / VSIX ทั่วไป)
    ├── README.marketplace.md    # สำหรับ Marketplace + Details tab (สั้นกว่า README.md เล็กน้อย แต่มีตาราง+รูป)
    ├── README.th.md
    ├── scripts/
    │   ├── sync-icline-docs.mjs # sync README, CHANGELOG, manifest, build-metadata
    │   ├── icline-docs.manifest.json
    │   ├── publish-marketplace.mjs
    │   └── marketplace-readme.mjs
    ├── assets/docs/             # รูป preview ใน README (ต้องอยู่ใน .vscodeignore !assets/docs/**)
    └── webview-ui/src/components/chat/
        ├── ChatModelPicker.tsx
        ├── chatModelPickerUtils.ts
        ├── chatModelPreferences.ts
        └── ModelThinkingStatusIcons.tsx
```

---

## 4. Workflow การพัฒนา (Dev)

### 4.1 Build & ติดตั้งทด local

```powershell
cd D:\.grok\iCline\cline-temp\apps\vscode
npm install
npm run package:vsix
# หรือใช้ release script:
cd D:\.grok\iCline\cline-temp
.\scripts\release-icline.ps1 -Channel Dev
```

ติดตั้ง + reload:

```powershell
code --install-extension apps\vscode\dist\i-mrdedchai.iCline-<ver>.vsix --force
# Ctrl+Shift+P → Developer: Reload Window
```

### 4.2 Dev build numbering

- `-Channel Dev` → bump เป็น `X.Y.Z-dev.N` (state ใน `.icline/dev-build.json`, gitignored)
- `-Channel Stable` → normalize เป็น `X.Y.Z` (ตัด `-dev.N`) + reset dev counter
- **หมายเหตุ:** รัน Dev ด้วย `-SkipBuild` ยัง consume เลข dev ได้ — ระวัง

### 4.3 Sync upstream Cline

```powershell
.\scripts\sync-upstream.ps1
```

อัปเดต `upstreamCline` ใน `icline-docs.manifest.json` หลัง sync สำคัญ

---

## 5. Workflow การปล่อย Release

สคริปต์หลัก: **`scripts/release-icline.ps1`**

### 5.1 Channels

| Channel | ใช้เมื่อ | Git push | GitHub Release | Marketplace |
|---------|----------|----------|----------------|-------------|
| **Dev** | ทด VSIX local | ไม่ | ไม่ | ไม่ |
| **Beta** | pre-release | ได้ | ได้ (prerelease) | optional `--pre-release` |
| **Stable** | ปล่อยสาธารณะ | ได้ | ได้ | แยก `-PublishMarketplace` |

### 5.2 พารามิเตอร์สำคัญ

```powershell
.\scripts\release-icline.ps1 `
  -Channel Stable `
  -SkipBuild `              # ใช้ VSIX ที่ build แล้วใน dist/
  -SkipPush `               # ไม่ commit ทั้ง repo (แต่ดู §5.4)
  -SkipRelease `            # ข้าม GitHub Release
  -SkipSmokeCheck `         # ข้าม checklist (Stable ต้องมี -MaintainerApproval)
  -PublishMarketplace `     # ปล่อย VS Marketplace
  -MaintainerApproval "approved"
```

- **Stable + `-SkipSmokeCheck`** → **บังคับ** `-MaintainerApproval "..."`  
- บันทึก approval → `releases/approvals/v<ver>-Stable.txt`

### 5.3 ลำดับขั้นตอนที่สคริปต์ทำ (Stable)

1. อ่าน/ตั้ง `package.json` version  
2. บันทึก maintainer approval (ถ้ามี)  
3. `node apps/vscode/scripts/sync-icline-docs.mjs`  
4. Build VSIX (`npm run package:vsix`) ยกเว้น `-SkipBuild`  
5. Git commit + push ยกเว้น `-SkipPush`  
6. **ถ้า `-SkipPush`** → push เฉพาะ README/docs (ฟังก์ชัน `Push-SyncedReadmeDocs`)  
7. สร้าง GitHub Release + อัปโหลด VSIX (`publish-github-release.mjs`)  
8. Marketplace ถ้า `-PublishMarketplace`

### 5.4 เอกสาร & README — อย่าสับสน

| ไฟล์ | ใช้ที่ไหน |
|------|-----------|
| `README.md` (root) | หน้าแรก GitHub |
| `apps/vscode/README.md` | เอกสาร extension เต็ม, VSIX จาก `package:vsix` |
| `apps/vscode/README.marketplace.md` | **Marketplace + VS Code Details tab** — swap เข้า `README.md` ตอน `vsce publish` |

`sync-icline-docs.mjs` อัปเดตทุก README + `README.marketplace.md` (รูปใน marketplace → **absolute GitHub raw URL**)

**กฎ:** หลัง release ตรวจ https://github.com/i-mrDedchai/iCline ว่า badge เวอร์ชันตรง `package.json`

### 5.5 เตรียม Stable รอบใหม่ (checklist)

1. แก้โค้ด + ทด Dev builds (`-Channel Dev`) จน maintainer อนุมัติ  
2. อัปเดต `apps/vscode/CHANGELOG.md` (section `## [X.Y.Z]`)  
3. Bump `apps/vscode/package.json` version  
4. Commit + push โค้ด  
5. `.\scripts\release-icline.ps1 -Channel Stable ...`  
6. อัปเดต `releases/STABLE.md`  
7. ยืนยัน GitHub Release + Marketplace + หน้า repo

---

## 6. GitHub Release (รายละเอียดเทคนิค)

### สคริปต์

- `scripts/extract-release-notes.mjs` — ดึง CHANGELOG → body (UTF-8, **`--out-file`** ไม่ pipe ผ่าน PowerShell)  
- `scripts/publish-github-release.mjs` — สร้าง/อัปเดต release + อัปโหลด VSIX (idempotent บน 422)

### Token

- ใช้ `$env:GITHUB_TOKEN` หรือ `$env:GH_TOKEN` หรือ `git credential fill` สำหรับ github.com  
- Classic PAT: scope **`repo`** + authorize SSO สำหรับ org `i-mrDedchai`  
- Fine-grained: repo `iCline` — **Contents Read and write**  
- **ห้าม** paste token ในแชท — revoke ทันทีถ้ารั่ว

### พฤติกรรม idempotent

- Release มีอยู่แล้ว (422) → PATCH body + ข้าม VSIX ถ้าชื่อไฟล์ซ้ำ  
- รันซ้ำได้โดยไม่ error

---

## 7. VS Marketplace

```powershell
cd apps\vscode
npm run publish:marketplace
# ภายใน: marketplace-readme.mjs swap-in → vsce publish → restore README
```

- Publisher: `i-mrdedchai`  
- ต้อง login `vsce` ไว้แล้ว (Personal Access Token ของ Azure DevOps publisher)  
- `vsce show i-mrdedchai.iCline` — ตรวจเวอร์ชันบน Marketplace  
- API อาจช้ากว่า `vsce` 5–15 นาที

---

## 8. ปัญหาที่เคยเจอ & วิธีแก้ (Troubleshooting)

| อาการ | สาเหตุ | วิธีแก้ |
|--------|--------|--------|
| GitHub Release **422** + lookup **404** | Release ยังไม่มี; หรือ body JSON พัง | ใช้ `publish-github-release.mjs` (ไม่ใช้ `ConvertTo-Json` ใน PS1) |
| Emoji/ไทยใน Release notes **เพี้ยน** | PowerShell pipe stdout จาก Node ทำลาย UTF-8 | `extract-release-notes.mjs --out-file` + Node publisher |
| หน้า repo GitHub ยัง **0.1.13** | `sync-icline-docs` รันแล้วแต่ไม่ push (`-SkipPush`) | Push README หรือใช้ `Push-SyncedReadmeDocs` (มีใน script แล้ว) |
| VS Code **Details** หายเนื้อหา | Marketplace ใช้ `README.marketplace.md` แบบสั้นเกินไป | อัปเดต `README.marketplace.md` + republish (แก้ใน 0.1.14) |
| **Error loading webview: ServiceWorker** (Windows) | Race ตอนเปิด sidebar หลัง install/reload ([cline#8920](https://github.com/cline/cline/issues/8920)) | อัปเดต ≥0.1.14 (defer HTML 50ms); **Developer: Reload Window** แล้วเปิด iCline อีกครั้ง |
| Webview **blank** (production) | dev script `localhost:8097` ใน HTML | แก้แล้วตั้งแต่ 0.1.12 — ตรวจ `extensionMode !== Development` |
| `Set-Content -Encoding UTF8NoBOM` error (PS 5.1) | พารามิเตอร์ไม่รองรับ | ใช้ `[System.IO.File]::WriteAllText(..., UTF8Encoding $false)` |
| `Out-File -Encoding utf8NoBOM` error | เหมือนกัน | ใช้ Node `--out-file` แทน |
| Marketplace publish บอก **already exists** แต่ API ยังเวอร์ชันเก่า | propagation / validation delay | รอหรือ `npx vsce show i-mrdedchai.iCline` |
| Dev counter กระโดด | `-SkipBuild` ยัง bump dev number | ยอมรับหรือแก้ state ใน `.icline/dev-build.json` |

---

## 9. คอนเวนชันจาก maintainer (สำคัญ)

1. **รอบเวอร์ชันรวม** — ใช้เลขเดียวกันทั้ง dev builds (`0.1.13-dev.N`) จน Stable `0.1.13` แล้วค่อยขึ้นรอบใหม่ (`0.1.14`)  
2. **อย่า** เพิ่ม workflow ยาวในไฟล์อื่นโดยไม่จำเป็น — ใช้ `releases/MAINTAINER-HANDOFF.md` เป็นแหล่ง handoff  
3. **Marketplace** — ไม่ publish จน maintainer ทด Stable ครบ (ใช้ `-PublishMarketplace` แยก)  
4. **ภาษา** — README คู่ EN + TH; รูป preview ใน `apps/vscode/assets/docs/`  
5. **Chat picker layout** — width 380px, hover total 528px (380+148 options)  
6. **RTK** — ถ้า shell รองรับ ให้ prefix คำสั่งด้วย `rtk` (ดู workspace rules)

---

## 10. วิธีเปิด Session / แชทใหม่ให้รับงานต่อ

วางข้อความนี้เป็น prompt แรก:

```
โปรเจกต์ iCline ที่ D:\.grok\iCline\cline-temp
อ่าน releases/MAINTAINER-HANDOFF.md และ releases/STABLE.md ก่อน
Stable ล่าสุด: 0.1.14
งานที่ต้องการ: [ระบุ]
```

Agent ควร:

1. `git pull`  
2. อ่าน `releases/MAINTAINER-HANDOFF.md`  
3. ตรวจ `apps/vscode/package.json` version  
4. ทำงานตาม workflow §4–§5  
5. อัปเดต `CHANGELOG.md`, `releases/STABLE.md`, เอกสารนี้ถ้าขั้นตอนเปลี่ยน

---

## 11. คำสั่งอ้างอิงด่วน

```powershell
# Dev VSIX
.\scripts\release-icline.ps1 -Channel Dev

# Stable (GitHub only, ไม่ Marketplace)
.\scripts\release-icline.ps1 -Channel Stable -SkipBuild -SkipPush -SkipSmokeCheck -MaintainerApproval "approved"

# Stable + Marketplace
.\scripts\release-icline.ps1 -Channel Stable -SkipBuild -SkipSmokeCheck -PublishMarketplace -MaintainerApproval "approved"

# ตรวจ Marketplace
npx vsce show i-mrdedchai.iCline

# Manual GitHub release (fallback)
$env:GITHUB_TOKEN = "..."   # ตั้งในเครื่อง อย่า paste ในแชท
node scripts/extract-release-notes.mjs 0.1.14 --out-file $env:TEMP\body.md
node scripts/publish-github-release.mjs --version 0.1.14 --body-file $env:TEMP\body.md `
  --vsix apps/vscode/dist/i-mrdedchai.iCline-0.1.14.vsix --owner i-mrDedchai --repo iCline
```

---

## 12. Commits สำคัญ (อ้างอิงประวัติแชทมิ.ย. 2026)

| Commit | เรื่อง |
|--------|--------|
| `de9221e` | v0.1.14 marketplace README + webview defer |
| `ece28fb` | UTF-8 GitHub release notes (Node publisher) |
| `bf546e5` | sync README badges 0.1.14 |
| `3c6c2c7` | push README เมื่อ `-SkipPush` |
| `204fd41` | Stable 0.1.13 |

---

## 13. อัปเดตเอกสารนี้เมื่อใด

- ปล่อย Stable ใหม่ → อัปเดต §2, `releases/STABLE.md`, เลขเวอร์ชันในหัวเอกสาร  
- เพิ่มสคริปต์ / เปลี่ยน release flow → อัปเดต §5–§7  
- เจอ incident ใหม่ → เพิ่มใน §8  
- เปลี่ยน convention → อัปเดต §9