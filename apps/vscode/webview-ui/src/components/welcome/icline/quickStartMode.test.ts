import { describe, expect, it } from "vitest"
import { resolveQuickStartMode, shouldShowHistoryPreview } from "./quickStartMode"

describe("resolveQuickStartMode", () => {
	it("shows Cline quick wins on hosted app with few tasks", () => {
		expect(resolveQuickStartMode(true, 0)).toBe("cline")
		expect(resolveQuickStartMode(true, 2)).toBe("cline")
	})

	it("shows iCline quick starts off hosted app with few tasks", () => {
		expect(resolveQuickStartMode(false, 0)).toBe("icline")
		expect(resolveQuickStartMode(false, 1)).toBe("icline")
	})

	it("hides Cline quick wins when hosted history threshold is reached", () => {
		expect(resolveQuickStartMode(true, 3)).toBe("none")
	})

	it("keeps iCline quick starts visible regardless of history length", () => {
		expect(resolveQuickStartMode(false, 3)).toBe("icline")
		expect(resolveQuickStartMode(false, 5)).toBe("icline")
	})
})

describe("shouldShowHistoryPreview", () => {
	it("hides history for Cline quick wins mode", () => {
		expect(shouldShowHistoryPreview("cline", 2)).toBe(false)
	})

	it("shows history for iCline quick starts when tasks exist", () => {
		expect(shouldShowHistoryPreview("icline", 2)).toBe(true)
	})

	it("shows history when quick starts are off", () => {
		expect(shouldShowHistoryPreview("none", 1)).toBe(true)
	})
})