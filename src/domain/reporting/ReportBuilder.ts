import type { GameState, ActionRecord } from '@/domain/types/game';
import type { ChatMessage } from '@/domain/types/chat';
import type { Episode, EpisodeTurn, EpisodeTacticExplanation } from '@/domain/types/episode';
import type { TacticUse } from '@/domain/types/tactic';
import { getTacticCard } from '@/domain/tactics/TacticRegistry';
import { generateId } from '@/lib/id';

export interface DefenderReportSummary {
  episode: Episode;
  aiTacticSummary: string[];
  firstOfficialVerificationTurnId?: string;
  contradictionSummary: {
    discovered: string[];
    missed: string[];
  };
  informationLeakSummary: string;
  emergencyEvaluation: string;
}

export class ReportBuilder {
  build(state: GameState): DefenderReportSummary {
    const episode = this.buildEpisode(state);

    return {
      episode,
      aiTacticSummary: this.buildTacticSummary(episode.turns),
      firstOfficialVerificationTurnId: episode.firstOfficialVerificationTurnId,
      contradictionSummary: this.buildContradictionSummary(state),
      informationLeakSummary: state.sensitiveInfoLeaked
        ? '本局发生了信息泄露：玩家向未确认渠道提交或表达了提交敏感信息的意图。'
        : '本局未发生信息泄露，玩家在提交信息前完成了官方核实。',
      emergencyEvaluation: state.sensitiveInfoLeaked
        ? state.emergencyHandled || state.emergencyActionsCompleted.length > 0
          ? '已进入应急处置并完成部分止损动作。'
          : '已触发应急风险，但尚未完成足够的止损动作。'
        : '未触发应急处置，说明风险在提交信息前被拦截。',
    };
  }

  private buildEpisode(state: GameState): Episode {
    const episodeId = generateId('episode');
    const chatTurns = this.buildChatTurns(state, episodeId);
    const actionTurns = this.buildActionTurns(state, episodeId, chatTurns.length);
    const turns = [...chatTurns, ...actionTurns].sort((a, b) => a.turnNumber - b.turnNumber);
    const firstOfficial = turns.find((turn) => turn.officialVerification);

    return {
      id: episodeId,
      sessionId: state.sessionId,
      mode: state.mode,
      difficulty: state.difficulty,
      turns,
      firstOfficialVerificationTurnId: firstOfficial?.id,
      generatedAt: new Date().toISOString(),
    };
  }

  private buildChatTurns(state: GameState, episodeId: string): EpisodeTurn[] {
    const playerMessages = Object.values(state.chatHistories)
      .flat()
      .filter((message) => message.sender === 'player')
      .sort((a, b) => a.timestamp.localeCompare(b.timestamp));

    return playerMessages.map((message, index) => {
      const turnNumber = index + 1;
      const tacticUses = state.tacticUses.filter((use) => use.turnNumber === turnNumber);
      return this.buildTurnFromMessage(state, episodeId, message, turnNumber, tacticUses);
    });
  }

  private buildActionTurns(state: GameState, episodeId: string, offset: number): EpisodeTurn[] {
    return state.actionHistory.map((action, index) => {
      const turnNumber = offset + index + 1;
      const tacticUses = state.tacticUses.filter((use) => use.turnNumber === turnNumber);
      return this.buildTurnFromAction(state, episodeId, action, turnNumber, tacticUses);
    });
  }

