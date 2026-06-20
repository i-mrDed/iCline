# iCline — VS Marketplace Publish

Extension ID: **`i-mrded.iCline`** · Publisher: **`i-mrded`**

## Prerequisites (one-time, maintainer)

1. **Create publisher** at [Marketplace Publisher Management](https://marketplace.visualstudio.com/manage)
   - Publisher ID must be exactly: `i-mrded` (matches `package.json` → `"publisher"`)
2. **Personal Access Token** (Azure DevOps):
   - https://dev.azure.com → User settings → Personal access tokens
   - Scopes: **Marketplace** → **Manage**
3. **Login vsce** (once per machine):
   ```powershell
   cd apps/vscode
   npx vsce login i-mrded
   ```
   Paste the PAT when prompted.

## Publish command

After a normal release build (`npm run sync:docs` + `npm run package:vsix`):

```powershell
cd apps/vscode
npm run publish:marketplace
```

This runs `scripts/publish-marketplace.mjs` which:
- Swaps `README.marketplace.md` for publishing
- `vsce publish` → VS Marketplace
- `ovsx publish` → Open VSX (optional registry)

Pre-release channel:
```powershell
npm run publish:marketplace:prerelease
```

## How auto-update works after Marketplace publish

| IDE | Mechanism |
|-----|-----------|
| **VS Code** | Built-in extension updater polls Marketplace (~every few hours). User gets "Update" button in Extensions view. |
| **Cursor** | Same extension host as VS Code — updates from Marketplace when publisher matches installed extension. |
| **VSIX-only install** | No auto-install — only iCline's GitHub release checker (`iCline.updates.*`) notifies user. |

### iCline GitHub update checker (always active)

- Code: `apps/vscode/src/icline/updates/UpdateService.ts`
- Default URL: `https://api.github.com/repos/i-mrDed/iCline/releases/latest`
- Settings: `iCline.updates.enabled`, `checkIntervalHours` (default 24h)
- On startup + interval: compares installed version vs GitHub latest → toast **View Release**
- Does **not** download or install — user must update via Marketplace (after publish) or reinstall VSIX

## Checklist before first publish

- [ ] Publisher `i-mrded` created and owns extension name `iCline`
- [ ] `README.marketplace.md` is iCline-specific (not Cline default)
- [ ] `package.json` version matches latest release
- [ ] No duplicate legacy `icline.icline` folders on maintainer machine
- [ ] Icon, license, repository URL set in `package.json`

## Troubleshooting

| Error | Fix |
|-------|-----|
| `ERROR Publisher 'i-mrded' is not authorized` | Run `vsce login i-mrded` with Marketplace PAT |
| `Extension name already taken` | Publisher must own the extension or use a different name |
| Duplicate view/settings registration | Uninstall **all** `icline.icline-*` and old `i-mrDed.iCline` versions; keep only `i-mrded.iCline` |