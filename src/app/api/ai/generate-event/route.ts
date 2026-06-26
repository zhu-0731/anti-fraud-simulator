import { NextRequest, NextResponse } from 'next/server';
import { aiGateway } from '@/domain/ai/gateway/AIGateway';
import { gameSessionRepository } from '@/domain/repositories/GameSessionRepository';
import type { AIEventGenerationInput } from '@/domain/types/ai';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, teachingGoal } = body;

    if (!sessionId || !teachingGoal) {
      return NextResponse.json(
        { error: 'sessionId and teachingGoal are required' },
        { status: 400 },
      );
    }

    const state = await gameSessionRepository.findById(sessionId);
    if (!state) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const input: AIEventGenerationInput = {
      sessionId,
      teachingGoal,
      currentRiskScore: state.riskScore,
      currentAnxietyScore: state.anxietyScore,
      flags: state.flags,
      actionHistory: state.actionHistory.map((a) => a.eventId),
      chapterId: state.chapterId,
    };

    const providerName = process.env.AI_PROVIDER ?? 'mock';
    const output = await aiGateway.generateEvent(input, providerName);

    return NextResponse.json(output, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
