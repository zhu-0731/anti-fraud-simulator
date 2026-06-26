export type AIErrorCode =
  | 'AI_DISABLED'
  | 'MISSING_API_KEY'
  | 'TIMEOUT'
  | 'RATE_LIMIT'
  | 'PROVIDER_ERROR'
  | 'REFUSAL'
  | 'EMPTY_OUTPUT'
  | 'SCHEMA_INVALID'
  | 'INPUT_BLOCKED'
  | 'OUTPUT_BLOCKED';

export class AIError extends Error {
  constructor(
    readonly code: AIErrorCode,
    message: string,
    readonly retryable = false,
  ) {
    super(message);
    this.name = 'AIError';
  }
}
