import { randomUUID } from 'node:crypto';
import type { AIEventGenerationInput, AIEventOutput } from '@/domain/types/ai';
import type { AIProvider } from './AIProvider';
import { AIError, type AIErrorCode } from './AIError';
import { aiCallLogRepository } from './AICallLogRepository';
import { mockAIProvider } from './MockAIProvider';
import { openAIProvider } from './OpenAIProvider';
import { parseEventCardJson } from './StructuredOutput';
import { safetyPipeline } from './SafetyPipeline';
import { generateId } from '@/lib/id';

export interface AIGatewayOptions {
  providers?: Record<string, AIProvider>;
  timeoutMs?: number;
  maxRetries?: number;
}

export interface GenerateEventGatewayResult extends AIEventOutput {
  requestId: string;
  fallbackUsed: boolean;
  errorCode?: AIErrorCode;
}

export class AIGateway {
  private readonly providers: Record<string, AIProvider>;
  private readonly timeoutMs: number;
  private readonly maxRetries: number;

  constructor(options: AIGatewayOptions = {}) {
    this.providers = options.providers ?? {
      mock: mockAIProvider,
      openai: openAIProvider,
      'openai-compatible': openAIProvider,
      vivo: openAIProvider,
    };
    this.timeoutMs = options.timeoutMs ?? Number(process.env.AI_TIMEOUT_MS ?? 15000);
    this.maxRetries = options.maxRetries ?? Number(process.env.AI_MAX_RETRIES ?? 1);
  }

  async generateEvent(
    input: AIEventGenerationInput,
    providerName = process.env.AI_PROVIDER ?? 'mock',
  ): Promise<GenerateEventGatewayResult> {
    const requestId = randomUUID();
    const aiEnabled = process.env.AI_ENABLED === 'true';
    const selectedProviderName = aiEnabled ? providerName : 'mock';

    try {
      safetyPipeline.validateInput(input);
    } catch (error) {
      const aiError = normalizeError(error);
      return this.generateFallback(input, requestId, aiError.code, 0);
    }

    if (!aiEnabled && providerName !== 'mock') {
      return this.generateFallback(input, requestId, 'AI_DISABLED', 0);
    }

    const provider = this.providers[selectedProviderName] ?? this.providers.mock;
    const attempts = provider.name === 'mock' ? 1 : this.maxRetries + 1;
    let retryCount = 0;
    let lastError: AIError | null = null;

    for (let attempt = 0; attempt < attempts; attempt += 1) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
      try {
        const response = await provider.generateEvent({
          requestId,
          task: 'generate_event',
          input,
          signal: controller.signal,
        });
        const event = safetyPipeline.validateOutput(parseEventCardJson(response.rawText));
        this.recordLog({
          requestId,
          input,
          provider: response.provider,
          model: response.model,
          latencyMs: response.latencyMs,
          schemaValid: true,
          fallbackUsed: false,
          retryCount,
        });
        return {
          event,
          provider: response.provider,
          confidence: response.provider === 'mock' ? 0.85 : 0.7,
          reasoning: `Generated through AIGateway using ${response.provider}.`,
          requestId,
          fallbackUsed: false,
        };
      } catch (error) {
        lastError = normalizeError(error);
        if (!lastError.retryable || attempt >= attempts - 1) break;
        retryCount += 1;
      } finally {
        clearTimeout(timeout);
      }
    }

    return this.generateFallback(input, requestId, lastError?.code ?? 'PROVIDER_ERROR', retryCount);
  }

  private async generateFallback(
    input: AIEventGenerationInput,
    requestId: string,
    errorCode: AIErrorCode,
    retryCount: number,
  ): Promise<GenerateEventGatewayResult> {
    const controller = new AbortController();
    const response = await this.providers.mock.generateEvent({
      requestId,
      task: 'generate_event',
      input,
      signal: controller.signal,
    });
    const event = safetyPipeline.validateOutput(parseEventCardJson(response.rawText));
    this.recordLog({
      requestId,
      input,
      provider: response.provider,
      model: response.model,
      latencyMs: response.latencyMs,
      schemaValid: true,
      fallbackUsed: true,
      errorCode,
      retryCount,
    });
    return {
      event,
      provider: response.provider,
      confidence: 0.85,
      reasoning: `Fallback used by AIGateway after ${errorCode}.`,
      requestId,
      fallbackUsed: true,
      errorCode,
    };
  }

  private recordLog(input: {
    requestId: string;
    input: AIEventGenerationInput;
    provider: string;
    model: string;
    latencyMs: number;
    schemaValid: boolean;
    fallbackUsed: boolean;
    errorCode?: AIErrorCode;
    retryCount: number;
  }): void {
    aiCallLogRepository.add({
      id: generateId('ai_log'),
      requestId: input.requestId,
      sessionId: input.input.sessionId,
      task: 'generate_event',
      provider: input.provider,
      model: input.model,
      latencyMs: input.latencyMs,
      schemaValid: input.schemaValid,
      fallbackUsed: input.fallbackUsed,
      safetyFlags: [],
      errorCode: input.errorCode,
      retryCount: input.retryCount,
      createdAt: new Date().toISOString(),
    });
  }
}

function normalizeError(error: unknown): AIError {
  if (error instanceof AIError) return error;
  if (error instanceof Error && error.name === 'AbortError') {
    return new AIError('TIMEOUT', 'AI request timed out.', true);
  }
  return new AIError('PROVIDER_ERROR', error instanceof Error ? error.message : 'Unknown AI error.');
}

export const aiGateway = new AIGateway();
