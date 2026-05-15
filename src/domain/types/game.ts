export type GamePhase =
  | 'start'
  | 'profile'
  | 'playing'
  | 'emergency'
  | 'report';

export type EndingType =
  | 'safe_confirmed'
  | 'near_miss'
  | 'info_leaked'
  | 'money_lost_but_handled'
  | 'fully_scammed';

export type ActionCategory =
  | 'risky'
  | 'verify'
  | 'evidence'
  | 'ignore'
  | 'safe'
  | 'emergency';

export type ChannelType =
  | 'wechat'
  | 'sms'
  | 'email'
  | 'browser'
  | 'call'
  | 'official_site'
  | 'system';

export type RiskLevel = 'none' | 'low' | 'medium' | 'high' | 'critical';

export interface PlayerProfile {
  id: string;
  name: string;
  school: string;
  major: string;
  year: string;
  targetSchool: string;
  targetMajor: string;
  backstory: string;
  avatarInitials: string;
}

export interface SafeResource {
  label: string;
  description: string;
  url: string;
}

export interface PlayerAction {
  id: string;
  label: string;
  category: ActionCategory;
  description?: string;
  riskScoreDelta?: number;
  anxietyScoreDelta?: number;
  setsFlag?: string;
  requiresFlag?: string;
  leaksInfo?: boolean;
  loseMoney?: number;
  addEvidence?: boolean;
  feedback?: string;
  nextEventOverride?: string;
  completesTask?: boolean;
  triggersEmergency?: boolean;
}

export interface NextEventRule {
  condition: string;
  nextEventId: string;
}

export interface EventCard {
  id: string;
  title: string;
  phase: GamePhase;
  channel: ChannelType;
  senderName: string;
  senderRole: string;
  message: string;
  surfaceTrust: number;
  trueRiskLevel: RiskLevel;
  pressureTypes: string[];
  riskSignals: string[];
  safeActions: string[];
  actions: PlayerAction[];
  nextEventRules: NextEventRule[];
  defaultNextEventId?: string;
  teachingPoint: string;
  isTerminal?: boolean;
}

export interface Evidence {
  id: string;
  eventId: string;
  label: string;
  description: string;
  timestamp: string;
  type: 'screenshot' | 'record' | 'report';
}

export interface Message {
  id: string;
  eventId: string;
  channel: ChannelType;
  senderName: string;
  senderRole: string;
  content: string;
  timestamp: string;
  isPlayer?: boolean;
  riskLevel?: RiskLevel;
}

export interface ActionRecord {
  eventId: string;
  actionId: string;
  actionLabel: string;
  category: ActionCategory;
  timestamp: string;
  riskScoreDelta: number;
  anxietyScoreDelta: number;
  feedback: string;
}

export interface GameState {
  sessionId: string;
  phase: GamePhase;
  chapterId: string;
  currentEventId: string;
  currentTime: string;
  playerProfile: PlayerProfile;
  riskScore: number;
  anxietyScore: number;
  officialVerified: boolean;
  taskCompleted: boolean;
  sensitiveInfoLeaked: boolean;
  moneyLost: number;
  emergencyHandled: boolean;
  evidenceList: Evidence[];
  actionHistory: ActionRecord[];
  messageHistory: Message[];
  flags: Record<string, boolean>;
  endingType?: EndingType;
  agentTrace?: import('./ai').AgentTrace;
  emergencyActionsCompleted: string[];
}
