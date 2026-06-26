import { describe, expect, it } from 'vitest';
import {
  assertValidGameModeState,
  createInitialDefenderState,
  createInitialRedTeamState,
  normalizeDifficulty,
  normalizeGameMode,
} from '@/domain/gameModes';
import { gameEngine } from '@/domain/services/GameEngine';
import type { GameState } from '@/domain/types/game';

describe('game mode contracts', () => {
  it('normalizes mode and difficulty conservatively', () => {
    expect(normalizeGameMode('red_team')).toBe('red_team');
    expect(normalizeGameMode('unexpected')).toBe('defender');
    expect(normalizeDifficulty('advanced')).toBe('advanced');
    expect(normalizeDifficulty('unexpected')).toBe('beginner');
  });

  it('creates isolated defender and red-team state skeletons', async () => {
    const defender = await gameEngine.startSession('chapter_recommendation_001', 'standard');
    const redTeam = createInitialRedTeamState({ difficulty: 'advanced' });

    expect(defender.state.mode).toBe('defender');
    expect(defender.state.difficulty).toBe('standard');
    expect(defender.state.defenderState.narrativeStage).toBe('normal_context');
    expect('redTeamState' in defender.state).toBe(false);

    expect(redTeam.mode).toBe('red_team');
    expect(redTeam.difficulty).toBe('advanced');
    expect(redTeam.status).toBe('not_ready');
    expect('defenderState' in redTeam).toBe(false);
  });

  it('rejects defender sessions that contain red-team state', async () => {
    const { state } = await gameEngine.startSession('chapter_recommendation_001');
    const invalid = {
      ...state,
      redTeamState: createInitialRedTeamState(),
    } as unknown as GameState;

    expect(() => assertValidGameModeState(invalid)).toThrow(
      'Defender session must not contain redTeamState',
    );
  });

  it('initializes every defender state section with neutral values', () => {
    const state = createInitialDefenderState();

    expect(state.triggeredStages).toEqual(['normal_context']);
    expect(state.exposure.suspiciousLink).toBe(0);
    expect(state.defense.officialVerification).toBe(0);
    expect(state.pressure.authority).toBe(0);
    expect(state.consequences.informationLeakLevel).toBe(0);
  });
});
