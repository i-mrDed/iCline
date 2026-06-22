export type QuickStartMode = "cline" | "icline" | "none"

export const QUICK_START_HISTORY_THRESHOLD = 3

export function resolveQuickStartMode(
	isProdHostedApp: boolean,
	taskHistoryLength: number,
	threshold = QUICK_START_HISTORY_THRESHOLD,
): QuickStartMode {
	if (isProdHostedApp && taskHistoryLength < threshold) {
		return "cline"
	}
	if (!isProdHostedApp && taskHistoryLength < threshold) {
		return "icline"
	}
	return "none"
}

export function shouldShowHistoryPreview(quickStartMode: QuickStartMode, taskHistoryLength: number): boolean {
	if (taskHistoryLength === 0) {
		return false
	}
	// iCline quick starts do not hide recent task history
	return quickStartMode !== "cline"
}