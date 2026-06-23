#!/usr/bin/env node
/**
 * Create (or reuse) a GitHub Release and upload the VSIX asset.
 * Usage:
 *   GITHUB_TOKEN=... node scripts/publish-github-release.mjs \
 *     --version 0.1.13 \
 *     --body-file /path/to/body.md \
 *     --vsix /path/to/file.vsix \
 *     --owner i-mrDedchai \
 *     --repo iCline \
 *     [--prerelease]
 */

import fs from "node:fs"

function parseArgs(argv) {
	const args = {
		version: "",
		bodyFile: "",
		vsix: "",
		owner: "",
		repo: "",
		prerelease: false,
	}
	for (let i = 2; i < argv.length; i++) {
		const arg = argv[i]
		if (arg === "--version") args.version = argv[++i]
		else if (arg === "--body-file") args.bodyFile = argv[++i]
		else if (arg === "--vsix") args.vsix = argv[++i]
		else if (arg === "--owner") args.owner = argv[++i]
		else if (arg === "--repo") args.repo = argv[++i]
		else if (arg === "--prerelease") args.prerelease = true
	}
	return args
}

function apiHeaders(token) {
	return {
		Authorization: `Bearer ${token}`,
		Accept: "application/vnd.github+json",
		"X-GitHub-Api-Version": "2022-11-28",
		"User-Agent": "icline-release-publish",
	}
}

async function readError(response) {
	const text = await response.text()
	try {
		const json = JSON.parse(text)
		return JSON.stringify(json, null, 2)
	} catch {
		return text || response.statusText
	}
}

async function main() {
	const args = parseArgs(process.argv)
	const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN
	if (!token) {
		console.error("GITHUB_TOKEN (or GH_TOKEN) is required.")
		process.exit(1)
	}
	for (const [key, value] of Object.entries(args)) {
		if (key === "prerelease") continue
		if (!value) {
			console.error(`Missing required argument: ${key}`)
			process.exit(1)
		}
	}
	if (!fs.existsSync(args.bodyFile)) {
		console.error(`Body file not found: ${args.bodyFile}`)
		process.exit(1)
	}
	if (!fs.existsSync(args.vsix)) {
		console.error(`VSIX not found: ${args.vsix}`)
		process.exit(1)
	}

	const body = fs.readFileSync(args.bodyFile, "utf8")
	const releasesApi = `https://api.github.com/repos/${args.owner}/${args.repo}/releases`
	const tagName = `v${args.version}`
	const releaseName = `iCline v${args.version}`
	const payload = {
		tag_name: tagName,
		target_commitish: "main",
		name: releaseName,
		body,
		draft: false,
		prerelease: args.prerelease,
		make_latest: !args.prerelease,
	}

	let release
	const createRes = await fetch(releasesApi, {
		method: "POST",
		headers: { ...apiHeaders(token), "Content-Type": "application/json; charset=utf-8" },
		body: JSON.stringify(payload),
	})

	if (createRes.ok) {
		release = await createRes.json()
		console.log(`Created release ${tagName}.`)
	} else if (createRes.status === 422) {
		const lookupRes = await fetch(`${releasesApi}/tags/${tagName}`, {
			headers: apiHeaders(token),
		})
		if (!lookupRes.ok) {
			console.error(`Create release failed (${createRes.status}):\n${await readError(createRes)}`)
			console.error(`Lookup release failed (${lookupRes.status}):\n${await readError(lookupRes)}`)
			process.exit(1)
		}
		release = await lookupRes.json()
		console.log(`Release ${tagName} already exists — updating notes and checking VSIX.`)

		const patchRes = await fetch(`${releasesApi}/${release.id}`, {
			method: "PATCH",
			headers: { ...apiHeaders(token), "Content-Type": "application/json; charset=utf-8" },
			body: JSON.stringify({
				name: releaseName,
				body,
				prerelease: args.prerelease,
			}),
		})
		if (!patchRes.ok) {
			console.error(`Update release body failed (${patchRes.status}):\n${await readError(patchRes)}`)
			process.exit(1)
		}
		release = await patchRes.json()
	} else {
		console.error(`Create release failed (${createRes.status}):\n${await readError(createRes)}`)
		process.exit(1)
	}

	const vsixName = `i-mrdedchai.iCline-${args.version}.vsix`
	const existingAsset = (release.assets ?? []).find((asset) => asset.name === vsixName)
	if (existingAsset) {
		console.log(`VSIX already uploaded: ${vsixName}`)
		console.log(release.html_url)
		return
	}

	const uploadUrl = release.upload_url.replace(/\{.*\}/, `?name=${encodeURIComponent(vsixName)}`)
	const vsixBytes = fs.readFileSync(args.vsix)

	const uploadRes = await fetch(uploadUrl, {
		method: "POST",
		headers: {
			...apiHeaders(token),
			"Content-Type": "application/octet-stream",
		},
		body: vsixBytes,
	})

	if (!uploadRes.ok) {
		console.error(`Upload VSIX failed (${uploadRes.status}):\n${await readError(uploadRes)}`)
		process.exit(1)
	}

	console.log(`Uploaded ${vsixName}.`)
	console.log(release.html_url)
}

main().catch((err) => {
	console.error(err?.stack || String(err))
	process.exit(1)
})