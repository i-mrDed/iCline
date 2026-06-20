# Changelog

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