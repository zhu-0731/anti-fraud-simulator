import type { AIEventGenerationInput } from '@/domain/types/ai';

export interface AIProviderRequest {
  requestId: string;
  task: 'generate_event';
  input: AIEventGenerationInput;
  signal: AbortSignal;
}

export interface AIProviderResponse {
  provider: string;
  model: string;
  rawText: string;
  latencyMs: number;
}

export interface AIProvider {
  readonly name: string;
  generateEvent(request: AIProviderRequest): Promise<AIProviderResponse>;
}
