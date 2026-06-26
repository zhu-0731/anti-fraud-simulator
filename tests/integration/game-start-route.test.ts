import { describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/game/start/route';

function jsonRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/game/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('/api/game/start', () => {
  it('starts defender mode by default', async () => {
    const response = await POST(jsonRequest({ chapterId: 'chapter_recommendation_001' }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.mode).toBe('defender');
    expect(body.state.mode).toBe('defender');
  });

  it('returns 501 for red-team mode while preserving the contract shape', async () => {
    const response = await POST(
      jsonRequest({
        mode: 'red_team',
        chapterId: 'chapter_recommendation_001',
        difficulty: 'advanced',
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(501);
    expect(body.code).toBe('FEATURE_NOT_READY');
    expect(body.state.mode).toBe('red_team');
    expect(body.state.difficulty).toBe('advanced');
  });
});
