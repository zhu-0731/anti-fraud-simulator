import type { EndingType, ActionRecord, Evidence } from './game';

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
}
