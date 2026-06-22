import { NewTaskRequest } from "@shared/proto/cline/task"
import React, { useState } from "react"
import { readQuickStartPromptOverrides, type QuickStartPromptOverrides } from "@/icline/quickStartPromptStorage"
import { TaskServiceClient } from "@/services/grpc-client"
import IclineQuickStartCard from "./icline/IclineQuickStartCard"
import { iclineQuickStartTasks } from "./icline/iclineQuickStartTasks"
import type { QuickStartMode } from "./icline/quickStartMode"
import QuickWinCard from "./QuickWinCard"
import { QuickWinTask, quickWinTasks } from "./quickWinTasks"

interface SuggestedTasksProps {
	quickStartMode: QuickStartMode
}

export const SuggestedTasks: React.FC<SuggestedTasksProps> = ({ quickStartMode }) => {
	const [promptOverrides, setPromptOverrides] = useState<QuickStartPromptOverrides>(() => readQuickStartPromptOverrides())

	const handleExecuteQuickWin = async (prompt: string) => {
		await TaskServiceClient.newTask(NewTaskRequest.create({ text: prompt, images: [] }))
	}

	if (quickStartMode === "cline") {
		return (
			<div className="px-4 pt-1 pb-3 select-none">
				<h2 className="text-sm font-medium mb-2.5 text-center text-gray">
					Quick <span className="text-white">[Wins]</span> with Cline
				</h2>
				<div className="flex flex-col space-y-1">
					{quickWinTasks.map((task: QuickWinTask) => (
						<QuickWinCard key={task.id} onExecute={() => handleExecuteQuickWin(task.prompt)} task={task} />
					))}
				</div>
			</div>
		)
	}

	if (quickStartMode === "icline") {
		return (
			<div className="px-4 pt-1 pb-3 select-none">
				<h2 className="text-sm font-medium mb-2.5 text-center text-gray">
					Quick <span className="text-white">[starts]</span> with iCline
				</h2>
				<div className="grid grid-cols-1 min-[300px]:grid-cols-2 gap-2">
					{iclineQuickStartTasks.map((task: QuickWinTask) => (
						<IclineQuickStartCard
							key={task.id}
							onExecute={handleExecuteQuickWin}
							onOverridesChange={setPromptOverrides}
							overrides={promptOverrides}
							task={task}
						/>
					))}
				</div>
			</div>
		)
	}

	return null
}