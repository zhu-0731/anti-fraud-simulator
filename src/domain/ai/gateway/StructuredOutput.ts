import type { EventCard } from '@/domain/types/game';
import { applyEventCompatibilityMetadata } from '@/domain/tactics/EventCompatibility';
import { AIError } from './AIError';
import { EventCardSchema } from './schemas/EventCardSchema';

export function parseEventCardJson(rawText: string): EventCard {
  if (!rawText.trim()) {
    throw new AIError('EMPTY_OUTPUT', 'Provider returned empty output.', true);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(extractJson(rawText));
  } catch (error) {
    throw new AIError(
      'SCHEMA_INVALID',
      `Provider returned invalid JSON: ${error instanceof Error ? error.message : 'unknown'}`,
    );
  }

  const result = EventCardSchema.safeParse(parsed);
  if (!result.success) {
    throw new AIError('SCHEMA_INVALID', result.error.issues.map((issue) => issue.message).join('; '));
  }

  return applyEventCompatibilityMetadata(result.data, {
    source: result.data.source ?? 'director',
    difficulty: result.data.difficulty ?? 'beginner',
    schemaVersion: result.data.schemaVersion ?? 1,
  });
}

function extractJson(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) return trimmed;

  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) return fenced[1].trim();

  const start = trimmed.indexOf('{');
  const end = trimmed.lastIndexOf('}');
  if (start >= 0 && end > start) return trimmed.slice(start, end + 1);

  throw new AIError('SCHEMA_INVALID', 'Provider output did not contain a JSON object.');
}
