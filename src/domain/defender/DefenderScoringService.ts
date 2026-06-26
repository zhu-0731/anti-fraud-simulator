import type { GameState } from '@/domain/types/game';
import type { ScoreBreakdown } from '@/domain/types/report';
import { scoringService } from '@/domain/services/ScoringService';

export interface DefenderRuntimeScore {
  legacyScore: ScoreBreakdown;
  officialVerification: number;
  evidenceAwareness: number;
  informationLeakLevel: number;
  tacticUseCount: number;
}

export class DefenderScoringService {
  calculate(state: GameState): DefenderRuntimeScore {
    return {
      legacyScore: scoringService.calculateScore(state),
      officialVerification: state.defenderState.defense.officialVerification,
      evidenceAwareness: state.defenderState.defense.evidenceAwareness,
      informationLeakLevel: state.defenderState.consequences.informationLeakLevel,
      tacticUseCount: state.tacticUses.length,
    };
  }
}

export const defenderScoringService = new DefenderScoringService();
