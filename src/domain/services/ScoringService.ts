import type { GameState } from '@/domain/types/game';
import type { ScoreBreakdown } from '@/domain/types/report';
import { clamp } from '@/lib/clamp';

export class ScoringService {
  calculateScore(state: GameState): ScoreBreakdown {
    const riskIdentification = this.scoreRiskIdentification(state);
    const verificationPath = this.scoreVerificationPath(state);
    const taskCompletion = this.scoreTaskCompletion(state);
    const emergencyHandling = this.scoreEmergencyHandling(state);
    const reviewUnderstanding = this.scoreReviewUnderstanding(state);

    return {
      riskIdentification,
      verificationPath,
      taskCompletion,
      emergencyHandling,
      reviewUnderstanding,
      total: riskIdentification + verificationPath + taskCompletion + emergencyHandling + reviewUnderstanding,
    };
  }

  private scoreRiskIdentification(state: GameState): number {
    // Max 35. Penalize risky actions, reward safe/verify actions.
    const riskyCount = state.actionHistory.filter((a) =>
      ['risky'].includes(a.category),
    ).length;
    const safeCount = state.actionHistory.filter((a) =>
      ['safe', 'verify', 'evidence'].includes(a.category),
    ).length;

    const base = 35;
    const penalty = riskyCount * 7;
    const bonus = Math.min(safeCount * 3, 10);
    return clamp(base - penalty + bonus, 0, 35);
  }

  private scoreVerificationPath(state: GameState): number {
    // Max 25
    let score = 0;
    if (state.officialVerified) score += 15;
    if (state.flags['counselor_confirmed']) score += 5;
    if (state.flags['checked_official_site']) score += 5;
    return clamp(score, 0, 25);
  }

  private scoreTaskCompletion(state: GameState): number {
    // Max 15
    if (state.taskCompleted) return 15;
    if (state.officialVerified) return 8;
    return 0;
  }

  private scoreEmergencyHandling(state: GameState): number {
    // Max 15 — only relevant if emergency was triggered
    const triggered = state.sensitiveInfoLeaked || state.moneyLost > 0;
    if (!triggered) return 15; // No emergency = full score for this category
    if (!state.emergencyHandled) return 0;

    const emergencyActions = state.emergencyActionsCompleted ?? [];
    const keyActions = [
      'stop_operation',
      'change_password',
      'contact_teacher',
      'report_police',
    ];
    const completedKey = keyActions.filter((a) => emergencyActions.includes(a)).length;
    return clamp(completedKey * 4, 0, 15);
  }

  private scoreReviewUnderstanding(state: GameState): number {
    // Max 10 — based on evidence collected
    const evidenceCount = state.evidenceList.length;
    return clamp(evidenceCount * 3, 0, 10);
  }
}

export const scoringService = new ScoringService();
