import { ModelInfo, XAIModelId, xaiDefaultModelId, xaiModels } from "@shared/api"
import { StateManager } from "@/core/storage/StateManager"
import { calculateApiCostOpenAI } from "@utils/cost"
import { shouldSkipReasoningForModel } from "@utils/model-utils"
import OpenAI from "openai"
import type { ChatCompletionTool as OpenAITool } from "openai/resources/chat/completions"
import { ChatCompletionReasoningEffort } from "openai/resources/chat/completions"
import { v7 as uuidv7 } from "uuid"
import {
	isXaiCliModel,
	XAI_CLI_PROXY_BASE_URL,
	XAI_DEFAULT_BASE_URL,
	XAI_GROK_CLI_VERSION,
} from "@/integrations/xai/constants"
import { assertXaiModelMatchesAuth, resolveXaiAuth } from "@/integrations/xai/auth-mode"
import { ClineStorageMessage } from "@/shared/messages/content"
import { createOpenAIClient } from "@/shared/net"
import { ApiFormat } from "@/shared/proto/cline/models"
import { ApiHandler, CommonApiHandlerOptions } from "../"
import { withRetry } from "../retry"
import { convertToOpenAiMessages } from "../transform/openai-format"
import { convertToOpenAIResponsesInput } from "../transform/openai-response-format"
import { ApiStream } from "../transform/stream"
import { getOpenAIToolParams, ToolCallProcessor } from "../transform/tool-call-processor"

interface XAIHandlerOptions extends CommonApiHandlerOptions {
	xaiApiKey?: string
	reasoningEffort?: string
	apiModelId?: string
}

function buildCliHeaders(modelId: string, sessionId: string): Record<string, string> {
	return {
		"x-grok-client-identifier": "cline",
		"x-grok-client-version": XAI_GROK_CLI_VERSION,
		"x-xai-token-auth": "xai-grok-cli",
		"x-grok-model-override": modelId,
		"x-grok-conv-id": sessionId,
	}
}

export class XAIHandler implements ApiHandler {
	private options: XAIHandlerOptions
	private client: OpenAI | undefined
	private clientBaseUrl: string | undefined
	private readonly sessionId: string

	constructor(options: XAIHandlerOptions) {
		this.options = options
		this.sessionId = uuidv7()
	}

	private async ensureClient(modelId: string): Promise<OpenAI> {
		const auth = await resolveXaiAuth(this.options.xaiApiKey)
		assertXaiModelMatchesAuth(auth.mode, modelId)
		const accessToken = auth.token

		const baseURL = isXaiCliModel(modelId) ? XAI_CLI_PROXY_BASE_URL : XAI_DEFAULT_BASE_URL
		const defaultHeaders = isXaiCliModel(modelId) ? buildCliHeaders(modelId, this.sessionId) : undefined

		if (!this.client || this.clientBaseUrl !== baseURL) {
			try {
				this.client = createOpenAIClient({
					baseURL,
					apiKey: accessToken,
					defaultHeaders,
				})
				this.clientBaseUrl = baseURL
			} catch (error: unknown) {
				const message = error instanceof Error ? error.message : String(error)
				throw new Error(`Error creating xAI client: ${message}`)
			}
		}

		return this.client
	}

	@withRetry()
	async *createMessage(systemPrompt: string, messages: ClineStorageMessage[], tools?: OpenAITool[]): ApiStream {
		const model = this.getModel()
		const auth = await resolveXaiAuth(this.options.xaiApiKey)
		assertXaiModelMatchesAuth(auth.mode, model.id)

		const useResponsesApi =
			model.info.apiFormat === ApiFormat.OPENAI_RESPONSES ||
			(auth.mode === "subscription" && !isXaiCliModel(model.id))

		if (useResponsesApi) {
			if (!tools?.length) {
				throw new Error("Native tool calling must be enabled to use xAI subscription and CLI models.")
			}
			yield* this.createResponseStream(systemPrompt, messages, tools, model)
			return
		}
		yield* this.createCompletionStream(systemPrompt, messages, tools, model)
	}

