#!/usr/bin/env node
/**
 * Build GitHub Release notes body from CHANGELOG.md for a given version.
 * Usage: node scripts/extract-release-notes.mjs 0.1.13
 */

import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { extractChangelogSection } from "../apps/vscode/scripts/sync-icline-docs.mjs"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.join(__dirname, "..")
const changelogPath = path.join(repoRoot, "apps/vscode/CHANGELOG.md")

const ver = process.argv[2]
if (!ver) {
	console.error("Usage: node scripts/extract-release-notes.mjs <version>")
	process.exit(1)
}

const changelog = fs.readFileSync(changelogPath, "utf8")
const section = extractChangelogSection(changelog, ver) ?? "See CHANGELOG.md"
const body = `## iCline v${ver}

${section}

### Install
\`\`\`powershell
code --install-extension i-mrdedchai.iCline-${ver}.vsix --force
\`\`\`
Then **Developer: Reload Window**.`

process.stdout.write(body)