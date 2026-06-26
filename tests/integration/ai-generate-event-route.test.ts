import { describe, expect, it, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/ai/generate-event/route';
import { gameEngine } from '@/domain/services/GameEngine';

function jsonRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/ai/generate-event', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('/api/ai/generate-event', () => {
  beforeEach(() => {
    process.env.AI_ENABLED = 'true';
    process.env.AI_PROVIDER = 'mock';
  });

  it('generates an event through AIGateway mock provider', async () => {
    const session = await gameEngine.startSession('chapter_recommendation_001');

    const response = await POST(
      jsonRequest({
        sessionId: session.sessionId,
        teachingGoal: 'authority_impersonation',
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.provider).toBe('mock');
    expect(body.fallbackUsed).toBe(false);
    expect(body.requestId).toEqual(expect.any(String));
    expect(body.event.actions.length).toBeGreaterThanOrEqual(4);
  });
});