  private buildTurnFromMessage(
    state: GameState,
    episodeId: string,
    message: ChatMessage,
    turnNumber: number,
    tacticUses: TacticUse[],
  ): EpisodeTurn {
    const turnId = generateId('turn');
    const officialVerification = isOfficialContact(message.contactId);
    const informationLeakOccurred = /身份证|手机号|验证码|密码|提交|填写/.test(message.content);

    return {
      id: turnId,
      episodeId,
      turnNumber,
      mode: state.mode,
      source: 'chat',
      contactId: message.contactId,
      messageId: message.id,
      playerAction: `发送消息给 ${message.contactId}`,
      playerText: message.content,
      tacticUses,
      agentSteps: [{
        id: generateId('agentstep'),
        turnId,
        agentId: 'DefenderRuleEngine',
        type: 'rule_engine',
        summary: tacticUses.length > 0
          ? `根据联系人和意图记录 ${tacticUses.length} 个技能使用。`
          : '本轮未记录风险技能，按规则更新防守状态。',
        inputRef: message.id,
        outputRef: turnId,
        fallbackUsed: false,
      }],
      tacticExplanations: tacticUses.map((use) => explainTacticUse(use)),
      observedRiskSignals: tacticUses.flatMap((use) => getTacticCard(use.tacticId).observableSignals),
      saferAction: officialVerification
        ? '继续坚持官方渠道，不向私聊或非官方链接提交信息。'
        : '先通过官网、辅导员或 96110 独立核实，再决定是否继续。',
      officialVerification,
      informationLeakOccurred,
      emergencyHandled: state.emergencyHandled || state.emergencyActionsCompleted.length > 0,
      timestamp: message.timestamp,
    };
  }

  private buildTurnFromAction(
    state: GameState,
    episodeId: string,
    action: ActionRecord,
    turnNumber: number,
    tacticUses: TacticUse[],
  ): EpisodeTurn {
    const turnId = generateId('turn');
    const officialVerification = action.category === 'verify' || action.category === 'safe';
    const informationLeakOccurred = action.category === 'risky';

    return {
      id: turnId,
      episodeId,
      turnNumber,
      mode: state.mode,
      source: 'event_action',
      actionId: action.actionId,
      playerAction: action.actionLabel,
      tacticUses,
      agentSteps: [{
        id: generateId('agentstep'),
        turnId,
        agentId: 'ReportBuilder',
        type: 'report_builder',
        summary: '从已记录的事件行动生成复盘条目，不调用模型推断玩家行为。',
        inputRef: action.actionId,
        outputRef: turnId,
      }],
      tacticExplanations: tacticUses.map((use) => explainTacticUse(use)),
      observedRiskSignals: tacticUses.flatMap((use) => getTacticCard(use.tacticId).observableSignals),
      saferAction: action.category === 'risky'
        ? '暂停操作，改走官网、辅导员或反诈热线核实。'
        : '保持当前核实和留证节奏。',
      officialVerification,
      informationLeakOccurred,
      emergencyHandled: state.emergencyHandled || state.emergencyActionsCompleted.length > 0,
      timestamp: action.timestamp,
    };
  }

  private buildTacticSummary(turns: EpisodeTurn[]): string[] {
    const withTactics = turns.filter((turn) => turn.tacticExplanations.length > 0);
    if (withTactics.length === 0) {
      return ['本局未记录明确的风险技能使用，报告只基于玩家已记录行为生成。'];
    }

    return withTactics.flatMap((turn) =>
      turn.tacticExplanations.map((item) =>
        `第 ${turn.turnNumber} 轮使用「${item.tacticName}」：${item.lookedReasonableBecause} 风险信号：${item.riskSignals.join('、')}。证据：${turn.messageId ?? turn.actionId ?? turn.id}`,
      ),
    );
  }

  private buildContradictionSummary(state: GameState): DefenderReportSummary['contradictionSummary'] {
    const discovered = state.defenderState.discoveredContradictions;
    const missed = state.tacticUses.length > 0 && discovered.length === 0
      ? ['风险角色身份未由独立官方渠道证明', '紧急操作要求与官方免费录取流程不一致']
      : [];

    return { discovered, missed };
  }
}

export const reportBuilder = new ReportBuilder();

function explainTacticUse(use: TacticUse): EpisodeTacticExplanation {
  const card = getTacticCard(use.tacticId);
  return {
    tacticId: use.tacticId,
    tacticName: card.name,
    lookedReasonableBecause: `${card.description} 在游戏语境中可能借助熟人、权威或流程外观显得可信。`,
    riskSignals: card.observableSignals,
    saferAction: card.defenderCounters.join('、'),
  };
}

function isOfficialContact(contactId: string): boolean {
  return contactId === 'official_service' || contactId === 'anti_fraud' || contactId === 'counselor';
}
