import type { AIErrorCode } from './AIError';

export interface AICallLog {
  id: string;
  requestId: string;
  sessionId: string;
  task: 'generate_event';
  provider: string;
  model: string;
  latencyMs: number;
  schemaValid: boolean;
  fallbackUsed: boolean;
  safetyFlags: string[];
  errorCode?: AIErrorCode;
  retryCount: number;
  createdAt: string;
}

class InMemoryAICallLogRepository {
  private logs: AICallLog[] = [];

  add(log: AICallLog): void {
    this.logs.push(structuredClone(log));
  }

  list(): AICallLog[] {
    return structuredClone(this.logs);
  }

  clear(): void {
    this.logs = [];
  }
}

export const aiCallLogRepository = new InMemoryAICallLogRepository();
