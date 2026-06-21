#!/usr/bin/env node
/**
 * Build GitHub Release notes body from CHANGELOG.md for a given version.
 * Usage:
 *   node scripts/extract-release-notes.mjs 0.1.13
 *   node scripts/extract-release-notes.mjs 0.1.13 --out-file /path/to/body.md
 */

import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { extractChangelogSection } from "../apps/vscode/scripts/sync-icline-docs.mjs"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.join(__dirname, "..")
const changelogPath = path.join(repoRoot, "apps/vscode/CHANGELOG.md")

function parseArgs(argv) {
	const args = { version: "", outFile: "" }
	for (let i = 2; i < argv.length; i++) {
		const arg = argv[i]
		if (arg === "--out-file") args.outFile = argv[++i]
		else if (!args.version) args.version = arg
	}
	return args
}

const args = parseArgs(process.argv)
if (!args.version) {
	console.error("Usage: node scripts/extract-release-notes.mjs <version> [--out-file path]")
	process.exit(1)
}

const changelog = fs.readFileSync(changelogPath, "utf8")
const section = extractChangelogSection(changelog, args.version) ?? "See CHANGELOG.md"
const body = `## iCline v${args.version}

${section}

### Install
\`\`\`powershell
code --install-extension i-mrdedchai.iCline-${args.version}.vsix --force
\`\`\`
Then **Developer: Reload Window**.`

if (args.outFile) {
	fs.writeFileSync(args.outFile, body, "utf8")
} else {
	process.stdout.write(body)
}