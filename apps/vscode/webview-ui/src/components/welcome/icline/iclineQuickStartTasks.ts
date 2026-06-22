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
	{
		id: "icline_review_changes",
		title: "Review my changes",
		description: "Code review: risks, gaps, and concrete improvements",
		icon: "ReviewIcon",
		actionCommand: "icline/quickStartReview",
		prompt:
			"Review this workspace like a senior engineer: inspect recent or high-churn areas, call out bugs, edge cases, style issues, and missing tests. Cite specific files and line areas — no vague praise. Prioritize the top 3 actionable fixes.",
		buttonText: ">",
	},
	{
		id: "icline_architecture_review",
		title: "Architecture review",
		description: "Assess structure, coupling, and maintainability risks",
		icon: "ArchitectureIcon",
		actionCommand: "icline/quickStartArchitecture",
		prompt:
			"Perform an architecture review of this project: module boundaries, coupling, layering, and scalability or maintenance risks. Map the main data and control flows. Recommend structural improvements ranked by impact and effort — explain trade-offs, do not rewrite everything at once.",
		buttonText: ">",
	},
	{
		id: "icline_security_pass",
		title: "Security pass",
		description: "Lightweight audit for secrets, injection, and unsafe patterns",
		icon: "SecurityIcon",
		actionCommand: "icline/quickStartSecurity",
		prompt:
			"Run a lightweight security review of this codebase: hardcoded secrets, unsafe dependencies, injection surfaces, auth/session handling, and risky file or shell operations. Cite evidence from the repo. List findings by severity with suggested fixes.",
		buttonText: ">",
	},
	{
		id: "icline_fix_ci",
		title: "Fix CI / failing tests",
		description: "Read logs, reproduce failures, and get the pipeline green",
		icon: "CiIcon",
		actionCommand: "icline/quickStartCi",
		prompt:
			"Help fix failing CI or tests in this project. Find the test or build commands, reproduce failures locally, diagnose root cause from logs, and apply the smallest fix. Re-run the relevant commands and report pass/fail with evidence.",
		buttonText: ">",
	},
	{
		id: "icline_update_docs",
		title: "Update docs",
		description: "Sync README, comments, and docs with the actual code",
		icon: "DocsIcon",
		actionCommand: "icline/quickStartDocs",
		prompt:
			"Audit documentation in this repo (README, CHANGELOG, inline comments, API docs). Find sections that are stale or missing compared to the code. Propose and apply focused updates — accurate, concise, no marketing fluff.",
		buttonText: ">",
	},
	{
		id: "icline_plan_feature",
		title: "Plan a feature",
		description: "Break down scope, files, risks — plan before coding",
		icon: "PlanIcon",
		actionCommand: "icline/quickStartPlan",
		prompt:
			"Help me plan a feature in this codebase without writing code yet. Ask clarifying questions if needed, then outline scope, affected files/modules, implementation steps, test strategy, and risks. Keep the plan actionable for a single PR or small series of PRs.",
		buttonText: ">",
	},
	{
		id: "icline_performance_check",
		title: "Performance check",
		description: "Spot bottlenecks, heavy bundles, or wasteful patterns",
		icon: "PerformanceIcon",
		actionCommand: "icline/quickStartPerformance",
		prompt:
			"Review this project for performance issues: slow paths, N+1 queries, unnecessary re-renders, large bundles, blocking I/O, or missing caching. Use evidence from the code and, where useful, run profiling or build analysis commands. Suggest prioritized fixes.",
		buttonText: ">",
	},
	{
		id: "icline_dependency_audit",
		title: "Dependency audit",
		description: "Outdated packages, vulnerabilities, and upgrade plan",
		icon: "DependencyIcon",
		actionCommand: "icline/quickStartDependencies",
		prompt:
			"Audit dependencies in this project: outdated packages, known vulnerabilities, unused deps, and version pinning risks. Use the project's package manager commands. Propose a safe upgrade order with breaking-change notes — do not bump everything blindly.",
		buttonText: ">",
	},
]