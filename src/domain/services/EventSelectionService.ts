import type { GameState, EventCard, PlayerAction } from '@/domain/types/game';
import { chapterRepository } from '@/domain/repositories/ChapterRepository';

export class EventSelectionService {
  async getCurrentEvent(state: GameState): Promise<EventCard | null> {
    return chapterRepository.getEventById(state.chapterId, state.currentEventId);
  }

  async getNextEventByRules(
    state: GameState,
    event: EventCard,
    action: PlayerAction,
  ): Promise<EventCard | null> {
    // Action-level override takes highest priority
    if (action.nextEventOverride) {
      return chapterRepository.getEventById(state.chapterId, action.nextEventOverride);
    }

    // Evaluate event-level rules against current state flags
    for (const rule of event.nextEventRules) {
      if (this.evaluateCondition(rule.condition, state)) {
        return chapterRepository.getEventById(state.chapterId, rule.nextEventId);
      }
    }

    // Fall back to default next event
    if (event.defaultNextEventId) {
      return chapterRepository.getEventById(state.chapterId, event.defaultNextEventId);
    }

    return null;
  }

  async getFallbackEvent(state: GameState): Promise<EventCard | null> {
    const events = await chapterRepository.getEventsByChapter(state.chapterId);
    return events.find((e) => e.id === 'E12') ?? events[events.length - 1] ?? null;
  }

  private evaluateCondition(condition: string, state: GameState): boolean {
    if (condition.startsWith('flag:')) {
      const flagName = condition.slice(5);
      return !!state.flags[flagName];
    }
    if (condition.startsWith('riskScore>')) {
      const threshold = parseInt(condition.slice(10), 10);
      return state.riskScore > threshold;
    }
    if (condition.startsWith('riskScore<')) {
      const threshold = parseInt(condition.slice(10), 10);
      return state.riskScore < threshold;
    }
    return false;
  }
}

export const eventSelectionService = new EventSelectionService();
