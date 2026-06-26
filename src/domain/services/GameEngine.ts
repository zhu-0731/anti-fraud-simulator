import type { GameState, EventCard, PlayerAction, Evidence, ActionRecord, Message, GameDifficulty } from '@/domain/types/game';
import type { Contact, ChatMessage } from '@/domain/types/chat';
import { gameSessionRepository } from '@/domain/repositories/GameSessionRepository';
import { chapterRepository } from '@/domain/repositories/ChapterRepository';
import { eventSelectionService } from './EventSelectionService';
import { endingService } from './EndingService';
import { defaultPlayerProfile } from '@/data/playerProfiles';
import { generateId } from '@/lib/id';
import { clamp } from '@/lib/clamp';
import { createInitialWorldState } from '@/domain/narrative/WorldState';
import { getAllAgents } from '@/domain/agents/AgentRegistry';
import { createInitialDefenderState } from '@/domain/gameModes';
import { calculateRepeatEffectMultiplier } from '@/domain/tactics/TacticRegistry';
import type { InteractionChannel, RiskRoleType } from '@/domain/types/tactic';
import { defenderStateReducer } from '@/domain/defender/DefenderStateReducer';

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
  async startSession(
    chapterId: string,
    difficulty: GameDifficulty = 'beginner',
  ): Promise<StartSessionResult> {
    const sessionId = generateId('session');
    const firstEvent = await chapterRepository.getFirstEvent(chapterId);
    if (!firstEvent) throw new Error(`Chapter not found: ${chapterId}`);

    const now = new Date().toISOString();
    // Build contacts from agent registry
    const agents = getAllAgents();
    const contacts: Contact[] = [
      { id: 'mom', name: '妈妈', type: 'person', avatarEmoji: '👩', unreadCount: 0, agentId: 'mom', lastMessagePreview: '宝，怎么了？' },
      { id: 'counselor', name: '王老师（辅导员）', type: 'person', avatarEmoji: '👨‍🏫', unreadCount: 0, agentId: 'counselor', lastMessagePreview: '同学你好' },
      { id: 'senior', name: '学长-张浩', type: 'person', avatarEmoji: '🧑‍🎓', unreadCount: 0, agentId: 'senior', lastMessagePreview: '去年我也保研到Z大…' },
      { id: 'group', name: '保研互助群 (327人)', type: 'group', avatarEmoji: '👥', unreadCount: 1, agentId: 'group', lastMessagePreview: '恭喜各位拿到offer！' },
      { id: 'fake_admission', name: '招生办-张老师（未认证）', type: 'person', avatarEmoji: '🧑‍💼', unreadCount: 1, agentId: 'fake_admission', isHidden: false, lastMessagePreview: '你好，我是Z大招生办张老师…' },
      { id: 'official_service', name: 'Z大研究生院（官方）', type: 'official', avatarEmoji: '🏛️', isOfficial: true, unreadCount: 0, agentId: 'official_service', lastMessagePreview: '欢迎关注官方服务号' },
      { id: 'anti_fraud', name: '反诈咨询', type: 'system', avatarEmoji: '🛡️', unreadCount: 0, agentId: 'anti_fraud', lastMessagePreview: '有任何可疑情况都可以问我' },
    ];

    // Seed initial chat histories from agents
    const chatHistories: Record<string, ChatMessage[]> = {};
    for (const agent of agents) {
      const initMsgs = agent.getInitialMessages?.() ?? [];
      if (initMsgs.length > 0) {
        chatHistories[agent.contactId] = initMsgs.map((m, i) => ({
          id: generateId('msg'),
          contactId: agent.contactId,
          sender: 'agent' as const,
          senderName: m.senderName,
          content: m.content,
          channel: m.channel,
          timestamp: new Date(Date.now() - (initMsgs.length - i) * 60000).toISOString(),
          metadata: m.metadata,
        }));
      }
    }

    const state: GameState = {
      sessionId,
      mode: 'defender',
      difficulty,
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
      // Chat system
      contacts,
      activeContactId: null,
      chatHistories,
      worldState: createInitialWorldState(),
      activeView: 'chat_list',
      browserState: null,
      phoneState: { isCalling: false, calledContactId: null, callType: null, callResult: null },
      notifications: [],
      defenderState: createInitialDefenderState(),
      tacticUses: [],
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

    updated.defenderState = defenderStateReducer.applyPatch(updated.defenderState, {
      exposure: {
        suspiciousLink: action.setsFlag === 'clicked_suspicious_link' ? 15 : 0,
        informationRequest: action.leaksInfo ? 25 : 0,
        paymentRequest: action.loseMoney ? 25 : 0,
        unverifiedIdentity: event.tacticIds?.includes('authority_claim') ? 10 : 0,
      },
      defense: {
        officialVerification:
          action.category === 'verify' || action.setsFlag === 'official_verified' ? 15 : 0,
        evidenceAwareness: action.addEvidence ? 15 : 0,
        helpSeeking: action.category === 'emergency' ? 15 : 0,
        contradictionAwareness: action.category === 'safe' ? 5 : 0,
      },
      pressure: {
        authority: event.tacticIds?.includes('authority_claim') ? 10 : 0,
        deadline: event.tacticIds?.includes('urgency_pressure') ? 10 : 0,
        social: event.tacticIds?.includes('social_proof') ? 10 : 0,
        emotional: event.tacticIds?.includes('loss_aversion') ? 10 : 0,
      },
      consequences: {
        informationLeakLevel: action.leaksInfo ? 30 : 0,
        simulatedMoneyLoss: action.loseMoney ? 30 : 0,
        accountRiskLevel: action.setsFlag === 'credentials_leaked' ? 40 : 0,
      },
      discoveredFacts:
        action.category === 'verify' || action.category === 'safe'
          ? [`玩家执行安全动作：${action.label}`]
          : [],
      hiddenRiskSignals: event.tacticIds ?? [],
      activeRiskActorIds: event.trueRiskLevel === 'none' ? [] : [event.senderName],
    });

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

    if (event.tacticIds?.length && event.trueRiskLevel !== 'none') {
      const turnNumber = updated.tacticUses.length + 1;
      const roleId = this.eventRole(event);
      const channelId = this.eventChannel(event);
      for (const tacticId of event.tacticIds) {
        updated.tacticUses.push({
          id: generateId('tu'),
          tacticId,
          mode: 'defender',
          roleId,
          channelId,
          intensity: event.trueRiskLevel === 'critical' ? 3 : 2,
          turnNumber,
          effectMultiplier: calculateRepeatEffectMultiplier({
            tacticId,
            previousUses: updated.tacticUses,
          }),
          createdAt: now,
        });
      }
    }

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

  private eventRole(event: EventCard): RiskRoleType {
    if (event.senderRole.includes('家长')) return 'family_forwarder';
    if (event.senderRole.includes('学长') || event.senderRole.includes('同学')) return 'senior_student';
    if (event.senderRole.includes('群')) return 'group_member';
    if (event.senderRole.includes('短信') || event.senderRole.includes('系统')) return 'automated_notification';
    if (event.senderRole.includes('客服')) return 'simulated_customer_service';
    return 'unverified_staff';
  }

  private eventChannel(event: EventCard): InteractionChannel {
    switch (event.channel) {
      case 'sms':
        return 'sms';
      case 'email':
        return 'email';
      case 'browser':
      case 'official_site':
        return 'simulated_browser';
      case 'call':
        return 'simulated_call';
      case 'wechat':
        return event.senderRole.includes('群') ? 'group_chat' : 'private_chat';
      default:
        return 'private_chat';
    }
  }
}

export const gameEngine = new GameEngine();
