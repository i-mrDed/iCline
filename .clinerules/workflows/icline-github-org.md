# iCline — GitHub Organization (`i-mrDedchai`)

Personal account **`i-mrDed`** is kept for other projects (`dedchai@live.com`).
iCline lives under org **`i-mrDedchai`**: https://github.com/i-mrDedchai/iCline

## Transfer repo (one-time)

1. Open https://github.com/i-mrDed/iCline/settings
2. Scroll to **Danger Zone** → **Transfer ownership**
3. New owner: **`i-mrDedchai`** (organization)
4. Confirm repository name: **`iCline`**
5. Accept the transfer email / org approval if prompted

After transfer:
- Old URL `i-mrDed/iCline` redirects to `i-mrDedchai/iCline`
- Releases, tags, and commit history are preserved
- **Fix About sidebar link** (does not auto-update): repo **Settings** → **General** → **Website** → `https://github.com/i-mrDedchai/iCline`  
  Or API: `PATCH /repos/i-mrDedchai/iCline` with `"homepage": "https://github.com/i-mrDedchai/iCline"`

## Update local git remote

```powershell
cd D:\.grok\iCline\cline-temp
git remote set-url origin https://github.com/i-mrDedchai/iCline.git
git remote -v
git push origin main
```

## Optional: rename repo to `icline`

Settings → **Repository name** → `icline` → then update `icline-docs.manifest.json` `"repo": "icline"` and run `npm run sync:docs`.

## GitHub repo topics (sidebar tags)

Topics are **not** set from `package.json` keywords — they require the GitHub API.

After changing `github.topics` in `apps/vscode/scripts/icline-docs.manifest.json`:

```powershell
.\scripts\set-github-repo-topics.ps1
```

Requires [GitHub CLI](https://cli.github.com/) (`gh auth login`). Max **20** topics.

## Identity map

| System | ID |
|--------|-----|
| GitHub org | `i-mrDedchai` |
| GitHub repo | `iCline` (or `icline` if renamed) |
| VS Marketplace publisher | `i-mrdedchai` |
| Extension ID | `i-mrdedchai.iCline` |
| Personal GitHub (other work) | `i-mrDed` |