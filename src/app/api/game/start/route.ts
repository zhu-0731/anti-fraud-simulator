import { NextRequest, NextResponse } from 'next/server';
import { normalizeDifficulty, normalizeGameMode } from '@/domain/gameModes';
import { gameStartService } from '@/domain/services/GameStartService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const mode = normalizeGameMode(body.mode);
    const difficulty = normalizeDifficulty(body.difficulty);
    const chapterId = body.chapterId ?? 'chapter_recommendation_001';

    const result = await gameStartService.startGame({
      mode,
      chapterId,
      difficulty,
    });

    return NextResponse.json(result, {
      status: result.mode === 'red_team' ? 501 : 200,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
