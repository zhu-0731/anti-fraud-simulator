import type { AIEventProvider } from './AIEventProvider';
import type { AIEventGenerationInput, AIEventOutput } from '@/domain/types/ai';

/**
 * LangGraph integration stub.
 *
 * Future LangGraph node structure:
 *
 * 1. StateLoaderNode
 *    - Input: AIEventGenerationInput (sessionId, flags, riskScore, etc.)
 *    - Loads current game state into LangGraph state object
 *
 * 2. DirectorNode
 *    - Decides which type of event to generate based on narrative pacing
 *    - Controls drama arc: intro → escalation → crisis → resolution
 *
 * 3. RiskEventGeneratorNode
 *    - Calls LLM (e.g. claude-opus-4-7) with eventGenerationPrompt
 *    - Output: raw EventCard JSON
 *    - LLM API call location: replace `throw new Error` below with Anthropic SDK call
 *
 * 4. SafetyFilterNode
 *    - Passes generated event through SafetyFilterService
 *    - Blocks unsafe content before it reaches the game engine
 *
 * 5. EventValidationNode
 *    - Validates that generated EventCard matches the required schema
 *    - Rejects or repairs malformed events
 *
 * 6. ReportGeneratorNode
 *    - Calls LLM to produce personalized report text
 *    - Uses reportPrompt template with player's action history
 *
 * To enable: set LANGGRAPH_ENABLED=true and configure ANTHROPIC_API_KEY in .env.local
 */
export class LangGraphEventProvider implements AIEventProvider {
  name = 'langgraph';

  async generateEvent(_input: AIEventGenerationInput): Promise<AIEventOutput> {
    // TODO: Replace with actual LangGraph graph invocation:
    //
    // const graph = await buildAntiFraudGraph();
    // const result = await graph.invoke({
    //   sessionId: _input.sessionId,
    //   teachingGoal: _input.teachingGoal,
    //   currentRiskScore: _input.currentRiskScore,
    //   flags: _input.flags,
    // });
    // return result.eventOutput;

    throw new Error(
      'LangGraph provider is not configured. Set LANGGRAPH_ENABLED=true and provide ANTHROPIC_API_KEY.',
    );
  }
}

export const langGraphEventProvider = new LangGraphEventProvider();
