#!/usr/bin/env node
/**
 * Changelog rules for iCline dev / release channels.
 *
 * Dev builds (0.1.x-dev.N) must NOT create changelog sections.
 * During development, accumulate notes under `## [0.1.x] - Unreleased`.
 * On Stable, finalize Unreleased → dated release and seed the next Unreleased stub.
 *
 * CLI:
 *   node scripts/changelog-release.mjs finalize --version 0.1.16 --file apps/vscode/CHANGELOG.md
 *   node scripts/changelog-release.mjs validate-stable --version 0.1.16 --file apps/vscode/CHANGELOG.md
 *   node scripts/changelog-release.mjs validate-dev --file apps/vscode/CHANGELOG.md
 *   node scripts/changelog-release.mjs seed-next --file apps/vscode/CHANGELOG.md
 */

import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function todayIso() {
	return new Date().toISOString().slice(0, 10)
}

function escapeRegExp(value) {
	return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

export function isDevVersion(version) {
	return /-dev\.\d+$/.test(version)
}

export function hasDevChangelogSections(changelog) {
	return /^## \[[^\]]+-dev\.\d+\]/m.test(changelog)
}

export function hasReleaseSection(changelog, version) {
	const unreleased = `## [${version}] - Unreleased`
	const dated = new RegExp(`^## \\[${escapeRegExp(version)}\\] - \\d{4}-\\d{2}-\\d{2}`, "m")
	return changelog.includes(unreleased) || dated.test(changelog) || changelog.includes(`## [${version}]`)
}

export function finalizeUnreleased(changelog, version, date = todayIso()) {
	const unreleased = `## [${version}] - Unreleased`
	if (!changelog.includes(unreleased)) {
		return { changelog, changed: false }
	}
	return {
		changelog: changelog.replace(unreleased, `## [${version}] - ${date}`),
		changed: true,
	}
}

export function seedNextUnreleased(changelog) {
	const match = changelog.match(/^## \[(\d+)\.(\d+)\.(\d+)\] - \d{4}-\d{2}-\d{2}/m)
	if (!match) {
		return { changelog, changed: false, nextVersion: null }
	}
	const nextVersion = `${match[1]}.${match[2]}.${Number(match[3]) + 1}`
	const header = `## [${nextVersion}] - Unreleased`
	if (changelog.includes(header)) {
		return { changelog, changed: false, nextVersion }
	}
	if (!changelog.startsWith("# Changelog\n\n")) {
		return { changelog, changed: false, nextVersion }
	}
	const updated = changelog.replace("# Changelog\n\n", `# Changelog\n\n${header}\n\n`)
	return { changelog: updated, changed: true, nextVersion }
}

/** Used by sync-icline-docs — never inject 0.1.x-dev.N sections. */
export function ensureChangelogVersion(changelog, version) {
	if (isDevVersion(version)) {
		return changelog
	}
	if (hasReleaseSection(changelog, version)) {
		return changelog
	}
	return changelog
}

function parseArgs(argv) {
	const args = { command: "", version: "", file: "" }
	for (let i = 2; i < argv.length; i++) {
		const arg = argv[i]
		if (!args.command && !arg.startsWith("-")) {
			args.command = arg
		} else if (arg === "--version") {
			args.version = argv[++i]
		} else if (arg === "--file") {
			args.file = argv[++i]
		}
	}
	return args
}

function readChangelog(filePath) {
	if (!fs.existsSync(filePath)) {
		throw new Error(`CHANGELOG not found: ${filePath}`)
	}
	return fs.readFileSync(filePath, "utf8")
}

function writeChangelog(filePath, content) {
	fs.writeFileSync(filePath, content, "utf8")
}

function main() {
	const args = parseArgs(process.argv)
	if (!args.command || !args.file) {
		console.error(
			"Usage: node scripts/changelog-release.mjs <finalize|validate-stable|validate-dev|seed-next> --file path [--version x.y.z]",
		)
		process.exit(1)
	}

	const filePath = path.isAbsolute(args.file) ? args.file : path.join(process.cwd(), args.file)
	let changelog = readChangelog(filePath)

	if (args.command === "finalize") {
		if (!args.version) {
			console.error("finalize requires --version")
			process.exit(1)
		}
		const result = finalizeUnreleased(changelog, args.version)
		if (result.changed) {
			writeChangelog(filePath, result.changelog)
			console.log(`changelog-release: finalized [${args.version}] - Unreleased`)
		} else {
			console.log(`changelog-release: no Unreleased header for [${args.version}]`)
		}
		return
	}

	if (args.command === "validate-stable") {
		if (!args.version) {
			console.error("validate-stable requires --version")
			process.exit(1)
		}
		const errors = []
		if (hasDevChangelogSections(changelog)) {
			errors.push("CHANGELOG still contains ## [x.y.z-dev.N] sections — consolidate under the Stable release, then delete dev entries.")
		}
		if (!hasReleaseSection(changelog, args.version)) {
			errors.push(
				`Missing release section for [${args.version}]. Add ## [${args.version}] - Unreleased while developing, then run Stable.`,
			)
		}
		if (errors.length) {
			console.error("changelog-release: Stable gate failed:\n- " + errors.join("\n- "))
			process.exit(1)
		}
		console.log(`changelog-release: Stable changelog OK for [${args.version}]`)
		return
	}

	if (args.command === "validate-dev") {
		if (hasDevChangelogSections(changelog)) {
			console.error(
				"changelog-release: remove ## [x.y.z-dev.N] sections from CHANGELOG. Dev builds use VSIX labels only; notes go under ## [x.y.z] - Unreleased.",
			)
			process.exit(1)
		}
		console.log("changelog-release: Dev changelog OK (no dev.N sections)")
		return
	}

	if (args.command === "seed-next") {
		const result = seedNextUnreleased(changelog)
		if (result.changed) {
			writeChangelog(filePath, result.changelog)
			console.log(`changelog-release: seeded ## [${result.nextVersion}] - Unreleased`)
		} else if (result.nextVersion) {
			console.log(`changelog-release: [${result.nextVersion}] - Unreleased already present`)
		} else {
			console.log("changelog-release: no dated release found to seed next Unreleased")
		}
		return
	}

	console.error(`Unknown command: ${args.command}`)
	process.exit(1)
}

const invokedAsCli = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))
if (invokedAsCli) {
	try {
		main()
	} catch (err) {
		console.error(`changelog-release: ${err.message}`)
		process.exit(1)
	}
}