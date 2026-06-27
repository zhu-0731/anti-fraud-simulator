import type { IBaseAgent } from './BaseAgent';
import { MomAgent } from './MomAgent';
import { CounselorAgent } from './CounselorAgent';
import { SeniorAgent } from './SeniorAgent';
import { GroupAgent } from './GroupAgent';
import { FakeAdmissionAgent } from './FakeAdmissionAgent';
import { OfficialSiteAgent } from './OfficialSiteAgent';
import { AntiFraudAgent } from './AntiFraudAgent';
import { AIChatAgent, shouldUseAIChat } from '@/domain/ai/chat/AIChatAgent';

// Export instances for direct use
export const momAgent = new MomAgent();
export const counselorAgent = new CounselorAgent();
export const seniorAgent = new SeniorAgent();
export const groupAgent = new GroupAgent();
export const fakeAdmissionAgent = new FakeAdmissionAgent();
export const officialSiteAgent = new OfficialSiteAgent();
export const antiFraudAgent = new AntiFraudAgent();

const registry: Record<string, IBaseAgent> = {
  mom: momAgent,
  counselor: counselorAgent,
  senior: seniorAgent,
  group: groupAgent,
  fake_admission: fakeAdmissionAgent,
  official_service: officialSiteAgent,
  anti_fraud: antiFraudAgent,
};

const aiRegistry: Record<string, IBaseAgent> = Object.fromEntries(
  Object.entries(registry).map(([contactId, agent]) => [contactId, new AIChatAgent(agent)]),
);

export function getAgent(contactId: string): IBaseAgent | null {
  const source = shouldUseAIChat() ? aiRegistry : registry;
  return source[contactId] ?? null;
}

export function getAllAgents(): IBaseAgent[] {
  return Object.values(shouldUseAIChat() ? aiRegistry : registry);
}
