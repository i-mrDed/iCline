# iCline Release Workflow

Standard release process for the **iCline** VS Code extension (`i-mrdedchai.iCline`).
Use this checklist every time — new agent sessions should read this file first.

## Important: how updates reach users

| Channel | Auto-install? | Notes |
|---------|---------------|-------|
| VS Code Marketplace | Published under publisher `i-mrdedchai` | Auto-update after first publish |
| GitHub Releases `.vsix` | **No** | User downloads VSIX and runs `code --install-extension` |
| iCline update toast | **Notify only** | `View Release` opens GitHub — does not install |

Installed version in VS Code = **last VSIX installed**, not GitHub latest.

## Single-command release (maintainer)

From repo root (`cline-temp/`):

```powershell
.\scripts\release-icline.ps1
```

Optional flags: `-Version 0.1.10`, `-SkipPush`, `-SkipRelease`, `-SkipBuild`

## Manual checklist (same order every time)

### 1. Code + version

- [ ] Fix/feature complete and tested locally
- [ ] Bump `apps/vscode/package.json` → `"version"`
- [ ] Add section to `apps/vscode/CHANGELOG.md` under `## [x.y.z]`

### 2. Sync all docs (single source of truth: `package.json` version)

```powershell
cd apps/vscode
npm run sync:docs
```

Updates automatically:

- `apps/vscode/README.md` + `README.th.md` (VS Code Details tab)
- `README.md` + `README.th.md` (repo root)
- `ICLINE.md` (workspace notes, if present)
- `package.json` description / releases URL
- Provider labels in `providers.json`

### 3. Build VSIX

```powershell
cd apps/vscode
npm run package:vsix -- --out dist/i-mrdedchai.iCline-<version>.vsix
```

### 4. Git commit + push

```powershell
cd ../..   # cline-temp root
git add -A
git commit -m "release(icline): v<version> — <short summary>"
git push origin main
```

### 5. GitHub Release

- Tag: `v<version>` (must match `package.json`)
- Attach: `dist/i-mrdedchai.iCline-<version>.vsix`
- Body: copy from `CHANGELOG.md` section for that version
- Or run `.\scripts\release-icline.ps1` (creates release via API)

### 6. Verify sync (before telling user "done")

- [ ] https://github.com/i-mrDedchai/iCline — root README shows correct version
- [ ] https://github.com/i-mrDedchai/iCline/releases — latest tag + VSIX asset
- [ ] `apps/vscode/CHANGELOG.md` matches release notes

### 7. User install command (send to testers)

```powershell
code --install-extension i-mrdedchai.iCline-<version>.vsix --force
```

Then **Developer: Reload Window**.

## Extension identity

- **ID:** `i-mrdedchai.iCline`
- **Publisher:** `i-mrdedchai` (Marketplace, `mr.dedchai@hotmail.com`)
- **GitHub org:** `i-mrDedchai/iCline`
- **Settings prefix:** `iCline.*` (legacy `icline.icline` used `icline.*`)
- **Upstream remote:** `upstream` → `cline/cline`
- **Origin remote:** `origin` → `i-mrDedchai/iCline`

## What is NOT auto-updated today

- VS Code installed extension version (manual VSIX reinstall)
- GitHub Release notes (unless release script / API step runs)
- Root README if `npm run sync:docs` was skipped

## Agent session bootstrap

1. Read this file + `icline-marketplace.md`
2. Check `apps/vscode/package.json` version vs latest GitHub Release
3. Run `npm run sync:docs` before any package/publish step