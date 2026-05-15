import type { GameState } from '@/domain/types/game';
import type { GameReport, TimelineEntry, TurningPoint, TrustChainAnalysis } from '@/domain/types/report';
import { scoringService } from './ScoringService';
import { endingService } from './EndingService';
import { chapterRepository } from '@/domain/repositories/ChapterRepository';

const ADVICE_BY_ENDING: Record<string, string[]> = {
  safe_confirmed: [
    '你全程保持了冷静，始终以官方渠道为核实依据，是优秀的防骗示范。',
    '继续保持：遇到任何"紧急通知"，第一步永远是核实官方渠道，而不是立即行动。',
    '保研录取全程免费，任何要求付款的都是诈骗。',
  ],
  near_miss: [
    '你最终做出了正确判断，但过程中有一些危险操作。',
    '关键点：链接域名核查、拒绝私信索要信息，这两点要成为本能反应。',
    '遇到倒计时压力时，冷静5秒钟再行动，往往能发现破绽。',
    '全国反诈骗热线：96110，随时可以咨询。',
  ],
  info_leaked: [
    '你的个人信息可能已被泄露，建议尽快修改相关账号密码。',
    '向学校报告情况，请求协助处理可能的身份冒用风险。',
    '如果收到异常验证码或账号异常登录提示，立即修改密码并开启双重验证。',
    '拨打96110反诈热线进行咨询。',
    '教训：任何索要身份证号+手机号组合的链接都极度危险。',
  ],
  money_lost_but_handled: [
    '你发现问题后及时进行了应急处置，做得很好。',
    '立即联系银行申请交易撤销，时间窗口非常重要。',
    '向警方报案，保存所有聊天记录和转账记录。',
    '拨打96110反诈热线，专业人员可以提供进一步指引。',
    '教训：保研录取绝对不需要支付任何费用，看到收费就是诈骗。',
  ],
  fully_scammed: [
    '立即拨打110报警，同时拨打96110反诈热线。',
    '联系银行/支付宝/微信支付，申请紧急冻结和撤销交易。',
    '修改所有涉及的账号密码，包括学信网、邮箱、支付工具。',
    '向学校报告，请求协助处理后续影响。',
    '保存所有聊天记录、转账记录、截图，作为报案证据。',
    '告诫自己：真实录取通知永远通过官网发布，永远免费，永远不要求私信密码。',
  ],
};

export class ReportService {
  async generateReport(state: GameState): Promise<GameReport> {
    const score = scoringService.calculateScore(state);
    const endingType = state.endingType ?? endingService.determineEnding(state);

    const timeline = await this.buildTimeline(state);
    const keyMistakes = state.actionHistory.filter((a) => a.category === 'risky');
    const correctActions = state.actionHistory.filter((a) =>
      ['safe', 'verify', 'evidence', 'emergency'].includes(a.category),
    );

    const events = await chapterRepository.getEventsByChapter(state.chapterId);
    const teachingPoints = events
      .filter((e) => state.actionHistory.some((a) => a.eventId === e.id))
      .map((e) => e.teachingPoint);

    const ws = state.worldState;
    const delayedConsequences = ws?.delayedConsequences ?? [];
    const turningPoints = this.buildTurningPoints(state);
    const trustChainAnalysis = this.buildTrustChainAnalysis(state);
    const pressureChainSummary = this.buildPressureChainSummary(state);
    const recoveryEvaluation = this.buildRecoveryEvaluation(state);

    return {
      sessionId: state.sessionId,
      endingType,
      score,
      timeline,
      keyMistakes,
      correctActions,
      evidenceSummary: state.evidenceList,
      realWorldAdvice: ADVICE_BY_ENDING[endingType] ?? [],
      teachingPoints,
      agentTraceSummary: state.agentTrace
        ? `AI生成了 ${state.agentTrace.steps.length} 个事件步骤`
        : undefined,
      generatedAt: new Date().toISOString(),
      delayedConsequences,
      turningPoints,
      trustChainAnalysis,
      pressureChainSummary,
      recoveryEvaluation,
    };
  }

  private async buildTimeline(state: GameState): Promise<TimelineEntry[]> {
    const ws = state.worldState;
    const dcMap = new Map(
      (ws?.delayedConsequences ?? []).map((dc) => [dc.source, dc]),
    );

    return state.actionHistory.map((record) => {
      const dc = dcMap.get(record.eventId);
      return {
        eventId: record.eventId,
        eventTitle: record.eventId,
        actionId: record.actionId,
        actionLabel: record.actionLabel,
        category: record.category,
        isCorrect: ['safe', 'verify', 'evidence', 'emergency'].includes(record.category),
        feedback: record.feedback,
        timestamp: record.timestamp,
        lookedReasonableBecause: dc?.lookedReasonableBecause,
        hiddenRisk: dc?.hiddenRisk,
        laterImpact: dc?.laterImpact,
      };
    });
  }

