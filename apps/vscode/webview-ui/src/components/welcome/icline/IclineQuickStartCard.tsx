import { memo } from "react"
import QuickWinCard from "../QuickWinCard"
import type { QuickWinTask } from "../quickWinTasks"
import QuickStartPromptPopover from "./QuickStartPromptPopover"
import { getQuickStartPrompt, type QuickStartPromptOverrides } from "@/icline/quickStartPromptStorage"

interface IclineQuickStartCardProps {
	task: QuickWinTask
	overrides: QuickStartPromptOverrides
	onOverridesChange: (overrides: QuickStartPromptOverrides) => void
	onExecute: (prompt: string) => void
}

const IclineQuickStartCard = ({ task, overrides, onOverridesChange, onExecute }: IclineQuickStartCardProps) => {
	const prompt = getQuickStartPrompt(task.id, task.prompt, overrides)

	return (
		<div className="flex items-stretch gap-1.5 min-w-0">
			<div className="flex-1 min-w-0">
				<QuickWinCard onExecute={() => onExecute(prompt)} task={task} variant="grid" />
			</div>
			<div className="flex items-center pb-0.5">
				<QuickStartPromptPopover
					defaultPrompt={task.prompt}
					onOverridesChange={onOverridesChange}
					onStart={onExecute}
					overrides={overrides}
					taskId={task.id}
					taskTitle={task.title}
				/>
			</div>
		</div>
	)
}

export default memo(IclineQuickStartCard)