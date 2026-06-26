import type { GameState, Evidence } from '@/domain/types/game';
import type { ChatMessage, SystemNotification } from '@/domain/types/chat';
import { intentParser } from './IntentParser';
import { getAgent } from '@/domain/agents/AgentRegistry';
import { narrativeDirector } from '@/domain/narrative/NarrativeDirector';
import { patchWorldState } from '@/domain/narrative/WorldState';
import { safetyFilterService } from '@/domain/services/SafetyFilterService';
import { generateId } from '@/lib/id';
import { clamp } from '@/lib/clamp';

export interface SendMessageResult {
  updatedState: GameState;
  newMessages: ChatMessage[];
  notifications: SystemNotification[];
  triggerEmergency: boolean;
  triggerReport: boolean;
}

export class ChatService {
  async sendMessage(
    state: GameState,
    contactId: string,
    playerText: string,
  ): Promise<SendMessageResult> {
    const now = new Date().toISOString();

    // 1. Parse intent
    const parsed = intentParser.parseIntent(playerText);

    // 2. Add player message to history
    const playerMsg: ChatMessage = {
      id: generateId('msg'),
      contactId,
      sender: 'player',
      senderName: state.playerProfile.name,
      content: playerText,
      channel: state.contacts.find((c) => c.id === contactId)?.type === 'group' ? 'group' : 'chat',
      timestamp: now,
    };

    // 3. Get agent response
    const agent = getAgent(contactId);
    const agentMessages: ChatMessage[] = [];

    if (agent) {
      const recentMessages = (state.chatHistories[contactId] ?? []).slice(-10);
      const agentResponse = await agent.generateResponse({
        contactId,
        playerText,
        intent: parsed.intent,
        worldState: state.worldState,
        recentMessages,
      });

      // Convert agent response messages to ChatMessage, safety-filter content
      for (const am of agentResponse.messages) {
        const filteredContent = safetyFilterService.removeRealLinks(am.content);
        agentMessages.push({
          id: generateId('msg'),
          contactId,
          sender: 'agent',
          senderName: am.senderName,
          content: filteredContent,
          channel: am.channel,
          timestamp: new Date().toISOString(),
          metadata: am.metadata,
        });
      }

      // Apply delayed consequences to worldState
      if (agentResponse.delayedConsequences?.length) {
        const patch = patchWorldState(state.worldState, {
          delayedConsequences: agentResponse.delayedConsequences,
        });
        state = { ...state, worldState: patch };
      }
    }

    // 4. Run NarrativeDirector tick
    const tickResult = narrativeDirector.tick(state.worldState, parsed.intent, contactId);

    // 5. Build updated state
    const newHistory = [
      ...(state.chatHistories[contactId] ?? []),
      playerMsg,
      ...agentMessages,
    ];

    const updatedContacts = state.contacts.map((c) => {
      if (c.id === contactId) {
        return {
          ...c,
          unreadCount: 0,
          lastMessagePreview: agentMessages[agentMessages.length - 1]?.content.slice(0, 40) ?? c.lastMessagePreview,
          lastMessageAt: now,
        };
      }
      return c;
    });

    // Apply notifications to contacts (add unread badges)
    const notifContacts = tickResult.newNotifications.reduce((contacts, notif) => {
      return contacts.map((c) =>
        c.id === notif.contactId
          ? { ...c, unreadCount: c.unreadCount + 1, lastMessagePreview: notif.preview, lastMessageAt: notif.timestamp }
          : c,
      );
    }, updatedContacts);

    // Save evidence if intent is save_evidence
    const newEvidence: Evidence[] = parsed.intent === 'save_evidence'
      ? [{
          id: generateId('ev'),
          eventId: contactId,
          label: `在${state.contacts.find((c) => c.id === contactId)?.name ?? contactId}中截图保存`,
          description: `玩家输入: "${playerText.slice(0, 60)}"`,
          timestamp: now,
          type: 'screenshot' as const,
        }]
      : [];

    // Update riskScore and anxietyScore from worldState (hidden from player)
    const newRiskScore = clamp(
      tickResult.updatedWorldState.suspiciousLinkExposure * 0.6 +
      tickResult.updatedWorldState.submittedInfoLevel * 0.4,
      0,
      100,
    );
    const newAnxietyScore = clamp(
      tickResult.updatedWorldState.deadlinePressure * 0.5 +
      tickResult.updatedWorldState.authorityPressure * 0.3 +
      (tickResult.updatedWorldState.officialPathAwareness > 30 ? -20 : 0) + state.anxietyScore,
      0,
      100,
    );

    const updatedState: GameState = {
      ...state,
      worldState: tickResult.updatedWorldState,
      contacts: notifContacts,
      chatHistories: {
        ...state.chatHistories,
        [contactId]: newHistory,
      },
      notifications: [...state.notifications, ...tickResult.newNotifications],
      evidenceList: [...state.evidenceList, ...newEvidence],
      currentTime: now,
      riskScore: Math.round(newRiskScore),
      anxietyScore: Math.round(newAnxietyScore),
      sensitiveInfoLeaked: state.sensitiveInfoLeaked || tickResult.updatedWorldState.submittedInfoLevel > 20,
      officialVerified: state.officialVerified || isOfficialVerification(contactId, parsed.intent, tickResult.updatedWorldState.officialPathAwareness),
      taskCompleted: state.taskCompleted || tickResult.triggerReport,
    };

    return {
      updatedState,
      newMessages: [playerMsg, ...agentMessages],
      notifications: tickResult.newNotifications,
      triggerEmergency: tickResult.triggerEmergency && !state.sensitiveInfoLeaked,
      triggerReport: tickResult.triggerReport,
    };
  }

  openContact(state: GameState, contactId: string): GameState {
    if (!contactId) {
      return {
        ...state,
        activeContactId: null,
        activeView: 'chat_list',
      };
    }

    const updatedContacts = state.contacts.map((c) =>
      c.id === contactId ? { ...c, unreadCount: 0 } : c,
    );
    return {
      ...state,
      contacts: updatedContacts,
      activeContactId: contactId,
      activeView: 'chat_window',
    };
  }
}

export const chatService = new ChatService();

function isOfficialVerification(
  contactId: string,
  intent: ReturnType<typeof intentParser.parseIntent>['intent'],
  officialPathAwareness: number,
): boolean {
  if (officialPathAwareness >= 60) return true;
  if (contactId !== 'official_service' && contactId !== 'anti_fraud' && contactId !== 'counselor') {
    return false;
  }

  return (
    intent === 'ask_verification' ||
    intent === 'search_official_site' ||
    intent === 'call_official' ||
    intent === 'report' ||
    intent === 'emergency_help'
  );
}
