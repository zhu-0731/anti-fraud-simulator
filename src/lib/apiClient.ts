import type { GameState, EventCard, GameDifficulty, GameMode } from '@/domain/types/game';
import type { ChatMessage, SystemNotification } from '@/domain/types/chat';
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
  mode?: GameMode;
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

export interface SendMessageResponse {
  state: GameState;
  messages: ChatMessage[];
  notifications: SystemNotification[];
  triggerEmergency: boolean;
  triggerReport: boolean;
}

export interface OpenContactResponse {
  state: GameState;
  chatHistory: ChatMessage[];
}

export interface NarrativeTickResponse {
  state: GameState;
  notifications: SystemNotification[];
  triggerEmergency: boolean;
  triggerReport: boolean;
}

export const apiClient = {
  startSession(
    chapterId: string,
    difficulty: GameDifficulty = 'beginner',
  ): Promise<StartSessionResponse> {
    return post('/api/game/start', { mode: 'defender', chapterId, difficulty });
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

  sendMessage(sessionId: string, contactId: string, text: string): Promise<SendMessageResponse> {
    return post('/api/chat/send', { sessionId, contactId, text });
  },

  openContact(sessionId: string, contactId: string): Promise<OpenContactResponse> {
    return post('/api/chat/open-contact', { sessionId, contactId });
  },

  narrativeTick(sessionId: string, contactId?: string): Promise<NarrativeTickResponse> {
    return post('/api/narrative/tick', { sessionId, contactId });
  },
};
