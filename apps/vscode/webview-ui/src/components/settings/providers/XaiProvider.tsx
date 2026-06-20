import { getXaiModelsForAuth, isXaiCliModelId, xaiDefaultModelId } from "@shared/api"
import { Mode } from "@shared/storage/types"
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react"
import { VSCodeCheckbox, VSCodeDropdown, VSCodeOption } from "@vscode/webview-ui-toolkit/react"
import { useEffect, useMemo, useState } from "react"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { AccountServiceClient } from "@/services/grpc-client"
import { DROPDOWN_Z_INDEX } from "../ApiOptions"
import { ApiKeyField } from "../common/ApiKeyField"
import { AuthConnectionBadge } from "../common/AuthConnectionBadge"
import { ModelInfoView } from "../common/ModelInfoView"
import { DropdownContainer, ModelSelector } from "../common/ModelSelector"
import { getModeSpecificFields, normalizeApiConfiguration } from "../utils/providerUtils"
import { useApiConfigurationHandlers } from "../utils/useApiConfigurationHandlers"

interface XaiProviderProps {
	showModelOptions: boolean
	isPopup?: boolean
	currentMode: Mode
}

export const XaiProvider = ({ showModelOptions, isPopup, currentMode }: XaiProviderProps) => {
	const {
		apiConfiguration,
		xaiOAuthIsAuthenticated,
		xaiGrokCliIsAuthenticated,
		xaiSubscriptionModels,
		refreshXaiSubscriptionModels,
	} = useExtensionState()
	const { handleFieldChange, handleModeFieldChange } = useApiConfigurationHandlers()

	const modeFields = getModeSpecificFields(apiConfiguration, currentMode)
	const { selectedModelId, selectedModelInfo } = normalizeApiConfiguration(apiConfiguration, currentMode)
	const [reasoningEffortSelected, setReasoningEffortSelected] = useState(!!modeFields.reasoningEffort)

	const hasApiKey = !!apiConfiguration?.xaiApiKey?.trim()
	const oauthConnected = !!xaiOAuthIsAuthenticated
	const cliOnlyConnected = !!xaiGrokCliIsAuthenticated && !oauthConnected
	const subscriptionAuthenticated = oauthConnected || !!xaiGrokCliIsAuthenticated

	useEffect(() => {
		if (subscriptionAuthenticated) {
			refreshXaiSubscriptionModels()
		}
	}, [subscriptionAuthenticated, refreshXaiSubscriptionModels])

	const availableModels = useMemo(
		() =>
			getXaiModelsForAuth({
				subscriptionAuthenticated,
				hasApiKey,
				xaiSubscriptionModels,
			}),
		[subscriptionAuthenticated, hasApiKey, xaiSubscriptionModels],
	)

	const displayModelInfo = useMemo(() => {
		if (selectedModelId && availableModels[selectedModelId]) {
			return availableModels[selectedModelId]
		}
		return selectedModelInfo
	}, [selectedModelId, availableModels, selectedModelInfo])

	const subscriptionOnly = subscriptionAuthenticated && !hasApiKey
	const apiKeyOnly = hasApiKey && !subscriptionAuthenticated
	const subscriptionModelCount = Object.keys(xaiSubscriptionModels).length

	useEffect(() => {
		if (!selectedModelId || selectedModelId in availableModels) {
			return
		}
		const fallback =
			(subscriptionAuthenticated && xaiDefaultModelId in availableModels
				? xaiDefaultModelId
				: Object.keys(availableModels)[0]) || xaiDefaultModelId
		handleModeFieldChange(
			{ plan: "planModeApiModelId", act: "actModeApiModelId" },
			fallback,
			currentMode,
		)
	}, [availableModels, selectedModelId, subscriptionAuthenticated, currentMode, handleModeFieldChange])

	const handleSignIn = async () => {
		try {
			await AccountServiceClient.xaiOauthSignIn({})
		} catch (error) {
			console.error("Failed to sign in to xAI Grok:", error)
		}
	}

	const handleSignOut = async () => {
		try {
			await AccountServiceClient.xaiOauthSignOut({})
		} catch (error) {
			console.error("Failed to sign out of xAI Grok:", error)
		}
	}

	const connectionVariant = oauthConnected ? "oauth" : cliOnlyConnected ? "cli" : "disconnected"

	const connectionLabel = oauthConnected
		? "Connected — xAI Grok (OAuth & Subscription)"
		: cliOnlyConnected
			? "Connected — Grok CLI auth only"
			: "Not connected"

	const connectionDetail = oauthConnected
		? subscriptionModelCount > 0
			? `${Object.keys(availableModels).length} models (CLI + subscription)`
			: "Loading subscription models…"
		: cliOnlyConnected
			? "OAuth signed out. Session from ~/.grok/auth.json is still active."
			: hasApiKey
				? "Pay-as-you-go API key — console.x.ai models"
				: undefined

	const isSubscriptionIncluded =
		subscriptionAuthenticated &&
		!!selectedModelId &&
		(isXaiCliModelId(selectedModelId) || selectedModelId in xaiSubscriptionModels)

	return (
		<div>
			<div style={{ marginBottom: "15px" }}>
				{oauthConnected ? (
					<div>
						<AuthConnectionBadge detail={connectionDetail} label={connectionLabel} variant={connectionVariant} />
						<div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
							<VSCodeButton appearance="secondary" onClick={handleSignOut}>
								Sign Out OAuth
							</VSCodeButton>
						</div>
					</div>
				) : cliOnlyConnected ? (
					<div>
						<AuthConnectionBadge detail={connectionDetail} label={connectionLabel} variant={connectionVariant} />
						<p
							style={{
								fontSize: 12,
								color: "var(--vscode-descriptionForeground)",
								marginTop: 8,
							}}>
							⚠️ OAuth was signed out, but Grok CLI login at{" "}
							<code>~/.grok/auth.json</code> is still detected. Sign out of Grok CLI separately to fully
							disconnect.
						</p>
						<VSCodeButton onClick={handleSignIn}>Sign in to xAI Grok (OAuth)</VSCodeButton>
					</div>
				) : (
					<div>
						<AuthConnectionBadge label="Not connected to xAI Grok" variant="disconnected" />
						<p
							style={{
								fontSize: "12px",
								color: "var(--vscode-descriptionForeground)",
								marginBottom: "10px",
								marginTop: 10,
							}}>
							🔐 Sign in with SuperGrok or X Premium for Composer 2.5 Fast, Grok Build, Grok 4.3 and more.
							Add an API key for extra pay-as-you-go models.
						</p>
						<VSCodeButton onClick={handleSignIn}>Sign in to xAI Grok (OAuth)</VSCodeButton>
					</div>
				)}
			</div>

			<div>
				<ApiKeyField
					initialValue={apiConfiguration?.xaiApiKey || ""}
					onChange={(value) => handleFieldChange("xaiApiKey", value)}
					providerName="X AI"
					signupUrl="https://console.x.ai"
				/>
				<p
					style={{
						fontSize: "12px",
						marginTop: -10,
						color: "var(--vscode-descriptionForeground)",
					}}>
					Optional: pay-as-you-go API key from console.x.ai for additional models beyond your subscription.
				</p>
			</div>

			{showModelOptions && (
				<>
					{(subscriptionOnly || apiKeyOnly) && (
						<p
							style={{
								fontSize: "12px",
								color: "var(--vscode-descriptionForeground)",
								marginBottom: 8,
							}}>
							{subscriptionOnly
								? subscriptionModelCount === 0
									? "⏳ Loading models from your subscription account…"
									: "📋 Showing CLI + subscription models. Add an API key for pay-as-you-go models."
								: "📋 Showing API models only. Sign in with OAuth for subscription models."}
						</p>
					)}

					<ModelSelector
						label="Model"
						models={availableModels}
						onChange={(e: any) =>
							handleModeFieldChange(
								{ plan: "planModeApiModelId", act: "actModeApiModelId" },
								e.target.value,
								currentMode,
							)
						}
						selectedModelId={selectedModelId}
					/>

					{isSubscriptionIncluded && (
						<p style={{ fontSize: 12, color: "var(--vscode-terminal-ansiGreen)", marginTop: 4 }}>
							✓ Included in SuperGrok / X Premium subscription
						</p>
					)}

					{selectedModelId && selectedModelId.includes("3-mini") && (
						<>
							<VSCodeCheckbox
								checked={reasoningEffortSelected}
								onChange={(e: any) => {
									const isChecked = e.target.checked === true
									setReasoningEffortSelected(isChecked)
									if (!isChecked) {
										handleModeFieldChange(
											{ plan: "planModeReasoningEffort", act: "actModeReasoningEffort" },
											"",
											currentMode,
										)
									}
								}}
								style={{ marginTop: 0 }}>
								Modify reasoning effort
							</VSCodeCheckbox>

							{reasoningEffortSelected && (
								<div>
									<label htmlFor="reasoning-effort-dropdown">
										<span>Reasoning Effort</span>
									</label>
									<DropdownContainer className="dropdown-container" zIndex={DROPDOWN_Z_INDEX - 100}>
										<VSCodeDropdown
											id="reasoning-effort-dropdown"
											onChange={(e: any) => {
												handleModeFieldChange(
													{ plan: "planModeReasoningEffort", act: "actModeReasoningEffort" },
													e.target.value,
													currentMode,
												)
											}}
											style={{ width: "100%", marginTop: 3 }}
											value={modeFields.reasoningEffort || "high"}>
											<VSCodeOption value="low">low</VSCodeOption>
											<VSCodeOption value="high">high</VSCodeOption>
										</VSCodeDropdown>
									</DropdownContainer>
								</div>
							)}
						</>
					)}

					<ModelInfoView
						isPopup={isPopup}
						modelInfo={displayModelInfo}
						selectedModelId={selectedModelId}
						subscriptionIncluded={isSubscriptionIncluded}
					/>
				</>
			)}
		</div>
	)
}