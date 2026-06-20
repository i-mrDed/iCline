import * as fs from "node:fs"
import * as os from "node:os"
import * as path from "node:path"
import { XAI_OAUTH_CLIENT_ID } from "./constants"

interface GrokCliAuthEntry {
	key?: string
	refresh_token?: string
	expires_at?: string
	oidc_client_id?: string
}

export interface GrokCliToken {
	accessToken: string
	refreshToken?: string
	expiresAt?: Date
}

function grokHomeDir(): string {
	return process.env.GROK_HOME?.trim() || path.join(os.homedir(), ".grok")
}

function authFilePath(): string {
	return path.join(grokHomeDir(), "auth.json")
}

function parseJwtExpiry(token: string): Date | undefined {
	const parts = token.split(".")
	if (parts.length < 2) {
		return undefined
	}
	try {
		const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8")) as { exp?: number }
		if (!payload.exp) {
			return undefined
		}
		return new Date(payload.exp * 1000)
	} catch {
		return undefined
	}
}

function tokenIsExpiring(expiresAt?: Date, skewMs = 5 * 60_000): boolean {
	if (!expiresAt) {
		return false
	}
	return expiresAt.getTime() - skewMs <= Date.now()
}

function readAuthEntries(): Record<string, GrokCliAuthEntry> | undefined {
	const filePath = authFilePath()
	if (!fs.existsSync(filePath)) {
		return undefined
	}
	try {
		return JSON.parse(fs.readFileSync(filePath, "utf8")) as Record<string, GrokCliAuthEntry>
	} catch {
		return undefined
	}
}

function pickAuthEntry(entries: Record<string, GrokCliAuthEntry>): GrokCliAuthEntry | undefined {
	const preferredKey = `https://auth.x.ai::${XAI_OAUTH_CLIENT_ID}`
	if (entries[preferredKey]?.key) {
		return entries[preferredKey]
	}
	for (const entry of Object.values(entries)) {
		if (entry.key?.trim()) {
			return entry
		}
	}
	return undefined
}

/** Read a valid OAuth token from Grok Build CLI (~/.grok/auth.json). */
export function readGrokCliToken(): GrokCliToken | undefined {
	const entries = readAuthEntries()
	if (!entries) {
		return undefined
	}
	const entry = pickAuthEntry(entries)
	if (!entry) {
		return undefined
	}

	const accessToken = entry.key?.trim()
	if (!accessToken) {
		return undefined
	}

	const expiresAt = entry.expires_at ? new Date(entry.expires_at) : parseJwtExpiry(accessToken)
	if (tokenIsExpiring(expiresAt)) {
		return undefined
	}

	return {
		accessToken,
		refreshToken: entry.refresh_token,
		expiresAt,
	}
}