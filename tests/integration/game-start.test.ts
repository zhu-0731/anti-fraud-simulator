import { describe, expect, it } from 'vitest';
import { gameStartService } from '@/domain/services/GameStartService';

describe('unified game start service', () => {
  it('starts defender mode through the unified contract', async () => {
    const result = await gameStartService.startGame({
      mode: 'defender',
      chapterId: 'chapter_recommendation_001',
      difficulty: 'beginner',
    });

    expect(result.mode).toBe('defender');
    if (result.mode !== 'defender') throw new Error('Expected defender result');
    expect(result.sessionId).toMatch(/^session_/);
    expect(result.state.mode).toBe('defender');
    expect(result.state.phase).toBe('playing');
    expect(result.firstEvent.id).toBe('E01');
  });

  it('returns a not-ready contract for red-team mode without defender state', async () => {
    const result = await gameStartService.startGame({
      mode: 'red_team',
      chapterId: 'chapter_recommendation_001',
      difficulty: 'standard',
    });

    expect(result.mode).toBe('red_team');
    if (result.mode !== 'red_team') throw new Error('Expected red-team result');
    expect(result.code).toBe('FEATURE_NOT_READY');
    expect(result.state.mode).toBe('red_team');
    expect(result.state.status).toBe('not_ready');
    expect('defenderState' in result.state).toBe(false);
  });
});
