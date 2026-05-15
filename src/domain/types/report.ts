import type { EndingType, ActionRecord, Evidence } from './game';
import type { DelayedConsequence } from './chat';

export interface ScoreBreakdown {
  riskIdentification: number;
  verificationPath: number;
  taskCompletion: number;
  emergencyHandling: number;
  reviewUnderstanding: number;
  total: number;
}

export interface TimelineEntry {
  eventId: string;
  eventTitle: string;
  actionId: string;
  actionLabel: string;
  category: string;
  isCorrect: boolean;
  feedback: string;
  timestamp: string;
  // Causal chain enrichment
  lookedReasonableBecause?: string;
  hiddenRisk?: string;
  laterImpact?: string;
}

export interface TurningPoint {
  timestamp: string;
  description: string;
  playerChoice: string;
  consequence: string;
  couldHaveDone: string;
}

export interface TrustChainAnalysis {
  familyChain: { score: number; description: string };
  peerChain: { score: number; description: string };
  authorityChain: { score: number; description: string };
  officialAwareness: { score: number; description: string };
}

export interface GameReport {
  sessionId: string;
  endingType: EndingType;
  score: ScoreBreakdown;
  timeline: TimelineEntry[];
  keyMistakes: ActionRecord[];
  correctActions: ActionRecord[];
  evidenceSummary: Evidence[];
  realWorldAdvice: string[];
  teachingPoints: string[];
  agentTraceSummary?: string;
  generatedAt: string;

  // Causal chain (new)
  delayedConsequences: DelayedConsequence[];
  turningPoints: TurningPoint[];
  trustChainAnalysis: TrustChainAnalysis;
  pressureChainSummary: string;
  recoveryEvaluation: string;
}
