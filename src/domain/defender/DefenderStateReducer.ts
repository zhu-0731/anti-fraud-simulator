import type { DefenderState } from '@/domain/types/game';
import type { WorldState } from '@/domain/types/chat';
import type { DefenseCapability, TacticType } from '@/domain/types/tactic';
import { clamp } from '@/lib/clamp';

export interface DefenderStatePatch {
  exposure?: Partial<DefenderState['exposure']>;
  defense?: Partial<DefenderState['defense']>;
  pressure?: Partial<DefenderState['pressure']>;
  consequences?: Partial<DefenderState['consequences']>;
  discoveredFacts?: string[];
  discoveredContradictions?: string[];
  hiddenRiskSignals?: string[];
  activeRiskActorIds?: string[];
  tacticIds?: TacticType[];
  capabilities?: DefenseCapability[];
}

export class DefenderStateReducer {
  applyPatch(state: DefenderState, patch: DefenderStatePatch): DefenderState {
    const next: DefenderState = {
      ...state,
      exposure: {
        suspiciousLink: clamp(
          state.exposure.suspiciousLink + (patch.exposure?.suspiciousLink ?? 0),
          0,
          100,
        ),
        unverifiedIdentity: clamp(
          state.exposure.unverifiedIdentity + (patch.exposure?.unverifiedIdentity ?? 0),
          0,
          100,
        ),
        informationRequest: clamp(
          state.exposure.informationRequest + (patch.exposure?.informationRequest ?? 0),
          0,
          100,
        ),
        paymentRequest: clamp(
          state.exposure.paymentRequest + (patch.exposure?.paymentRequest ?? 0),
          0,
          100,
        ),
      },
      defense: {
        officialVerification: clamp(
          state.defense.officialVerification + (patch.defense?.officialVerification ?? 0),
          0,
          100,
        ),
        evidenceAwareness: clamp(
          state.defense.evidenceAwareness + (patch.defense?.evidenceAwareness ?? 0),
          0,
          100,
        ),
        contradictionAwareness: clamp(
          state.defense.contradictionAwareness + (patch.defense?.contradictionAwareness ?? 0),
          0,
          100,
        ),
        helpSeeking: clamp(state.defense.helpSeeking + (patch.defense?.helpSeeking ?? 0), 0, 100),
      },
      pressure: {
        deadline: clamp(state.pressure.deadline + (patch.pressure?.deadline ?? 0), 0, 100),
        authority: clamp(state.pressure.authority + (patch.pressure?.authority ?? 0), 0, 100),
        social: clamp(state.pressure.social + (patch.pressure?.social ?? 0), 0, 100),
        emotional: clamp(state.pressure.emotional + (patch.pressure?.emotional ?? 0), 0, 100),
      },
      consequences: {
        informationLeakLevel: clamp(
          state.consequences.informationLeakLevel + (patch.consequences?.informationLeakLevel ?? 0),
          0,
          100,
        ),
        simulatedMoneyLoss: clamp(
          state.consequences.simulatedMoneyLoss + (patch.consequences?.simulatedMoneyLoss ?? 0),
          0,
          100,
        ),
        accountRiskLevel: clamp(
          state.consequences.accountRiskLevel + (patch.consequences?.accountRiskLevel ?? 0),
          0,
          100,
        ),
      },
      discoveredFacts: unique([...state.discoveredFacts, ...(patch.discoveredFacts ?? [])]),
      discoveredContradictions: unique([
        ...state.discoveredContradictions,
        ...(patch.discoveredContradictions ?? []),
      ]),
      hiddenRiskSignals: unique([...state.hiddenRiskSignals, ...(patch.hiddenRiskSignals ?? [])]),
      activeRiskActorIds: unique([...state.activeRiskActorIds, ...(patch.activeRiskActorIds ?? [])]),
    };

    const narrativeStage = resolveDefenderStage(next);
    return {
      ...next,
      narrativeStage,
      triggeredStages: unique([...next.triggeredStages, narrativeStage]),
    };
  }

  fromWorldState(state: DefenderState, worldState: WorldState): DefenderState {
    const next: DefenderState = {
      ...state,
      narrativeStage: mapWorldStage(worldState.narrativeStage),
      exposure: {
        suspiciousLink: clamp(worldState.suspiciousLinkExposure, 0, 100),
        unverifiedIdentity: state.exposure.unverifiedIdentity,
        informationRequest: clamp(worldState.submittedInfoLevel, 0, 100),
        paymentRequest: state.exposure.paymentRequest,
      },
      defense: {
        ...state.defense,
        officialVerification: clamp(worldState.officialPathAwareness, 0, 100),
      },
      pressure: {
        ...state.pressure,
        deadline: clamp(worldState.deadlinePressure, 0, 100),
        authority: clamp(worldState.authorityPressure, 0, 100),
        social: clamp(Math.max(worldState.trustFamilyChain, worldState.trustPeerChain), 0, 100),
      },
      consequences: {
        ...state.consequences,
        informationLeakLevel: clamp(worldState.submittedInfoLevel, 0, 100),
      },
      discoveredFacts: unique([...state.discoveredFacts, ...worldState.knownFacts]),
      discoveredContradictions: unique([
        ...state.discoveredContradictions,
        ...worldState.contradictionsFound,
      ]),
    };

    return {
      ...next,
      triggeredStages: unique([...next.triggeredStages, next.narrativeStage]),
    };
  }
}

function resolveDefenderStage(state: DefenderState): DefenderState['narrativeStage'] {
  if (state.consequences.informationLeakLevel > 20) return 'information_leak';
  if (state.defense.officialVerification > 60 && state.consequences.informationLeakLevel === 0) {
    return 'escape';
  }
  if (state.exposure.informationRequest > 30 || state.exposure.paymentRequest > 20) {
    return 'critical_decision';
  }
  if (state.pressure.authority > 30 || state.pressure.deadline > 30) {
    return 'pressure_escalation';
  }
  if (state.defense.officialVerification > 20 || state.defense.contradictionAwareness > 10) {
    return 'verification_conflict';
  }
  if (state.exposure.suspiciousLink > 15 || state.exposure.unverifiedIdentity > 15) {
    return 'risk_seed';
  }
  if (state.pressure.social > 10) return 'trust_building';
  return 'normal_context';
}

function mapWorldStage(stage: WorldState['narrativeStage']): DefenderState['narrativeStage'] {
  switch (stage) {
    case 'trust_building':
      return 'trust_building';
    case 'fake_entry_seeded':
      return 'risk_seed';
    case 'authority_pressure':
      return 'verification_conflict';
    case 'submission_pressure':
      return 'pressure_escalation';
    case 'leak_or_escape':
      return 'information_leak';
    case 'recovery':
      return 'recovery';
    case 'report':
      return 'report';
    default:
      return 'normal_context';
  }
}

function unique<T>(items: T[]): T[] {
  return [...new Set(items)];
}

export const defenderStateReducer = new DefenderStateReducer();
