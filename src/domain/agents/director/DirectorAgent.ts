import type { DirectorInput, DirectorPlan, IDirectorAgent } from '@/domain/types/director';
import { ruleDirectorAgent } from './RuleDirectorAgent';

export class DirectorAgent implements IDirectorAgent {
  constructor(
    private readonly primary: IDirectorAgent = ruleDirectorAgent,
    private readonly fallback: IDirectorAgent = ruleDirectorAgent,
  ) {}

  async plan(input: DirectorInput): Promise<DirectorPlan> {
    try {
      return await this.primary.plan(input);
    } catch {
      const fallbackPlan = await this.fallback.plan(input);
      return {
        ...fallbackPlan,
        reasonCode: 'rule_fallback',
        fallbackUsed: true,
      };
    }
  }
}

export const directorAgent = new DirectorAgent();