	private async *createCompletionStream(
		systemPrompt: string,
		messages: ClineStorageMessage[],
		tools: OpenAITool[] | undefined,
		model: { id: string; info: ModelInfo },
	): ApiStream {
		const client = await this.ensureClient(model.id)
		const modelId = model.id

		let reasoningEffort: ChatCompletionReasoningEffort | undefined
		if (modelId.includes("3-mini")) {
			const effort = this.options.reasoningEffort
			reasoningEffort = effort && ["low", "high"].includes(effort) ? (effort as ChatCompletionReasoningEffort) : undefined
		}

		const stream = await client.chat.completions.create({
			model: modelId,
			max_completion_tokens: model.info.maxTokens,
			temperature: 0,
			messages: [{ role: "system", content: systemPrompt }, ...convertToOpenAiMessages(messages)],
			stream: true,
			stream_options: { include_usage: true },
			reasoning_effort: reasoningEffort,
			...getOpenAIToolParams(tools),
		})

		const toolCallProcessor = new ToolCallProcessor()

		for await (const chunk of stream) {
			const delta = chunk.choices?.[0]?.delta
			if (delta?.content) {
				yield { type: "text", text: delta.content }
			}

			if (delta?.tool_calls) {
				yield* toolCallProcessor.processToolCallDeltas(delta.tool_calls)
			}

			if (delta && "reasoning_content" in delta && delta.reasoning_content) {
				if (!shouldSkipReasoningForModel(modelId)) {
					yield {
						type: "reasoning",
						// @ts-expect-error-next-line
						reasoning: delta.reasoning_content,
					}
				}
			}

			if (chunk.usage) {
				const inputTokens = chunk.usage.prompt_tokens || 0
				const outputTokens = chunk.usage.completion_tokens || 0
				const cacheReadTokens = chunk.usage.prompt_tokens_details?.cached_tokens || 0
				// @ts-expect-error-next-line
				const cacheWriteTokens = chunk.usage.prompt_cache_miss_tokens || 0
				yield {
					type: "usage",
					inputTokens,
					outputTokens,
					cacheReadTokens,
					cacheWriteTokens,
					totalCost: calculateApiCostOpenAI(model.info, inputTokens, outputTokens, cacheWriteTokens, cacheReadTokens),
				}
			}
		}
	}

	private mapResponseTools(tools: OpenAITool[]): OpenAI.Responses.Tool[] {
		return tools
			.filter((tool): tool is OpenAI.Chat.Completions.ChatCompletionFunctionTool => tool?.type === "function")
			.map((tool) => ({
				type: "function" as const,
				name: tool.function.name,
				description: tool.function.description,
				parameters: tool.function.parameters ?? null,
				strict: tool.function.strict ?? true,
			}))
	}

	private async *createResponseStream(
		systemPrompt: string,
		messages: ClineStorageMessage[],
		tools: OpenAITool[],
		model: { id: string; info: ModelInfo },
	): ApiStream {
		const client = await this.ensureClient(model.id)
		const { input } = convertToOpenAIResponsesInput(messages)
		const params: OpenAI.Responses.ResponseCreateParamsStreaming = {
			model: model.id,
			instructions: systemPrompt,
			input,
			stream: true,
			tools: this.mapResponseTools(tools),
			store: false,
		}

		const stream = await client.responses.create(params)
		yield* this.processResponsesEvents(stream, model.info)
	}

	private async *processResponsesEvents(
		stream: AsyncIterable<OpenAI.Responses.ResponseStreamEvent>,
		modelInfo: ModelInfo,
	): ApiStream {
		for await (const chunk of stream) {
			if (chunk.type === "response.output_item.added") {
				const item = chunk.item
				if (item.type === "function_call" && item.id) {
					yield {
						type: "tool_calls",
						id: item.id,
						tool_call: {
							call_id: item.call_id,
							function: {
								id: item.id,
								name: item.name,
								arguments: item.arguments,
							},
						},
					}
				}
			}

			if (chunk.type === "response.output_text.delta" && chunk.delta) {
				yield { id: chunk.item_id, type: "text", text: chunk.delta }
			}

			if (chunk.type === "response.reasoning_text.delta" && chunk.delta) {
				yield { id: chunk.item_id, type: "reasoning", reasoning: chunk.delta }
			}

			if (chunk.type === "response.completed" && chunk.response?.usage) {
				const usage = chunk.response.usage
				const inputTokens = usage.input_tokens || 0
				const outputTokens = usage.output_tokens || 0
				const cacheReadTokens = usage.input_tokens_details?.cached_tokens || 0
				const cacheWriteTokens = 0
				yield {
					type: "usage",
					inputTokens: Math.max(0, inputTokens - cacheReadTokens),
					outputTokens,
					cacheReadTokens,
					cacheWriteTokens,
					totalCost: calculateApiCostOpenAI(modelInfo, inputTokens, outputTokens, cacheWriteTokens, cacheReadTokens),
					id: chunk.response.id,
				}
			}
		}
	}

	getModel(): { id: string; info: ModelInfo } {
		const modelId = this.options.apiModelId
		if (modelId && modelId in xaiModels) {
			const id = modelId as XAIModelId
			return { id, info: xaiModels[id] }
		}
		if (modelId) {
			const cached = StateManager.get().getModelInfo("xaiSubscription", modelId)
			if (cached) {
				return { id: modelId, info: cached }
			}
		}
		return {
			id: xaiDefaultModelId,
			info: xaiModels[xaiDefaultModelId],
		}
	}
}