  private buildTurningPoints(state: GameState): TurningPoint[] {
    const ws = state.worldState;
    const points: TurningPoint[] = [];

    if (ws?.submittedInfoLevel > 0) {
      points.push({
        timestamp: state.currentTime,
        description: '向未验证渠道提交个人信息',
        playerChoice: '填写并提交了信息表单',
        consequence: '个人信息被记录，为精准诈骗提供素材',
        couldHaveDone: '先通过官网核实招办电话，再决定是否操作',
      });
    }

    if (ws?.suspiciousLinkExposure > 25) {
      points.push({
        timestamp: state.currentTime,
        description: '多次点开非官方链接',
        playerChoice: '相信了"专用快速通道"的说法',
        consequence: '链接行为被追踪，身份信息有泄露风险',
        couldHaveDone: '核查域名是否与学校官网完全一致',
      });
    }

    if (ws?.officialPathAwareness > 50 && ws?.submittedInfoLevel === 0) {
      points.push({
        timestamp: state.currentTime,
        description: '坚持通过官方渠道核实',
        playerChoice: '主动查询官网并致电招办',
        consequence: '成功识别诈骗，保住了个人信息安全',
        couldHaveDone: '（已做出正确选择）',
      });
    }

    return points;
  }

  private buildTrustChainAnalysis(state: GameState): TrustChainAnalysis {
    const ws = state.worldState;
    const family = ws?.trustFamilyChain ?? 0;
    const peer = ws?.trustPeerChain ?? 0;
    const authority = ws?.authorityPressure ?? 0;
    const official = ws?.officialPathAwareness ?? 0;

    return {
      familyChain: {
        score: family,
        description: family > 20
          ? '你通过家人传播了可疑信息，亲情信任链被利用作为诈骗切入点'
          : '家人传播链影响较小，你没有轻信亲人转发的未核实信息',
      },
      peerChain: {
        score: peer,
        description: peer > 20
          ? '同学/学长的"亲身经历"增加了你对可疑渠道的信任，同辈压力发挥了作用'
          : '同伴影响可控，你对同学推荐保持了适度怀疑',
      },
      authorityChain: {
        score: authority,
        description: authority > 30
          ? '对方成功利用"招办老师"身份制造权威幻觉，你感受到了强烈的服从压力'
          : '你对权威身份保持了质疑，尝试核实对方身份',
      },
      officialAwareness: {
        score: official,
        description: official > 40
          ? '你对官方渠道的认知较强，懂得通过官网、官方电话核实信息'
          : '官方核实意识有待加强：录取信息永远只发布在学校官网',
      },
    };
  }

  private buildPressureChainSummary(state: GameState): string {
    const ws = state.worldState;
    const parts: string[] = [];

    if ((ws?.deadlinePressure ?? 0) > 20) {
      parts.push('截止时间倒计时制造了紧迫感（"今日24:00截止"）');
    }
    if ((ws?.authorityPressure ?? 0) > 20) {
      parts.push('权威身份（"招办老师"）压制了你的质疑冲动');
    }
    if ((ws?.trustFamilyChain ?? 0) > 10) {
      parts.push('亲情渠道（妈妈转发）降低了你的初始警惕');
    }
    if ((ws?.trustPeerChain ?? 0) > 10) {
      parts.push('同伴背书（学长/群聊）增加了信息可信度幻觉');
    }

    if (parts.length === 0) return '本次模拟中，你较好地抵抗了各类心理压力策略。';
    return `本次诈骗尝试利用了以下压力链条：${parts.join('；')}。这些手段组合使用，是现代诈骗的典型套路。`;
  }

  private buildRecoveryEvaluation(state: GameState): string {
    const ws = state.worldState;
    const submitted = ws?.submittedInfoLevel ?? 0;
    const awareness = ws?.officialPathAwareness ?? 0;

    if (submitted === 0 && awareness > 40) {
      return '优秀：你在未受损失的情况下识别了诈骗，全程保持了正确判断。';
    }
    if (submitted > 0 && awareness > 50) {
      return '及时止损：虽然提交了部分信息，但你随后主动求助官方渠道，减少了进一步损失。';
    }
    if (submitted > 0 && awareness <= 50) {
      return '需要改进：信息已提交但官方核实不足，建议立即修改相关密码并向辅导员说明情况。';
    }
    return '待评估：继续与各联系人互动以完成模拟。';
  }
}

export const reportService = new ReportService();
