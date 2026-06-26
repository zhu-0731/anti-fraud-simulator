import type {
  TacticCard,
  TacticSelectionIssue,
  TacticSelectionValidation,
  TacticType,
  TacticUse,
} from '@/domain/types/tactic';

export const TACTIC_CARDS: Record<TacticType, TacticCard> = {
  authority_claim: {
    id: 'authority_claim',
    type: 'authority_claim',
    name: '权威身份',
    description: '使用虚构工作人员、老师或平台人员身份增加表面可信度。',
    category: 'identity',
    cost: 1,
    cooldown: 1,
    maximumIntensity: 3,
    prerequisites: [],
    incompatibleWith: [],
    effects: { trustPressure: 14, urgencyPressure: 4, verificationDelay: 0, contradictionRisk: 8 },
    observableSignals: ['身份只能由对方自己声明', '无法从独立官方渠道验证', '用职位和语气代替证据'],
    defenderCounters: ['independent_identity_verification'],
    allowedModes: ['defender', 'red_team'],
    allowedRoles: ['unverified_staff', 'simulated_customer_service', 'automated_notification'],
    allowedChannels: ['private_chat', 'sms', 'email', 'simulated_call'],
  },
  social_proof: {
    id: 'social_proof',
    type: 'social_proof',
    name: '同伴背书',
    description: '使用同学、学长、群聊或熟人转发建立信任和从众压力。',
    category: 'trust',
    cost: 1,
    cooldown: 1,
    maximumIntensity: 2,
    prerequisites: [],
    incompatibleWith: [],
    effects: { trustPressure: 12, urgencyPressure: 5, verificationDelay: 0, contradictionRisk: 5 },
    observableSignals: ['转发者本身没有核实', '他人的行为被当作真实性证明'],
    defenderCounters: ['source_tracing'],
    allowedModes: ['defender', 'red_team'],
    allowedRoles: ['group_member', 'senior_student', 'family_forwarder'],
    allowedChannels: ['group_chat', 'private_chat'],
  },
  urgency_pressure: {
    id: 'urgency_pressure',
    type: 'urgency_pressure',
    name: '时间压力',
    description: '制造截止时间，减少核实时间并增加焦虑。',
    category: 'pressure',
    cost: 1,
    cooldown: 1,
    maximumIntensity: 3,
    prerequisites: [],
    incompatibleWith: [],
    effects: { trustPressure: 2, urgencyPressure: 18, verificationDelay: 4, contradictionRisk: 6 },
    observableSignals: ['要求先操作后核实', '时间限制无法从官方渠道确认'],
    defenderCounters: ['urgency_resistance'],
    allowedModes: ['defender', 'red_team'],
    allowedRoles: ['unverified_staff', 'group_member', 'automated_notification'],
    allowedChannels: ['group_chat', 'private_chat', 'sms', 'simulated_browser'],
  },
  loss_aversion: {
    id: 'loss_aversion',
    type: 'loss_aversion',
    name: '损失厌恶',
    description: '强调可能失去名额、资格或机会，让玩家忽视当前风险。',
    category: 'pressure',
    cost: 2,
    cooldown: 1,
    maximumIntensity: 3,
    prerequisites: [],
    incompatibleWith: [],
    effects: { trustPressure: 3, urgencyPressure: 14, verificationDelay: 2, contradictionRisk: 7 },
    observableSignals: ['严重后果没有正式规则依据', '使用资格取消压制合理质疑'],
    defenderCounters: ['risk_benefit_reassessment'],
    allowedModes: ['defender', 'red_team'],
    allowedRoles: ['unverified_staff', 'group_member', 'family_forwarder', 'automated_notification'],
    allowedChannels: ['group_chat', 'private_chat', 'sms', 'simulated_browser'],
  },
  verification_deflection: {
    id: 'verification_deflection',
    type: 'verification_deflection',
    name: '核实拖延',
    description: '推迟或阻止独立核实，使用系统维护或电话繁忙等游戏内理由。',
    category: 'verification',
    cost: 1,
    cooldown: 1,
    maximumIntensity: 2,
    prerequisites: ['authority_claim'],
    incompatibleWith: [],
    effects: { trustPressure: 2, urgencyPressure: 6, verificationDelay: 16, contradictionRisk: 8 },
    observableSignals: ['核实总被推迟', '风险操作却要求立即执行'],
    defenderCounters: ['verify_before_action'],
    allowedModes: ['defender', 'red_team'],
    allowedRoles: ['unverified_staff', 'simulated_customer_service'],
    allowedChannels: ['private_chat', 'sms', 'simulated_call'],
  },
  channel_switch: {
    id: 'channel_switch',
    type: 'channel_switch',
    name: '渠道切换',
    description: '从群聊切换到私聊、电话、短信或模拟网页。',
    category: 'channel',
    cost: 1,
    cooldown: 1,
    maximumIntensity: 2,
    prerequisites: [],
    incompatibleWith: [],
    effects: { trustPressure: 5, urgencyPressure: 4, verificationDelay: 6, contradictionRisk: 6 },
    observableSignals: ['身份验证没有随渠道改变重新进行', '主动离开可监督或可追溯环境'],
    defenderCounters: ['cross_channel_verification'],
    allowedModes: ['defender', 'red_team'],
    allowedRoles: ['unverified_staff', 'group_member', 'senior_student', 'automated_notification'],
    allowedChannels: ['group_chat', 'private_chat', 'sms', 'simulated_call', 'simulated_browser'],
  },
  information_escalation: {
    id: 'information_escalation',
    type: 'information_escalation',
    name: '信息递进',
    description: '将高风险请求拆分为多个低风险步骤，测试跨轮聚合能力。',
    category: 'verification',
    cost: 2,
    cooldown: 1,
    maximumIntensity: 3,
    prerequisites: [],
    incompatibleWith: [],
    effects: { trustPressure: 6, urgencyPressure: 5, verificationDelay: 4, contradictionRisk: 7 },
    observableSignals: ['请求内容逐步升级', '前一步完成被当作继续操作的理由'],
    defenderCounters: ['cross_turn_request_aggregation'],
    allowedModes: ['defender', 'red_team'],
    allowedRoles: ['unverified_staff', 'simulated_customer_service', 'automated_notification'],
    allowedChannels: ['private_chat', 'sms', 'simulated_browser'],
  },
  consistency_repair: {
    id: 'consistency_repair',
    type: 'consistency_repair',
    name: '说辞修复',
    description: '玩家发现矛盾后，风险角色尝试解释并转移核心身份问题。',
    category: 'consistency',
    cost: 2,
    cooldown: 2,
    maximumIntensity: 2,
    prerequisites: ['authority_claim'],
    incompatibleWith: [],
    effects: { trustPressure: 4, urgencyPressure: 2, verificationDelay: 8, contradictionRisk: 14 },
    observableSignals: ['解释没有独立证据', '次要问题被承认，核心身份仍未验证'],
    defenderCounters: ['contradiction_checking'],
    allowedModes: ['defender', 'red_team'],
    allowedRoles: ['unverified_staff', 'simulated_customer_service'],
    allowedChannels: ['private_chat', 'simulated_call'],
  },
};

