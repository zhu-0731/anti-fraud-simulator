import type { GameState, EventCard } from '@/domain/types/game';
import type { GameReport } from '@/domain/types/report';
import type { AIEventOutput } from '@/domain/types/ai';

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as { error: string }).error ?? res.statusText);
  }
  return res.json() as Promise<T>;
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(path);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as { error: string }).error ?? res.statusText);
  }
  return res.json() as Promise<T>;
}

export interface StartSessionResponse {
  sessionId: string;
  state: GameState;
  firstEvent: EventCard;
}

export interface GameStateResponse {
  state: GameState;
  currentEvent: EventCard | null;
}

export interface HandleActionResponse {
  state: GameState;
  nextEvent: EventCard | null;
  feedback: string;
}

export interface GenerateReportResponse {
  report: GameReport;
}

export const apiClient = {
  startSession(chapterId: string): Promise<StartSessionResponse> {
    return post('/api/session/start', { chapterId });
  },

  getGameState(sessionId: string): Promise<GameStateResponse> {
    return get(`/api/game/state?sessionId=${encodeURIComponent(sessionId)}`);
  },

  handleAction(sessionId: string, eventId: string, actionId: string): Promise<HandleActionResponse> {
    return post('/api/game/action', { sessionId, eventId, actionId });
  },

  generateAIEvent(sessionId: string, teachingGoal: string): Promise<AIEventOutput> {
    return post('/api/ai/generate-event', { sessionId, teachingGoal });
  },

  generateReport(sessionId: string): Promise<GenerateReportResponse> {
    return post('/api/report/generate', { sessionId });
  },
};
