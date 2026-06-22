# iCline — Cline Fork

<!-- icline:version -->
> 📦 **Current version:** `0.1.16-dev.7` · [Releases](https://github.com/i-mrDedchai/iCline/releases) · [Changelog](https://github.com/i-mrDedchai/iCline/blob/main/apps/vscode/CHANGELOG.md) · [Repo](https://github.com/i-mrDedchai/iCline)
<!-- /icline:version -->

<!-- icline:repo -->
🔗 **GitHub:** [i-mrDedchai/iCline](https://github.com/i-mrDedchai/iCline)
<!-- /icline:repo -->

🌐 **Languages:** English (this page) · [ภาษาไทย](README.th.md)

Standalone Cline fork for VS Code — extension ID **`i-mrdedchai.iCline`**. **No official Cline required.** Supports Grok, ZenMux, OpenRouter, and other providers.

🤖 xAI Grok OAuth & Subscription, ZenMux, safe dual-channel updates, and hardened agent harness.

---

## ❓ FAQ

### Do I need official Cline installed first?

**No.** iCline is a complete extension on its own. Install from Marketplace or a `.vsix` from [Releases](https://github.com/i-mrDedchai/iCline/releases), open **iCline** in the Activity Bar, then sign in to **xAI · Grok** (or add an API key).

### Can I use iCline and official Cline together?

**Yes, optionally.** They are separate extensions (`i-mrdedchai.iCline` vs `saoudrizwan.claude-dev`) and can run side by side without conflicts. Many users run **only iCline**.

---

## ✨ Why iCline?

| | Cline official | iCline |
|---|---|---|
| Extension ID | `saoudrizwan.claude-dev` | `i-mrdedchai.iCline` |
| ⚡ Quick Provider & Model picker on chat | ❌ | ✅ |
| 🔐 xAI OAuth (SuperGrok / X Premium) | ❌ | ✅ |
| ⚡ Composer 2.5 Fast, Grok Build | ❌ | ✅ |
| 🌐 ZenMux (100+ models) | ❌ | ✅ |
| 🛡️ Harness guardrails (verify-before-claim) | ❌ | ✅ |
| 🔄 Dual-channel updates (iCline + upstream) | ❌ | ✅ |

### ⚡ Quick Provider & Model picker (chat)

Switch providers and models **without leaving the chat** — search all providers, collapse/expand model lists, set **Thinking / Effort per model** on hover, and refresh dynamic catalogs.

<p align="center">
  <img src="assets/docs/Preview-Settings-iCline-menu-Providers-Models.jpg" alt="iCline quick model picker on the chat input" width="720" />
</p>

The full provider catalog and deep model settings remain in **Settings → API Configuration**:

<p align="center">
  <img src="assets/docs/Preview-Settings-iCline-Providers-Models.jpg" alt="iCline Settings — Providers and Models" width="720" />
</p>

---

## 🚀 Getting started

1. Click the **iCline** icon in the Activity Bar (or `Ctrl+Shift+P` → `iCline: Open In New Tab`)
2. Open **Settings** ⚙️ → choose **xAI · Grok (OAuth & Subscription)** or another provider
3. Sign in or add an API key, pick a model such as **Composer 2.5 Fast** or **Grok Build**
4. Describe your task — iCline plans, reads code, edits files, and runs commands (after your approval)

> 💡 **Tip:** If the sidebar shows *Error loading webview* right after install, run **Developer: Reload Window** once and open iCline again (known VS Code on Windows timing issue).

---

## Features

- 🔐 **xAI · Grok** — OAuth (SuperGrok / X Premium), API key, Grok CLI auth bridge
- ⚡ **Composer 2.5 Fast**, **Grok Build**, subscription model catalog
- 🌐 **ZenMux** — 100+ models, multi-protocol
- 🛡️ Agent harness guardrails (verify-before-claim, post-write verification)
- 🔄 Dual-channel update notifications (iCline + Cline upstream)

## Updates

- **VS Marketplace:** VS Code / Cursor auto-check for new versions
- **GitHub Releases:** [github.com/i-mrDedchai/iCline/releases](https://github.com/i-mrDedchai/iCline/releases)

## Links

- 📦 [GitHub](https://github.com/i-mrDedchai/iCline)
- 📋 [Changelog](https://github.com/i-mrDedchai/iCline/blob/main/apps/vscode/CHANGELOG.md)
- 🔧 [Build from source](https://github.com/i-mrDedchai/iCline#build-from-source)

## License

Apache-2.0 — derived from [Cline](https://github.com/cline/cline).