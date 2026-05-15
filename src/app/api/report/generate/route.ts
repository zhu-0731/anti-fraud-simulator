import { NextRequest, NextResponse } from 'next/server';
import { reportService } from '@/domain/services/ReportService';
import { gameSessionRepository } from '@/domain/repositories/GameSessionRepository';
import { endingService } from '@/domain/services/EndingService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId is required' }, { status: 400 });
    }

    const state = await gameSessionRepository.findById(sessionId);
    if (!state) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Ensure ending is determined
    if (!state.endingType) {
      state.endingType = endingService.determineEnding(state);
      await gameSessionRepository.update(state);
    }

    const report = await reportService.generateReport(state);

    return NextResponse.json({ report }, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
