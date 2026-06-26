import type { DefenderState, GameDifficulty } from './game';
import type { PlayerIntent } from './chat';
import type {
  DefenseCapability,
  InteractionChannel,
  RiskRoleType,
  TacticType,
  TacticUse,
} from './tactic';
import type { NarrativeStage } from './defender';

export type DirectorResponseRole =
  | RiskRoleType
  | 'counselor'
  | 'official_service'
  | 'anti_fraud';

export interface DirectorInput {
  state: DefenderState;
  playerIntent: PlayerIntent;
  difficulty: GameDifficulty;
  currentTurn: number;
  previousTacticUses: TacticUse[];
  discoveredFacts: string[];
  discoveredContradictions: string[];
}

export interface DirectorPlan {
  responseRole: DirectorResponseRole;
  channel: InteractionChannel | 'official';
  allowedTactics: TacticType[];
  maximumIntensity: 1 | 2 | 3;
  teachingGoal: DefenseCapability;
  nextStageSuggestion: NarrativeStage;
  viewEffects: string[];
  reasonCode:
    | 'seed_risk'
    | 'increase_pressure'
    | 'respond_to_verification'
    | 'safe_escape'
    | 'recovery_support'
    | 'rule_fallback';
  fallbackUsed: boolean;
}

export interface IDirectorAgent {
  plan(input: DirectorInput): Promise<DirectorPlan>;
}
