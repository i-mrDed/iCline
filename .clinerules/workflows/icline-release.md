# iCline Release Workflow (Dev / Beta / Stable)

Standard release process for **iCline** (`i-mrdedchai.iCline`).  
New agent sessions: read this file + `icline-marketplace.md` first.

## Release channels

| Channel | Command | GitHub | Marketplace | Smoke gate |
|---------|---------|--------|-------------|------------|
| **Dev** | `-Channel Dev` | No | No | No |
| **Beta** | `-Channel Beta` | Pre-release + VSIX | Optional `-PublishMarketplace` | Required |
| **Stable** | `-Channel Stable` | Release + VSIX | `-PublishMarketplace` (explicit) | Required (stricter) |

**Current Stable:** `0.1.12` — see `releases/STABLE.md`

**Rule:** Never publish Stable to Marketplace without passing the smoke checklist **or** documented maintainer approval (`-MaintainerApproval` writes to `releases/approvals/`).

## Single-command release

From repo root (`cline-temp/`):

```powershell
# Dev — VSIX only (default)
.\scripts\release-icline.ps1 -Channel Dev

# Beta — after local VSIX testing
.\scripts\release-icline.ps1 -Channel Beta -Version 0.1.11-beta.1 -PublishMarketplace

# Stable — after Beta soak
.\scripts\release-icline.ps1 -Channel Stable -Version 0.1.11 -PublishMarketplace
```

Flags: `-Version`, `-SkipBuild`, `-SkipPush`, `-SkipRelease`, `-MaintainerApproval`, `-SkipSmokeCheck` (Stable requires `-MaintainerApproval` when skipping smoke)

### Maintainer approval (alternative to interactive smoke)

When real-world testing is already done (e.g. clean VSIX install + Grok models verified), maintainer explicit approval counts:

```powershell
.\scripts\release-icline.ps1 -Channel Stable -Version 0.1.12 -PublishMarketplace `
  -SkipSmokeCheck `
  -MaintainerApproval "Release 0.1.12 Stable — Grok smoke passed manually"
```

## Smoke test gate

```powershell
.\scripts\icline-smoke-checklist.ps1 -Channel Beta   # or Stable
```

Beta/Stable releases run this automatically unless `-SkipSmokeCheck`.

Key checks:
- xAI Grok OAuth / subscription works
- Composer 2.5 Fast (or similar) chats without repeated `attempt_completion without result` warnings
- No duplicate legacy extensions (`icline.icline`, old publisher IDs)
- Stable: file edit tools + longer soak period

## Manual checklist (every release)

### 1. Code + version

- [ ] Fix/feature complete
- [ ] Add bullets under `## [x.y.z] - Unreleased` in `apps/vscode/CHANGELOG.md` during dev (never `## [x.y.z-dev.N]` sections)
- [ ] On Stable: `release-icline.ps1` finalizes Unreleased → dated release, blocks leftover dev sections, seeds next Unreleased

### 2. Sync docs

```powershell
cd apps/vscode
npm run sync:docs
```

### 3. Dev build + local install

```powershell
cd ../..
.\scripts\release-icline.ps1 -Channel Dev
code --install-extension apps\vscode\dist\i-mrdedchai.iCline-<version>.vsix --force
```

Reload Window → run smoke checklist mentally or via script.

### 4. Beta / Stable

Script handles: commit, push, GitHub Release, optional Marketplace.

### 5. Verify before "done"

- [ ] https://github.com/i-mrDedchai/iCline/releases
- [ ] Marketplace version (if published)
- [ ] Test from **Marketplace install**, not only local VSIX

## How updates reach users

| Channel | Auto-install? |
|---------|---------------|
| VS Code Marketplace (`i-mrdedchai`) | Yes |
| GitHub Releases `.vsix` | No — manual reinstall |
| iCline update toast | Notify only |

## Extension identity

- **ID:** `i-mrdedchai.iCline`
- **Publisher:** `i-mrdedchai`
- **GitHub:** `i-mrDedchai/iCline`
- **Settings:** `iCline.*`

## CI guidance

- **Green gate:** `ext-vscode-test-e2e` (Playwright)
- **Known debt:** `ext-vscode-test` — triage incrementally; do not block Beta on it

## Agent session bootstrap

1. Read this file + `icline-marketplace.md`
2. Check `package.json` version vs latest GitHub Release
3. Dev build first; Beta/Stable only after smoke passes