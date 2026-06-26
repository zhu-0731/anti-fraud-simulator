import { narrativeDirector, type NarrativeTickResult } from '@/domain/narrative/NarrativeDirector';
import type { PlayerIntent, WorldState } from '@/domain/types/chat';

export class RuleNarrativeDirector {
  tick(worldState: WorldState, intent: PlayerIntent, contactId: string): NarrativeTickResult {
    return narrativeDirector.tick(worldState, intent, contactId);
  }
}

export const ruleNarrativeDirector = new RuleNarrativeDirector();
