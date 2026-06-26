import { describe, expect, it } from 'vitest';
import { chapter01Events } from '@/data/chapter01';
import { eventVariantsByGoal } from '@/data/eventVariants';
import {
  findUnmappedPressureTypes,
  findUnmappedSafeActions,
  mapPressureTypesToTactics,
} from '@/domain/tactics/EventCompatibility';

const allVariantEvents = Object.values(eventVariantsByGoal).flat();

describe('event tactic compatibility metadata', () => {
  it('maps legacy pressure labels to known tactic ids', () => {
    expect(mapPressureTypesToTactics(['authority_impersonation', 'urgency'])).toEqual([
      'authority_claim',
      'urgency_pressure',
    ]);
  });

  it('has no unmapped legacy pressure or safe-action labels for existing events', () => {
    const events = [...chapter01Events, ...allVariantEvents];

    expect(findUnmappedPressureTypes(events)).toEqual([]);
    expect(findUnmappedSafeActions(events)).toEqual([]);
  });

  it('adds compatibility metadata without removing legacy fields', () => {
    const riskyEvent = chapter01Events.find((event) => event.id === 'E06');

    expect(riskyEvent).toBeDefined();
    expect(riskyEvent?.pressureTypes).toContain('authority_impersonation');
    expect(riskyEvent?.riskSignals.length).toBeGreaterThan(0);
    expect(riskyEvent?.safeActions).toContain('call_official_number');
    expect(riskyEvent?.source).toBe('static');
    expect(riskyEvent?.tacticIds).toContain('authority_claim');
    expect(riskyEvent?.tacticIds).toContain('urgency_pressure');
    expect(riskyEvent?.testedCapabilities).toContain('independent_identity_verification');
    expect(riskyEvent?.schemaVersion).toBe(1);
  });

  it('keeps all E01-E12 events loadable after metadata enrichment', () => {
    expect(chapter01Events).toHaveLength(12);
    expect(chapter01Events.map((event) => event.id)).toEqual([
      'E01',
      'E02',
      'E03',
      'E04',
      'E05',
      'E06',
      'E07',
      'E08',
      'E09',
      'E10',
      'E11',
      'E12',
    ]);
  });
});
