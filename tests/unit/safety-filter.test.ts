import { describe, expect, it } from 'vitest';
import { safetyFilterService } from '@/domain/services/SafetyFilterService';
import type { EventCard } from '@/domain/types/game';

function eventWithMessage(message: string): EventCard {
  return {
    id: 'T01',
    title: '测试事件',
    phase: 'playing',
    channel: 'browser',
    senderName: '测试',
    senderRole: '系统',
    message,
    surfaceTrust: 50,
    trueRiskLevel: 'high',
    pressureTypes: [],
    riskSignals: [],
    safeActions: [],
    actions: [],
    nextEventRules: [],
    teachingPoint: '测试安全过滤',
  };
}

describe('SafetyFilterService', () => {
  it('replaces real links and preserves simulated links', () => {
    const filtered = safetyFilterService.removeRealLinks(
      'real https://example.com/a and simulated game-simulated-link.local/demo',
    );

    expect(filtered).toContain('game-simulated-link.local/blocked');
    expect(filtered).toContain('game-simulated-link.local/demo');
    expect(filtered).not.toContain('https://example.com/a');
  });

  it('adds browser simulation disclaimer and blocks dangerous patterns', () => {
    const result = safetyFilterService.filterEvent(
      eventWithMessage('请把真实身份证号发送到这里，并访问 https://example.com'),
    );

    expect(result.filteredEvent.message).toContain('【教育模拟内容 - 请勿填写真实信息】');
    expect(result.filteredEvent.message).toContain('game-simulated-link.local/blocked');
    expect(result.passed).toBe(false);
    expect(result.blockedReasons.length).toBeGreaterThan(0);
  });
});
