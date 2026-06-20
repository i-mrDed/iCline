#!/usr/bin/env node
/**
 * Sync iCline extension docs from package.json version + icline-docs.manifest.json.
 * Runs before vsce package / vscode:prepublish so Details, Changelog, and settings stay current.
 */

import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const extRoot = path.join(__dirname, "..")
const repoRoot = path.join(extRoot, "../..")

const MANIFEST_PATH = path.join(__dirname, "icline-docs.manifest.json")
const PACKAGE_PATH = path.join(extRoot, "package.json")
const README_PATH = path.join(extRoot, "README.md")
const README_TH_PATH = path.join(extRoot, "README.th.md")
const CHANGELOG_PATH = path.join(extRoot, "CHANGELOG.md")
const PROVIDERS_PATH = path.join(extRoot, "src/shared/providers/providers.json")
const UPDATE_SERVICE_PATH = path.join(extRoot, "src/icline/updates/UpdateService.ts")
const ICLINE_MD_PATH = path.join(repoRoot, "../ICLINE.md")

function readJson(p) {
	return JSON.parse(fs.readFileSync(p, "utf-8"))
}

function writeJson(p, data) {
	fs.writeFileSync(p, `${JSON.stringify(data, null, "\t")}\n`, "utf-8")
}

function releasesApiUrl(manifest) {
	const { owner, repo } = manifest.github
	return `https://api.github.com/repos/${owner}/${repo}/releases/latest`
}

function todayIso() {
	return new Date().toISOString().slice(0, 10)
}

function ensureChangelogVersion(changelog, version) {
	const header = `## [${version}]`
	if (changelog.includes(header)) {
		return changelog
	}
	const entry = `# Changelog

${header} - ${todayIso()}

### Changed
- 📄 Docs auto-synced from \`scripts/sync-icline-docs.mjs\`

`
	if (changelog.startsWith("# Changelog")) {
		return changelog.replace("# Changelog\n\n", entry.replace("# Changelog\n\n", "# Changelog\n\n"))
	}
	return entry + changelog
}

