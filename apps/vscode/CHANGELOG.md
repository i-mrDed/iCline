# Changelog

## [0.1.16-dev.4] - 2026-06-22

### Fixed
- 🐛 **Auto-approved commands stuck on Running** — stream command output without blocking on `command_output` asks; apply managed timeouts for auto-approved commands; mark command UI completed when orchestration returns (including timeout / proceed-while-running paths)

### Changed
- 🏠 **Review quick start** — read-only review wording; PowerShell-safe directory guidance (`Set-Location` instead of `cd /d`)

## [0.1.16-dev.3] - 2026-06-22

### Changed
- 📄 Docs auto-synced from `scripts/sync-icline-docs.mjs`

## [0.1.16-dev.2] - 2026-06-22

### Changed
- 📄 Docs auto-synced from `scripts/sync-icline-docs.mjs`

## [0.1.16-dev.1] - 2026-06-22

### Changed
- 📄 Docs auto-synced from `scripts/sync-icline-docs.mjs`

## [0.1.16] - Unreleased

### Changed
- 🏪 **Marketplace copy** — displayName `iCline — Standalone Coding Agent` (EN) / `iCline — เอเจนต์เขียนโค้ด (standalone)` (TH); description leads with “Cline fork” + provider line (Grok, ZenMux, OpenRouter, …); remove Grok-only signal from title

### Added
- 🏠 **Welcome home — Phase 1** — iCline branding on welcome screen, provider/model chip, twelve quick-start prompts (explain, refactor, tests, debug, review, architecture, security, CI, docs, plan, performance, dependencies); task history stays visible alongside iCline quick starts (unlike Cline hosted quick wins)

### Changed
- 🏠 **Quick Starts layout** — two-column grid for iCline templates (single column below 300px); welcome scroll includes quick starts so cards are not hidden behind Auto-approve / chat input
- 🎨 **iCline icon branding** — add `i` mark beside left ear on Activity Bar SVG (`icon.svg`) and Welcome compact icon; refresh 128×128 marketplace PNG; retrace sleepy logo from updated artwork (`sleepy-cline.svg`, `ClineLogoTired`); update panel robot PNGs (dark/light)

### Fixed
- 🐛 **Open VSX screenshots** — keep relative `assets/docs/` paths in packaged README (`vsce --no-rewrite-relative-links`; Open VSX blocks external GitHub URLs); `package-vsix.mjs` swaps marketplace README before `vsce package` so dev and publish builds match
- 🛡️ **Harness epistemic discipline** — do not echo user factual claims (e.g. wrong weekday in greetings); check `# Current Time` in environment_details before affirming date/time; politely correct conflicts instead of mirroring
- 🛡️ **ACT MODE conversational replies** — harness overlay now requires `attempt_completion` or `ask_followup_question` for chat-only turns (avoids plain-text replies that trigger “did not use a tool” loops)

## [0.1.15] - 2026-06-22

### Changed
- 📄 **Install messaging** — clarify that iCline is **standalone** (no official Cline required) across Marketplace description, GitHub README, `README.marketplace.md`, and Settings → About
- ❓ **FAQ** — add “Do I need official Cline?” / “Can I use both?” sections (EN + TH) on extension README and Marketplace Details

### Fixed
- 🐛 **User confusion** — replace “install alongside official Cline” one-liner that read like a prerequisite; optional side-by-side install is now explained separately

