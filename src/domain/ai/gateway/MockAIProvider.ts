import { eventVariantsByGoal } from '@/data/eventVariants';
import type { AIProvider, AIProviderRequest, AIProviderResponse } from './AIProvider';

export class MockAIProvider implements AIProvider {
  readonly name = 'mock';

  async generateEvent(request: AIProviderRequest): Promise<AIProviderResponse> {
    const start = Date.now();
    const variants = eventVariantsByGoal[request.input.teachingGoal] ?? [];
    const fallbackGoal = Object.keys(eventVariantsByGoal)[0];
    const pool = variants.length > 0 ? variants : (eventVariantsByGoal[fallbackGoal] ?? []);
    const selected = pool[0];

    return {
      provider: this.name,
      model: 'rule-mock',
      rawText: JSON.stringify(selected),
      latencyMs: Date.now() - start,
    };
  }
}

export const mockAIProvider = new MockAIProvider();
