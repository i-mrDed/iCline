import type { QuickWinTask } from "../quickWinTasks"

export const iclineQuickStartTasks: QuickWinTask[] = [
	{
		id: "icline_explain_code",
		title: "Explain this codebase",
		description: "Walk through structure, entry points, and how pieces connect",
		icon: "ExplainIcon",
		actionCommand: "icline/quickStartExplain",
		prompt:
			"Explore this workspace and explain how the project is organized: main folders, entry points, and how the important modules connect. Keep it practical for a developer onboarding to the repo.",
		buttonText: ">",
	},
	{
		id: "icline_refactor",
		title: "Refactor safely",
		description: "Pick a small, verifiable improvement without a large rewrite",
		icon: "RefactorIcon",
		actionCommand: "icline/quickStartRefactor",
		prompt:
			"Find one focused refactor opportunity in this codebase (naming, duplication, or clarity). Propose a small, verifiable change — not a speculative rewrite — and implement it with tests if they exist.",
		buttonText: ">",
	},
	{
		id: "icline_write_tests",
		title: "Write tests",
		description: "Add or extend tests around a critical path",
		icon: "TestIcon",
		actionCommand: "icline/quickStartTests",
		prompt:
			"Identify a critical code path that lacks adequate tests. Add focused unit or integration tests using the project's existing test stack. Run the relevant tests and report results.",
		buttonText: ">",
	},
	{
		id: "icline_debug",
		title: "Debug an issue",
		description: "Reproduce, isolate root cause, and fix with evidence",
		icon: "DebugIcon",
		actionCommand: "icline/quickStartDebug",
		prompt:
			"Help me debug an issue in this project. Ask what symptom I see if needed, then reproduce with commands, isolate root cause with evidence, and apply the smallest fix that solves it.",
		buttonText: ">",
	},
]