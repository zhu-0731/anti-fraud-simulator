'use client';

import { create } from 'zustand';
import type { GameState, EventCard, GamePhase } from '@/domain/types/game';
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
  error: string | null;

  // Actions
  startGame(chapterId?: string): Promise<void>;
  submitAction(eventId: string, actionId: string): Promise<void>;
  loadReport(): Promise<void>;
  restoreSession(): Promise<void>;
  resetGame(): void;
  clearError(): void;
  setPhase(phase: GamePhase): void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  sessionId: null,
  gameState: null,
  currentEvent: null,
  report: null,
  feedback: '',
  isLoading: false,
  error: null,

  async startGame(chapterId = 'chapter_recommendation_001') {
    set({ isLoading: true, error: null });
    try {
      const { sessionId, state, firstEvent } = await apiClient.startSession(chapterId);
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
}));
