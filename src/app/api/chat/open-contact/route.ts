import { NextRequest, NextResponse } from 'next/server';
import { defenderGameService } from '@/domain/defender/DefenderGameService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, contactId } = body as { sessionId: string; contactId: string };

    if (!sessionId || typeof contactId !== 'string') {
      return NextResponse.json({ error: 'Missing sessionId or contactId' }, { status: 400 });
    }

    const result = await defenderGameService.openContact(sessionId, contactId);

    return NextResponse.json({
      state: result.state,
      chatHistory: result.chatHistory,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    const status = message.startsWith('Session not found:') ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
