import type { RiskRoleType, RoleCard } from '@/domain/types/tactic';

export const ROLE_CARDS: Record<RiskRoleType, RoleCard> = {
  unverified_staff: {
    id: 'unverified_staff',
    name: '未认证工作人员',
    description: '自称学校、学院或平台工作人员，但缺少独立认证。',
    initialCredibility: 45,
    availableTactics: [
      'authority_claim',
      'urgency_pressure',
      'loss_aversion',
      'verification_deflection',
      'channel_switch',
      'information_escalation',
      'consistency_repair',
    ],
    availableChannels: ['private_chat', 'sms', 'simulated_call', 'simulated_browser'],
    contradictionTolerance: 2,
    verificationMethods: ['independent_identity_verification', 'cross_channel_verification'],
    allowedModes: ['defender', 'red_team'],
  },
  group_member: {
    id: 'group_member',
    name: '群聊成员',
    description: '在群聊中提供未经核实的转发、催促或同伴反馈。',
    initialCredibility: 35,
    availableTactics: ['social_proof', 'urgency_pressure', 'loss_aversion', 'channel_switch'],
    availableChannels: ['group_chat', 'private_chat'],
    contradictionTolerance: 1,
    verificationMethods: ['source_tracing', 'urgency_resistance'],
    allowedModes: ['defender', 'red_team'],
  },
  senior_student: {
    id: 'senior_student',
    name: '学长或学姐',
    description: '以经验分享形式提供不完整或未经核实的信息。',
    initialCredibility: 50,
    availableTactics: ['social_proof', 'channel_switch', 'information_escalation'],
    availableChannels: ['private_chat', 'group_chat'],
    contradictionTolerance: 1,
    verificationMethods: ['source_tracing', 'verify_before_action'],
    allowedModes: ['defender', 'red_team'],
  },
  family_forwarder: {
    id: 'family_forwarder',
    name: '家人转发者',
    description: '出于关心转发外部信息，但信源可能不可靠。',
    initialCredibility: 65,
    availableTactics: ['social_proof', 'urgency_pressure', 'loss_aversion'],
    availableChannels: ['private_chat'],
    contradictionTolerance: 1,
    verificationMethods: ['source_tracing', 'risk_benefit_reassessment'],
    allowedModes: ['defender', 'red_team'],
  },
  simulated_customer_service: {
    id: 'simulated_customer_service',
    name: '模拟客服',
    description: '伪装成流程服务方或技术支持角色。',
    initialCredibility: 40,
    availableTactics: [
      'authority_claim',
      'verification_deflection',
      'information_escalation',
      'consistency_repair',
    ],
    availableChannels: ['private_chat', 'sms', 'simulated_browser', 'simulated_call'],
    contradictionTolerance: 2,
    verificationMethods: ['independent_identity_verification', 'contradiction_checking'],
    allowedModes: ['defender', 'red_team'],
  },
  automated_notification: {
    id: 'automated_notification',
    name: '自动通知',
    description: '以系统通知、短信或页面公告形式出现的单向信息。',
    initialCredibility: 30,
    availableTactics: [
      'authority_claim',
      'urgency_pressure',
      'loss_aversion',
      'channel_switch',
      'information_escalation',
    ],
    availableChannels: ['sms', 'email', 'simulated_browser'],
    contradictionTolerance: 0,
    verificationMethods: ['cross_channel_verification', 'verify_before_action'],
    allowedModes: ['defender', 'red_team'],
  },
};

export function getAllRoleCards(): RoleCard[] {
  return Object.values(ROLE_CARDS);
}

export function getRoleCard(id: RiskRoleType): RoleCard {
  return ROLE_CARDS[id];
}
