import type { GameState, EndingType } from '@/domain/types/game';

export class EndingService {
  determineEnding(state: GameState): EndingType {
    const { sensitiveInfoLeaked, moneyLost, emergencyHandled, officialVerified, taskCompleted } = state;

    // Worst case: lost money and didn't handle emergency
    if (moneyLost > 0 && !emergencyHandled) {
      return 'fully_scammed';
    }

    // Lost money but handled emergency properly
    if (moneyLost > 0 && emergencyHandled) {
      return 'money_lost_but_handled';
    }

    // Info leaked but no money lost
    if (sensitiveInfoLeaked && !moneyLost) {
      return 'info_leaked';
    }

    // Verified official but had some close calls
    const riskyActionCount = state.actionHistory.filter((a) => a.category === 'risky').length;
    if (officialVerified && taskCompleted && riskyActionCount > 0) {
      return 'near_miss';
    }

    // Clean playthrough
    return 'safe_confirmed';
  }
}

export const endingService = new EndingService();
