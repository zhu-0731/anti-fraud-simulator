import { createInitialRedTeamState, createRedTeamNotReadyResponse } from '@/domain/gameModes';
import type {
  EventCard,
  FeatureNotReadyResponse,
  GameDifficulty,
  GameMode,
  GameState,
} from '@/domain/types/game';
import { gameEngine } from './GameEngine';

export interface StartGameInput {
  mode: GameMode;
  chapterId: string;
  difficulty: GameDifficulty;
}

export interface StartDefenderGameResult {
  sessionId: string;
  mode: 'defender';
  state: GameState;
  firstEvent: EventCard;
}

export type StartGameResult = StartDefenderGameResult | FeatureNotReadyResponse;

export class GameStartService {
  async startGame(input: StartGameInput): Promise<StartGameResult> {
    if (input.mode === 'red_team') {
      return createRedTeamNotReadyResponse(
        createInitialRedTeamState({
          difficulty: input.difficulty,
          scenarioId: input.chapterId,
        }),
      );
    }

    const result = await gameEngine.startSession(input.chapterId, input.difficulty);
    return {
      ...result,
      mode: 'defender',
    };
  }
}

export const gameStartService = new GameStartService();
