import type { AIEventGenerationInput } from '@/domain/types/ai';
import type { JudgeAgentInput, VictimAgentInput } from '@/domain/types/redTeam';

export type AITask = 'generate_event' | 'victim_response' | 'judge_evaluation';

export type AIProviderInputByTask = {
  generate_event: AIEventGenerationInput;
  victim_response: VictimAgentInput;
  judge_evaluation: JudgeAgentInput;
};

export interface AIProviderRequest<TTask extends AITask = 'generate_event'> {
  requestId: string;
  task: TTask;
  input: AIProviderInputByTask[TTask];
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
