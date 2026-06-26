import type { DirectorInput, DirectorPlan, DirectorResponseRole, IDirectorAgent } from '@/domain/types/director';
import type { InteractionChannel, TacticType } from '@/domain/types/tactic';
import { getRoleCard } from '@/domain/tactics/RoleRegistry';
import { validateTacticSelection } from '@/domain/tactics/TacticRegistry';

export class RuleDirectorAgent implements IDirectorAgent {
  async plan(input: DirectorInput): Promise<DirectorPlan> {
    const intent = input.playerIntent;

    if (input.state.consequences.informationLeakLevel > 20) {
      return supportPlan('anti_fraud', 'recovery_support', 'incident_response', 'recovery');
    }

    if (
      input.state.defense.officialVerification > 60 &&
      input.state.consequences.informationLeakLevel === 0
    ) {
      return supportPlan('official_service', 'safe_escape', 'verify_before_action', 'escape');
    }

    if (intent === 'challenge_identity' || intent === 'ask_verification') {
      return this.riskPlan(input, {
        role: 'unverified_staff',
        channel: 'private_chat',
        candidates: ['authority_claim', 'verification_deflection', 'consistency_repair'],
        reasonCode: 'respond_to_verification',
        teachingGoal: 'independent_identity_verification',
        nextStageSuggestion: 'verification_conflict',
      });
    }

    if (input.state.pressure.deadline > 25 || input.state.pressure.authority > 25) {
      return this.riskPlan(input, {
        role: 'unverified_staff',
        channel: 'private_chat',
        candidates: ['urgency_pressure', 'loss_aversion', 'authority_claim'],
        reasonCode: 'increase_pressure',
        teachingGoal: 'urgency_resistance',
        nextStageSuggestion: 'pressure_escalation',
      });
    }

    return this.riskPlan(input, {
      role: 'group_member',
      channel: 'group_chat',
      candidates: ['social_proof', 'channel_switch', 'urgency_pressure'],
      reasonCode: 'seed_risk',
      teachingGoal: 'source_tracing',
      nextStageSuggestion: 'risk_seed',
    });
  }

  private riskPlan(
    input: DirectorInput,
    config: {
      role: DirectorResponseRole & Parameters<typeof getRoleCard>[0];
      channel: InteractionChannel;
      candidates: TacticType[];
      reasonCode: DirectorPlan['reasonCode'];
      teachingGoal: DirectorPlan['teachingGoal'];
      nextStageSuggestion: DirectorPlan['nextStageSuggestion'];
    },
  ): DirectorPlan {
    const role = getRoleCard(config.role);
    const allowedCandidates = config.candidates.filter((tacticId) =>
      role.availableTactics.includes(tacticId),
    );
    const selected = selectValidTactics(input, allowedCandidates);

    return {
      responseRole: config.role,
      channel: config.channel,
      allowedTactics: selected,
      maximumIntensity: input.difficulty === 'advanced' ? 3 : input.difficulty === 'standard' ? 2 : 1,
      teachingGoal: config.teachingGoal,
      nextStageSuggestion: config.nextStageSuggestion,
      viewEffects: [],
      reasonCode: config.reasonCode,
      fallbackUsed: false,
    };
  }
}

function supportPlan(
  responseRole: DirectorPlan['responseRole'],
  reasonCode: DirectorPlan['reasonCode'],
  teachingGoal: DirectorPlan['teachingGoal'],
  nextStageSuggestion: DirectorPlan['nextStageSuggestion'],
): DirectorPlan {
  return {
    responseRole,
    channel: 'official',
    allowedTactics: [],
    maximumIntensity: 1,
    teachingGoal,
    nextStageSuggestion,
    viewEffects: [],
    reasonCode,
    fallbackUsed: false,
  };
}

function selectValidTactics(input: DirectorInput, candidates: TacticType[]): TacticType[] {
  for (let size = Math.min(2, candidates.length); size >= 1; size -= 1) {
    const selected = candidates.slice(0, size);
    const validation = validateTacticSelection({
      tacticIds: selected,
      currentTurn: input.currentTurn,
      previousUses: input.previousTacticUses,
    });
    if (validation.valid) return selected;
  }
  return [];
}

export const ruleDirectorAgent = new RuleDirectorAgent();
