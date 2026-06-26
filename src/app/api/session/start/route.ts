import { NextRequest, NextResponse } from 'next/server';
import { gameEngine } from '@/domain/services/GameEngine';
import { normalizeDifficulty } from '@/domain/gameModes';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const chapterId = body.chapterId ?? 'chapter_recommendation_001';
    const difficulty = normalizeDifficulty(body.difficulty);

    const result = await gameEngine.startSession(chapterId, difficulty);

    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
