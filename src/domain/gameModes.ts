import type {
  DefenderState,
  FeatureNotReadyResponse,
  GameDifficulty,
  GameMode,
  GameState,
  RedTeamState,
} from '@/domain/types/game';
import { generateId } from '@/lib/id';

export function normalizeGameMode(mode: unknown): GameMode {
  return mode === 'red_team' ? 'red_team' : 'defender';
}

export function normalizeDifficulty(difficulty: unknown): GameDifficulty {
  if (difficulty === 'standard' || difficulty === 'advanced') return difficulty;
  return 'beginner';
}

export function createInitialDefenderState(): DefenderState {
  return {
    narrativeStage: 'normal_context',
    exposure: {
      suspiciousLink: 0,
      unverifiedIdentity: 0,
      informationRequest: 0,
      paymentRequest: 0,
    },
    defense: {
      officialVerification: 0,
      evidenceAwareness: 0,
      contradictionAwareness: 0,
      helpSeeking: 0,
    },
    pressure: {
      deadline: 0,
      authority: 0,
      social: 0,
      emotional: 0,
    },
    consequences: {
      informationLeakLevel: 0,
      simulatedMoneyLoss: 0,
      accountRiskLevel: 0,
    },
    discoveredFacts: [],
    discoveredContradictions: [],
    hiddenRiskSignals: [],
    activeRiskActorIds: [],
    triggeredStages: ['normal_context'],
  };
}

export function createInitialRedTeamState(input?: {
  sessionId?: string;
  difficulty?: GameDifficulty;
  scenarioId?: string;
}): RedTeamState {
  return {
    mode: 'red_team',
    sessionId: input?.sessionId ?? generateId('redteam'),
    difficulty: input?.difficulty ?? 'beginner',
    scenarioId: input?.scenarioId ?? 'chapter_recommendation_001',
    status: 'not_ready',
    selectedTactics: [],
    selectedRole: null,
    selectedChannel: null,
    turnCount: 0,
  };
}

export function createRedTeamNotReadyResponse(state: RedTeamState): FeatureNotReadyResponse {
  return {
    code: 'FEATURE_NOT_READY',
    mode: 'red_team',
    message: '红队模式契约已建立，完整玩法将在后续阶段启用。',
    state,
  };
}

export function assertValidGameModeState(state: GameState): void {
  if (state.mode !== 'defender') {
    throw new Error(`Unsupported persisted game mode: ${String(state.mode)}`);
  }

  if (!state.defenderState) {
    throw new Error('Defender session is missing defenderState');
  }

  if ('redTeamState' in state && state.redTeamState !== undefined) {
    throw new Error('Defender session must not contain redTeamState');
  }
}
