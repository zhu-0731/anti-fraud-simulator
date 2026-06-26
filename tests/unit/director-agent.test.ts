import { describe, expect, it } from 'vitest';
import { DirectorAgent } from '@/domain/agents/director/DirectorAgent';
import { ruleDirectorAgent } from '@/domain/agents/director/RuleDirectorAgent';
import { createInitialDefenderState } from '@/domain/gameModes';
import { defenderStateReducer } from '@/domain/defender/DefenderStateReducer';
import { getRoleCard } from '@/domain/tactics/RoleRegistry';
import type { DirectorInput, IDirectorAgent } from '@/domain/types/director';

describe('DirectorAgent', () => {
  it('returns only tactics allowed by the selected role', async () => {
    const plan = await ruleDirectorAgent.plan(baseInput());
    const role = getRoleCard('group_member');

    expect(plan.responseRole).toBe('group_member');
    expect(plan.allowedTactics.length).toBeGreaterThan(0);
    for (const tacticId of plan.allowedTactics) {
      expect(role.availableTactics).toContain(tacticId);
    }
  });

  it('caps maximum intensity by difficulty', async () => {
    const beginner = await ruleDirectorAgent.plan(baseInput({ difficulty: 'beginner' }));
    const advanced = await ruleDirectorAgent.plan(baseInput({ difficulty: 'advanced' }));

    expect(beginner.maximumIntensity).toBe(1);
    expect(advanced.maximumIntensity).toBe(3);
  });

  it('respects tactic cooldowns', async () => {
    const plan = await ruleDirectorAgent.plan(
      baseInput({
        previousTacticUses: [
          {
            id: 'tu_1',
            tacticId: 'social_proof',
            mode: 'defender',
            roleId: 'group_member',
            channelId: 'group_chat',
            intensity: 1,
            turnNumber: 1,
            effectMultiplier: 1,
            createdAt: '2026-06-27T00:00:00.000Z',
          },
        ],
        currentTurn: 2,
      }),
    );

    expect(plan.allowedTactics).not.toContain('social_proof');
  });

  it('responds to verification attempts with verification-conflict tactics', async () => {
    const plan = await ruleDirectorAgent.plan(
      baseInput({
        playerIntent: 'challenge_identity',
        difficulty: 'standard',
      }),
    );

    expect(plan.reasonCode).toBe('respond_to_verification');
    expect(plan.allowedTactics).toContain('authority_claim');
    expect(plan.allowedTactics).toContain('verification_deflection');
    expect(plan.nextStageSuggestion).toBe('verification_conflict');
  });

  it('suggests safe escape after sustained official verification', async () => {
    const verifiedState = defenderStateReducer.applyPatch(createInitialDefenderState(), {
      defense: { officialVerification: 80 },
    });
    const plan = await ruleDirectorAgent.plan(baseInput({ state: verifiedState }));

    expect(plan.responseRole).toBe('official_service');
    expect(plan.allowedTactics).toEqual([]);
    expect(plan.reasonCode).toBe('safe_escape');
  });

  it('falls back to rule director when the primary director fails', async () => {
    const failing: IDirectorAgent = {
      async plan() {
        throw new Error('boom');
      },
    };
    const agent = new DirectorAgent(failing, ruleDirectorAgent);
    const plan = await agent.plan(baseInput());

    expect(plan.fallbackUsed).toBe(true);
    expect(plan.reasonCode).toBe('rule_fallback');
  });
});

function baseInput(overrides: Partial<DirectorInput> = {}): DirectorInput {
  return {
    state: createInitialDefenderState(),
    playerIntent: 'small_talk',
    difficulty: 'beginner',
    currentTurn: 1,
    previousTacticUses: [],
    discoveredFacts: [],
    discoveredContradictions: [],
    ...overrides,
  };
}
