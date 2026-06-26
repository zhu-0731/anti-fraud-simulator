import { describe, expect, it } from 'vitest';
import { supportAgent } from '@/domain/agents/support/SupportAgent';
import type { SupportRole } from '@/domain/types/supportAgent';

const ROLES: SupportRole[] = ['family', 'peer', 'group', 'counselor', 'official', 'anti_fraud'];

describe('SupportAgent', () => {
  it.each(ROLES)('responds for %s role', async (role) => {
    const output = await supportAgent.respond({
      role,
      playerIntent: 'ask_verification',
      playerText: '这个是真的吗',
    });

    expect(output.role).toBe(role);
    expect(output.responseText.length).toBeGreaterThan(0);
    expect(output.recommendedActions.length).toBeGreaterThan(0);
    expect(output.safetyFlags).toEqual([]);
  });

  it('allows family and peer roles to be non-authoritative', async () => {
    const family = await supportAgent.respond({
      role: 'family',
      playerIntent: 'ask_source',
      playerText: '来源是哪',
    });
    const peer = await supportAgent.respond({
      role: 'peer',
      playerIntent: 'ask_source',
      playerText: '来源是哪',
    });

    expect(family.isAuthoritative).toBe(false);
    expect(peer.isAuthoritative).toBe(false);
  });

  it('keeps counselor, official, and anti-fraud roles on safe actions', async () => {
    for (const role of ['counselor', 'official', 'anti_fraud'] satisfies SupportRole[]) {
      const output = await supportAgent.respond({
        role,
        playerIntent: 'submit_info',
        playerText: '我要提交信息',
      });

      expect(output.isAuthoritative).toBe(true);
      expect(output.responseText).not.toMatch(/私信.*密码|发送.*身份证|转账/);
      expect(output.safetyFlags).toEqual([]);
    }
  });

  it('uses only simulated domains in official guidance', async () => {
    const output = await supportAgent.respond({
      role: 'official',
      playerIntent: 'request_link',
      playerText: '发我链接',
    });

    expect(output.responseText).toContain('game-simulated-link.local');
    expect(output.responseText).not.toMatch(/https?:\/\//);
  });
});
