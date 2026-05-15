import type { AgentResponseInput, AgentResponseMessage, DelayedConsequence } from '@/domain/types/chat';
import { MockAgent, AgentResponseMap, msg, pick } from './BaseAgent';
import { makeConsequence } from '@/domain/narrative/DelayedConsequenceService';

export class SeniorAgent extends MockAgent {
  readonly contactId = 'senior';
  readonly displayName = '学长（赵某）';
  readonly role = '已录取学长，分享经验但信息不一定准确';

  protected responseMap(_input: AgentResponseInput): AgentResponseMap {
    const me = this.displayName;
    return {
      ask_verification: () => [
        msg(me, pick([
          '这个我也不太确定，我当年是直接从研究生院官网操作的，你最好也去官网看一下。',
          '学妹，这种事还是以官网为准，我的经验只是参考，每年流程可能不一样。',
          '坦白说我也搞不清楚，你问辅导员更靠谱，别只听我的。',
        ])),
      ],
      ask_source: () => [
        msg(me, pick([
          '我整理的资料来自往年同学和网上，不一定和今年一模一样，以今年官方为准。',
          '我那份是去年的，今年可能有变化，官网公告最准。',
        ])),
      ],
      request_link: () => [
        msg(me, '给你发一份往年整理的经验包，仅供参考，具体操作还是看官网。game-simulated-link.local/guide-doc', 'chat', {
          simulatedLink: 'game-simulated-link.local/guide-doc',
          revealAtReport: true,
          hiddenConsequenceId: 'senior_link_followed',
        }),
      ],
      search_official_site: () => [
        msg(me, '对，官网是对的。我当年就是在官网完成的，没有走其他渠道。'),
      ],
      call_official: () => [
        msg(me, '打招办电话是个好主意！我当年也打过，他们态度还不错，可以核实。'),
      ],
      save_evidence: () => [
        msg(me, '截图是好习惯。我当年就因为没截图，后来出问题说不清楚。'),
      ],
      challenge_identity: () => [
        msg(me, '我就是赵某啊，你不记得我了？不管是不是我，这种事以官网为准，别被任何人影响。'),
      ],
      small_talk: () => [
        msg(me, pick([
          '祝你顺利啊，Z大软件工程很不错！',
          '加油，保研就是熬过这段等待期。',
        ])),
      ],
      emergency_help: () => [
        msg(me, '怎么了？快告诉我，如果是被骗了，赶紧联系辅导员和银行，别耽误时间！'),
      ],
    };
  }

  protected defaultDelayedConsequences(input: AgentResponseInput): DelayedConsequence[] {
    if (input.intent === 'request_link') {
      return [makeConsequence('学长资料包', {
        playerActionSummary: '请求并访问了学长发来的"往年经验包"链接',
        lookedReasonableBecause: '学长是真实认识的学长，分享经验看起来很正常',
        hiddenRisk: '链接域名非官方，资料中包含了指向假确认入口的内嵌链接',
        laterImpact: '增加了对非官方域名的接受度，为后续假页面埋下信任基础',
        severity: 'medium',
      })];
    }
    return [];
  }

  getInitialMessages(): AgentResponseMessage[] {
    return [
      msg(
        this.displayName,
        '学妹！恭喜你保研！我整理了一份往年经验，希望对你有帮助。不过具体流程一定要以今年官网为准～ game-simulated-link.local/guide-doc',
        'chat',
        { simulatedLink: 'game-simulated-link.local/guide-doc', revealAtReport: true },
      ),
    ];
  }
}
