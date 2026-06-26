import type { PlayerIntent } from './chat';

export type SupportRole =
  | 'family'
  | 'peer'
  | 'group'
  | 'counselor'
  | 'official'
  | 'anti_fraud';

export interface SupportAgentInput {
  role: SupportRole;
  playerIntent: PlayerIntent;
  playerText: string;
}

export interface SupportAgentOutput {
  role: SupportRole;
  responseText: string;
  isAuthoritative: boolean;
  recommendedActions: string[];
  safetyFlags: string[];
}

export interface ISupportAgent {
  respond(input: SupportAgentInput): Promise<SupportAgentOutput>;
}
