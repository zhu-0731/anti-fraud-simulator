import { chatService, type SendMessageResult } from '@/domain/chat/ChatService';
import { intentParser } from '@/domain/chat/IntentParser';
import { gameSessionRepository } from '@/domain/repositories/GameSessionRepository';
import type { GameState } from '@/domain/types/game';
import type { ChatMessage, SystemNotification } from '@/domain/types/chat';
import { defenderRuleEngine } from './DefenderRuleEngine';
import { defenderStateReducer } from './DefenderStateReducer';

export interface DefenderSendMessageResult {
  state: GameState;
  messages: ChatMessage[];
  notifications: SystemNotification[];
  triggerEmergency: boolean;
  triggerReport: boolean;
}

export interface DefenderOpenContactResult {
  state: GameState;
  chatHistory: ChatMessage[];
}

export class DefenderGameService {
  async sendMessage(
    sessionId: string,
    contactId: string,
    text: string,
  ): Promise<DefenderSendMessageResult> {
    const state = await this.getDefenderState(sessionId);
    const parsed = intentParser.parseIntent(text);
    const chatResult = await chatService.sendMessage(state, contactId, text);
    const ruleResult = defenderRuleEngine.applyTurn({
      state: chatResult.updatedState,
      contactId,
      intent: parsed.intent,
    });

    const updatedState = this.applyPhaseTriggers(ruleResult.state, chatResult);
    await gameSessionRepository.update(updatedState);

    return {
      state: updatedState,
      messages: chatResult.newMessages,
      notifications: chatResult.notifications,
      triggerEmergency: chatResult.triggerEmergency,
      triggerReport: chatResult.triggerReport,
    };
  }

  async openContact(sessionId: string, contactId: string): Promise<DefenderOpenContactResult> {
    const state = await this.getDefenderState(sessionId);
    const updatedState = chatService.openContact(state, contactId);
    await gameSessionRepository.update(updatedState);

    return {
      state: updatedState,
      chatHistory: updatedState.chatHistories[contactId] ?? [],
    };
  }

  syncDefenderState(state: GameState): GameState {
    return {
      ...state,
      defenderState: defenderStateReducer.fromWorldState(state.defenderState, state.worldState),
    };
  }

  private async getDefenderState(sessionId: string): Promise<GameState> {
    const state = await gameSessionRepository.findById(sessionId);
    if (!state) throw new Error(`Session not found: ${sessionId}`);
    if (state.mode !== 'defender') throw new Error(`Unsupported mode for defender service: ${state.mode}`);
    return state;
  }

  private applyPhaseTriggers(state: GameState, result: SendMessageResult): GameState {
    if (result.triggerEmergency && state.phase === 'playing') {
      return { ...state, phase: 'emergency' };
    }
    if (result.triggerReport && state.phase === 'playing') {
      return { ...state, phase: 'report' };
    }
    return state;
  }
}

export const defenderGameService = new DefenderGameService();
