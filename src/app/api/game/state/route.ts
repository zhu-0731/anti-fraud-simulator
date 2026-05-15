import { NextRequest, NextResponse } from 'next/server';
import { gameSessionRepository } from '@/domain/repositories/GameSessionRepository';
import { chapterRepository } from '@/domain/repositories/ChapterRepository';

export async function GET(req: NextRequest) {
  try {
    const sessionId = req.nextUrl.searchParams.get('sessionId');
    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId is required' }, { status: 400 });
    }

    const state = await gameSessionRepository.findById(sessionId);
    if (!state) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const currentEvent = await chapterRepository.getEventById(
      state.chapterId,
      state.currentEventId,
    );

    return NextResponse.json({ state, currentEvent }, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
