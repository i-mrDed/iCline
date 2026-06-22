#!/usr/bin/env node

// Publishes the marketplace-flavored VSIX to VS Marketplace (vsce) and Open VSX (ovsx).
// Packages via package-vsix.mjs first so README.marketplace.md (relative image paths) is inside the VSIX.
//
// Usage:
//   node scripts/publish-marketplace.mjs                  # release channel
//   node scripts/publish-marketplace.mjs --pre-release    # pre-release channel

import { spawnSync } from "node:child_process"
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const extRoot = path.join(__dirname, "..")
const isPrerelease = process.argv.includes("--pre-release")
const spawnOpts = { stdio: "inherit", shell: process.platform === "win32", cwd: extRoot }

function run(cmd, args) {
	const result = spawnSync(cmd, args, spawnOpts)
	if (result.status !== 0) {
		process.exit(result.status ?? 1)
	}
}

const pkg = JSON.parse(fs.readFileSync(path.join(extRoot, "package.json"), "utf8"))
const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, "icline-docs.manifest.json"), "utf8"))
const base = manifest.vsixFileName || manifest.extensionId || "i-mrdedchai.iCline"
const vsixPath = path.join(extRoot, "dist", `${base}-${pkg.version}.vsix`)

console.log(`publish-marketplace: packaging ${pkg.version} with marketplace README...`)
run("node", [path.join(__dirname, "package-vsix.mjs")])

if (!fs.existsSync(vsixPath)) {
	console.error(`publish-marketplace: VSIX not found at ${vsixPath}`)
	process.exit(1)
}

const vsceArgs = ["publish", "--no-dependencies", "-i", vsixPath, "--allow-package-secrets", "sendgrid"]
if (isPrerelease) {
	vsceArgs.push("--pre-release")
}
console.log(`publish-marketplace: uploading to VS Marketplace...`)
run("npx", ["@vscode/vsce", ...vsceArgs])

const ovsxArgs = ["ovsx", "publish", vsixPath]
if (isPrerelease) {
	ovsxArgs.push("--pre-release")
}
console.log(`publish-marketplace: uploading to Open VSX...`)
const ovsx = spawnSync("npx", ovsxArgs, spawnOpts)
if (ovsx.status !== 0) {
	console.warn("publish-marketplace: ovsx publish skipped or failed (VS Marketplace publish may still have succeeded)")
	process.exit(ovsx.status ?? 1)
}

console.log("publish-marketplace: done.")