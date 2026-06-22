import { EmptyRequest } from "@shared/proto/cline/common"
import ClineLogoSanta from "@/assets/ClineLogoSanta"
import ClineLogoTired from "@/assets/ClineLogoTired"
import ClineLogoVariable from "@/assets/ClineLogoVariable"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { UiServiceClient } from "@/services/grpc-client"
import IclineWelcomeBrand from "./icline/IclineWelcomeBrand"
import ProviderModelChip from "./icline/ProviderModelChip"
import type { QuickStartMode } from "./icline/quickStartMode"

interface HomeHeaderProps {
	quickStartMode?: QuickStartMode
}

const HomeHeader = ({ quickStartMode = "none" }: HomeHeaderProps) => {
	const { environment, lazyTeammateModeEnabled, mode } = useExtensionState()

	const handleTakeATour = async () => {
		try {
			await UiServiceClient.openWalkthrough(EmptyRequest.create())
		} catch (error) {
			console.error("Error opening walkthrough:", error)
		}
	}

	if (quickStartMode === "icline") {
		const heading = lazyTeammateModeEnabled ? "I guess I'm here to help" : "What can we build today?"
		return (
			<div className="flex flex-col items-center mb-5">
				<IclineWelcomeBrand heading={heading} subheading="Standalone agent · Grok & more" />
				<ProviderModelChip mode={mode} />
			</div>
		)
	}

	// Lazy Teammate Mode takes priority, then December festive logo, then default Cline branding
	const isDecember = new Date().getMonth() === 11 // 11 = December (0-indexed)
	const LogoComponent = lazyTeammateModeEnabled ? ClineLogoTired : isDecember ? ClineLogoSanta : ClineLogoVariable
	const headingText = lazyTeammateModeEnabled ? "I guess I'm here to help" : "What can I do for you?"

	return (
		<div className="flex flex-col items-center mb-5">
			<div className="my-7">
				<LogoComponent className="size-20" environment={environment} />
			</div>
			<div className="text-center flex items-center justify-center px-4">
				<h1 className="m-0 font-bold">{headingText}</h1>
			</div>
			{quickStartMode === "cline" && (
				<div className="mt-4">
					<button
						className="flex items-center gap-2 px-4 py-2 rounded-full border border-border-panel bg-white/2 hover:bg-list-background-hover transition-colors duration-150 ease-in-out text-code-foreground text-sm font-medium cursor-pointer"
						onClick={handleTakeATour}
						type="button">
						Take a Tour
						<span className="codicon codicon-play scale-90" />
					</button>
				</div>
			)}
		</div>
	)
}

export default HomeHeader