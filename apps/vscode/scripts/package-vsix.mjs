#!/usr/bin/env node
import { spawnSync } from "node:child_process"
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const extRoot = path.join(__dirname, "..")
const pkg = JSON.parse(fs.readFileSync(path.join(extRoot, "package.json"), "utf-8"))
const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, "icline-docs.manifest.json"), "utf-8"))
const base = manifest.vsixFileName || manifest.extensionId || "i-mrdedchai.iCline"
const out = path.join(extRoot, "dist", `${base}-${pkg.version}.vsix`)

const result = spawnSync("npx", ["vsce", "package", "--no-dependencies", "--out", out], {
	stdio: "inherit",
	shell: process.platform === "win32",
	cwd: extRoot,
})
process.exit(result.status ?? 1)