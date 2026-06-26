import type { WorldState, NarrativeStage, SystemNotification, PlayerIntent } from '@/domain/types/chat';
import { patchWorldState } from './WorldState';
import { generateId } from '@/lib/id';

export interface NarrativeTickResult {
  updatedWorldState: WorldState;
  newNotifications: SystemNotification[];
  triggerEmergency: boolean;
  triggerReport: boolean;
}

// Maps player intent to WorldState numeric changes
const INTENT_WORLD_PATCH: Partial<Record<PlayerIntent, Partial<WorldState>>> = {
  ask_verification: { officialPathAwareness: 10 },
  ask_source: { officialPathAwareness: 5 },
  challenge_identity: { authorityPressure: -10, officialPathAwareness: 15 },
  search_official_site: { officialPathAwareness: 25 },
  call_official: { officialPathAwareness: 30 },
  save_evidence: { officialPathAwareness: 5 },
  report: { officialPathAwareness: 20 },
  emergency_help: { officialPathAwareness: 10 },
  request_link: { suspiciousLinkExposure: 10, trustPeerChain: 5 },
  open_link: { suspiciousLinkExposure: 15 },
  submit_info: { submittedInfoLevel: 30, suspiciousLinkExposure: 20 },
  share_suspicious_info: { trustFamilyChain: 5, suspiciousLinkExposure: 5 },
  ignore: { deadlinePressure: 5 },
  small_talk: {},
};

// Narrative stage thresholds
function resolveStage(ws: WorldState): NarrativeStage {
  // Escape / recovery takes priority
  if (ws.submittedInfoLevel > 0 && ws.officialPathAwareness > 50) return 'recovery';
  if (ws.submittedInfoLevel > 20) return 'leak_or_escape';

  if (ws.authorityPressure > 30 || ws.deadlinePressure > 30) return 'submission_pressure';
  if (ws.suspiciousLinkExposure > 25) return 'authority_pressure';
  if (ws.suspiciousLinkExposure > 15 || ws.trustFamilyChain > 15 || ws.trustPeerChain > 15)
    return 'fake_entry_seeded';
  if (ws.trustFamilyChain > 5 || ws.trustPeerChain > 5) return 'trust_building';

  return 'normal_context';
}

// Notifications injected by the director when stages change
const STAGE_NOTIFICATIONS: Partial<Record<NarrativeStage, { contactId: string; preview: string }>> = {
  fake_entry_seeded: {
    contactId: 'group',
    preview: '📢 群公告：请保研同学于今日24:00前完成录取确认，链接见下',
  },
  authority_pressure: {
    contactId: 'fake_admission',
    preview: '招生办-张老师：你好，看到你还没完成确认，特地私信提醒…',
  },
  submission_pressure: {
    contactId: 'fake_admission',
    preview: '招生办-张老师：⚠️ 截止时间只剩1小时，请立即操作！',
  },
  recovery: {
    contactId: 'counselor',
    preview: '王老师：同学，注意！有同学上当受骗，请立即查阅官网核实！',
  },
};

export class NarrativeDirector {
  tick(
    worldState: WorldState,
    intent: PlayerIntent,
    contactId: string,
  ): NarrativeTickResult {
    // Apply intent-driven world patch
    const intentPatch = INTENT_WORLD_PATCH[intent] ?? {};

    // Contact-specific extra patches
    const contactPatch = this.contactPatch(contactId, intent);

    let updated = patchWorldState(worldState, buildIncrementalPatch(worldState, intentPatch, contactPatch));

    // Resolve new stage
    const newStage = resolveStage(updated);
    const stageChanged =
      newStage !== updated.narrativeStage &&
      !updated.triggeredStages.includes(newStage);

    if (stageChanged) {
      updated = patchWorldState(updated, {
        narrativeStage: newStage,
        triggeredStages: [...updated.triggeredStages, newStage],
      });
    }

    // Generate notifications for newly entered stages
    const newNotifications: SystemNotification[] = [];
    if (stageChanged) {
      const notif = STAGE_NOTIFICATIONS[newStage];
      if (notif) {
        newNotifications.push({
          id: generateId('notif'),
          contactId: notif.contactId,
          preview: notif.preview,
          timestamp: new Date().toISOString(),
        });
      }
    }

    // Emergency trigger
    const triggerEmergency = updated.submittedInfoLevel > 20;

    // Report trigger
    const canCompleteFromContact = contactId === 'official_service' || contactId === 'counselor';
    const triggerReport =
      canCompleteFromContact &&
      updated.submittedInfoLevel === 0 &&
      updated.officialPathAwareness >= 60;

    return { updatedWorldState: updated, newNotifications, triggerEmergency, triggerReport };
  }

  private contactPatch(contactId: string, intent: PlayerIntent): Partial<WorldState> {
    if (contactId === 'mom') {
      if (intent === 'ask_verification' || intent === 'ask_source') {
        return { trustFamilyChain: -3, officialPathAwareness: 5 };
      }
      return { trustFamilyChain: 5 };
    }

    if (contactId === 'counselor') {
      return { officialPathAwareness: 10 };
    }

    if (contactId === 'senior') {
      if (intent === 'request_link') {
        return { trustPeerChain: 10, suspiciousLinkExposure: 10 };
      }
      return { trustPeerChain: 5 };
    }

    if (contactId === 'group') {
      if (intent === 'open_link' || intent === 'request_link') {
        return { suspiciousLinkExposure: 15, deadlinePressure: 10 };
      }
      return { trustPeerChain: 5, deadlinePressure: 5 };
    }

    if (contactId === 'fake_admission') {
      if (intent === 'challenge_identity') {
        return { authorityPressure: -5 };
      }
      return { authorityPressure: 10, deadlinePressure: 10 };
    }

    if (contactId === 'official_service' || contactId === 'anti_fraud') {
      return { officialPathAwareness: 20 };
    }

    return {};
  }
}

export const narrativeDirector = new NarrativeDirector();

function buildIncrementalPatch(
  current: WorldState,
  ...patches: Partial<WorldState>[]
): Partial<WorldState> {
  const numericKeys: (keyof Pick<
    WorldState,
    | 'trustFamilyChain'
    | 'trustPeerChain'
    | 'authorityPressure'
    | 'deadlinePressure'
    | 'officialPathAwareness'
    | 'suspiciousLinkExposure'
    | 'submittedInfoLevel'
  >)[] = [
    'trustFamilyChain',
    'trustPeerChain',
    'authorityPressure',
    'deadlinePressure',
    'officialPathAwareness',
    'suspiciousLinkExposure',
    'submittedInfoLevel',
  ];

  const merged: Partial<WorldState> = {};

  for (const key of numericKeys) {
    let delta = 0;
    for (const patch of patches) {
      const value = patch[key];
      if (typeof value === 'number') delta += value;
    }
    if (delta !== 0) {
      merged[key] = current[key] + delta;
    }
  }

  return merged;
}
