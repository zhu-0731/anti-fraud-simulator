import type { GameState } from '@/domain/types/game';
import type { GameReport, TimelineEntry } from '@/domain/types/report';
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
    };
  }

  private async buildTimeline(state: GameState): Promise<TimelineEntry[]> {
    return state.actionHistory.map((record) => ({
      eventId: record.eventId,
      eventTitle: record.eventId,
      actionId: record.actionId,
      actionLabel: record.actionLabel,
      category: record.category,
      isCorrect: ['safe', 'verify', 'evidence', 'emergency'].includes(record.category),
      feedback: record.feedback,
      timestamp: record.timestamp,
    }));
  }
}

export const reportService = new ReportService();
