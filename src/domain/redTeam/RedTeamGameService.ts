import { createInitialRedTeamState } from '@/domain/gameModes';
import type { RedTeamTurnRequest, RedTeamTurnResponse } from '@/domain/types/redTeam';
import type { RedTeamState } from '@/domain/types/game';

export class RedTeamGameService {
  createNotReadyState(input?: {
    sessionId?: string;
    difficulty?: RedTeamState['difficulty'];
    scenarioId?: string;
  }): RedTeamState {
    return createInitialRedTeamState(input);
  }

  async submitTurn(request: RedTeamTurnRequest): Promise<RedTeamTurnResponse> {
    return {
      status: 'not_ready',
      state: {
        ...request.state,
        selectedRole: request.selectedRole,
        selectedChannel: request.selectedChannel,
        selectedTactics: request.selectedTactics,
      },
      message: '红队模式契约已建立，完整玩法将在后续阶段启用。',
    };
  }
}

export const redTeamGameService = new RedTeamGameService();
