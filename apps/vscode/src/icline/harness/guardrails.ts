import * as fs from "node:fs/promises"
import * as path from "node:path"

/** Categories for harness mistake tracking (Fable-inspired: precise failure modes). */
export type HarnessMistakeCategory = "format" | "logic" | "loop" | "stall" | "verification"

export interface HarnessMistakeState {
	format: number
	logic: number
	loop: number
	stall: number
	verification: number
}

export function createHarnessMistakeState(): HarnessMistakeState {
	return { format: 0, logic: 0, loop: 0, stall: 0, verification: 0 }
}

export function incrementHarnessMistake(state: HarnessMistakeState, category: HarnessMistakeCategory): number {
	state[category] += 1
	return totalHarnessMistakes(state)
}

export function resetHarnessMistakeCategory(state: HarnessMistakeState, category: HarnessMistakeCategory): void {
	state[category] = 0
}

export function totalHarnessMistakes(state: HarnessMistakeState): number {
	return state.format + state.logic + state.loop + state.stall + state.verification
}

/** Clamp auto-compact threshold to avoid accidental early compaction (known Cline footgun). */
export function normalizeCompactionThreshold(raw?: number): number {
	if (raw === undefined || Number.isNaN(raw)) {
		return 0.75
	}
	if (raw < 0.5) {
		return 0.5
	}
	if (raw > 0.95) {
		return 0.95
	}
	return raw
}

export interface PostWriteVerificationResult {
	ok: boolean
	message: string
}

/**
 * Lightweight post-write verification: file exists and is non-empty when content was expected.
 * Inspired by Fable-style epistemic checks — verify claims against filesystem reality.
 */
export async function verifyWrittenFile(params: {
	absolutePath: string
	expectedMinBytes?: number
}): Promise<PostWriteVerificationResult> {
	try {
		const stat = await fs.stat(params.absolutePath)
		if (!stat.isFile()) {
			return { ok: false, message: `Verification failed: ${params.absolutePath} is not a file after write.` }
		}
		const minBytes = params.expectedMinBytes ?? 1
		if (stat.size < minBytes) {
			return {
				ok: false,
				message: `Verification failed: ${path.basename(params.absolutePath)} is empty or too small (${stat.size} bytes).`,
			}
		}
		return { ok: true, message: `Verified write: ${path.basename(params.absolutePath)} (${stat.size} bytes).` }
	} catch (error) {
		const msg = error instanceof Error ? error.message : String(error)
		return { ok: false, message: `Verification failed: could not read ${params.absolutePath} (${msg}).` }
	}
}

/** Harness overlay text — behavioral guardrails aligned with robust agent patterns. */
export function getIclineHarnessOverlay(): string {
	return `ICLINE HARNESS GUARDRAILS
- Verify before claiming: read files, run commands, and inspect outputs before stating something is done.
- On tool errors: acknowledge what failed, do not repeat the identical failing call; change strategy.
- On ambiguous requests: ask one focused clarifying question OR proceed with the safest minimal assumption and state it.
- On partial progress: summarize what changed, what remains, and the next concrete step.
- Prefer small, verifiable edits over large speculative rewrites.
- When context is tight: preserve task goal, recent decisions, and file paths touched.`
}