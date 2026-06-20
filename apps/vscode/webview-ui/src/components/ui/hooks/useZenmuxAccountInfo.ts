import { useEffect, useState } from "react"

interface PaygBalance {
	totalCredits?: number
	topUpCredits?: number
	bonusCredits?: number
}

interface SubscriptionInfo {
	tier?: string
	maxFlows?: number
	remainingFlows?: number
}

export function useZenmuxAccountInfo(apiKey?: string, managementApiKey?: string) {
	const [paygBalance, setPaygBalance] = useState<PaygBalance | null>(null)
	const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null)
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		const authKey = managementApiKey || apiKey
		if (!authKey) {
			setPaygBalance(null)
			setSubscription(null)
			return
		}

		let cancelled = false
		setIsLoading(true)
		setError(null)

		const headers = { Authorization: `Bearer ${authKey}` }

		Promise.all([
			fetch("https://zenmux.ai/api/v1/management/payg/balance", { headers })
				.then((r) => (r.ok ? r.json() : null))
				.catch(() => null),
			fetch("https://zenmux.ai/api/v1/management/subscription/detail", { headers })
				.then((r) => (r.ok ? r.json() : null))
				.catch(() => null),
		])
			.then(([paygRes, subRes]) => {
				if (cancelled) return
				if (paygRes?.data) {
					setPaygBalance({
						totalCredits: paygRes.data.total_credits,
						topUpCredits: paygRes.data.top_up_credits,
						bonusCredits: paygRes.data.bonus_credits,
					})
				}
				if (subRes?.data) {
					setSubscription({
						tier: subRes.data.plan?.tier,
						maxFlows: subRes.data.quota_5_hour?.max_flows,
						remainingFlows: subRes.data.quota_5_hour?.remaining_flows,
					})
				}
			})
			.catch((e) => {
				if (!cancelled) setError(String(e))
			})
			.finally(() => {
				if (!cancelled) setIsLoading(false)
			})

		return () => {
			cancelled = true
		}
	}, [apiKey, managementApiKey])

	return { paygBalance, subscription, isLoading, error }
}