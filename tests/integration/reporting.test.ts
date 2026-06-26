import { describe, expect, it } from 'vitest';
import { defenderGameService } from '@/domain/defender/DefenderGameService';
import { gameEngine } from '@/domain/services/GameEngine';
import { reportService } from '@/domain/services/ReportService';
import { turnLogRepository } from '@/domain/repositories/TurnLogRepository';

describe('Defender reporting episode log', () => {
  it('builds report evidence from recorded turns only', async () => {
    const session = await gameEngine.startSession('chapter_recommendation_001');
    await defenderGameService.sendMessage(
      session.sessionId,
      'fake_admission',
      '请问怎么核实你的身份？',
    );
    const completed = await defenderGameService.sendMessage(
      session.sessionId,
      'official_service',
      '我已确认录取确认官方渠道，完成核实',
    );

    const report = await reportService.generateReport(completed.state);
    const persistedEpisode = await turnLogRepository.findEpisodeBySessionId(session.sessionId);

    expect(report.episode?.turns.length).toBe(2);
    expect(persistedEpisode?.turns.length).toBe(2);
    expect(report.episode?.turns.every((turn) => turn.messageId || turn.actionId)).toBe(true);
    expect(report.firstOfficialVerificationTurnId).toBeDefined();
    expect(report.informationLeakSummary).toContain('未发生信息泄露');
    expect(report.aiTacticSummary.some((item) => item.includes('证据：'))).toBe(true);
  });

  it('reports leakage and emergency state from persisted game state', async () => {
    const session = await gameEngine.startSession('chapter_recommendation_001');
    const leaked = await defenderGameService.sendMessage(
      session.sessionId,
      'fake_admission',
      '我来提交信息',
    );

    const report = await reportService.generateReport(leaked.state);

    expect(report.informationLeakSummary).toContain('发生了信息泄露');
    expect(report.emergencyEvaluation).toContain('应急');
    expect(report.episode?.turns[0].informationLeakOccurred).toBe(true);
  });
});
