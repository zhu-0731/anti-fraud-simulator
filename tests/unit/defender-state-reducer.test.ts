import { describe, expect, it } from 'vitest';
import { createInitialDefenderState } from '@/domain/gameModes';
import { defenderStateReducer } from '@/domain/defender/DefenderStateReducer';

describe('DefenderStateReducer', () => {
  it('clamps state values and records stage transitions deterministically', () => {
    const state = createInitialDefenderState();
    const next = defenderStateReducer.applyPatch(state, {
      exposure: { suspiciousLink: 120, unverifiedIdentity: 25 },
      pressure: { authority: 40, deadline: 35 },
    });

    expect(next.exposure.suspiciousLink).toBe(100);
    expect(next.exposure.unverifiedIdentity).toBe(25);
    expect(next.pressure.authority).toBe(40);
    expect(next.narrativeStage).toBe('pressure_escalation');
    expect(next.triggeredStages).toContain('pressure_escalation');
  });

  it('moves to escape after strong official verification without leakage', () => {
    const next = defenderStateReducer.applyPatch(createInitialDefenderState(), {
      defense: { officialVerification: 80 },
    });

    expect(next.narrativeStage).toBe('escape');
    expect(next.consequences.informationLeakLevel).toBe(0);
  });
});
