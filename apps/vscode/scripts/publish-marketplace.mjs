#!/usr/bin/env node

// Publishes to Open VSX and VS Marketplace with the same README image baseline:
// relative assets/docs/ in source → vsce rewrites to GitHub absolute URLs in the VSIX.
// See scripts/marketplace-images.mjs and บันทึกแชท/2026-06/2026-06-23_01_openvsx-readme-images-root-cause.md
//
// Usage:
//   node scripts/publish-marketplace.mjs                  # release channel
//   node scripts/publish-marketplace.mjs --pre-release    # pre-release channel

import { spawnSync } from "node:child_process"
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"
import { restore, swapIn } from "./marketplace-readme.mjs"
import { getVsceImageRewriteArgs } from "./marketplace-images.mjs"

const allowWithoutGithub = process.argv.includes("--allow-without-github-release")

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const extRoot = path.join(__dirname, "..")
const isPrerelease = process.argv.includes("--pre-release")
const spawnOpts = { stdio: "inherit", shell: process.platform === "win32", cwd: extRoot }

const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, "icline-docs.manifest.json"), "utf8"))
const pkg = JSON.parse(fs.readFileSync(path.join(extRoot, "package.json"), "utf8"))
const releaseVersion = pkg.version.replace(/^(.+?)-dev\.\d+$/, "$1")
const base = manifest.vsixFileName || manifest.extensionId || "i-mrdedchai.iCline"
const vsixPath = path.join(extRoot, "dist", `${base}-${pkg.version}.vsix`)

const { assertGitHubReleaseBeforeMarketplace } = await import(
	pathToFileURL(path.join(extRoot, "..", "..", "scripts", "release-parity.mjs")).href
)

if (!allowWithoutGithub && !isPrerelease) {
	await assertGitHubReleaseBeforeMarketplace(releaseVersion, manifest)
}

function run(cmd, args) {
	const result = spawnSync(cmd, args, spawnOpts)
	if (result.status !== 0) {
		process.exit(result.status ?? 1)
	}
}

console.log(`publish-marketplace: packaging ${pkg.version} (README images → GitHub via --baseImagesUrl)...`)
run("node", [path.join(__dirname, "package-vsix.mjs")])

if (!fs.existsSync(vsixPath)) {
	console.error(`publish-marketplace: VSIX not found at ${vsixPath}`)
	process.exit(1)
}

const ovsxArgs = ["ovsx", "publish", vsixPath]
if (isPrerelease) {
	ovsxArgs.push("--pre-release")
}
console.log("publish-marketplace: uploading to Open VSX...")
const ovsx = spawnSync("npx", ovsxArgs, spawnOpts)
if (ovsx.status !== 0) {
	console.error("publish-marketplace: Open VSX publish failed")
	process.exit(ovsx.status ?? 1)
}

const swapResult = swapIn()
let interrupted = false
const cleanupOnSignal = (exitCode) => () => {
	interrupted = true
	try {
		if (!swapResult.skipped) {
			restore()
		}
	} catch (err) {
		console.error(`marketplace-readme: failed to restore on signal: ${err.message}`)
	}
	process.exit(exitCode)
}
process.on("SIGINT", cleanupOnSignal(130))
process.on("SIGTERM", cleanupOnSignal(143))

try {
	const vsceArgs = [
		"publish",
		"--no-dependencies",
		"--allow-package-secrets",
		"sendgrid",
		...getVsceImageRewriteArgs(manifest),
	]
	if (isPrerelease) {
		vsceArgs.push("--pre-release")
	}
	console.log("publish-marketplace: uploading to VS Marketplace (rewrite README images to GitHub)...")
	run("npx", ["@vscode/vsce", ...vsceArgs])
} finally {
	if (!interrupted && !swapResult.skipped) {
		restore()
	}
}

console.log("publish-marketplace: done.")