export function getAllTacticCards(): TacticCard[] {
  return Object.values(TACTIC_CARDS);
}

export function getTacticCard(id: TacticType): TacticCard {
  return TACTIC_CARDS[id];
}

export function isTacticType(value: string): value is TacticType {
  return value in TACTIC_CARDS;
}

export function validateTacticSelection(input: {
  tacticIds: string[];
  availablePoints?: number;
  currentTurn?: number;
  previousUses?: Pick<TacticUse, 'tacticId' | 'turnNumber'>[];
}): TacticSelectionValidation {
  const availablePoints = input.availablePoints ?? 3;
  const currentTurn = input.currentTurn ?? 1;
  const issues: TacticSelectionIssue[] = [];
  const seen = new Set<string>();
  let totalCost = 0;

  if (input.tacticIds.length > 2) {
    issues.push({ code: 'TOO_MANY_TACTICS', message: '每轮最多使用两个技能。' });
  }

  for (const tacticId of input.tacticIds) {
    if (seen.has(tacticId)) {
      issues.push({ code: 'DUPLICATE_TACTIC', tacticId, message: '同一轮不能重复使用同一技能。' });
      continue;
    }
    seen.add(tacticId);

    if (!isTacticType(tacticId)) {
      issues.push({ code: 'UNKNOWN_TACTIC', tacticId, message: '未知技能。' });
      continue;
    }

    const card = getTacticCard(tacticId);
    totalCost += card.cost;

    const recentUse = input.previousUses?.find(
      (use) => use.tacticId === tacticId && currentTurn - use.turnNumber <= card.cooldown,
    );
    if (recentUse) {
      issues.push({ code: 'COOLDOWN_ACTIVE', tacticId, message: '技能冷却中。' });
    }

    for (const prerequisite of card.prerequisites) {
      if (!seen.has(prerequisite) && !input.previousUses?.some((use) => use.tacticId === prerequisite)) {
        issues.push({ code: 'PREREQUISITE_MISSING', tacticId, message: '缺少前置技能。' });
      }
    }

    const incompatible = card.incompatibleWith.find((other) => seen.has(other));
    if (incompatible) {
      issues.push({
        code: 'INCOMPATIBLE_TACTICS',
        tacticId,
        message: `技能与 ${incompatible} 互斥。`,
      });
    }
  }

  if (totalCost > availablePoints) {
    issues.push({ code: 'INSUFFICIENT_POINTS', message: '策略点不足。' });
  }

  return {
    valid: issues.length === 0,
    totalCost,
    issues,
  };
}

export function calculateRepeatEffectMultiplier(input: {
  tacticId: TacticType;
  previousUses: Pick<TacticUse, 'tacticId'>[];
}): number {
  const priorCount = input.previousUses.filter((use) => use.tacticId === input.tacticId).length;
  return Math.max(0.4, 1 - priorCount * 0.2);
}
