# Contributing to iCline

Thank you for your interest in iCline!

## Who can change `main`?

This repository is **public** at [i-mrDedchai/iCline](https://github.com/i-mrDedchai/iCline). Direct pushes to `main` are limited to the maintainer ([@i-mrDedchai](https://github.com/i-mrDedchai)) and org collaborators.

Everyone else should:

1. Fork the repository
2. Create a feature branch
3. Open a Pull Request

The maintainer reviews and merges PRs.

## iCline releases

See **[.clinerules/workflows/icline-release.md](.clinerules/workflows/icline-release.md)** for the full checklist.  
Quick command: `.\scripts\release-icline.ps1`

## Development setup

```powershell
cd apps/vscode
npm install
npm run protos
npm run sync:docs
npm run package:vsix
```

## Scope

- **iCline-specific changes** belong in `apps/vscode/` (and related scripts under `apps/vscode/scripts/`)
- Upstream Cline changes should be merged via `scripts/sync-upstream.ps1`, then iCline customizations re-applied

## Pull request guidelines

- One logical change per PR
- Update `CHANGELOG.md` under `apps/vscode/` for user-visible changes
- Run `npm run sync:docs` before packaging
- Do not commit secrets, `.env`, `*.vsix`, or `node_modules`

## Languages / i18n

- Extension marketplace README: `apps/vscode/README.md` (English) + `apps/vscode/README.th.md` (Thai)
- VS Code UI strings: `package.nls.json` + `package.nls.th.json`
- Repo overview: root `README.md` + `README.th.md`

## Questions

Open a [GitHub Discussion](https://github.com/i-mrDedchai/iCline/discussions) or file an issue.