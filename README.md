<p align="center">
  <img src="apps/vscode/assets/icons/icon.png" width="80" alt="iCline" />
</p>

<h1 align="center">iCline</h1>

<p align="center">
A Cline fork for VS Code with xAI Grok OAuth, ZenMux, and hardened agent harness — install alongside official Cline.
</p>

<p align="center">
🌐 <strong>English</strong> (this page) · <a href="README.th.md">ภาษาไทย</a>
</p>

<!-- icline:version -->
<p align="center">
  <strong>Version</strong> <code>0.1.12</code> ·
  <a href="https://github.com/i-mrDedchai/iCline/releases">Releases</a> ·
  Extension ID <code>i-mrdedchai.iCline</code>
</p>
<!-- /icline:version -->

---

## Quick start

1. Download the latest `.vsix` from [Releases](https://github.com/i-mrDedchai/iCline/releases)
2. Install: `code --install-extension i-mrdedchai.iCline-0.1.12.vsix --force`
3. Open iCline from the Activity Bar → Settings → sign in to **xAI · Grok** or add your API key

Full extension docs: **[apps/vscode/README.md](apps/vscode/README.md)** · Thai: **[apps/vscode/README.th.md](apps/vscode/README.th.md)**

## Build from source

```powershell
cd apps/vscode
npm install
npm run package:vsix
code --install-extension dist/i-mrdedchai.iCline-0.1.12.vsix --force
```

## iCline vs Cline official

| | Cline official | iCline |
|---|---|---|
| Extension ID | `saoudrizwan.claude-dev` | `i-mrdedchai.iCline` |
| xAI OAuth & subscription models | ❌ | ✅ |
| ZenMux provider | ❌ | ✅ |
| Dual-channel safe updates | ❌ | ✅ |

Both extensions can run side by side — updates to one do not remove the other.

## Sync upstream Cline

```powershell
.\scripts\sync-upstream.ps1
```

## Repository layout

This repo is a fork of [cline/cline](https://github.com/cline/cline). The **iCline VS Code extension** lives in `apps/vscode/`. Other directories (`apps/cli`, `sdk`, `docs`, …) come from upstream.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Changes to `main` are made by the maintainer; external contributions via fork + pull request.

## Security

See [SECURITY.md](SECURITY.md). Never commit API keys, `.env`, or `~/.grok/auth.json`.

## License

[Apache-2.0](LICENSE) — derived from [Cline](https://github.com/cline/cline).