import { describe, expect, it } from 'vitest';
import { gameEngine } from '@/domain/services/GameEngine';

describe('game session startup', () => {
  it('creates a playable session with seven contacts and initial state', async () => {
    const result = await gameEngine.startSession('chapter_recommendation_001');

    expect(result.sessionId).toMatch(/^session_/);
    expect(result.firstEvent.id).toBe('E01');
    expect(result.state.mode).toBe('defender');
    expect(result.state.difficulty).toBe('beginner');
    expect(result.state.phase).toBe('playing');
    expect(result.state.defenderState.narrativeStage).toBe('normal_context');
    expect(result.state.contacts).toHaveLength(7);
    expect(result.state.activeView).toBe('chat_list');
    expect(result.state.worldState.narrativeStage).toBe('normal_context');
  });
});
