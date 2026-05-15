import { NextRequest, NextResponse } from 'next/server';
import { gameEngine } from '@/domain/services/GameEngine';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, eventId, actionId } = body;

    if (!sessionId || !eventId || !actionId) {
      return NextResponse.json(
        { error: 'sessionId, eventId, and actionId are required' },
        { status: 400 },
      );
    }

    const result = await gameEngine.handleAction(sessionId, eventId, actionId);

    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
