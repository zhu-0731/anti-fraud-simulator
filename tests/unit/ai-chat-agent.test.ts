import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { AIChatAgent, type AIChatClient } from '@/domain/ai/chat/AIChatAgent';
import { FakeAdmissionAgent } from '@/domain/agents/FakeAdmissionAgent';
import type { AgentResponseInput } from '@/domain/types/chat';

describe('AIChatAgent', () => {
  beforeEach(() => {
    process.env.AI_ENABLED = 'true';
    process.env.AI_PROVIDER = 'vivo';
    process.env.VIVO_APP_KEY = 'test-key';
    delete process.env.AI_CHAT_ENABLED;
  });

  afterEach(() => {
    delete process.env.AI_ENABLED;
    delete process.env.AI_PROVIDER;
    delete process.env.VIVO_APP_KEY;
    delete process.env.AI_CHAT_ENABLED;
  });

  it('uses structured AI chat output when enabled', async () => {
    const agent = new AIChatAgent(new FakeAdmissionAgent(), clientReturning('你放心，我这边先帮你占着名额。'));

    const response = await agent.generateResponse(input());

    expect(response.messages[0].content).toBe('你放心，我这边先帮你占着名额。');
    expect(response.messages[0].metadata?.aiGenerated).toBe(true);
    expect(response.messages[0].metadata?.aiProvider).toBe('vivo');
    expect(response.delayedConsequences).toBeUndefined();
  });

  it('falls back to rule response when AI output is invalid', async () => {
    const agent = new AIChatAgent(new FakeAdmissionAgent(), {
      async generate() {
        return { messages: [] };
      },
    });

    const response = await agent.generateResponse(input());

    expect(response.messages[0].content).not.toBe('unused');
    expect(response.messages[0].content.length).toBeGreaterThan(0);
  });

  it('does not call AI when provider is mock', async () => {
    process.env.AI_PROVIDER = 'mock';
    let called = false;
    const agent = new AIChatAgent(new FakeAdmissionAgent(), {
      async generate() {
        called = true;
        return { messages: [{ content: 'unused' }] };
      },
    });

    const response = await agent.generateResponse(input());

    expect(called).toBe(false);
    expect(response.messages[0].content.length).toBeGreaterThan(0);
  });

  it('ignores empty OpenAI key and uses vivo key', async () => {
    process.env.OPENAI_API_KEY = '';
    let called = false;
    const agent = new AIChatAgent(new FakeAdmissionAgent(), {
      async generate() {
        called = true;
        return { messages: [{ content: 'vivo key path works' }] };
      },
    });

    const response = await agent.generateResponse(input());

    expect(called).toBe(true);
    expect(response.messages[0].content).toBe('vivo key path works');
  });

  it('falls back when all key env vars are empty', async () => {
    process.env.VIVO_APP_KEY = '';
    process.env.OPENAI_COMPATIBLE_API_KEY = '';
    process.env.OPENAI_API_KEY = '';
    let called = false;
    const agent = new AIChatAgent(new FakeAdmissionAgent(), {
      async generate() {
        called = true;
        return { messages: [{ content: 'unused' }] };
      },
    });

    const response = await agent.generateResponse(input());

    expect(called).toBe(false);
    expect(response.messages[0].content.length).toBeGreaterThan(0);
  });

  it('filters real links from AI chat output', async () => {
    const agent = new AIChatAgent(new FakeAdmissionAgent(), clientReturning('请打开 https://example.com 处理。'));

    const response = await agent.generateResponse(input());

    expect(response.messages[0].content).not.toContain('https://example.com');
    expect(response.messages[0].content).toContain('game-simulated-link.local');
  });
});

function clientReturning(content: string): AIChatClient {
  return {
    async generate() {
      return { messages: [{ content }] };
    },
  };
}

function input(): AgentResponseInput {
  return {
    contactId: 'fake_admission',
    playerText: '请问怎么核实你的身份？',
    intent: 'ask_verification',
    recentMessages: [],
    worldState: {
      narrativeStage: 'normal_context',
      trustFamilyChain: 0,
      trustPeerChain: 0,
      authorityPressure: 0,
      deadlinePressure: 0,
      officialPathAwareness: 0,
      suspiciousLinkExposure: 0,
      submittedInfoLevel: 0,
      knownFacts: [],
      contradictionsFound: [],
      delayedConsequences: [],
      triggeredStages: [],
    },
  };
}
