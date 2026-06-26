import { describe, expect, it } from 'vitest';
import { riskActorAgent } from '@/domain/agents/risk/RiskActorAgent';
import type { DirectorPlan } from '@/domain/types/director';
import type { TacticType } from '@/domain/types/tactic';

describe('RiskActorAgent', () => {
  it.each([
    'authority_claim',
    'social_proof',
    'urgency_pressure',
    'loss_aversion',
    'verification_deflection',
    'channel_switch',
    'information_escalation',
    'consistency_repair',
  ] satisfies TacticType[])('generates a controlled path for %s', async (tacticId) => {
    const output = await riskActorAgent.generate({
      plan: planFor(tacticId),
      allowedClaims: ['教育模拟确认'],
      forbiddenClaims: ['真实付款', '真实账号'],
      simulatedResources: {
        officialDomain: 'game-simulated-link.local/official',
        fakeDomain: 'game-simulated-link.local/fake',
      },
      recentMessages: [],
    });

    expect(output.tacticUses.map((use) => use.tacticId)).toContain(tacticId);
    expect(output.visibleContent).toContain('【教育模拟】');
    expect(output.visibleContent).not.toMatch(/https?:\/\//);
  });

  it('does not use tactics that are not authorized for the selected role and channel', async () => {
    const output = await riskActorAgent.generate({
      plan: {
        ...basePlan(),
        responseRole: 'official_service',
        channel: 'official',
        allowedTactics: ['authority_claim'],
      },
      allowedClaims: [],
      forbiddenClaims: [],
      simulatedResources: {
        officialDomain: 'game-simulated-link.local/official',
        fakeDomain: 'game-simulated-link.local/fake',
      },
      recentMessages: [],
    });

    expect(output.tacticUses).toEqual([]);
    expect(output.usedTacticUseIds).toEqual([]);
  });

  it('records view effects from the director plan', async () => {
    const output = await riskActorAgent.generate({
      plan: {
        ...planFor('channel_switch'),
        viewEffects: ['open_simulated_browser'],
      },
      allowedClaims: [],
      forbiddenClaims: [],
      simulatedResources: {
        officialDomain: 'game-simulated-link.local/official',
        fakeDomain: 'game-simulated-link.local/fake',
      },
      recentMessages: [],
    });

    expect(output.viewEffects).toEqual(['open_simulated_browser']);
  });
});

function planFor(tacticId: TacticType): DirectorPlan {
  if (tacticId === 'social_proof') {
    return {
      ...basePlan(),
      responseRole: 'group_member',
      channel: 'group_chat',
      allowedTactics: [tacticId],
    };
  }
  if (tacticId === 'channel_switch') {
    return {
      ...basePlan(),
      responseRole: 'group_member',
      channel: 'group_chat',
      allowedTactics: [tacticId],
    };
  }
  return {
    ...basePlan(),
    responseRole: 'unverified_staff',
    channel: 'private_chat',
    allowedTactics: [tacticId],
  };
}

function basePlan(): DirectorPlan {
  return {
    responseRole: 'unverified_staff',
    channel: 'private_chat',
    allowedTactics: [],
    maximumIntensity: 2,
    teachingGoal: 'independent_identity_verification',
    nextStageSuggestion: 'verification_conflict',
    viewEffects: [],
    reasonCode: 'seed_risk',
    fallbackUsed: false,
  };
}
