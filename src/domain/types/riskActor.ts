import type { ChatMessage } from './chat';
import type { DirectorPlan } from './director';
import type { TacticType, TacticUse } from './tactic';

export interface RiskActorInput {
  plan: DirectorPlan;
  allowedClaims: string[];
  forbiddenClaims: string[];
  simulatedResources: {
    officialDomain: string;
    fakeDomain: string;
  };
  recentMessages: ChatMessage[];
}

export interface RiskActorOutput {
  responseText: string;
  visibleContent: string;
  usedTacticUseIds: string[];
  tacticUses: TacticUse[];
  viewEffects: string[];
}

export interface IRiskActorAgent {
  generate(input: RiskActorInput): Promise<RiskActorOutput>;
}

export interface RiskTacticTemplate {
  tacticId: TacticType;
  text: string;
}
