# Security Policy

## Supported versions

| Version | Supported |
| ------- | --------- |
| 0.1.x   | ✅        |

## Reporting a vulnerability

Please **do not** open public GitHub issues for security vulnerabilities.

Email or DM the maintainer via GitHub ([@i-mrDedchai](https://github.com/i-mrDedchai)) with:

- Description of the issue
- Steps to reproduce
- Impact assessment (if known)

We aim to respond within 7 days.

## Secrets handling

**Never commit:**

- API keys (xAI, ZenMux, Anthropic, OpenAI, etc.)
- `.env`, `secrets.json`, `*evals.env`
- OAuth refresh tokens or `~/.grok/auth.json` contents
- GitHub personal access tokens

iCline stores user credentials in **VS Code Secret Storage** and reads Grok CLI auth from the user's home directory only at runtime.

## OAuth client ID

The xAI OAuth client ID in `apps/vscode/src/integrations/xai/constants.ts` is a **public PKCE client identifier** — not a secret. It is safe to publish in source code.

## Fork lineage

iCline is derived from [Cline](https://github.com/cline/cline) (Apache-2.0). Security fixes in upstream Cline should be merged via `scripts/sync-upstream.ps1`.