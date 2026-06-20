import * as crypto from "crypto"
import * as http from "http"
import { URL } from "url"
import { z } from "zod"
import { StateManager } from "@/core/storage/StateManager"
import { fetch } from "@/shared/net"
import { Logger } from "@/shared/services/Logger"
import {
	XAI_OAUTH_CLIENT_ID,
	XAI_OAUTH_CREDENTIALS_KEY,
	XAI_OAUTH_DISCOVERY_URL,
	XAI_OAUTH_REDIRECT_HOST,
	XAI_OAUTH_REDIRECT_PATH,
	XAI_OAUTH_REDIRECT_PORT,
	XAI_OAUTH_SCOPE,
} from "./constants"

const redirectUri = `http://${XAI_OAUTH_REDIRECT_HOST}:${XAI_OAUTH_REDIRECT_PORT}${XAI_OAUTH_REDIRECT_PATH}`

const oauthDiscoverySchema = z.object({
	authorization_endpoint: z.string().min(1),
	token_endpoint: z.string().min(1),
})

const xaiCredentialsSchema = z.object({
	type: z.literal("xai"),
	access_token: z.string().min(1),
	refresh_token: z.string().min(1),
	expires: z.number(),
	email: z.string().optional(),
	discovery: oauthDiscoverySchema,
})

export type XaiOAuthCredentials = z.infer<typeof xaiCredentialsSchema>

const tokenResponseSchema = z.object({
	access_token: z.string(),
	refresh_token: z.string().optional(),
	id_token: z.string().optional(),
	expires_in: z.number(),
	email: z.string().optional(),
	token_type: z.string().optional(),
})

class XaiOAuthTokenError extends Error {
	public readonly status?: number
	public readonly errorCode?: string

	constructor(message: string, opts?: { status?: number; errorCode?: string }) {
		super(message)
		this.name = "XaiOAuthTokenError"
		this.status = opts?.status
		this.errorCode = opts?.errorCode
	}

	public isLikelyInvalidGrant(): boolean {
		if (this.errorCode && /invalid_grant/i.test(this.errorCode)) {
			return true
		}
		if (this.status === 400 || this.status === 401 || this.status === 403) {
			return /invalid_grant|revoked|expired|invalid refresh/i.test(this.message)
		}
		return false
	}
}

export function generateCodeVerifier(): string {
	return crypto.randomBytes(32).toString("base64url")
}

export function generateCodeChallenge(verifier: string): string {
	return crypto.createHash("sha256").update(verifier).digest().toString("base64url")
}

export function generateState(): string {
	return crypto.randomBytes(16).toString("hex")
}

async function discoverOAuthEndpoints(): Promise<z.infer<typeof oauthDiscoverySchema>> {
	const response = await fetch(XAI_OAUTH_DISCOVERY_URL, {
		headers: { Accept: "application/json" },
		signal: AbortSignal.timeout(15_000),
	})
	if (!response.ok) {
		throw new Error(`xAI OIDC discovery failed with HTTP ${response.status}`)
	}
	const payload = await response.json()
	return oauthDiscoverySchema.parse(payload)
}

function buildAuthorizationUrl(params: {
	authorizationEndpoint: string
	codeChallenge: string
	state: string
	nonce: string
}): string {
	const query = new URLSearchParams({
		response_type: "code",
		client_id: XAI_OAUTH_CLIENT_ID,
		redirect_uri: redirectUri,
		scope: XAI_OAUTH_SCOPE,
		code_challenge: params.codeChallenge,
		code_challenge_method: "S256",
		state: params.state,
		nonce: params.nonce,
		plan: "generic",
		referrer: "cline",
	})
	return `${params.authorizationEndpoint}?${query.toString()}`
}

async function exchangeCodeForTokens(params: {
	tokenEndpoint: string
	code: string
	codeVerifier: string
	discovery: z.infer<typeof oauthDiscoverySchema>
}): Promise<XaiOAuthCredentials> {
	const body = new URLSearchParams({
		grant_type: "authorization_code",
		code: params.code,
		redirect_uri: redirectUri,
		client_id: XAI_OAUTH_CLIENT_ID,
		code_verifier: params.codeVerifier,
	})

	const response = await fetch(params.tokenEndpoint, {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
			Accept: "application/json",
		},
		body,
		signal: AbortSignal.timeout(30_000),
	})

	const text = await response.text()
	if (!response.ok) {
		if (response.status === 403) {
			throw new Error(
				`xAI token exchange denied (HTTP 403). Your subscription may not include OAuth API access. Response: ${text}`,
			)
		}
		throw new Error(`xAI token exchange failed (HTTP ${response.status}): ${text}`)
	}

	const tokenResponse = tokenResponseSchema.parse(JSON.parse(text))
	if (!tokenResponse.refresh_token) {
		throw new Error("xAI token exchange did not return a refresh_token")
	}

	return {
		type: "xai",
		access_token: tokenResponse.access_token,
		refresh_token: tokenResponse.refresh_token,
		expires: Date.now() + tokenResponse.expires_in * 1000,
		email: tokenResponse.email,
		discovery: params.discovery,
	}
}

