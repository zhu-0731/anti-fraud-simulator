import { describe, expect, it } from 'vitest';
import { getAllChannelCards } from '@/domain/tactics/ChannelRegistry';
import { getAllRoleCards } from '@/domain/tactics/RoleRegistry';
import { isTacticType } from '@/domain/tactics/TacticRegistry';
import type { InteractionChannel } from '@/domain/types/tactic';

const CORE_CHANNELS: InteractionChannel[] = [
  'group_chat',
  'private_chat',
  'sms',
  'email',
  'simulated_call',
  'simulated_browser',
];

describe('RoleRegistry and ChannelRegistry', () => {
  it('defines the six shared interaction channels', () => {
    const channels = getAllChannelCards();

    expect(channels.map((channel) => channel.id).sort()).toEqual([...CORE_CHANNELS].sort());
    for (const channel of channels) {
      expect(channel.primaryEffect).not.toHaveLength(0);
      expect(channel.primaryRiskSignal).not.toHaveLength(0);
      expect(channel.allowedModes).toContain('defender');
      expect(channel.allowedModes).toContain('red_team');
    }
  });

  it('defines roles with valid tactic and channel references', () => {
    const channelIds = new Set(getAllChannelCards().map((channel) => channel.id));

    for (const role of getAllRoleCards()) {
      expect(role.availableTactics.length).toBeGreaterThan(0);
      expect(role.availableChannels.length).toBeGreaterThan(0);
      expect(role.verificationMethods.length).toBeGreaterThan(0);
      expect(role.allowedModes).toContain('defender');
      expect(role.allowedModes).toContain('red_team');

      for (const tacticId of role.availableTactics) {
        expect(isTacticType(tacticId)).toBe(true);
      }
      for (const channelId of role.availableChannels) {
        expect(channelIds.has(channelId)).toBe(true);
      }
    }
  });
});
