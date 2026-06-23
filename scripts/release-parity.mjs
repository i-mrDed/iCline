#!/usr/bin/env node
/**
 * Release channel parity helpers — GitHub Release must exist before Marketplace publish.
 *
 * CLI:
 *   node scripts/release-parity.mjs verify --version 0.1.17
 *   node scripts/release-parity.mjs assert-github --version 0.1.17
 */

import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.join(__dirname, "..")
const manifestPath = path.join(repoRoot, "apps/vscode/scripts/icline-docs.manifest.json")
const packageJsonPath = path.join(repoRoot, "apps/vscode/package.json")

function loadManifest() {
	return JSON.parse(fs.readFileSync(manifestPath, "utf8"))
}

function loadPackageVersion() {
	const pkg = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"))
	return pkg.version
}

function normalizeReleaseVersion(version) {
	const match = /^(.+?)-dev\.\d+$/.exec(version)
	return match ? match[1] : version
}

async function readJson(url, init) {
	const res = await fetch(url, init)
	if (!res.ok) {
		const text = await res.text().catch(() => res.statusText)
		throw new Error(`${url} → ${res.status}: ${text}`)
	}
	return res.json()
}

export async function getGitHubRelease(owner, repo, version) {
	const tag = `v${version}`
	const url = `https://api.github.com/repos/${owner}/${repo}/releases/tags/${tag}`
	try {
		return await readJson(url, {
			headers: {
				Accept: "application/vnd.github+json",
				"User-Agent": "icline-release-parity",
			},
		})
	} catch (err) {
		if (String(err.message).includes("→ 404")) return null
		throw err
	}
}

export async function getOpenVsxVersion(namespace, extensionName, version) {
	const url = `https://open-vsx.org/api/${namespace}/${extensionName}/${version}`
	try {
		const json = await readJson(url)
		return json.version ?? null
	} catch (err) {
		if (String(err.message).includes("→ 404")) return null
		throw err
	}
}

export async function getVsMarketplaceVersion(publisher, extensionName) {
	const itemName = `${publisher}.${extensionName}`
	const res = await fetch("https://marketplace.visualstudio.com/_apis/public/gallery/extensionquery", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Accept: "application/json;api-version=3.0-preview.1",
		},
		body: JSON.stringify({
			filters: [{ criteria: [{ filterType: 7, value: itemName }] }],
			flags: 914,
		}),
	})
	if (!res.ok) {
		throw new Error(`VS Marketplace query failed: ${res.status}`)
	}
	const json = await res.json()
	const ext = json?.results?.[0]?.extensions?.[0]
	const version = ext?.versions?.[0]?.version
	return version ?? null
}

export async function assertGitHubReleaseBeforeMarketplace(version, manifest = loadManifest()) {
	const { owner, repo } = manifest.github
	const release = await getGitHubRelease(owner, repo, version)
	if (!release) {
		console.error(`
publish-marketplace: BLOCKED — no GitHub Release for v${version}.

Stable/Beta store publishes must go through release-icline.ps1 so GitHub Release + VSIX are created first:
  .\\scripts\\release-icline.ps1 -Channel Stable -Version ${version} -PublishMarketplace

Retroactive GitHub-only (store already published):
  .\\scripts\\release-icline.ps1 -Channel Stable -Version ${version} -GitHubOnly -SkipBuild -SkipPush -SkipSmokeCheck -MaintainerApproval "..."

Emergency bypass (not recommended):
  node scripts/publish-marketplace.mjs --allow-without-github-release
`)
		process.exit(1)
	}
	const vsixName = `i-mrdedchai.iCline-${version}.vsix`
	const hasVsix = (release.assets ?? []).some((asset) => asset.name === vsixName)
	if (!hasVsix) {
		console.error(`publish-marketplace: BLOCKED — GitHub Release v${version} exists but VSIX asset ${vsixName} is missing.`)
		process.exit(1)
	}
	console.log(`release-parity: GitHub Release v${version} OK (VSIX attached).`)
}

export async function verifyReleaseParity(version, manifest = loadManifest()) {
	const { owner, repo } = manifest.github
	const publisher = manifest.extensionId.split(".")[0]
	const extensionName = manifest.extensionId.split(".")[1] ?? "iCline"

	const github = await getGitHubRelease(owner, repo, version)
	const githubTag = github ? version : null
	const githubVsix = github
		? (github.assets ?? []).some((a) => a.name === `i-mrdedchai.iCline-${version}.vsix`)
		: false

	const openVsx = await getOpenVsxVersion(publisher, extensionName, version)
	const marketplace = await getVsMarketplaceVersion(publisher, extensionName)

	const rows = [
		{ channel: "GitHub tag v" + version, ok: !!githubTag, detail: githubTag ? github.html_url : "missing" },
		{ channel: "GitHub VSIX asset", ok: githubVsix, detail: githubVsix ? "attached" : "missing" },
		{ channel: "Open VSX", ok: openVsx === version, detail: openVsx ?? "not published" },
		{ channel: "VS Marketplace", ok: marketplace === version, detail: marketplace ?? "not published" },
	]

	let failed = false
	console.log(`\nRelease parity for ${version}:`)
	for (const row of rows) {
		const mark = row.ok ? "OK" : "MISSING"
		console.log(`  [${mark}] ${row.channel}: ${row.detail}`)
		if (!row.ok) failed = true
	}

	if (failed) {
		console.error("\nrelease-parity: FAILED — channels are out of sync.")
		process.exit(1)
	}
	console.log("\nrelease-parity: all channels aligned.")
}

async function main() {
	const args = process.argv.slice(2)
	const command = args[0] ?? "verify"
	let version = ""
	for (let i = 1; i < args.length; i++) {
		if (args[i] === "--version") version = args[++i]
	}
	if (!version) {
		version = normalizeReleaseVersion(loadPackageVersion())
	}

	if (command === "assert-github") {
		await assertGitHubReleaseBeforeMarketplace(version)
		return
	}
	if (command === "verify") {
		await verifyReleaseParity(version)
		return
	}
	console.error("Usage: node scripts/release-parity.mjs <verify|assert-github> [--version X.Y.Z]")
	process.exit(1)
}

const isCli =
	process.argv[1] &&
	path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))

if (isCli) {
	main().catch((err) => {
		console.error(err?.stack || String(err))
		process.exit(1)
	})
}