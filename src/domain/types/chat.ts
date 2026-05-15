// ── Contact / Chat types ─────────────────────────────────────────────────────

export type PlayerIntent =
  | 'ask_verification'
  | 'ask_source'
  | 'request_link'
  | 'share_suspicious_info'
  | 'open_link'
  | 'submit_info'
  | 'call_official'
  | 'save_evidence'
  | 'search_official_site'
  | 'ignore'
  | 'report'
  | 'emergency_help'
  | 'small_talk'
  | 'challenge_identity';

export type ContactType = 'person' | 'group' | 'official' | 'system';

export interface Contact {
  id: string;
  name: string;
  type: ContactType;
  avatarEmoji: string;
  isOfficial?: boolean;
  unreadCount: number;
  lastMessagePreview?: string;
  lastMessageAt?: string;
  agentId: string;
  isHidden?: boolean;
}

export type ChatChannel = 'chat' | 'group' | 'sms' | 'email' | 'browser' | 'official' | 'phone';

export interface ChatMessage {
  id: string;
  contactId: string;
  sender: 'player' | 'agent' | 'system';
  senderName: string;
  content: string;
  channel: ChatChannel;
  timestamp: string;
  isTyping?: boolean;
  metadata?: {
    simulatedLink?: string;
    sourceMessageId?: string;
    isSystemGenerated?: boolean;
    revealAtReport?: boolean;
    hiddenConsequenceId?: string;
  };
}

// ── Narrative / WorldState types ─────────────────────────────────────────────

export type NarrativeStage =
  | 'normal_context'
  | 'trust_building'
  | 'fake_entry_seeded'
  | 'authority_pressure'
  | 'submission_pressure'
  | 'leak_or_escape'
  | 'recovery'
  | 'report';

export interface DelayedConsequence {
  id: string;
  source: string;
  playerActionSummary: string;
  lookedReasonableBecause: string;
  hiddenRisk: string;
  laterImpact: string;
  revealAt: 'later_event' | 'report';
  timestamp: string;
  severity: 'low' | 'medium' | 'high';
}

export interface WorldState {
  narrativeStage: NarrativeStage;
  trustFamilyChain: number;
  trustPeerChain: number;
  authorityPressure: number;
  deadlinePressure: number;
  officialPathAwareness: number;
  suspiciousLinkExposure: number;
  submittedInfoLevel: number;
  knownFacts: string[];
  contradictionsFound: string[];
  delayedConsequences: DelayedConsequence[];
  triggeredStages: NarrativeStage[];
}

// ── View / UI state ───────────────────────────────────────────────────────────

export type ActiveView =
  | 'chat_list'
  | 'chat_window'
  | 'browser'
  | 'official_site'
  | 'phone'
  | 'evidence';

export interface BrowserState {
  url: string;
  title: string;
  hasCountdown: boolean;
  countdownSeconds: number;
  hasForm: boolean;
  isLoading: boolean;
}

export interface PhoneState {
  isCalling: boolean;
  calledContactId: string | null;
  callType: 'official' | 'suspicious' | null;
  callResult: string | null;
}

export interface SystemNotification {
  id: string;
  contactId: string;
  preview: string;
  timestamp: string;
}

// ── Agent interfaces ──────────────────────────────────────────────────────────

export interface AgentResponseInput {
  contactId: string;
  playerText: string;
  intent: PlayerIntent;
  worldState: WorldState;
  recentMessages: ChatMessage[];
}

export interface AgentResponseMessage {
  senderName: string;
  content: string;
  channel: ChatChannel;
  metadata?: ChatMessage['metadata'];
}

export interface AgentResponse {
  messages: AgentResponseMessage[];
  worldStatePatch?: Partial<WorldState>;
  delayedConsequences?: DelayedConsequence[];
  suggestedNotifications?: Omit<SystemNotification, 'id' | 'timestamp'>[];
  triggerPhase?: string;
}
