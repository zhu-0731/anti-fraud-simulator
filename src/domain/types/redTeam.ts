import type { GameDifficulty, RedTeamState } from './game';
import type { EpisodeTurn } from './episode';
import type { InteractionChannel, RiskRoleType, TacticUse, TacticType } from './tactic';

export interface VictimVisibleMessage {
  id: string;
  channelId: InteractionChannel;
  roleHint: string;
  content: string;
  timestamp: string;
}

export interface VictimAgentInput {
  sessionId: string;
  difficulty: GameDifficulty;
  scenarioId: string;
  visibleMessages: VictimVisibleMessage[];
  victimProfile: {
    riskAwareness: 'low' | 'medium' | 'high';
    pressureTolerance: 'low' | 'medium' | 'high';
    priorKnowledge: string[];
  };
  publicContext: string[];
}

export interface VictimAgentOutput {
  responseText: string;
  decision: 'ignore' | 'question' | 'comply' | 'verify' | 'report';
  confidence: number;
  exposedSignals: string[];
  requestedNextChannel?: InteractionChannel;
}

export interface JudgeAgentInput {
  sessionId: string;
  difficulty: GameDifficulty;
  scenarioId: string;
  evidenceTurns: Pick<EpisodeTurn, 'id' | 'turnNumber' | 'mode' | 'messageId' | 'actionId'>[];
  candidateTacticUses: TacticUse[];
  playerHypothesis?: BlindSpotHypothesis;
}

export interface JudgeAgentOutput {
  accepted: boolean;
  confidence: number;
  evidenceTurnIds: string[];
  detectedTactics: TacticType[];
  possibleNewBlindSpot: boolean;
  feedback: string;
}

export interface BlindSpotHypothesis {
  id: string;
  sessionId: string;
  description: string;
  suspectedTactics: TacticType[];
  evidenceTurnIds: string[];
  submittedAt: string;
}

export interface RedTeamTurnRequest {
  sessionId: string;
  state: RedTeamState;
  selectedRole: RiskRoleType;
  selectedChannel: InteractionChannel;
  selectedTactics: TacticType[];
  messageDraft: string;
}

export interface RedTeamTurnResponse {
  status: 'not_ready';
  state: RedTeamState;
  message: string;
}