async function refreshAccessToken(credentials: XaiOAuthCredentials): Promise<XaiOAuthCredentials> {
	const body = new URLSearchParams({
		grant_type: "refresh_token",
		client_id: XAI_OAUTH_CLIENT_ID,
		refresh_token: credentials.refresh_token,
	})

	const response = await fetch(credentials.discovery.token_endpoint, {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
			Accept: "application/json",
		},
		body,
		signal: AbortSignal.timeout(30_000),
	})

	const text = await response.text()
	if (!response.ok) {
		throw new XaiOAuthTokenError(
			`xAI token refresh failed (HTTP ${response.status}): ${text}`,
			{ status: response.status },
		)
	}

	const tokenResponse = tokenResponseSchema.parse(JSON.parse(text))
	return {
		type: "xai",
		access_token: tokenResponse.access_token,
		refresh_token: tokenResponse.refresh_token ?? credentials.refresh_token,
		expires: Date.now() + tokenResponse.expires_in * 1000,
		email: tokenResponse.email ?? credentials.email,
		discovery: credentials.discovery,
	}
}

function isTokenExpired(credentials: XaiOAuthCredentials): boolean {
	const bufferMs = 2 * 60 * 1000
	return Date.now() >= credentials.expires - bufferMs
}

export class XaiOAuthManager {
	private credentials: XaiOAuthCredentials | null = null
	private refreshPromise: Promise<XaiOAuthCredentials> | null = null
	private pendingAuth: {
		codeVerifier: string
		state: string
		nonce: string
		discovery: z.infer<typeof oauthDiscoverySchema>
		server?: http.Server
	} | null = null

	async forceRefreshAccessToken(): Promise<string | null> {
		if (!this.credentials) {
			await this.loadCredentials()
		}
		if (!this.credentials) {
			return null
		}
		try {
			if (!this.refreshPromise) {
				this.refreshPromise = refreshAccessToken(this.credentials)
			}
			const newCredentials = await this.refreshPromise
			this.refreshPromise = null
			await this.saveCredentials(newCredentials)
			return newCredentials.access_token
		} catch (error) {
			this.refreshPromise = null
			Logger.error("[xai-oauth] Failed to force refresh token:", error)
			if (error instanceof XaiOAuthTokenError && error.isLikelyInvalidGrant()) {
				await this.clearCredentials()
			}
			return null
		}
	}

	async loadCredentials(): Promise<XaiOAuthCredentials | null> {
		try {
			const stateManager = StateManager.get()
			const credentialsJson = stateManager.getSecretKey(XAI_OAUTH_CREDENTIALS_KEY)
			if (!credentialsJson) {
				return null
			}
			this.credentials = xaiCredentialsSchema.parse(JSON.parse(credentialsJson))
			return this.credentials
		} catch (error) {
			Logger.error("[xai-oauth] Failed to load credentials:", error)
			return null
		}
	}

	async saveCredentials(credentials: XaiOAuthCredentials): Promise<void> {
		const stateManager = StateManager.get()
		stateManager.setSecret(XAI_OAUTH_CREDENTIALS_KEY, JSON.stringify(credentials))
		await stateManager.flushPendingState()
		this.credentials = credentials
	}

	async clearCredentials(): Promise<void> {
		const stateManager = StateManager.get()
		stateManager.setSecret(XAI_OAUTH_CREDENTIALS_KEY, undefined)
		await stateManager.flushPendingState()
		this.credentials = null
	}

