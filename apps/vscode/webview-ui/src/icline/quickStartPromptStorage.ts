const STORAGE_KEY = "icline-quick-start-prompt-overrides"

export type QuickStartPromptOverrides = Record<string, string>

export function readQuickStartPromptOverrides(): QuickStartPromptOverrides {
	try {
		const raw = localStorage.getItem(STORAGE_KEY)
		if (!raw) {
			return {}
		}
		const parsed = JSON.parse(raw) as QuickStartPromptOverrides
		return typeof parsed === "object" && parsed !== null ? parsed : {}
	} catch {
		return {}
	}
}

export function writeQuickStartPromptOverrides(overrides: QuickStartPromptOverrides): void {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides))
}

export function getQuickStartPrompt(taskId: string, defaultPrompt: string, overrides?: QuickStartPromptOverrides): string {
	const map = overrides ?? readQuickStartPromptOverrides()
	return map[taskId]?.trim() || defaultPrompt
}

export function saveQuickStartPromptOverride(taskId: string, prompt: string): QuickStartPromptOverrides {
	const overrides = readQuickStartPromptOverrides()
	const trimmed = prompt.trim()
	if (!trimmed) {
		delete overrides[taskId]
	} else {
		overrides[taskId] = trimmed
	}
	writeQuickStartPromptOverrides(overrides)
	return { ...overrides }
}

export function resetQuickStartPromptOverride(taskId: string): QuickStartPromptOverrides {
	const overrides = readQuickStartPromptOverrides()
	delete overrides[taskId]
	writeQuickStartPromptOverrides(overrides)
	return { ...overrides }
}