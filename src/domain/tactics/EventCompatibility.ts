import type { EventCard, GameDifficulty } from '@/domain/types/game';
import type { DefenseCapability, TacticType } from '@/domain/types/tactic';
import { getTacticCard, isTacticType } from './TacticRegistry';

export const PRESSURE_TYPE_TO_TACTIC: Record<string, TacticType> = {
  authority_impersonation: 'authority_claim',
  fake_official_design: 'authority_claim',
  personal_targeting: 'authority_claim',
  family_pressure: 'social_proof',
  peer_pressure: 'social_proof',
  social_proof: 'social_proof',
  social_trust: 'social_proof',
  urgency: 'urgency_pressure',
  deadline_pressure: 'urgency_pressure',
  countdown_timer: 'urgency_pressure',
  financial_threat: 'loss_aversion',
  payment_demand: 'loss_aversion',
};

export const SAFE_ACTION_TO_CAPABILITY: Record<string, DefenseCapability> = {
  note_warning: 'urgency_resistance',
  screenshot_evidence: 'evidence_preservation',
  verify_official_site: 'verify_before_action',
  ask_counselor_e02: 'source_tracing',
  refuse_download: 'verify_before_action',
  report_suspicious: 'evidence_preservation',
  check_official_domain: 'cross_channel_verification',
  screenshot_e04: 'evidence_preservation',
  stay_calm: 'urgency_resistance',
  check_official_e05: 'verify_before_action',
  refuse_send_info: 'independent_identity_verification',
  call_official_number: 'independent_identity_verification',
  close_browser: 'urgency_resistance',
  check_domain: 'cross_channel_verification',
  record_official_info: 'evidence_preservation',
  call_hotline: 'independent_identity_verification',
  thank_counselor: 'source_tracing',
  call_admissions: 'independent_identity_verification',
  complete_official_confirm: 'verify_before_action',
  report_fake_accounts: 'evidence_preservation',
  stop_operation: 'incident_response',
  screenshot_evidence_emergency: 'evidence_preservation',
  change_password: 'incident_response',
  exit_devices: 'incident_response',
  contact_teacher: 'incident_response',
  contact_bank: 'incident_response',
  report_police: 'incident_response',
  report_scammer: 'incident_response',
  verify_via_official_call: 'independent_identity_verification',
  verify_link_domain: 'cross_channel_verification',
  call_official: 'independent_identity_verification',
  stay_calm_peer: 'urgency_resistance',
  check_official_peer: 'verify_before_action',
};

export function mapPressureTypesToTactics(pressureTypes: string[]): TacticType[] {
  return unique(
    pressureTypes
      .map((pressureType) => PRESSURE_TYPE_TO_TACTIC[pressureType])
      .filter((tacticId): tacticId is TacticType => Boolean(tacticId) && isTacticType(tacticId)),
  );
}

export function mapSafeActionsToCapabilities(safeActions: string[]): DefenseCapability[] {
  return unique(
    safeActions
      .map((safeAction) => SAFE_ACTION_TO_CAPABILITY[safeAction])
      .filter((capability): capability is DefenseCapability => Boolean(capability)),
  );
}

export function findUnmappedPressureTypes(events: EventCard[]): string[] {
  return unique(
    events
      .flatMap((event) => event.pressureTypes)
      .filter((pressureType) => !PRESSURE_TYPE_TO_TACTIC[pressureType]),
  );
}

export function findUnmappedSafeActions(events: EventCard[]): string[] {
  return unique(
    events
      .flatMap((event) => event.safeActions)
      .filter((safeAction) => !SAFE_ACTION_TO_CAPABILITY[safeAction]),
  );
}

export function applyEventCompatibilityMetadata(
  event: EventCard,
  input?: {
    source?: EventCard['source'];
    difficulty?: GameDifficulty;
    schemaVersion?: number;
  },
): EventCard {
  const tacticIds = event.tacticIds ?? mapPressureTypesToTactics(event.pressureTypes);
  const tacticCapabilities = tacticIds.flatMap((tacticId) => getTacticCard(tacticId).defenderCounters);
  const safeActionCapabilities = mapSafeActionsToCapabilities(event.safeActions);

  return {
    ...event,
    source: event.source ?? input?.source ?? 'static',
    tacticIds,
    testedCapabilities: event.testedCapabilities ?? unique([...tacticCapabilities, ...safeActionCapabilities]),
    difficulty: event.difficulty ?? input?.difficulty ?? 'beginner',
    schemaVersion: event.schemaVersion ?? input?.schemaVersion ?? 1,
  };
}

function unique<T>(items: T[]): T[] {
  return [...new Set(items)];
}
