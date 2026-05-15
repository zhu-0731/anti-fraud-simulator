import { NextRequest, NextResponse } from 'next/server';
import { gameSessionRepository } from '@/domain/repositories/GameSessionRepository';
import { chatService } from '@/domain/chat/ChatService';

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

    const state = await gameSessionRepository.findById(sessionId);
    if (!state) {
      return NextResponse.json({ error: `Session not found: ${sessionId}` }, { status: 404 });
    }

    const result = await chatService.sendMessage(state, contactId, text);
    await gameSessionRepository.update(result.updatedState);

    return NextResponse.json({
      state: result.updatedState,
      messages: result.newMessages,
      notifications: result.notifications,
      triggerEmergency: result.triggerEmergency,
      triggerReport: result.triggerReport,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
