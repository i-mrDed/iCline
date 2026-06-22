import { ClineCompactIcon } from "@/assets/ClineCompactIcon"

interface IclineWelcomeBrandProps {
	heading: string
	subheading?: string
}

const IclineWelcomeBrand = ({ heading, subheading }: IclineWelcomeBrandProps) => {
	return (
		<div className="flex flex-col items-center">
			<div className="my-7 flex flex-col items-center gap-3">
				<div className="size-20 rounded-2xl border border-(--vscode-panel-border) bg-(--vscode-editor-background) flex items-center justify-center shadow-sm">
					<div className="scale-[2.75] text-(--vscode-foreground)">
						<ClineCompactIcon />
					</div>
				</div>
				<div className="text-center">
					<div className="text-lg font-bold tracking-tight text-(--vscode-editor-foreground)">iCline</div>
					{subheading && <div className="text-xs text-(--vscode-descriptionForeground) mt-0.5">{subheading}</div>}
				</div>
			</div>
			<div className="text-center flex items-center justify-center px-4">
				<h1 className="m-0 font-bold text-(--vscode-editor-foreground)">{heading}</h1>
			</div>
		</div>
	)
}

export default IclineWelcomeBrand