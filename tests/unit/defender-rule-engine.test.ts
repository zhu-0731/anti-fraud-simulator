import { describe, expect, it } from 'vitest';
import { defenderRuleEngine } from '@/domain/defender/DefenderRuleEngine';
import { gameEngine } from '@/domain/services/GameEngine';

describe('DefenderRuleEngine', () => {
  it('records authorized tactic uses for risk actor turns', async () => {
    const { state } = await gameEngine.startSession('chapter_recommendation_001');
    const result = defenderRuleEngine.applyTurn({
      state,
      contactId: 'fake_admission',
      intent: 'request_link',
      now: '2026-06-27T00:00:00.000Z',
    });

    expect(result.tacticUses.map((use) => use.tacticId)).toEqual([
      'authority_claim',
      'channel_switch',
    ]);
    expect(result.state.tacticUses).toHaveLength(2);
    expect(result.state.defenderState.exposure.unverifiedIdentity).toBeGreaterThan(0);
    expect(result.state.defenderState.activeRiskActorIds).toContain('fake_admission');
  });

  it('does not create risk tactic uses for official support contacts', async () => {
    const { state } = await gameEngine.startSession('chapter_recommendation_001');
    const result = defenderRuleEngine.applyTurn({
      state,
      contactId: 'official_service',
      intent: 'search_official_site',
    });

    expect(result.tacticUses).toEqual([]);
    expect(result.state.defenderState.defense.officialVerification).toBeGreaterThan(0);
  });
});
