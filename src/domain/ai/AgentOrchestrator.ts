import type { AIEventProvider } from './AIEventProvider';
import type { AIEventGenerationInput, AIEventOutput, AgentStep, AgentTrace } from '@/domain/types/ai';
import { mockAIEventProvider } from './MockAIEventProvider';
import { langGraphEventProvider } from './LangGraphEventProvider';
import { safetyFilterService } from '@/domain/services/SafetyFilterService';
import { generateId } from '@/lib/id';

/**
 * AgentOrchestrator routes event generation requests to the appropriate provider
 * and provides structure for future multi-agent orchestration.
 *
 * Future agent roles:
 * - DirectorAgent:    Controls narrative pacing and chapter arc
 * - RiskEventAgent:  Generates specific risk event types
 * - DefenderAgent:   Evaluates player defense behaviors
 * - SafetyAgent:     Content moderation layer
 * - ReportAgent:     Generates personalized post-game analysis
 */
export class AgentOrchestrator {
  private providers: Record<string, AIEventProvider> = {
    mock: mockAIEventProvider,
    langgraph: langGraphEventProvider,
  };

  private traces: Map<string, AgentTrace> = new Map();

  selectProvider(providerName: string): AIEventProvider {
    const provider = this.providers[providerName];
    if (!provider) {
      console.warn(`Provider "${providerName}" not found, falling back to mock`);
      return mockAIEventProvider;
    }
    return provider;
  }

  async generateEventWithSafetyFilter(
    input: AIEventGenerationInput,
    providerName = 'mock',
  ): Promise<AIEventOutput> {
    const provider = this.selectProvider(providerName);
    const startTime = Date.now();

    const step: AgentStep = {
      stepId: generateId('step'),
      agentName: provider.name,
      input: { teachingGoal: input.teachingGoal, sessionId: input.sessionId },
      output: {},
      timestamp: new Date().toISOString(),
    };

    const output = await provider.generateEvent(input);

    // Double-check safety — even if provider already filters, we verify here
    const filterResult = safetyFilterService.filterEvent(output.event);
    const safeOutput: AIEventOutput = {
      ...output,
      event: filterResult.filteredEvent,
    };

    step.output = { eventId: safeOutput.event.id, provider: safeOutput.provider };
    step.durationMs = Date.now() - startTime;

    this.recordAgentTrace(input.sessionId, step);

    return safeOutput;
  }

  recordAgentTrace(sessionId: string, step: AgentStep): void {
    const existing = this.traces.get(sessionId);
    if (existing) {
      existing.steps.push(step);
    } else {
      this.traces.set(sessionId, {
        traceId: generateId('trace'),
        sessionId,
        steps: [step],
      });
    }
  }

  getTrace(sessionId: string): AgentTrace | undefined {
    return this.traces.get(sessionId);
  }
}

export const agentOrchestrator = new AgentOrchestrator();
