import React from "react"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { QuickWinTask } from "./quickWinTasks"

interface QuickWinCardProps {
	task: QuickWinTask
	onExecute: () => void
	variant?: "list" | "grid"
}

const renderIcon = (iconName?: string) => {
	if (!iconName) {
		return <span className="codicon codicon-rocket text-[28px]! leading-none!"></span>
	}

	let iconClass = "codicon-rocket"
	switch (iconName) {
		case "WebAppIcon":
			iconClass = "codicon-dashboard"
			break
		case "TerminalIcon":
			iconClass = "codicon-terminal"
			break
		case "GameIcon":
			iconClass = "codicon-game"
			break
		case "ExplainIcon":
			iconClass = "codicon-book"
			break
		case "RefactorIcon":
			iconClass = "codicon-wand"
			break
		case "TestIcon":
			iconClass = "codicon-beaker"
			break
		case "DebugIcon":
			iconClass = "codicon-debug"
			break
		case "ReviewIcon":
			iconClass = "codicon-eye"
			break
		case "ArchitectureIcon":
			iconClass = "codicon-type-hierarchy-sub"
			break
		case "SecurityIcon":
			iconClass = "codicon-shield"
			break
		case "CiIcon":
			iconClass = "codicon-run-errors"
			break
		case "DocsIcon":
			iconClass = "codicon-markdown"
			break
		case "PlanIcon":
			iconClass = "codicon-tasklist"
			break
		case "PerformanceIcon":
			iconClass = "codicon-pulse"
			break
		case "DependencyIcon":
			iconClass = "codicon-package"
			break
		default:
			break
	}
	return <span className={`codicon ${iconClass} text-[28px]! leading-none!`}></span>
}

const QuickWinCard: React.FC<QuickWinCardProps> = ({ task, onExecute, variant = "list" }) => {
	const isGrid = variant === "grid"
	const cardClassName = [
		"flex items-center w-full min-w-0 py-0 space-x-3 cursor-pointer group transition-colors duration-150 ease-in-out",
		"bg-white/2 border border-(--vscode-panel-border) hover:bg-(--vscode-list-hoverBackground)",
		isGrid ? "px-3 py-2 rounded-xl" : "mb-2 px-5 rounded-full",
	].join(" ")

	const cardBody = (
		<>
			<div className="shrink-0 flex items-center justify-center w-6 h-6 text-(--vscode-icon-foreground)">
				{renderIcon(task.icon)}
			</div>
			<div className="grow min-w-0">
				<h3
					className={[
						"text-sm font-medium text-(--vscode-editor-foreground) leading-tight mb-0 mt-0",
						isGrid ? "line-clamp-1" : "truncate pt-3",
					].join(" ")}>
					{task.title}
				</h3>
				<p
					className={[
						"text-xs text-(--vscode-descriptionForeground) leading-tight mt-px",
						isGrid ? "line-clamp-2" : "truncate",
					].join(" ")}>
					{task.description}
				</p>
			</div>
		</>
	)

	if (!isGrid) {
		return (
			<div className={cardClassName} onClick={() => onExecute()}>
				{cardBody}
			</div>
		)
	}

	return (
		<HoverCard closeDelay={100} openDelay={250}>
			<HoverCardTrigger asChild>
				<button className={cardClassName} onClick={() => onExecute()} type="button">
					{cardBody}
				</button>
			</HoverCardTrigger>
			<HoverCardContent align="start" className="w-72" side="top">
				<div className="space-y-1">
					<h4 className="text-sm font-semibold text-(--vscode-editor-foreground) leading-snug">{task.title}</h4>
					<p className="text-xs text-(--vscode-descriptionForeground) leading-relaxed">{task.description}</p>
				</div>
			</HoverCardContent>
		</HoverCard>
	)
}

export default QuickWinCard
