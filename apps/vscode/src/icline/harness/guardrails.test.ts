import { describe, it } from "mocha"
import "should"
import {
	createHarnessMistakeState,
	getIclineHarnessOverlay,
	incrementHarnessMistake,
	normalizeCompactionThreshold,
	totalHarnessMistakes,
} from "./guardrails"

describe("getIclineHarnessOverlay", () => {
	it("requires epistemic discipline for user factual claims", () => {
		const overlay = getIclineHarnessOverlay()
		overlay.should.containEql("Epistemic discipline")
		overlay.should.containEql("do not echo the user's factual claims")
		overlay.should.containEql("# Current Time")
	})

	it("requires ACT MODE conversational replies to use a tool", () => {
		const overlay = getIclineHarnessOverlay()
		overlay.should.containEql("attempt_completion")
		overlay.should.containEql("ask_followup_question")
	})

	it("retains verify-before-claim for technical work", () => {
		getIclineHarnessOverlay().should.containEql("Verify before claiming")
	})
})

describe("harness mistake counters", () => {
	it("tracks verification mistakes", () => {
		const state = createHarnessMistakeState()
		incrementHarnessMistake(state, "verification").should.equal(1)
		totalHarnessMistakes(state).should.equal(1)
	})
})

describe("normalizeCompactionThreshold", () => {
	it("clamps out-of-range values", () => {
		normalizeCompactionThreshold(0.1).should.equal(0.5)
		normalizeCompactionThreshold(0.99).should.equal(0.95)
	})
})