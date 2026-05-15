import type { GameState } from '@/domain/types/game';

/**
 * Template for future LLM-based personalized report generation.
 */
export function buildReportPrompt(state: GameState): string {
  const riskyActions = state.actionHistory.filter((a) => a.category === 'risky');
  const safeActions = state.actionHistory.filter((a) =>
    ['safe', 'verify', 'evidence'].includes(a.category),
  );

  return `You are an anti-fraud education advisor reviewing a student's simulation performance.

Player: ${state.playerProfile.name}
Chapter: ${state.chapterId}
Ending: ${state.endingType ?? 'unknown'}
Risk score: ${state.riskScore}/100
Official verified: ${state.officialVerified}
Money lost (simulated): ¥${state.moneyLost}
Info leaked: ${state.sensitiveInfoLeaked}

Key risky actions taken:
${riskyActions.map((a) => `- ${a.actionLabel} (event: ${a.eventId})`).join('\n') || 'None'}

Correct actions taken:
${safeActions.map((a) => `- ${a.actionLabel} (event: ${a.eventId})`).join('\n') || 'None'}

Evidence collected: ${state.evidenceList.length} items

Write a personalized, encouraging but honest assessment in Chinese (200-300 characters) that:
1. Acknowledges their specific mistakes by name
2. Highlights what they did correctly
3. Gives 2-3 concrete real-world tips
4. Ends with a motivating message about fraud prevention`;
}
