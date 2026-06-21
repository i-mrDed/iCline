import { VSCodeLink } from "@vscode/webview-ui-toolkit/react"
import { ICLINE_BUILD_METADATA } from "@/icline/build-metadata"
import Section from "../Section"

interface AboutSectionProps {
	version: string
	renderSectionHeader: (tabId: string) => JSX.Element | null
}

const ICLINE_EXTENSION_ID = "i-mrdedchai.iCline"
const ICLINE_GITHUB = "https://github.com/i-mrDedchai/iCline"
const ICLINE_RELEASES = "https://github.com/i-mrDedchai/iCline/releases"
const ICLINE_CHANGELOG = "https://github.com/i-mrDedchai/iCline/blob/main/apps/vscode/CHANGELOG.md"
const ICLINE_MARKETPLACE = "https://marketplace.visualstudio.com/items?itemName=i-mrdedchai.iCline"

const ICLINE_FEATURE_HIGHLIGHTS = [
	"xAI Grok — OAuth (SuperGrok / X Premium), API key, and Grok CLI auth",
	"Composer 2.5 Fast, Grok Build, and subscription model catalog",
	"ZenMux — 100+ models, multi-protocol, PAYG & subscription keys",
	"Agent harness — verify-before-claim and post-write verification",
	"Dual-channel updates — iCline releases and Cline upstream notifications",
]

function formatAboutVersionTitle(version: string): string {
	const { releaseVersion, devBuildNumber, devBuildLabel, builtAt } = ICLINE_BUILD_METADATA
	if (devBuildNumber != null && devBuildLabel) {
		return `iCline v${releaseVersion} · ${devBuildLabel} · ${builtAt}`
	}
	return `iCline v${releaseVersion || version}`
}

const AboutSection = ({ version, renderSectionHeader }: AboutSectionProps) => {
	return (
		<div>
			{renderSectionHeader("about")}
			<Section>
				<div className="flex px-4 flex-col gap-4">
					{/* iCline (this extension) */}
					<div className="flex flex-col gap-2">
						<h2 className="text-lg font-semibold">{formatAboutVersionTitle(version)}</h2>
						<p className="text-description text-sm">
							Extension ID: <code className="text-foreground">{ICLINE_EXTENSION_ID}</code>
							<br />
							Based on Cline official{" "}
							<code className="text-foreground">{ICLINE_BUILD_METADATA.upstreamClineSyncedVersion}</code>
							{" "}(synced {ICLINE_BUILD_METADATA.upstreamClineSyncedAt})
						</p>
						<p>
							iCline is a fork of Cline packaged as a separate VS Code extension. Install it alongside official Cline
							(<code className="text-foreground">saoudrizwan.claude-dev</code>) without conflicts — each extension
							updates on its own channel.
						</p>
						<h3 className="text-md font-semibold">iCline highlights</h3>
						<ul className="list-disc pl-5 flex flex-col gap-1">
							{ICLINE_FEATURE_HIGHLIGHTS.map((item) => (
								<li key={item}>{item}</li>
							))}
						</ul>
						<h3 className="text-md font-semibold">iCline links</h3>
						<p>
							<VSCodeLink href={ICLINE_GITHUB}>GitHub</VSCodeLink>
							{" • "}
							<VSCodeLink href={ICLINE_RELEASES}>Releases</VSCodeLink>
							{" • "}
							<VSCodeLink href={ICLINE_CHANGELOG}>Changelog</VSCodeLink>
							{" • "}
							<VSCodeLink href={ICLINE_MARKETPLACE}>Marketplace</VSCodeLink>
						</p>
					</div>

					<hr className="border-0 border-t border-[var(--vscode-panel-border)]" />

					{/* Cline official (upstream) */}
					<div className="flex flex-col gap-2">
						<h2 className="text-lg font-semibold">Cline (Official)</h2>
						<p className="text-description text-sm">
							Extension ID: <code className="text-foreground">saoudrizwan.claude-dev</code>
							<br />
							Latest upstream in this fork:{" "}
							<code className="text-foreground">{ICLINE_BUILD_METADATA.upstreamClineSyncedVersion}</code>
						</p>
						<p>
							An AI assistant that can use your CLI and Editor. Cline can handle complex software development tasks
							step-by-step with tools that let him create & edit files, explore large projects, use the browser, and
							execute terminal commands (after you grant permission).
						</p>

						<h3 className="text-md font-semibold">Community & Support</h3>
						<p>
							<VSCodeLink href="https://x.com/cline">X</VSCodeLink>
							{" • "}
							<VSCodeLink href="https://discord.gg/cline">Discord</VSCodeLink>
							{" • "}
							<VSCodeLink href="https://www.reddit.com/r/cline/">r/cline</VSCodeLink>
						</p>

						<h3 className="text-md font-semibold">Development</h3>
						<p>
							<VSCodeLink href="https://github.com/cline/cline">GitHub</VSCodeLink>
							{" • "}
							<VSCodeLink href="https://github.com/cline/cline/issues">Issues</VSCodeLink>
							{" • "}
							<VSCodeLink href="https://github.com/cline/cline/discussions/categories/feature-requests?discussions_q=is%3Aopen+category%3A%22Feature+Requests%22+sort%3Atop">
								Feature Requests
							</VSCodeLink>
						</p>

						<h3 className="text-md font-semibold">Resources</h3>
						<p>
							<VSCodeLink href="https://docs.cline.bot/">Documentation</VSCodeLink>
							{" • "}
							<VSCodeLink href="https://cline.bot/">https://cline.bot</VSCodeLink>
						</p>
					</div>
				</div>
			</Section>
		</div>
	)
}

export default AboutSection