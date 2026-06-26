import type { IRiskActorAgent, RiskActorInput, RiskActorOutput } from '@/domain/types/riskActor';
import type { TacticType, TacticUse } from '@/domain/types/tactic';
import { getTacticCard } from '@/domain/tactics/TacticRegistry';
import { generateId } from '@/lib/id';

const TACTIC_TEXT: Record<TacticType, string> = {
  authority_claim: '我是负责本次确认流程的工作人员，可以协助你完成模拟确认。',
  social_proof: '群里已经有同学说完成了确认，大家都在关注这个流程。',
  urgency_pressure: '这个模拟流程有时间限制，请你先处理，后续再补充核实。',
  loss_aversion: '如果错过模拟截止时间，系统会显示资格待确认状态。',
  verification_deflection: '现在官方线路可能繁忙，你可以先完成基础确认，稍后再查。',
  channel_switch: '为了避免群里刷屏，我们切到私聊或模拟页面继续。',
  information_escalation: '先确认一个低风险信息，后面再逐步补齐模拟资料。',
  consistency_repair: '你指出的问题是显示口径差异，但核心流程仍以我这里的模拟提醒为准。',
};

export class RiskActorAgent implements IRiskActorAgent {
  async generate(input: RiskActorInput): Promise<RiskActorOutput> {
    const allowedTactics = input.plan.allowedTactics.filter((tacticId) =>
      isTacticAllowedByPlan(tacticId, input),
    );
    const responseText = buildResponse(allowedTactics, input);
    const tacticUses = buildTacticUses(allowedTactics, input);

    return {
      responseText,
      visibleContent: responseText,
      usedTacticUseIds: tacticUses.map((use) => use.id),
      tacticUses,
      viewEffects: input.plan.viewEffects,
    };
  }
}

function isTacticAllowedByPlan(tacticId: TacticType, input: RiskActorInput): boolean {
  const card = getTacticCard(tacticId);
  const role = input.plan.responseRole;
  if (
    role === 'counselor' ||
    role === 'official_service' ||
    role === 'anti_fraud' ||
    input.plan.channel === 'official'
  ) {
    return false;
  }
  return card.allowedRoles.includes(role) && card.allowedChannels.includes(input.plan.channel);
}

function buildResponse(tacticIds: TacticType[], input: RiskActorInput): string {
  const pieces = tacticIds.map((tacticId) => TACTIC_TEXT[tacticId]);
  const resourceHint = tacticIds.includes('channel_switch')
    ? ` 模拟入口：${input.simulatedResources.fakeDomain}/confirm`
    : '';
  const disclaimer = '【教育模拟】';
  return `${disclaimer}${pieces.join(' ')}${resourceHint}`.trim();
}

function buildTacticUses(tacticIds: TacticType[], input: RiskActorInput): TacticUse[] {
  return tacticIds.map((tacticId) => ({
    id: generateId('tu'),
    tacticId,
    mode: 'defender',
    roleId: input.plan.responseRole as TacticUse['roleId'],
    channelId: input.plan.channel as TacticUse['channelId'],
    intensity: input.plan.maximumIntensity,
    turnNumber: input.recentMessages.length + 1,
    effectMultiplier: 1,
    createdAt: new Date().toISOString(),
  }));
}

export const riskActorAgent = new RiskActorAgent();
