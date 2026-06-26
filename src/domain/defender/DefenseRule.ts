import type { DefenseCapability, TacticType } from '@/domain/types/tactic';

export interface DefenseRule {
  id: string;
  conditions: {
    tacticsAllOf?: TacticType[];
    tacticsAnyOf?: TacticType[];
    signalKeywordsAnyOf?: string[];
    minIntensity?: number;
    repeatedClaimCount?: number;
    crossTurnRequestCount?: number;
  };
  effects: {
    suspicionDelta: number;
    identityTrustDelta: number;
    disclosureDelta: number;
    requireIndependentVerification: boolean;
    forceDecision?: 'question' | 'verify' | 'reject' | 'report';
  };
  explanation: string;
  testedCapability: DefenseCapability;
  sourcePatternIds: string[];
}
