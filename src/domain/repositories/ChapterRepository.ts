import type { EventCard } from '@/domain/types/game';
import { chapter01Events } from '@/data/chapter01';

export interface IChapterRepository {
  getEventsByChapter(chapterId: string): Promise<EventCard[]>;
  getEventById(chapterId: string, eventId: string): Promise<EventCard | null>;
  getFirstEvent(chapterId: string): Promise<EventCard | null>;
}

class StaticChapterRepository implements IChapterRepository {
  private chapters: Record<string, EventCard[]> = {
    chapter_recommendation_001: chapter01Events,
  };

  async getEventsByChapter(chapterId: string): Promise<EventCard[]> {
    return this.chapters[chapterId] ?? [];
  }

  async getEventById(chapterId: string, eventId: string): Promise<EventCard | null> {
    const events = this.chapters[chapterId] ?? [];
    return events.find((e) => e.id === eventId) ?? null;
  }

  async getFirstEvent(chapterId: string): Promise<EventCard | null> {
    const events = this.chapters[chapterId] ?? [];
    return events[0] ?? null;
  }
}

export const chapterRepository: IChapterRepository = new StaticChapterRepository();
