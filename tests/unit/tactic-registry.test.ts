import { describe, expect, it } from 'vitest';
import {
  calculateRepeatEffectMultiplier,
  getAllTacticCards,
  getTacticCard,
  validateTacticSelection,
} from '@/domain/tactics/TacticRegistry';
import type { TacticType } from '@/domain/types/tactic';

const CORE_TACTICS: TacticType[] = [
  'authority_claim',
  'social_proof',
  'urgency_pressure',
  'loss_aversion',
  'verification_deflection',
  'channel_switch',
  'information_escalation',
  'consistency_repair',
];

describe('TacticRegistry', () => {
  it('defines all eight core tactics with signals and counters', () => {
    const cards = getAllTacticCards();

    expect(cards.map((card) => card.id).sort()).toEqual([...CORE_TACTICS].sort());
    for (const tacticId of CORE_TACTICS) {
      const card = getTacticCard(tacticId);
      expect(card.observableSignals.length).toBeGreaterThan(0);
      expect(card.defenderCounters.length).toBeGreaterThan(0);
      expect(card.cost).toBeGreaterThan(0);
      expect(card.cooldown).toBeGreaterThanOrEqual(1);
      expect(card.allowedRoles.length).toBeGreaterThan(0);
      expect(card.allowedChannels.length).toBeGreaterThan(0);
    }
  });

  it('enforces per-turn points and max tactic count', () => {
    const result = validateTacticSelection({
      tacticIds: ['authority_claim', 'loss_aversion', 'urgency_pressure'],
      availablePoints: 3,
    });

    expect(result.valid).toBe(false);
    expect(result.issues.map((issue) => issue.code)).toContain('TOO_MANY_TACTICS');
    expect(result.issues.map((issue) => issue.code)).toContain('INSUFFICIENT_POINTS');
  });

  it('blocks duplicate tactics and active cooldowns', () => {
    const result = validateTacticSelection({
      tacticIds: ['urgency_pressure', 'urgency_pressure'],
      currentTurn: 4,
      previousUses: [{ tacticId: 'urgency_pressure', turnNumber: 3 }],
    });

    expect(result.valid).toBe(false);
    expect(result.issues.map((issue) => issue.code)).toContain('DUPLICATE_TACTIC');
    expect(result.issues.map((issue) => issue.code)).toContain('COOLDOWN_ACTIVE');
  });

  it('requires prerequisites for repair-style tactics', () => {
    const result = validateTacticSelection({
      tacticIds: ['consistency_repair'],
      currentTurn: 3,
      previousUses: [],
    });

    expect(result.valid).toBe(false);
    expect(result.issues.map((issue) => issue.code)).toContain('PREREQUISITE_MISSING');
  });

  it('reduces repeated tactic effects without dropping below the floor', () => {
    const multiplier = calculateRepeatEffectMultiplier({
      tacticId: 'urgency_pressure',
      previousUses: [
        { tacticId: 'urgency_pressure' },
        { tacticId: 'urgency_pressure' },
        { tacticId: 'urgency_pressure' },
        { tacticId: 'urgency_pressure' },
      ],
    });

    expect(multiplier).toBe(0.4);
  });
});
