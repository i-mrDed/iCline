import { isXaiCliModelId } from "@shared/api"
import { isXaiCliModel } from "./constants"
import { readGrokCliToken } from "./grok-cli-auth"
import { xaiOAuthManager } from "./oauth"

export type XaiAuthMode = "subscription" | "api_key"

export interface XaiResolvedAuth {
	mode: XaiAuthMode
	token: string
}

/** Resolve bearer token and whether it is subscription OAuth vs pay-as-you-go API key. */
export async function resolveXaiAuth(apiKey?: string): Promise<XaiResolvedAuth> {
	const oauthToken = await xaiOAuthManager.getAccessToken()
	if (oauthToken) {
		return { mode: "subscription", token: oauthToken }
	}

	const cliToken = readGrokCliToken()
	if (cliToken?.accessToken) {
		return { mode: "subscription", token: cliToken.accessToken }
	}

	const key = apiKey?.trim()
	if (key) {
		return { mode: "api_key", token: key }
	}

	throw new Error(
		"xAI authentication required. Sign in with OAuth (SuperGrok / X Premium), use Grok Build CLI auth, or set an API key.",
	)
}

export function assertXaiModelMatchesAuth(mode: XaiAuthMode, modelId: string): void {
	if (mode === "api_key" && (isXaiCliModel(modelId) || isXaiCliModelId(modelId))) {
		throw new Error(
			`Model "${modelId}" requires xAI OAuth (SuperGrok / X Premium) or Grok CLI sign-in. ` +
				"Choose a pay-as-you-go API model instead.",
		)
	}
}

/** @deprecated Use resolveXaiAuth().token */
export async function resolveXaiAccessToken(apiKey?: string): Promise<string | null> {
	try {
		const auth = await resolveXaiAuth(apiKey)
		return auth.token
	} catch {
		return null
	}
}