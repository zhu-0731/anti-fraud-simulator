import type { Episode } from '@/domain/types/episode';

export interface ITurnLogRepository {
  saveEpisode(episode: Episode): Promise<void>;
  findEpisodeBySessionId(sessionId: string): Promise<Episode | null>;
}

class InMemoryTurnLogRepository implements ITurnLogRepository {
  private episodesBySession = new Map<string, Episode>();

  async saveEpisode(episode: Episode): Promise<void> {
    this.episodesBySession.set(episode.sessionId, structuredClone(episode));
  }

  async findEpisodeBySessionId(sessionId: string): Promise<Episode | null> {
    const episode = this.episodesBySession.get(sessionId);
    return episode ? structuredClone(episode) : null;
  }
}

export const turnLogRepository: ITurnLogRepository = new InMemoryTurnLogRepository();