	async getAccessToken(): Promise<string | null> {
		if (!this.credentials) {
			await this.loadCredentials()
		}
		if (!this.credentials) {
			return null
		}

		if (isTokenExpired(this.credentials)) {
			try {
				if (!this.refreshPromise) {
					this.refreshPromise = refreshAccessToken(this.credentials)
				}
				const newCredentials = await this.refreshPromise
				this.refreshPromise = null
				await this.saveCredentials(newCredentials)
			} catch (error) {
				this.refreshPromise = null
				Logger.error("[xai-oauth] Failed to refresh token:", error)
				if (error instanceof XaiOAuthTokenError && error.isLikelyInvalidGrant()) {
					await this.clearCredentials()
				}
				return null
			}
		}

		return this.credentials.access_token
	}

	async isAuthenticated(): Promise<boolean> {
		if (!this.credentials) {
			await this.loadCredentials()
		}
		return this.credentials !== null
	}

	async startAuthorizationFlow(): Promise<string> {
		this.cancelAuthorizationFlow()
		const discovery = await discoverOAuthEndpoints()
		const codeVerifier = generateCodeVerifier()
		const codeChallenge = generateCodeChallenge(codeVerifier)
		const state = generateState()
		const nonce = generateState()

		this.pendingAuth = { codeVerifier, state, nonce, discovery }
		return buildAuthorizationUrl({
			authorizationEndpoint: discovery.authorization_endpoint,
			codeChallenge,
			state,
			nonce,
		})
	}

	async waitForCallback(): Promise<XaiOAuthCredentials> {
		if (!this.pendingAuth) {
			throw new Error("No pending xAI authorization flow")
		}

		if (this.pendingAuth.server) {
			try {
				this.pendingAuth.server.close()
			} catch {}
			this.pendingAuth.server = undefined
		}

		const pending = this.pendingAuth

		return new Promise((resolve, reject) => {
			const server = http.createServer(async (req, res) => {
				try {
					const url = new URL(req.url || "/", `http://${XAI_OAUTH_REDIRECT_HOST}`)
					if (url.pathname !== XAI_OAUTH_REDIRECT_PATH) {
						res.writeHead(404)
						res.end("Not found")
						return
					}

					const code = url.searchParams.get("code")
					const state = url.searchParams.get("state")
					const error = url.searchParams.get("error")

					if (error) {
						res.writeHead(400)
						res.end(`Authentication failed: ${error}`)
						reject(new Error(`OAuth error: ${error}`))
						server.close()
						return
					}

					if (!code || !state) {
						res.writeHead(400)
						res.end("Missing code or state parameter")
						reject(new Error("Missing code or state parameter"))
						server.close()
						return
					}

					if (state !== pending.state) {
						res.writeHead(400)
						res.end("State mismatch")
						reject(new Error("State mismatch"))
						server.close()
						return
					}

					try {
						const credentials = await exchangeCodeForTokens({
							tokenEndpoint: pending.discovery.token_endpoint,
							code,
							codeVerifier: pending.codeVerifier,
							discovery: pending.discovery,
						})
						await this.saveCredentials(credentials)
						res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" })
						res.end(
							"<html><body><h2>xAI Grok sign-in complete</h2><p>You can close this tab and return to Cline.</p></body></html>",
						)
						this.pendingAuth = null
						server.close()
						resolve(credentials)
					} catch (exchangeError) {
						res.writeHead(500)
						res.end(`Token exchange failed: ${exchangeError}`)
						reject(exchangeError)
						server.close()
					}
				} catch (err) {
					res.writeHead(500)
					res.end("Internal server error")
					reject(err)
					server.close()
				}
			})

			const timeout = setTimeout(
				() => {
					server.close()
					reject(new Error("Authentication timed out"))
				},
				5 * 60 * 1000,
			)

			server.on("error", (err: NodeJS.ErrnoException) => {
				this.pendingAuth = null
				clearTimeout(timeout)
				if (err.code === "EADDRINUSE") {
					reject(
						new Error(
							`Port ${XAI_OAUTH_REDIRECT_PORT} is already in use. Close other OAuth sessions and try again.`,
						),
					)
				} else {
					reject(err)
				}
			})

			server.listen(XAI_OAUTH_REDIRECT_PORT, XAI_OAUTH_REDIRECT_HOST, () => {
				if (this.pendingAuth) {
					this.pendingAuth.server = server
				}
			})

			server.on("close", () => clearTimeout(timeout))
		})
	}

	cancelAuthorizationFlow(): void {
		if (this.pendingAuth?.server) {
			this.pendingAuth.server.close()
		}
		this.pendingAuth = null
	}
}

export const xaiOAuthManager = new XaiOAuthManager()

export { resolveXaiAccessToken } from "./auth-mode"