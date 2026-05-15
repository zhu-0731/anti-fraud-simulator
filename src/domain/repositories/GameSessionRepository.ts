import type { GameState } from '@/domain/types/game';

export interface IGameSessionRepository {
  create(state: GameState): Promise<void>;
  findById(sessionId: string): Promise<GameState | null>;
  update(state: GameState): Promise<void>;
  delete(sessionId: string): Promise<void>;
}

// In-memory implementation — swap out for a DB client without changing callers
class InMemoryGameSessionRepository implements IGameSessionRepository {
  private store = new Map<string, GameState>();

  async create(state: GameState): Promise<void> {
    this.store.set(state.sessionId, structuredClone(state));
  }

  async findById(sessionId: string): Promise<GameState | null> {
    const state = this.store.get(sessionId);
    return state ? structuredClone(state) : null;
  }

  async update(state: GameState): Promise<void> {
    if (!this.store.has(state.sessionId)) {
      throw new Error(`Session not found: ${state.sessionId}`);
    }
    this.store.set(state.sessionId, structuredClone(state));
  }

  async delete(sessionId: string): Promise<void> {
    this.store.delete(sessionId);
  }
}

// Singleton — persists across API requests within a server process
export const gameSessionRepository: IGameSessionRepository =
  new InMemoryGameSessionRepository();
