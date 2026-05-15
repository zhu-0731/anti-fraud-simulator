import type { AIEventGenerationInput, AIEventOutput } from '@/domain/types/ai';

export interface AIEventProvider {
  name: string;
  generateEvent(input: AIEventGenerationInput): Promise<AIEventOutput>;
}
