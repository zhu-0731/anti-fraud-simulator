import type { EventCard } from './game';

export interface AIEventGenerationInput {
  sessionId: string;
  teachingGoal: string;
  currentRiskScore: number;
  currentAnxietyScore: number;
  flags: Record<string, boolean>;
  actionHistory: string[];
  chapterId: string;
}

export interface AIEventOutput {
  event: EventCard;
  provider: string;
  confidence?: number;
  reasoning?: string;
}

export interface AIEventProvider {
  name: string;
  generateEvent(input: AIEventGenerationInput): Promise<AIEventOutput>;
}

export interface AgentStep {
  stepId: string;
  agentName: string;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  timestamp: string;
  durationMs?: number;
}

export interface AgentTrace {
  traceId: string;
  sessionId: string;
  steps: AgentStep[];
  totalDurationMs?: number;
}

export interface SafetyFilterResult {
  passed: boolean;
  filteredEvent: EventCard;
  warnings: string[];
  blockedReasons: string[];
}