### Added
- 🌐 **Open VSX** — publish `i-mrdedchai/iCline` v0.1.15 on [Open VSX](https://open-vsx.org/extension/i-mrdedchai/iCline) so Cursor and other Open VSX–based IDEs can search and install iCline (same VSIX as VS Marketplace; no rebuild)

## [0.1.14] - 2026-06-21

### Fixed
- 🐛 **Marketplace Details page** — ship full `README.marketplace.md` (comparison table, preview screenshots, Thai link) instead of the minimal stub; sync absolute image URLs for Marketplace rendering
- 🐛 **Webview ServiceWorker error on Windows** — defer sidebar HTML assignment on cold start (VS Code race; see cline/cline#8920); README tip to **Reload Window** if it still appears once after install

## [0.1.13] - 2026-06-21

### Added
- ⚡ **Chat quick Provider & Model picker** — switch providers/models from the chat bar; search, collapse/expand provider groups, per-model Thinking/Effort on hover, status icons on chat + list rows, refresh dynamic catalogs
- 🔢 **Dev build numbering** — `release-icline.ps1 -Channel Dev` bumps `0.1.13-dev.N`; About shows `v0.1.13 · dev build N · timestamp`
- ⚙️ **Settings → About** — iCline + Cline (Official) sections; shows upstream Cline version synced in this fork
- 📸 **README previews** — chat picker & Settings screenshots under **Why iCline?** (`assets/docs/`)
- 🔗 Root **README** — Changelog link beside Releases
- 🏷️ **GitHub repo topics** script — `scripts/set-github-repo-topics.ps1`

### Changed
- 🏪 **Marketplace SEO** — displayName `iCline — Cline Fork (Grok & ZenMux)`, description leads with “Cline fork”, expanded keywords (`cline-fork`, `coding-assistant`, `vscode-extension`, …)
- 🏷️ VS Marketplace search tags — `grok-build`, `composer-2.5-fast`, `grok-4`, `grok-code`, `grok-cli`, `supergrok` (plus existing `composer`, `grok`, `xai`)
- 📄 **SECURITY.md / CONTRIBUTING.md** — maintainer contact → [@i-mrDedchai](https://github.com/i-mrDedchai)

## [0.1.12] - 2026-06-21

**Stable release** — GitHub Release + VS Marketplace (`i-mrdedchai.iCline`). ทดสอบ Grok: Composer 2.5 Fast, Grok 4.3, Grok Build.

### Fixed
- 🐛 **Webview blank / UI not loading** — remove dev-only `localhost:8097` script and broken `node_modules` codicon link from production HTML (codicons already bundled in `index.css`)

## [0.1.11] - 2026-06-21

### Fixed
- 🐛 **xAI / Grok (Composer 2.5 Fast, subscription)** — handle Responses API `function_call_arguments` streaming; stop emitting empty `attempt_completion` tool calls that caused `without value for required parameter 'result'. Retrying...`
- 🐛 **attempt_completion** — canonicalize alias fields (`message`, `response`, `summary`, etc.) into `result` for models that use non-standard parameter names

### Added
- 🚦 **Release gates** — Dev / Beta / Stable channels with interactive smoke checklist (`scripts/icline-smoke-checklist.ps1`, `scripts/release-icline.ps1 -Channel`)

## [0.1.10] - 2026-06-21

### Changed
- 🏪 Marketplace publisher **`i-mrdedchai`** — extension ID **`i-mrdedchai.iCline`**
- 🐙 GitHub moved to org **[i-mrDedchai/iCline](https://github.com/i-mrDedchai/iCline)** (`i-mrDed` account kept for other projects)

## [0.1.9] - 2026-06-21

### Changed
- 🎨 New extension icon (128×128 PNG)
- 🏪 Marketplace publisher ID **`i-mrded`** — extension ID is now **`i-mrded.iCline`** (VS Marketplace requires lowercase publisher slug)

## [0.1.8] - 2026-06-20

### Fixed
- 🐛 **Extension collision** — migrate commands/views/settings to `iCline.*` prefix so `i-mrDed.iCline` no longer conflicts with legacy `icline.icline` installs (fixes missing sidebar / duplicate registration errors)

### Added
- 📦 VS Marketplace docs: `README.marketplace.md`, `.clinerules/workflows/icline-marketplace.md`

### Changed
- ⚙️ Settings keys: `icline.updates.*` → `iCline.updates.*`

## [0.1.7] - 2026-06-20

### Fixed
- 🐛 **xAI / Grok models** — register `xai` as a next-gen provider and Grok agent models (Composer, Build, Code) so native tool calling is enabled; fixes `Native tool calling must be enabled to use xAI subscription and CLI models`

## [0.1.6] - 2026-06-20

### Changed
- 🆔 Extension ID **`i-mrDed.iCline`** (publisher `i-mrDed`) — aligns with GitHub repo owner
- 🌐 Bilingual docs: `README.md` (English) + `README.th.md` (ภาษาไทย)
- 🗣️ VS Code marketplace strings: `package.nls.json` + `package.nls.th.json`

### Added
- 📦 Initial public release on [GitHub](https://github.com/i-mrDed/iCline) with CONTRIBUTING & SECURITY guides

## [0.1.5] - 2026-06-20

### Fixed
- 💰 Subscription models (Grok 4.3, etc.) show **Included in subscription** instead of pay-as-you-go pricing
- 🟡 **Sign Out OAuth** now shows amber CLI-only badge when `~/.grok/auth.json` is still active (explains why status remains connected)
- 📢 Update toast says **iCline has been updated** (not Cline)

## [0.1.4] - 2026-06-20

### Added
- 🌐 **xAI subscription model catalog** — fetches chat models from `api.x.ai/v1/models` for your OAuth account (Grok 4.3, Grok 4.20, etc.)
- 📋 Model picker shows **CLI models + full subscription list** when signed in

### Fixed
- 🐛 Subscription models (e.g. Grok 4.3) now use **Responses API** on `api.x.ai` with OAuth token — fixes empty/unparsable API errors

## [0.1.3] - 2026-06-20

### Fixed
- 🐛 **xAI OAuth** — filter model list to subscription-only models (Composer 2.5 Fast, Grok Build) when signed in without API key
- 🛡️ Runtime guard: clear error if subscription auth is used with pay-as-you-go models (or vice versa)
- 🔄 Auto-reset incompatible model when auth mode changes

### Added
- 🟢 **Auth connection badge** — green status indicator for xAI, OpenAI Codex, and ZenMux

## [0.1.2] - 2026-06-20

### Added
- 📄 **Auto doc sync** — `scripts/sync-icline-docs.mjs` อัปเดต README, CHANGELOG, package.json, provider labels ก่อน package
- 🔗 GitHub repo ตั้งเป็น [i-mrDed/iCline](https://github.com/i-mrDed/iCline)
- 📦 คำสั่ง `npm run sync:docs` และ `npm run package:vsix`

### Changed
- 🏷️ Provider xAI เปลี่ยนชื่อเป็น **xAI · Grok (OAuth & Subscription)**
- 🎨 README & CHANGELOG เพิ่ม emoji / ไอคอนให้อ่านง่ายขึ้น
- ⚙️ Default `icline.updates.releasesUrl` → `i-mrDed/iCline` releases API

## [0.1.1] - 2026-06-20

### Added
- 🌐 **ZenMux** provider (`zenmux`) — multi-protocol support (OpenAI, Anthropic, Responses, Gemini)
- 🔑 PAYG + Subscription API keys, optional Management API key for balance/quota display
- 📋 Dynamic model picker from `zenmux.ai/api/v1/models`
- 🎯 Provider routing (latency / price / throughput)
- 🔗 Console links: Sign in, PAYG, Subscription, Management keys

## [0.1.0] - 2026-06-20

### Added
- 🎉 Rebrand เป็น **iCline** แยกจาก Cline official (ตอนนี้ใช้ ID `i-mrDed.iCline`)
- 🔐 **xAI OAuth** — Sign in/out, token refresh, Grok CLI auth bridge
- ⚡ โมเดล **Composer 2.5 Fast**, **Grok Build**, Grok 4.3
- 🛡️ Agent harness guardrails (verify-before-claim, post-write verify, compaction clamp)
- 🔄 Dual-channel update service (iCline releases + Cline upstream notification)
- 📢 คำสั่ง `iCline: Check for Updates`
- ⚙️ Settings `icline.updates.*`

### Changed
- 🏷️ Commands และ Activity Bar ใช้ prefix `icline.*`
- 🤖 System prompt ระบุตัวตนเป็น iCline เมื่อรันภายใต้ extension นี้