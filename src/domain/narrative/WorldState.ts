import type { WorldState } from '@/domain/types/chat';

export function createInitialWorldState(): WorldState {
  return {
    narrativeStage: 'normal_context',
    trustFamilyChain: 0,
    trustPeerChain: 0,
    authorityPressure: 0,
    deadlinePressure: 0,
    officialPathAwareness: 0,
    suspiciousLinkExposure: 0,
    submittedInfoLevel: 0,
    knownFacts: [],
    contradictionsFound: [],
    delayedConsequences: [],
    triggeredStages: [],
  };
}

export function patchWorldState(
  current: WorldState,
  patch: Partial<WorldState>,
): WorldState {
  const merged: WorldState = { ...current, ...patch };

  // Clamp numeric fields to 0–100
  const numericKeys: (keyof WorldState)[] = [
    'trustFamilyChain',
    'trustPeerChain',
    'authorityPressure',
    'deadlinePressure',
    'officialPathAwareness',
    'suspiciousLinkExposure',
    'submittedInfoLevel',
  ];
  for (const key of numericKeys) {
    const val = merged[key] as number;
    (merged as unknown as Record<string, unknown>)[key] = Math.min(100, Math.max(0, val));
  }

  // Merge arrays rather than replace
  if (patch.knownFacts) {
    merged.knownFacts = [
      ...new Set([...current.knownFacts, ...patch.knownFacts]),
    ];
  }
  if (patch.contradictionsFound) {
    merged.contradictionsFound = [
      ...new Set([...current.contradictionsFound, ...patch.contradictionsFound]),
    ];
  }
  if (patch.delayedConsequences) {
    merged.delayedConsequences = [
      ...current.delayedConsequences,
      ...patch.delayedConsequences,
    ];
  }

  return merged;
}
