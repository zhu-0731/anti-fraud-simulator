import type { IBaseAgent } from './BaseAgent';
import { MomAgent } from './MomAgent';
import { CounselorAgent } from './CounselorAgent';
import { SeniorAgent } from './SeniorAgent';
import { GroupAgent } from './GroupAgent';
import { FakeAdmissionAgent } from './FakeAdmissionAgent';
import { OfficialSiteAgent } from './OfficialSiteAgent';
import { AntiFraudAgent } from './AntiFraudAgent';

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

export function getAgent(contactId: string): IBaseAgent | null {
  return registry[contactId] ?? null;
}

export function getAllAgents(): IBaseAgent[] {
  return Object.values(registry);
}
