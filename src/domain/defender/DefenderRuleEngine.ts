import type { GameState } from '@/domain/types/game';
import type { PlayerIntent } from '@/domain/types/chat';
import type {
  InteractionChannel,
  RiskRoleType,
  TacticType,
  TacticUse,
} from '@/domain/types/tactic';
import { generateId } from '@/lib/id';
import { calculateRepeatEffectMultiplier } from '@/domain/tactics/TacticRegistry';
import { defenderStateReducer, type DefenderStatePatch } from './DefenderStateReducer';

export interface DefenderTurnInput {
  state: GameState;
  contactId: string;
  intent: PlayerIntent;
  now?: string;
}

export interface DefenderRuleResult {
  state: GameState;
  tacticUses: TacticUse[];
}

export class DefenderRuleEngine {
  applyTurn(input: DefenderTurnInput): DefenderRuleResult {
    const now = input.now ?? new Date().toISOString();
    const tacticIds = resolveTactics(input.contactId, input.intent);
    const roleId = resolveRole(input.contactId);
    const channelId = resolveChannel(input.contactId);
    const turnNumber = input.state.tacticUses.length + 1;
    const tacticUses = tacticIds.map((tacticId) => {
      const effectMultiplier = calculateRepeatEffectMultiplier({
        tacticId,
        previousUses: input.state.tacticUses,
      });
      return {
        id: generateId('tu'),
        tacticId,
        mode: 'defender' as const,
        roleId,
        channelId,
        intensity: resolveIntensity(input.intent),
        turnNumber,
        effectMultiplier,
        createdAt: now,
      };
    });

    const stateAfterWorldSync = {
      ...input.state,
      defenderState: defenderStateReducer.fromWorldState(
        input.state.defenderState,
        input.state.worldState,
      ),
    };

    const nextDefenderState = defenderStateReducer.applyPatch(
      stateAfterWorldSync.defenderState,
      buildPatch(input.contactId, input.intent, tacticIds),
    );

    const nextState: GameState = {
      ...stateAfterWorldSync,
      defenderState: nextDefenderState,
      tacticUses: [...input.state.tacticUses, ...tacticUses],
    };

    return {
      state: nextState,
      tacticUses,
    };
  }
}

function resolveTactics(contactId: string, intent: PlayerIntent): TacticType[] {
  if (contactId === 'fake_admission') {
    if (intent === 'challenge_identity') return ['authority_claim', 'consistency_repair'];
    if (intent === 'request_link' || intent === 'open_link') return ['authority_claim', 'channel_switch'];
    if (intent === 'submit_info') return ['authority_claim', 'information_escalation'];
    return ['authority_claim', 'urgency_pressure'];
  }

  if (contactId === 'group') {
    if (intent === 'request_link' || intent === 'open_link') return ['social_proof', 'channel_switch'];
    return ['social_proof', 'urgency_pressure'];
  }

  if (contactId === 'mom') return ['social_proof', 'loss_aversion'];
  if (contactId === 'senior') return ['social_proof', 'channel_switch'];
  return [];
}

function resolveRole(contactId: string): RiskRoleType {
  switch (contactId) {
    case 'mom':
      return 'family_forwarder';
    case 'senior':
      return 'senior_student';
    case 'group':
      return 'group_member';
    case 'fake_admission':
      return 'unverified_staff';
    default:
      return 'automated_notification';
  }
}

function resolveChannel(contactId: string): InteractionChannel {
  switch (contactId) {
    case 'group':
      return 'group_chat';
    case 'official_service':
    case 'anti_fraud':
      return 'simulated_browser';
    default:
      return 'private_chat';
  }
}

function resolveIntensity(intent: PlayerIntent): 1 | 2 | 3 {
  if (intent === 'submit_info' || intent === 'open_link') return 3;
  if (intent === 'request_link' || intent === 'challenge_identity') return 2;
  return 1;
}

function buildPatch(
  contactId: string,
  intent: PlayerIntent,
  tacticIds: TacticType[],
): DefenderStatePatch {
  const patch: DefenderStatePatch = {
    hiddenRiskSignals: tacticIds,
    activeRiskActorIds: contactId === 'fake_admission' ? ['fake_admission'] : [],
  };

  if (tacticIds.includes('authority_claim')) {
    patch.exposure = { ...patch.exposure, unverifiedIdentity: 10 };
    patch.pressure = { ...patch.pressure, authority: 10 };
  }
  if (tacticIds.includes('social_proof')) {
    patch.pressure = { ...patch.pressure, social: 8 };
  }
  if (tacticIds.includes('urgency_pressure')) {
    patch.pressure = { ...patch.pressure, deadline: 10 };
  }
  if (tacticIds.includes('channel_switch')) {
    patch.exposure = { ...patch.exposure, suspiciousLink: 8 };
  }
  if (tacticIds.includes('information_escalation') || intent === 'submit_info') {
    patch.exposure = { ...patch.exposure, informationRequest: 18 };
    patch.consequences = { ...patch.consequences, informationLeakLevel: intent === 'submit_info' ? 30 : 0 };
  }

  if (intent === 'ask_source') {
    patch.defense = { ...patch.defense, officialVerification: 5 };
    patch.discoveredFacts = ['玩家追问信息来源'];
  }
  if (intent === 'ask_verification' || intent === 'challenge_identity') {
    patch.defense = {
      ...patch.defense,
      officialVerification: 10,
      contradictionAwareness: intent === 'challenge_identity' ? 10 : 0,
    };
    patch.discoveredFacts = ['玩家要求身份核实'];
  }
  if (intent === 'search_official_site' || contactId === 'official_service') {
    patch.defense = { ...patch.defense, officialVerification: 25 };
    patch.discoveredFacts = ['玩家使用官方渠道核实'];
  }
  if (intent === 'call_official' || contactId === 'anti_fraud') {
    patch.defense = { ...patch.defense, officialVerification: 30, helpSeeking: 10 };
    patch.discoveredFacts = ['玩家拨打或咨询官方渠道'];
  }
  if (intent === 'save_evidence' || intent === 'report') {
    patch.defense = { ...patch.defense, evidenceAwareness: 15, helpSeeking: 10 };
    patch.discoveredFacts = ['玩家保存证据或举报'];
  }
  if (intent === 'emergency_help') {
    patch.defense = { ...patch.defense, helpSeeking: 20 };
  }

  return patch;
}

export const defenderRuleEngine = new DefenderRuleEngine();
