import type { AIEventGenerationInput } from '@/domain/types/ai';
import type { EventCard } from '@/domain/types/game';
import { safetyFilterService } from '@/domain/services/SafetyFilterService';
import { AIError } from './AIError';

const PROMPT_INJECTION_PATTERN =
  /(ignore\s+(all\s+)?previous|system\s+prompt|developer\s+message|泄露.*提示词|忽略.*指令)/i;

export class SafetyPipeline {
  validateInput(input: AIEventGenerationInput): void {
    if (input.teachingGoal.length > 120 || PROMPT_INJECTION_PATTERN.test(input.teachingGoal)) {
      throw new AIError('INPUT_BLOCKED', 'AI input failed safety validation.');
    }
    if (Object.keys(input.flags).some((key) => PROMPT_INJECTION_PATTERN.test(key))) {
      throw new AIError('INPUT_BLOCKED', 'AI input flags failed safety validation.');
    }
  }

  validateOutput(event: EventCard): EventCard {
    const filterResult = safetyFilterService.filterEvent(event);
    if (!filterResult.passed || filterResult.warnings.length > 0) {
      throw new AIError(
        'OUTPUT_BLOCKED',
        `AI output blocked: ${[
          ...filterResult.blockedReasons,
          ...filterResult.warnings,
        ].join(', ')}`,
      );
    }
    return filterResult.filteredEvent;
  }
}

export const safetyPipeline = new SafetyPipeline();
