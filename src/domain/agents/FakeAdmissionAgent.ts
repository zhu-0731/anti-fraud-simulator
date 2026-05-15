/**
 * FakeAdmissionAgent — Risk simulation role.
 *
 * SAFETY CONSTRAINTS (strictly enforced):
 * - All links use game-simulated-link.local only
 * - No real payment account numbers
 * - No instructions that bypass real security controls
 * - Content is educational simulation ONLY, not real fraud methodology
 * - Responses reveal realistic pressure tactics for training purposes
 */
import type { AgentResponseInput, AgentResponseMessage, DelayedConsequence } from '@/domain/types/chat';
import { MockAgent, AgentResponseMap, msg, pick } from './BaseAgent';
import { makeConsequence } from '@/domain/narrative/DelayedConsequenceService';

export class FakeAdmissionAgent extends MockAgent {
  readonly contactId = 'fake_admission';
  readonly displayName = '招生办-张老师（未认证）';
  readonly role = '风险模拟：仿冒权威施压，用于教育演示';

  protected responseMap(input: AgentResponseInput): AgentResponseMap {
    const me = this.displayName;
    const ws = input.worldState;
    // Escalate pressure when deadlinePressure is high
    const urgent = ws.deadlinePressure > 20;

    return {
      ask_verification: () => [
        msg(me, pick([
          '我们这是招办内部协助系统，今年试运行，还没上官网，正式的。你放心。',
          '官方文件我可以发给你，但现在时间紧，你先把基本信息提交，后面可以核实。',
        ])),
      ],
      ask_source: () => [
        msg(me, pick([
          '这是教务系统推送给我的，我们负责统一联系推免生。今天24:00截止，你赶紧操作。',
          '招办统一通知，通过各个辅导员群下发。你没有收到可能是漏掉了，所以我直接联系你。',
        ])),
      ],
      challenge_identity: () => [
        msg(me, pick([
          '我理解你谨慎，这很好，但时间紧迫，你先把基本信息填一下，后面可以再核实。你的名额不能空着。',
          urgent
            ? '同学，现在只剩不到一小时了！你再核实就来不及了，先把信息提交了再说！'
            : '你可以打我们部门电话核实，但记住我们今晚系统维护，电话可能接听慢。先操作再说。',
        ])),
      ],
      search_official_site: () => [
        msg(me, pick([
          '官网今晚在维护，你通过我这边的渠道更快，等官网恢复可能就超时了。',
          '官网是通用渠道，处理慢，我们这个是推免生专用快速通道，一样正规。',
        ])),
      ],
      call_official: () => [
        msg(me, pick([
          '我们部门今晚开会，电话可能接听慢，你先把信息填了，我这边有记录。',
          '你可以打，但我告诉你，今晚截止，电话队列很长，不如先在这里完成。',
        ])),
      ],
      request_link: () => [
        msg(me, '录取确认入口：game-simulated-link.local/fake-confirm —— 用学号登录，填写手机号和身份证号，等待确认短信。', 'chat', {
          simulatedLink: 'game-simulated-link.local/fake-confirm',
          revealAtReport: true,
          hiddenConsequenceId: 'fake_teacher_info_submitted',
        }),
      ],
      open_link: () => [
        msg(me, '好，你现在去操作就行，有问题随时告诉我，我在线等你。'),
      ],
      submit_info: () => [
        msg(me, '收到！你的信息已提交，等待系统审核，今晚应该会收到确认短信。'),
      ],
      save_evidence: () => [
        msg(me, '没问题，你截图留存就行，这是正规流程，没什么问题的。'),
      ],
      small_talk: () => [
        msg(me, urgent
          ? '同学，请尽快操作，时间不等人。'
          : '有问题随时问我，我负责跟进你的录取确认。'),
      ],
      ignore: () => [
        msg(me, urgent
          ? '同学！！你还没有完成确认，截止时间快到了，请立即操作！'
          : '好的，但请记得今天24:00截止，晚了名额会被取消。'),
      ],
      emergency_help: () => [
        msg(me, '同学你冷静，我们是正规机构，你操作没有问题的，放心。'),
      ],
    };
  }

  protected defaultDelayedConsequences(input: AgentResponseInput): DelayedConsequence[] {
    if (input.intent === 'submit_info' || input.intent === 'open_link') {
      return [makeConsequence('疑似招办老师私聊', {
        playerActionSummary: '向自称招办老师的未认证账号提交了个人信息',
        lookedReasonableBecause: '对方使用招办名义，语气正式，主动提供了"流程"',
        hiddenRisk: '招办绝不会通过私信要求提交身份信息，账号名可随意设置',
        laterImpact: '个人信息被记录，为精准诈骗或身份冒用提供了素材',
        severity: 'high',
      })];
    }
    return [];
  }

  // Initially hidden — only appears after NarrativeDirector triggers it
  getInitialMessages(): AgentResponseMessage[] {
    return [
      msg(
        this.displayName,
        '你好，我是Z大招生办张老师，看到你还没完成录取确认，特地私信提醒一下，今日24:00截止，请尽快操作。',
        'chat',
      ),
    ];
  }
}
