import { describe, expect, it } from 'vitest';
import { defenderGameService } from '@/domain/defender/DefenderGameService';
import { gameSessionRepository } from '@/domain/repositories/GameSessionRepository';
import { gameEngine } from '@/domain/services/GameEngine';

describe('DefenderGameService rule runtime', () => {
  it('persists defender state and tactic use records after a chat turn', async () => {
    const session = await gameEngine.startSession('chapter_recommendation_001');

    const result = await defenderGameService.sendMessage(
      session.sessionId,
      'fake_admission',
      '请把确认链接发我看看',
    );
    const persisted = await gameSessionRepository.findById(session.sessionId);

    expect(result.state.tacticUses.length).toBeGreaterThan(0);
    expect(result.state.tacticUses.map((use) => use.tacticId)).toContain('authority_claim');
    expect(result.state.defenderState.activeRiskActorIds).toContain('fake_admission');
    expect(persisted?.tacticUses).toHaveLength(result.state.tacticUses.length);
  });

  it('marks safe official verification as completed before report', async () => {
    const session = await gameEngine.startSession('chapter_recommendation_001');

    await defenderGameService.sendMessage(
      session.sessionId,
      'official_service',
      '我想核实我的录取信息是否真实',
    );
    await defenderGameService.sendMessage(
      session.sessionId,
      'anti_fraud',
      '我拨打了96110反诈热线确认',
    );
    const result = await defenderGameService.sendMessage(
      session.sessionId,
      'official_service',
      '请问录取确认的官方渠道是什么？',
    );

    expect(result.triggerReport).toBe(true);
    expect(result.state.phase).toBe('report');
    expect(result.state.officialVerified).toBe(true);
    expect(result.state.taskCompleted).toBe(true);
    expect(result.state.sensitiveInfoLeaked).toBe(false);
  });

  it('records legacy event-card tactics through GameEngine actions', async () => {
    const session = await gameEngine.startSession('chapter_recommendation_001');

    const result = await gameEngine.handleAction(session.sessionId, 'E02', 'click_link');

    expect(result.state.tacticUses.map((use) => use.tacticId)).toContain('social_proof');
    expect(result.state.tacticUses.map((use) => use.tacticId)).toContain('urgency_pressure');
    expect(result.state.defenderState.exposure.suspiciousLink).toBeGreaterThan(0);
  });
});
