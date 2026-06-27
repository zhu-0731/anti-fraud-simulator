import { randomUUID } from 'node:crypto';
import { buildEventGenerationPrompt } from '@/domain/ai/prompts/eventGenerationPrompt';
import { AIError } from './AIError';
import type { AIProvider, AIProviderRequest, AIProviderResponse } from './AIProvider';

interface ChatCompletionResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
    finish_reason?: string;
  }>;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
}

export class OpenAIProvider implements AIProvider {
  readonly name = 'openai';

  async generateEvent(request: AIProviderRequest): Promise<AIProviderResponse> {
    const apiKey = getApiKey();
    if (!apiKey) {
      throw new AIError('MISSING_API_KEY', 'Missing OpenAI-compatible API key.');
    }

    const baseUrl = normalizeBaseUrl(firstNonEmpty(
      process.env.OPENAI_COMPATIBLE_BASE_URL,
      process.env.OPENAI_BASE_URL,
      'https://api.openai.com/v1',
    ));
    const model =
      firstNonEmpty(
        process.env.OPENAI_COMPATIBLE_MODEL,
        process.env.OPENAI_MODEL,
        process.env.AI_MODEL_FAST,
        'gpt-4.1-mini',
      );

    const requestId = request.requestId || randomUUID();
    const url = new URL(`${baseUrl}/chat/completions`);
    url.searchParams.set('request_id', requestId);

    const headers: Record<string, string> = {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json; charset=utf-8',
    };
    if (process.env.VIVO_APP_ID?.trim()) {
      headers['X-App-Id'] = process.env.VIVO_APP_ID.trim();
    }

    const start = Date.now();
    const response = await fetch(url, {
      method: 'POST',
      headers,
      signal: request.signal,
      body: JSON.stringify({
        model,
        temperature: 0.2,
        max_tokens: 1400,
        stream: false,
        messages: [
          {
            role: 'system',
            content:
              'Return only one strict JSON object for an educational anti-fraud game event. Do not include markdown.',
          },
          {
            role: 'user',
            content: buildEventGenerationPrompt(request.input),
          },
        ],
      }),
    }).catch((error) => {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new AIError('TIMEOUT', 'AI provider timed out.', true);
      }
      throw error;
    });

    if (response.status === 429) {
      throw new AIError('RATE_LIMIT', 'AI provider rate limited the request.', true);
    }
    if (response.status >= 500) {
      throw new AIError('PROVIDER_ERROR', `AI provider server error: ${response.status}`, true);
    }
    if (!response.ok) {
      throw new AIError('PROVIDER_ERROR', `AI provider failed: ${response.status}`);
    }

    const data = (await response.json()) as ChatCompletionResponse;
    const choice = data.choices?.[0];
    if (choice?.finish_reason === 'content_filter') {
      throw new AIError('REFUSAL', 'AI provider refused the request.');
    }

    const rawText = choice?.message?.content ?? '';
    if (!rawText.trim()) {
      throw new AIError('EMPTY_OUTPUT', 'AI provider returned empty content.', true);
    }

    return {
      provider: this.name,
      model,
      rawText,
      latencyMs: Date.now() - start,
    };
  }
}

function normalizeBaseUrl(url: string): string {
  return url.replace(/\/+$/, '');
}

function getApiKey(): string | null {
  return firstNonEmpty(
    process.env.OPENAI_COMPATIBLE_API_KEY,
    process.env.OPENAI_API_KEY,
    process.env.VIVO_APP_KEY,
  ) || null;
}

function firstNonEmpty(...values: Array<string | undefined>): string {
  for (const value of values) {
    const trimmed = value?.trim();
    if (trimmed) return trimmed;
  }
  return '';
}

export const openAIProvider = new OpenAIProvider();
