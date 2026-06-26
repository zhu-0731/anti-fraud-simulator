import type { GameMode } from './game';

export type TacticType =
  | 'authority_claim'
  | 'social_proof'
  | 'urgency_pressure'
  | 'loss_aversion'
  | 'verification_deflection'
  | 'channel_switch'
  | 'information_escalation'
  | 'consistency_repair';

export type TacticCategory =
  | 'identity'
  | 'trust'
  | 'pressure'
  | 'verification'
  | 'channel'
  | 'consistency';

export type DefenseCapability =
  | 'independent_identity_verification'
  | 'source_tracing'
  | 'urgency_resistance'
  | 'risk_benefit_reassessment'
  | 'verify_before_action'
  | 'cross_channel_verification'
  | 'cross_turn_request_aggregation'
  | 'contradiction_checking'
  | 'evidence_preservation'
  | 'incident_response';

export type RiskRoleType =
  | 'unverified_staff'
  | 'group_member'
  | 'senior_student'
  | 'family_forwarder'
  | 'simulated_customer_service'
  | 'automated_notification';

export type InteractionChannel =
  | 'group_chat'
  | 'private_chat'
  | 'sms'
  | 'email'
  | 'simulated_call'
  | 'simulated_browser';

export interface TacticCard {
  id: TacticType;
  type: TacticType;
  name: string;
  description: string;
  category: TacticCategory;
  cost: number;
  cooldown: number;
  maximumIntensity: 1 | 2 | 3;
  prerequisites: TacticType[];
  incompatibleWith: TacticType[];
  effects: {
    trustPressure: number;
    urgencyPressure: number;
    verificationDelay: number;
    contradictionRisk: number;
  };
  observableSignals: string[];
  defenderCounters: DefenseCapability[];
  allowedModes: GameMode[];
  allowedRoles: RiskRoleType[];
  allowedChannels: InteractionChannel[];
}

export interface RoleCard {
  id: RiskRoleType;
  name: string;
  description: string;
  initialCredibility: number;
  availableTactics: TacticType[];
  availableChannels: InteractionChannel[];
  contradictionTolerance: number;
  verificationMethods: DefenseCapability[];
  allowedModes: GameMode[];
}

export interface ChannelCard {
  id: InteractionChannel;
  name: string;
  description: string;
  primaryEffect: string;
  primaryRiskSignal: string;
  allowedModes: GameMode[];
}

export interface TacticUse {
  id: string;
  tacticId: TacticType;
  mode: GameMode;
  roleId: RiskRoleType;
  channelId: InteractionChannel;
  intensity: 1 | 2 | 3;
  turnNumber: number;
  effectMultiplier: number;
  createdAt: string;
}

export interface TacticSelectionIssue {
  code:
    | 'UNKNOWN_TACTIC'
    | 'TOO_MANY_TACTICS'
    | 'DUPLICATE_TACTIC'
    | 'INSUFFICIENT_POINTS'
    | 'COOLDOWN_ACTIVE'
    | 'PREREQUISITE_MISSING'
    | 'INCOMPATIBLE_TACTICS';
  tacticId?: string;
  message: string;
}

export interface TacticSelectionValidation {
  valid: boolean;
  totalCost: number;
  issues: TacticSelectionIssue[];
}
