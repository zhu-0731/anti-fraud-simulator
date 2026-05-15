import type { AIEventProvider } from './AIEventProvider';
import type { AIEventGenerationInput, AIEventOutput } from '@/domain/types/ai';
import type { EventCard } from '@/domain/types/game';
import { eventVariantsByGoal } from '@/data/eventVariants';
import { safetyFilterService } from '@/domain/services/SafetyFilterService';

export class MockAIEventProvider implements AIEventProvider {
  name = 'mock';

  async generateEvent(input: AIEventGenerationInput): Promise<AIEventOutput> {
    const variants = eventVariantsByGoal[input.teachingGoal] ?? [];
    const fallbackGoal = Object.keys(eventVariantsByGoal)[0];
    const pool = variants.length > 0 ? variants : (eventVariantsByGoal[fallbackGoal] ?? []);

    if (pool.length === 0) {
      throw new Error(`No event variants available for goal: ${input.teachingGoal}`);
    }

    // Pick a variant not yet in the action history to avoid repetition
    const usedEventIds = new Set(input.actionHistory);
    const unused = pool.filter((e) => !usedEventIds.has(e.id));
    const selected: EventCard = unused.length > 0 ? unused[0] : pool[0];

    // All AI-generated events MUST pass through SafetyFilterService
    const filterResult = safetyFilterService.filterEvent(selected);
    if (!filterResult.passed) {
      throw new Error(`Safety filter blocked event: ${filterResult.blockedReasons.join(', ')}`);
    }

    return {
      event: filterResult.filteredEvent,
      provider: this.name,
      confidence: 0.85,
      reasoning: `Mock provider selected event for goal: ${input.teachingGoal}`,
    };
  }
}

export const mockAIEventProvider = new MockAIEventProvider();
