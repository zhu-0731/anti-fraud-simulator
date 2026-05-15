import { NextRequest, NextResponse } from 'next/server';
import { gameSessionRepository } from '@/domain/repositories/GameSessionRepository';
import { chatService } from '@/domain/chat/ChatService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, contactId } = body as { sessionId: string; contactId: string };

    if (!sessionId || typeof contactId !== 'string') {
      return NextResponse.json({ error: 'Missing sessionId or contactId' }, { status: 400 });
    }

    const state = await gameSessionRepository.findById(sessionId);
    if (!state) {
      return NextResponse.json({ error: `Session not found: ${sessionId}` }, { status: 404 });
    }

    const updatedState = chatService.openContact(state, contactId);
    await gameSessionRepository.update(updatedState);

    return NextResponse.json({
      state: updatedState,
      chatHistory: updatedState.chatHistories[contactId] ?? [],
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
