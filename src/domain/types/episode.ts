import type { GameDifficulty, GameMode } from './game';
import type { TacticUse, TacticType } from './tactic';

export interface AgentStep {
  id: string;
  turnId: string;
  agentId: string;
  type: 'director' | 'risk_actor' | 'support' | 'rule_engine' | 'report_builder';
  summary: string;
  inputRef?: string;
  outputRef?: string;
  fallbackUsed?: boolean;
  requestId?: string;
}

export interface EpisodeTurn {
  id: string;
  episodeId: string;
  turnNumber: number;
  mode: GameMode;
  source: 'chat' | 'event_action' | 'system';
  contactId?: string;
  messageId?: string;
  actionId?: string;
  playerAction: string;
  playerText?: string;
  tacticUses: TacticUse[];
  agentSteps: AgentStep[];
  tacticExplanations: EpisodeTacticExplanation[];
  observedRiskSignals: string[];
  saferAction: string;
  officialVerification: boolean;
  informationLeakOccurred: boolean;
  emergencyHandled: boolean;
  timestamp: string;
}

export interface EpisodeTacticExplanation {
  tacticId: TacticType;
  tacticName: string;
  lookedReasonableBecause: string;
  riskSignals: string[];
  saferAction: string;
}

export interface Episode {
  id: string;
  sessionId: string;
  mode: GameMode;
  difficulty: GameDifficulty;
  turns: EpisodeTurn[];
  firstOfficialVerificationTurnId?: string;
  generatedAt: string;
}
