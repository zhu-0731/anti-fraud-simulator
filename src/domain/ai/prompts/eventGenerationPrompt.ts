import type { AIEventGenerationInput } from '@/domain/types/ai';

/**
 * Template for future LLM-based event generation.
 * Replace the mock provider with a real LLM call using this prompt.
 *
 * Suggested model: claude-opus-4-7 or claude-sonnet-4-6
 * API: Anthropic Messages API with JSON output mode
 */
export function buildEventGenerationPrompt(input: AIEventGenerationInput): string {
  return `You are a game designer for an anti-fraud educational simulation targeting Chinese university students.

Current game state:
- Chapter: ${input.chapterId}
- Session: ${input.sessionId}
- Teaching goal: ${input.teachingGoal}
- Current risk score: ${input.currentRiskScore}/100
- Current anxiety score: ${input.currentAnxietyScore}/100
- Active flags: ${JSON.stringify(input.flags)}

Generate ONE game event card in JSON format matching this schema:
{
  "id": "string (unique, e.g. AI_xxx)",
  "title": "string (short event title in Chinese)",
  "phase": "playing",
  "channel": "wechat | sms | email | browser | call | official_site",
  "senderName": "string (Chinese name with role)",
  "senderRole": "string",
  "message": "string (the message content in Chinese, education-focused simulation)",
  "surfaceTrust": "number 0-100",
  "trueRiskLevel": "none | low | medium | high | critical",
  "pressureTypes": ["string array"],
  "riskSignals": ["string array - visible warning signs for players"],
  "safeActions": ["string array - action IDs that are safe"],
  "actions": [
    {
      "id": "string",
      "label": "string (Chinese, concise action label)",
      "category": "risky | verify | evidence | ignore | safe | emergency",
      "riskScoreDelta": "number",
      "anxietyScoreDelta": "number",
      "feedback": "string (educational feedback in Chinese)"
    }
  ],
  "nextEventRules": [],
  "defaultNextEventId": "E09",
  "teachingPoint": "string (one key educational lesson in Chinese)"
}

SAFETY REQUIREMENTS:
- All links must use domain: game-simulated-link.local
- No real payment accounts
- No real personal information
- All content must be educational simulation, not real fraud instructions
- Mark content as simulation where appropriate`;
}