function patchReadme(readme, { version, manifest, releasesUrl }) {
	const { url } = manifest.github
	let next = readme

	const extId = manifest.extensionId || "i-mrDed.iCline"
	const isThai = /README\.th\.md$/i.test(readme) || /ภาษาไทย|เวอร์ชันปัจจุบัน/.test(readme.slice(0, 800))
	const versionLine = isThai
		? `> 📦 **เวอร์ชันปัจจุบัน:** \`${version}\` · [Releases](${url}/releases) · [Repo](${url})`
		: `> 📦 **Current version:** \`${version}\` · [Releases](${url}/releases) · [Repo](${url})`

	// Version badge / footer
	next = next.replace(
		/<!-- icline:version -->[\s\S]*?<!-- \/icline:version -->/,
		`<!-- icline:version -->\n${versionLine}\n<!-- /icline:version -->`,
	)
	if (!next.includes("<!-- icline:version -->")) {
		const insert = `\n<!-- icline:version -->\n${versionLine}\n<!-- /icline:version -->\n`
		next = next.replace(/^# iCline\n/, `# iCline\n${insert}`)
	}

	// Extension ID in comparison table
	next = next.replace(/\| `icline\.icline` \|/g, `| \`${extId}\` |`)
	next = next.replace(/\(`icline\.icline`\)/g, `(\`${extId}\`)`)

	// GitHub repo link block
	next = next.replace(
		/<!-- icline:repo -->[\s\S]*?<!-- \/icline:repo -->/,
		`<!-- icline:repo -->\n🔗 **GitHub:** [${manifest.github.owner}/${manifest.github.repo}](${url})\n<!-- /icline:repo -->`,
	)
	if (!next.includes("<!-- icline:repo -->")) {
		next = next.replace(
			/\*\*iCline\*\* คือ fork/,
			`<!-- icline:repo -->\n🔗 **GitHub:** [${manifest.github.owner}/${manifest.github.repo}](${url})\n<!-- /icline:repo -->\n\n**iCline** คือ fork`,
		)
	}

	// Releases URL in settings table
	next = next.replace(
		/\| `icline\.updates\.releasesUrl` \| URL GitHub Releases API \| .*? \|/,
		`| \`icline.updates.releasesUrl\` | URL GitHub Releases API | \`${releasesUrl}\` |`,
	)

	// Example releasesUrl code block
	next = next.replace(
		/```\nhttps:\/\/api\.github\.com\/repos\/.*?\/releases\/latest\n```/,
		`\`\`\`\n${releasesUrl}\n\`\`\``,
	)

	// xAI provider name in getting started
	next = next.replace(
		/เลือก \*\*xAI\*\* แล้วกด/,
		`เลือก **${manifest.providers.xai}** แล้วกด`,
	)

	return next
}

function patchProviders(providers, manifest) {
	const list = providers.list.map((p) => {
		if (p.value === "xai" && manifest.providers.xai) {
			return { ...p, label: manifest.providers.xai }
		}
		if (p.value === "zenmux" && manifest.providers.zenmux) {
			return { ...p, label: manifest.providers.zenmux }
		}
		return p
	})
	return { ...providers, list }
}

function patchUpdateService(source, releasesUrl) {
	return source.replace(
		/const DEFAULT_ICLINE_RELEASES_URL = ".*?"/,
		`const DEFAULT_ICLINE_RELEASES_URL = "${releasesUrl}"`,
	)
}

function patchIclineMd(source, { version, manifest, releasesUrl }) {
	if (!source) return source
	const { url } = manifest.github
	let next = source
	next = next.replace(
		/<!-- icline:version -->[\s\S]*?<!-- \/icline:version -->/,
		`<!-- icline:version -->\n> 📦 เวอร์ชัน \`${version}\` — [Releases](${url}/releases)\n<!-- /icline:version -->`,
	)
	if (!next.includes("<!-- icline:version -->")) {
		next = next.replace(/^# iCline\n/, `# iCline\n\n<!-- icline:version -->\n> 📦 เวอร์ชัน \`${version}\` — [Releases](${url}/releases)\n<!-- /icline:version -->\n`)
	}
	next = next.replace(
		/- `icline\.updates\.releasesUrl`/,
		`- \`icline.updates.releasesUrl\` (default: \`${releasesUrl}\`)`,
	)
	return next
}

function sync() {
	const manifest = readJson(MANIFEST_PATH)
	const pkg = readJson(PACKAGE_PATH)
	const version = pkg.version
	const releasesUrl = releasesApiUrl(manifest)
	const { url } = manifest.github

	// package.json
	pkg.description = manifest.description
	pkg.repository = { type: "git", url }
	pkg.homepage = url
	pkg.keywords = manifest.keywords
	if (pkg.contributes?.configuration?.properties?.["icline.updates.releasesUrl"]) {
		pkg.contributes.configuration.properties["icline.updates.releasesUrl"].default = releasesUrl
	}
	writeJson(PACKAGE_PATH, pkg)

	// providers.json
	const providers = readJson(PROVIDERS_PATH)
	writeJson(PROVIDERS_PATH, patchProviders(providers, manifest))

	// README.md (EN) + README.th.md (TH)
	for (const readmePath of [README_PATH, README_TH_PATH]) {
		if (fs.existsSync(readmePath)) {
			const readme = fs.readFileSync(readmePath, "utf-8")
			fs.writeFileSync(readmePath, patchReadme(readme, { version, manifest, releasesUrl }), "utf-8")
		}
	}

	// CHANGELOG.md
	if (fs.existsSync(CHANGELOG_PATH)) {
		let changelog = fs.readFileSync(CHANGELOG_PATH, "utf-8")
		changelog = ensureChangelogVersion(changelog, version)
		fs.writeFileSync(CHANGELOG_PATH, changelog, "utf-8")
	}

	// UpdateService.ts
	if (fs.existsSync(UPDATE_SERVICE_PATH)) {
		const src = fs.readFileSync(UPDATE_SERVICE_PATH, "utf-8")
		fs.writeFileSync(UPDATE_SERVICE_PATH, patchUpdateService(src, releasesUrl), "utf-8")
	}

	// Root ICLINE.md
	if (fs.existsSync(ICLINE_MD_PATH)) {
		const md = fs.readFileSync(ICLINE_MD_PATH, "utf-8")
		fs.writeFileSync(ICLINE_MD_PATH, patchIclineMd(md, { version, manifest, releasesUrl }), "utf-8")
	}

	console.log(`sync-icline-docs: v${version} → ${url}`)
	console.log(`  releases API: ${releasesUrl}`)
	return { version, releasesUrl, url }
}

const invokedAsCli = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))
if (invokedAsCli) {
	try {
		sync()
	} catch (err) {
		console.error(`sync-icline-docs: ${err.message}`)
		process.exit(1)
	}
}

export { sync, releasesApiUrl }