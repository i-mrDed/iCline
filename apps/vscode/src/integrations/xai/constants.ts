export const XAI_DEFAULT_BASE_URL = "https://api.x.ai/v1"
export const XAI_CLI_PROXY_BASE_URL = "https://cli-chat-proxy.grok.com/v1"
export const XAI_GROK_CLI_VERSION = "0.2.56"

export const XAI_OAUTH_ISSUER = "https://auth.x.ai"
export const XAI_OAUTH_DISCOVERY_URL = `${XAI_OAUTH_ISSUER}/.well-known/openid-configuration`
export const XAI_OAUTH_CLIENT_ID = "b1a00492-073a-47ea-816f-4c329264a828"
export const XAI_OAUTH_SCOPE = "openid profile email offline_access grok-cli:access api:access"
export const XAI_OAUTH_REDIRECT_HOST = "127.0.0.1"
export const XAI_OAUTH_REDIRECT_PORT = 56121
export const XAI_OAUTH_REDIRECT_PATH = "/callback"

export const XAI_OAUTH_CREDENTIALS_KEY = "xai-oauth-credentials"

import { xaiCliModelIds } from "@shared/api"

/** Models routed through the Grok Build CLI proxy (OAuth / subscription required). */
export const XAI_CLI_MODEL_IDS = new Set<string>(xaiCliModelIds)

export function isXaiCliModel(modelId: string): boolean {
	return XAI_CLI_MODEL_IDS.has(modelId)
}