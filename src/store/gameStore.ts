'use client';

import { create } from 'zustand';
import type { GameState, EventCard, GamePhase, GameDifficulty } from '@/domain/types/game';
import type { ChatMessage, SystemNotification, ActiveView } from '@/domain/types/chat';
import type { GameReport } from '@/domain/types/report';
import { apiClient } from '@/lib/apiClient';
import { saveSessionId, loadSessionId, clearSession } from '@/lib/storage';

interface GameStore {
  // State
  sessionId: string | null;
  gameState: GameState | null;
  currentEvent: EventCard | null;
  report: GameReport | null;
  feedback: string;
  isLoading: boolean;
  isChatLoading: boolean;
  error: string | null;

  // Legacy event-card actions
  startGame(chapterId?: string, difficulty?: GameDifficulty): Promise<void>;
  submitAction(eventId: string, actionId: string): Promise<void>;
  loadReport(): Promise<void>;
  restoreSession(): Promise<void>;
  resetGame(): void;
  clearError(): void;
  setPhase(phase: GamePhase): void;

  // Chat system actions
  sendMessage(contactId: string, text: string): Promise<void>;
  openContact(contactId: string): Promise<void>;
  setActiveView(view: ActiveView): void;
  openBrowserUrl(url: string): void;
  narrativeTick(contactId?: string): Promise<void>;

  // Derived helpers
  getActiveMessages(): ChatMessage[];
  getPendingNotifications(): SystemNotification[];
}

export const useGameStore = create<GameStore>((set, get) => ({
  sessionId: null,
  gameState: null,
  currentEvent: null,
  report: null,
  feedback: '',
  isLoading: false,
  isChatLoading: false,
  error: null,

  async startGame(chapterId = 'chapter_recommendation_001', difficulty: GameDifficulty = 'beginner') {
    set({ isLoading: true, error: null });
    try {
      const { sessionId, state, firstEvent } = await apiClient.startSession(chapterId, difficulty);
      saveSessionId(sessionId);
      set({
        sessionId,
        gameState: state,
        currentEvent: firstEvent,
        report: null,
        feedback: '',
        isLoading: false,
      });
    } catch (err) {
      set({ error: String(err), isLoading: false });
    }
  },

  async submitAction(eventId: string, actionId: string) {
    const { sessionId } = get();
    if (!sessionId) return;
    set({ isLoading: true, error: null, feedback: '' });
    try {
      const { state, nextEvent, feedback } = await apiClient.handleAction(
        sessionId,
        eventId,
        actionId,
      );
      set({
        gameState: state,
        currentEvent: nextEvent ?? get().currentEvent,
        feedback,
        isLoading: false,
      });
    } catch (err) {
      set({ error: String(err), isLoading: false });
    }
  },

  async loadReport() {
    const { sessionId } = get();
    if (!sessionId) return;
    set({ isLoading: true, error: null });
    try {
      const { report } = await apiClient.generateReport(sessionId);
      set({ report, isLoading: false });
    } catch (err) {
      set({ error: String(err), isLoading: false });
    }
  },

  async restoreSession() {
    const sessionId = loadSessionId();
    if (!sessionId) return;
    set({ isLoading: true });
    try {
      const { state, currentEvent } = await apiClient.getGameState(sessionId);
      set({ sessionId, gameState: state, currentEvent, isLoading: false });
    } catch {
      clearSession();
      set({ isLoading: false });
    }
  },

  resetGame() {
    clearSession();
    set({
      sessionId: null,
      gameState: null,
      currentEvent: null,
      report: null,
      feedback: '',
      error: null,
    });
  },

  clearError() {
    set({ error: null });
  },

  setPhase(phase: GamePhase) {
    set((s) => ({
      gameState: s.gameState ? { ...s.gameState, phase } : null,
    }));
  },

  async sendMessage(contactId: string, text: string) {
    const { sessionId, gameState } = get();
    if (!sessionId || !gameState) return;
    set({ isChatLoading: true, error: null });
    try {
      const result = await apiClient.sendMessage(sessionId, contactId, text);
      const updatedState = result.state;

      // Handle phase transitions
      if (result.triggerEmergency && gameState.phase === 'playing') {
        updatedState.phase = 'emergency';
      }
      if (result.triggerReport) {
        updatedState.phase = 'report';
      }

      const latestState = get().gameState;
      set({
        gameState: latestState
          ? {
              ...updatedState,
              activeView: latestState.activeView,
              activeContactId: latestState.activeContactId,
              browserState: latestState.browserState,
              phoneState: latestState.phoneState,
            }
          : updatedState,
        isChatLoading: false,
      });
    } catch (err) {
      set({ error: String(err), isChatLoading: false });
    }
  },

  async openContact(contactId: string) {
    const { sessionId } = get();
    if (!sessionId) return;
    set({ isChatLoading: true });
    try {
      const { state } = await apiClient.openContact(sessionId, contactId);
      set({ gameState: state, isChatLoading: false });
    } catch (err) {
      set({ error: String(err), isChatLoading: false });
    }
  },

  setActiveView(view: ActiveView) {
    set((s) => ({
      gameState: s.gameState ? { ...s.gameState, activeView: view } : null,
    }));
  },

  openBrowserUrl(url: string) {
    const normalizedUrl = url.trim().replace(/^https?:\/\//, '');
    if (!normalizedUrl) return;

    set((s) => ({
      gameState: s.gameState
        ? {
            ...s.gameState,
            activeView: 'browser',
            browserState: {
              url: normalizedUrl,
              title: normalizedUrl,
              hasCountdown: false,
              countdownSeconds: 0,
              hasForm: false,
              isLoading: false,
            },
          }
        : null,
    }));
  },

  async narrativeTick(contactId?: string) {
    const { sessionId } = get();
    if (!sessionId) return;
    try {
      const result = await apiClient.narrativeTick(sessionId, contactId);
      const updatedState = result.state;
      if (result.triggerEmergency) updatedState.phase = 'emergency';
      if (result.triggerReport) updatedState.phase = 'report';
      const latestState = get().gameState;
      set({
        gameState: latestState
          ? {
              ...updatedState,
              activeView: latestState.activeView,
              activeContactId: latestState.activeContactId,
              browserState: latestState.browserState,
              phoneState: latestState.phoneState,
            }
          : updatedState,
      });
    } catch {
      // Narrative ticks fail silently
    }
  },

  getActiveMessages(): ChatMessage[] {
    const { gameState } = get();
    if (!gameState?.activeContactId) return [];
    return gameState.chatHistories[gameState.activeContactId] ?? [];
  },

  getPendingNotifications(): SystemNotification[] {
    const { gameState } = get();
    return gameState?.notifications ?? [];
  },
}));
