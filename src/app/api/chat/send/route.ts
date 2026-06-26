import { NextRequest, NextResponse } from 'next/server';
import { defenderGameService } from '@/domain/defender/DefenderGameService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, contactId, text } = body as {
      sessionId: string;
      contactId: string;
      text: string;
    };

    if (!sessionId || !contactId || typeof text !== 'string') {
      return NextResponse.json({ error: 'Missing sessionId, contactId, or text' }, { status: 400 });
    }

    const result = await defenderGameService.sendMessage(sessionId, contactId, text);

    return NextResponse.json({
      state: result.state,
      messages: result.messages,
      notifications: result.notifications,
      triggerEmergency: result.triggerEmergency,
      triggerReport: result.triggerReport,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    const status = message.startsWith('Session not found:') ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
