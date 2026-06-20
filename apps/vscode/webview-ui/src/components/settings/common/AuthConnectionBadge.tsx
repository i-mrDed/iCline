export type AuthConnectionVariant = "oauth" | "cli" | "disconnected"

interface AuthConnectionBadgeProps {
	variant: AuthConnectionVariant
	label: string
	detail?: string
	/** @deprecated Use variant instead */
	connected?: boolean
}

const VARIANT_STYLES: Record<
	AuthConnectionVariant,
	{ color: string; pulse: boolean }
> = {
	oauth: { color: "var(--vscode-terminal-ansiGreen)", pulse: true },
	cli: { color: "var(--vscode-terminal-ansiYellow)", pulse: true },
	disconnected: { color: "var(--vscode-descriptionForeground)", pulse: false },
}

/**
 * Visible connection status — green (OAuth), amber (Grok CLI only), grey (offline).
 */
export const AuthConnectionBadge = ({ variant, label, detail, connected }: AuthConnectionBadgeProps) => {
	const resolvedVariant: AuthConnectionVariant =
		variant ?? (connected ? "oauth" : "disconnected")
	const { color, pulse } = VARIANT_STYLES[resolvedVariant]

	return (
		<div
			style={{
				display: "flex",
				alignItems: "flex-start",
				gap: 10,
				padding: "10px 12px",
				borderRadius: 6,
				marginBottom: 4,
				background:
					resolvedVariant === "disconnected"
						? "var(--vscode-input-background)"
						: `color-mix(in srgb, ${color} 12%, transparent)`,
				border: `1px solid ${resolvedVariant === "disconnected" ? "var(--vscode-panel-border)" : color}`,
			}}>
			<span
				aria-hidden
				style={{
					flexShrink: 0,
					width: 10,
					height: 10,
					marginTop: 4,
					borderRadius: "50%",
					background: color,
					boxShadow: pulse ? `0 0 8px ${color}` : "none",
					animation: pulse ? "icline-pulse 2s ease-in-out infinite" : "none",
				}}
			/>
			<div style={{ flex: 1, minWidth: 0 }}>
				<div style={{ fontSize: 13, fontWeight: 600, color }}>{label}</div>
				{detail && (
					<div style={{ fontSize: 12, color: "var(--vscode-descriptionForeground)", marginTop: 2 }}>
						{detail}
					</div>
				)}
			</div>
			<style>{`
				@keyframes icline-pulse {
					0%, 100% { opacity: 1; transform: scale(1); }
					50% { opacity: 0.65; transform: scale(0.92); }
				}
			`}</style>
		</div>
	)
}