import type { GameState, EventCard, PlayerAction, Evidence, ActionRecord, Message } from '@/domain/types/game';
import { gameSessionRepository } from '@/domain/repositories/GameSessionRepository';
import { chapterRepository } from '@/domain/repositories/ChapterRepository';
import { eventSelectionService } from './EventSelectionService';
import { endingService } from './EndingService';
import { defaultPlayerProfile } from '@/data/playerProfiles';
import { generateId } from '@/lib/id';
import { clamp } from '@/lib/clamp';

export interface StartSessionResult {
  sessionId: string;
  state: GameState;
  firstEvent: EventCard;
}

export interface HandleActionResult {
  state: GameState;
  nextEvent: EventCard | null;
  feedback: string;
}

export class GameEngine {
  async startSession(chapterId: string): Promise<StartSessionResult> {
    const sessionId = generateId('session');
    const firstEvent = await chapterRepository.getFirstEvent(chapterId);
    if (!firstEvent) throw new Error(`Chapter not found: ${chapterId}`);

    const now = new Date().toISOString();
    const state: GameState = {
      sessionId,
      phase: 'playing',
      chapterId,
      currentEventId: firstEvent.id,
      currentTime: now,
      playerProfile: defaultPlayerProfile,
      riskScore: 0,
      anxietyScore: 20,
      officialVerified: false,
      taskCompleted: false,
      sensitiveInfoLeaked: false,
      moneyLost: 0,
      emergencyHandled: false,
      evidenceList: [],
      actionHistory: [],
      messageHistory: [this.eventToMessage(firstEvent, now)],
      flags: {},
      emergencyActionsCompleted: [],
    };

    await gameSessionRepository.create(state);
    return { sessionId, state, firstEvent };
  }

  async handleAction(
    sessionId: string,
    eventId: string,
    actionId: string,
  ): Promise<HandleActionResult> {
    const state = await gameSessionRepository.findById(sessionId);
    if (!state) throw new Error(`Session not found: ${sessionId}`);

    const event = await chapterRepository.getEventById(state.chapterId, eventId);
    if (!event) throw new Error(`Event not found: ${eventId}`);

    const action = event.actions.find((a) => a.id === actionId);
    if (!action) throw new Error(`Action not found: ${actionId}`);

    const updatedState = await this.applyActionEffects(state, event, action);

    let nextEvent = await eventSelectionService.getNextEventByRules(updatedState, event, action);

    // Force emergency phase if triggered
    if (action.triggersEmergency && !updatedState.sensitiveInfoLeaked && !updatedState.moneyLost) {
      // handled in applyActionEffects
    }

    if (!nextEvent && !event.isTerminal) {
      nextEvent = await eventSelectionService.getFallbackEvent(updatedState);
    }

    if (nextEvent) {
      updatedState.currentEventId = nextEvent.id;
      if (nextEvent.phase === 'emergency') updatedState.phase = 'emergency';
      else if (nextEvent.phase === 'report') updatedState.phase = 'report';
      else if (nextEvent.isTerminal) updatedState.phase = 'report';

      const msgTime = new Date().toISOString();
      updatedState.messageHistory.push(this.eventToMessage(nextEvent, msgTime));
    }

    // Determine ending if we're at report phase
    if (updatedState.phase === 'report' && !updatedState.endingType) {
      updatedState.endingType = endingService.determineEnding(updatedState);
    }

    await gameSessionRepository.update(updatedState);
    return { state: updatedState, nextEvent, feedback: action.feedback ?? '' };
  }

  async applyActionEffects(
    state: GameState,
    event: EventCard,
    action: PlayerAction,
  ): Promise<GameState> {
    const updated: GameState = structuredClone(state);
    const now = new Date().toISOString();

    // Update scores
    updated.riskScore = clamp(updated.riskScore + (action.riskScoreDelta ?? 0), 0, 100);
    updated.anxietyScore = clamp(updated.anxietyScore + (action.anxietyScoreDelta ?? 0), 0, 100);

    // Apply flags
    if (action.setsFlag) updated.flags[action.setsFlag] = true;

    // Info leakage
    if (action.leaksInfo) updated.sensitiveInfoLeaked = true;

    // Money lost
    if (action.loseMoney) updated.moneyLost += action.loseMoney;

    // Evidence
    if (action.addEvidence) {
      const evidence: Evidence = {
        id: generateId('ev'),
        eventId: event.id,
        label: action.label,
        description: `在 ${event.title} 中执行了「${action.label}」`,
        timestamp: now,
        type: 'screenshot',
      };
      updated.evidenceList.push(evidence);
    }

    // Task completion
    if (action.completesTask) {
      updated.taskCompleted = true;
      if (updated.flags['official_verified'] || action.setsFlag === 'task_completed') {
        updated.officialVerified = true;
      }
    }

    // Official verified flag
    if (action.setsFlag === 'official_verified' || action.setsFlag === 'task_completed') {
      updated.officialVerified = true;
    }

    // Emergency phase trigger
    if (action.triggersEmergency || updated.sensitiveInfoLeaked || updated.moneyLost > 0) {
      if (event.phase !== 'emergency' && updated.phase !== 'emergency') {
        updated.phase = 'emergency';
      }
    }

    // Emergency tracking
    if (event.phase === 'emergency' && action.category === 'emergency') {
      if (!updated.emergencyActionsCompleted.includes(action.id)) {
        updated.emergencyActionsCompleted.push(action.id);
      }
      const keyEmergency = ['stop_operation', 'change_password', 'contact_teacher', 'report_police'];
      const completedKey = keyEmergency.filter((a) => updated.emergencyActionsCompleted.includes(a));
      if (completedKey.length >= 2) updated.emergencyHandled = true;
    }

    // Record action
    const record: ActionRecord = {
      eventId: event.id,
      actionId: action.id,
      actionLabel: action.label,
      category: action.category,
      timestamp: now,
      riskScoreDelta: action.riskScoreDelta ?? 0,
      anxietyScoreDelta: action.anxietyScoreDelta ?? 0,
      feedback: action.feedback ?? '',
    };
    updated.actionHistory.push(record);

    // Player reply message
    const playerMessage: Message = {
      id: generateId('msg'),
      eventId: event.id,
      channel: event.channel,
      senderName: updated.playerProfile.name,
      senderRole: '玩家',
      content: action.label,
      timestamp: now,
      isPlayer: true,
    };
    updated.messageHistory.push(playerMessage);

    updated.currentTime = now;
    return updated;
  }

  async selectNextEvent(state: GameState, event: EventCard, action: PlayerAction): Promise<EventCard | null> {
    return eventSelectionService.getNextEventByRules(state, event, action);
  }

  async resetGame(sessionId: string): Promise<void> {
    await gameSessionRepository.delete(sessionId);
  }

  private eventToMessage(event: EventCard, timestamp: string): Message {
    return {
      id: generateId('msg'),
      eventId: event.id,
      channel: event.channel,
      senderName: event.senderName,
      senderRole: event.senderRole,
      content: event.message,
      timestamp,
      isPlayer: false,
      riskLevel: event.trueRiskLevel,
    };
  }
}

export const gameEngine = new GameEngine();
