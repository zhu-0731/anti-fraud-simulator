import type {
  AgentResponseInput,
  AgentResponse,
  PlayerIntent,
  AgentResponseMessage,
  DelayedConsequence,
} from '@/domain/types/chat';

/**
 * BaseAgent interface — replace with LLMAgent for real AI.
 * Future LLMAgent will call Anthropic SDK with the agent's systemPrompt.
 */
export interface IBaseAgent {
  readonly contactId: string;
  readonly displayName: string;
  readonly role: string;
  generateResponse(input: AgentResponseInput): Promise<AgentResponse>;
  getInitialMessages?(): AgentResponseMessage[];
}

// Helper to pick a random element
export function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Helper to build a simple message
export function msg(
  senderName: string,
  content: string,
  channel: AgentResponseMessage['channel'] = 'chat',
  metadata?: AgentResponseMessage['metadata'],
): AgentResponseMessage {
  return { senderName, content, channel, metadata };
}

// Fallback response for unrecognised intents
export function fallbackResponse(
  senderName: string,
  intent: PlayerIntent,
): AgentResponseMessage[] {
  const fallbacks: Partial<Record<PlayerIntent, string[]>> = {
    small_talk: ['嗯嗯，还有什么需要我帮你的？', '好的，你先忙。'],
    ignore: ['好，你忙你的。', '没事，随时找我。'],
  };
  const opts = fallbacks[intent] ?? ['好的，我知道了。'];
  return [msg(senderName, pick(opts))];
}

export type AgentResponseMap = Partial<Record<PlayerIntent, () => AgentResponseMessage[]>>;

export abstract class MockAgent implements IBaseAgent {
  abstract readonly contactId: string;
  abstract readonly displayName: string;
  abstract readonly role: string;
  protected abstract responseMap(input: AgentResponseInput): AgentResponseMap;
  protected abstract defaultDelayedConsequences(
    input: AgentResponseInput,
  ): DelayedConsequence[];

  async generateResponse(input: AgentResponseInput): Promise<AgentResponse> {
    const map = this.responseMap(input);
    const handler = map[input.intent];
    const messages = handler ? handler() : fallbackResponse(this.displayName, input.intent);

    const dc = this.defaultDelayedConsequences(input);

    return { messages, delayedConsequences: dc.length > 0 ? dc : undefined };
  }
}
