import { describe, expect, it } from 'vitest';
import type { AIProviderRequest } from '@/domain/ai/gateway/AIProvider';
import { createInitialRedTeamState } from '@/domain/gameModes';
import { redTeamGameService } from '@/domain/redTeam/RedTeamGameService';
import { getAllChannelCards } from '@/domain/tactics/ChannelRegistry';
import { getAllRoleCards } from '@/domain/tactics/RoleRegistry';
import { getAllTacticCards } from '@/domain/tactics/TacticRegistry';
import type { DefenseRule } from '@/domain/defender/DefenseRule';
import type { EpisodeTurn } from '@/domain/types/episode';
import type {
  BlindSpotHypothesis,
  JudgeAgentInput,
  RedTeamTurnRequest,
  VictimAgentInput,
} from '@/domain/types/redTeam';

describe('red-team readiness contracts', () => {
  it('keeps victim input blind to selected tactic labels', () => {
    const input: VictimAgentInput = {
      sessionId: 's1',
      difficulty: 'beginner',
      scenarioId: 'chapter_recommendation_001',
      visibleMessages: [{
        id: 'm1',
        channelId: 'private_chat',
        roleHint: '自称工作人员',
        content: '请尽快确认。',
        timestamp: '2026-06-27T00:00:00.000Z',
      }],
      victimProfile: {
        riskAwareness: 'medium',
        pressureTolerance: 'medium',
        priorKnowledge: [],
      },
      publicContext: ['保研录取确认场景'],
    };

    expect(Object.keys(input)).not.toContain('selectedTactics');
    expect(JSON.stringify(input)).not.toContain('authority_claim');
  });

  it('separates judge evidence from victim-visible input', () => {
    const hypothesis: BlindSpotHypothesis = {
      id: 'h1',
      sessionId: 's1',
      description: '玩家认为对方使用权威冒充。',
      suspectedTactics: ['authority_claim'],
      evidenceTurnIds: ['turn1'],
      submittedAt: '2026-06-27T00:00:00.000Z',
    };
    const input: JudgeAgentInput = {
      sessionId: 's1',
      difficulty: 'standard',
      scenarioId: 'chapter_recommendation_001',
      evidenceTurns: [{ id: 'turn1', turnNumber: 1, mode: 'red_team', messageId: 'm1' }],
      candidateTacticUses: [{
        id: 'use1',
        tacticId: 'authority_claim',
        mode: 'red_team',
        roleId: 'unverified_staff',
        channelId: 'private_chat',
        intensity: 1,
        turnNumber: 1,
        effectMultiplier: 1,
        createdAt: '2026-06-27T00:00:00.000Z',
      }],
      playerHypothesis: hypothesis,
    };

    expect(input.evidenceTurns[0].mode).toBe('red_team');
    expect(input.candidateTacticUses[0].mode).toBe('red_team');
    expect(input.playerHypothesis?.suspectedTactics).toEqual(['authority_claim']);
  });

  it('keeps red-team state isolated from defender state', () => {
    const state = createInitialRedTeamState({ difficulty: 'advanced' });

    expect(state.mode).toBe('red_team');
    expect('defenderState' in state).toBe(false);
    expect('worldState' in state).toBe(false);
  });

  it('reuses shared registries without defender-only dependencies', () => {
    expect(getAllTacticCards().every((card) => card.allowedModes.includes('red_team'))).toBe(true);
    expect(getAllRoleCards().every((card) => card.allowedModes.includes('red_team'))).toBe(true);
    expect(getAllChannelCards().every((card) => card.allowedModes.includes('red_team'))).toBe(true);
  });

  it('supports red-team mode on episode turns and reusable defense rules', () => {
    const turn: EpisodeTurn = {
      id: 'turn1',
      episodeId: 'episode1',
      turnNumber: 1,
      mode: 'red_team',
      source: 'chat',
      playerAction: '发送红队测试消息',
      tacticUses: [],
      agentSteps: [],
      tacticExplanations: [],
      observedRiskSignals: [],
      saferAction: '等待 Judge 评估。',
      officialVerification: false,
      informationLeakOccurred: false,
      emergencyHandled: false,
      timestamp: '2026-06-27T00:00:00.000Z',
    };
    const rule: DefenseRule = {
      id: 'rule1',
      conditions: { tacticsAnyOf: ['authority_claim'] },
      effects: {
        suspicionDelta: 10,
        identityTrustDelta: -10,
        disclosureDelta: 0,
        requireIndependentVerification: true,
      },
      explanation: '身份声明需要独立核实。',
      testedCapability: 'independent_identity_verification',
      sourcePatternIds: [],
    };

    expect(turn.mode).toBe('red_team');
    expect(rule.conditions.tacticsAnyOf).toContain('authority_claim');
  });

  it('declares future AI Gateway victim and judge tasks', () => {
    const victimRequest: AIProviderRequest<'victim_response'> = {
      requestId: 'req-victim',
      task: 'victim_response',
      input: {
        sessionId: 's1',
        difficulty: 'beginner',
        scenarioId: 'chapter_recommendation_001',
        visibleMessages: [],
        victimProfile: { riskAwareness: 'low', pressureTolerance: 'medium', priorKnowledge: [] },
        publicContext: [],
      },
      signal: new AbortController().signal,
    };
    const judgeRequest: AIProviderRequest<'judge_evaluation'> = {
      requestId: 'req-judge',
      task: 'judge_evaluation',
      input: {
        sessionId: 's1',
        difficulty: 'beginner',
        scenarioId: 'chapter_recommendation_001',
        evidenceTurns: [],
        candidateTacticUses: [],
      },
      signal: new AbortController().signal,
    };

    expect(victimRequest.task).toBe('victim_response');
    expect(judgeRequest.task).toBe('judge_evaluation');
  });

  it('returns not-ready status without modifying defender core', async () => {
    const state = redTeamGameService.createNotReadyState({ sessionId: 'red1' });
    const request: RedTeamTurnRequest = {
      sessionId: 'red1',
      state,
      selectedRole: 'unverified_staff',
      selectedChannel: 'private_chat',
      selectedTactics: ['authority_claim'],
      messageDraft: '请尽快确认。',
    };

    const response = await redTeamGameService.submitTurn(request);

    expect(response.status).toBe('not_ready');
    expect(response.state.selectedTactics).toEqual(['authority_claim']);
    expect(response.state.mode).toBe('red_team');
  });
});
