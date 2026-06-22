import { describe, expect, it, beforeEach } from "vitest"
import {
	getQuickStartPrompt,
	readQuickStartPromptOverrides,
	resetQuickStartPromptOverride,
	saveQuickStartPromptOverride,
} from "./quickStartPromptStorage"

describe("quickStartPromptStorage", () => {
	beforeEach(() => {
		localStorage.clear()
	})

	it("returns default prompt when no override exists", () => {
		expect(getQuickStartPrompt("icline_debug", "default prompt")).toBe("default prompt")
	})

	it("saves and reads overrides", () => {
		saveQuickStartPromptOverride("icline_debug", "custom prompt")
		expect(readQuickStartPromptOverrides()).toEqual({ icline_debug: "custom prompt" })
		expect(getQuickStartPrompt("icline_debug", "default prompt")).toBe("custom prompt")
	})

	it("resets overrides back to default", () => {
		saveQuickStartPromptOverride("icline_debug", "custom prompt")
		resetQuickStartPromptOverride("icline_debug")
		expect(readQuickStartPromptOverrides()).toEqual({})
	})
})