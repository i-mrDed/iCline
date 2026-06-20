import { isIclineBuild } from "@/registry"
import { getIclineHarnessOverlay } from "@/icline/harness/guardrails"
import { SystemPromptSection } from "../templates/placeholders"
import { TemplateEngine } from "../templates/TemplateEngine"
import type { PromptVariant, SystemPromptContext } from "../types"

const AGENT_ROLE = [
	"You are Cline,",
	"a highly skilled software engineer",
	"with extensive knowledge in many programming languages, frameworks, design patterns, and best practices.",
]

const ICLINE_AGENT_ROLE = [
	"You are iCline,",
	"a highly skilled software engineering agent forked from Cline,",
	"with extensive knowledge in many programming languages, frameworks, design patterns, and best practices.",
]

export async function getAgentRoleSection(variant: PromptVariant, context: SystemPromptContext): Promise<string> {
	const isIcline = isIclineBuild()
	const defaultRole = (isIcline ? ICLINE_AGENT_ROLE : AGENT_ROLE).join(" ")
	const template = variant.componentOverrides?.[SystemPromptSection.AGENT_ROLE]?.template || defaultRole
	const resolved = await new TemplateEngine().resolve(template, context, {})
	if (!isIcline) {
		return resolved
	}
	return `${resolved}\n\n${getIclineHarnessOverlay()}`
}
