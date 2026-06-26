import type { AgentResponseInput, AgentResponseMessage, DelayedConsequence } from '@/domain/types/chat';
import { MockAgent, AgentResponseMap, msg, pick } from './BaseAgent';
import { makeConsequence } from '@/domain/narrative/DelayedConsequenceService';

export class MomAgent extends MockAgent {
  readonly contactId = 'mom';
  readonly displayName = '妈妈';
  readonly role = '家长，关心子女但容易被社交媒体误导';

  protected responseMap(): AgentResponseMap {
    const me = this.displayName;
    return {
      ask_verification: () => [
        msg(me, pick([
          '妈也不太清楚呀，你去问问辅导员老师吧，妈妈不懂这些。',
          '应该是真的吧？反正妈妈觉得你谨慎一点是对的，你去学校问问。',
          '妈妈也说不准，你自己判断，别乱填东西就好。',
        ])),
      ],
      ask_source: () => [
        msg(me, pick([
          '你舅妈转给我的，她说是你们学校群里有人发的，说很重要。',
          '妈妈的朋友圈看到的，说是保研相关的，就转给你了。',
          '微信群里有人分享的，妈妈也不知道准不准确，你去核实一下。',
        ])),
      ],
      request_link: () => [
        msg(me, '妈妈就把那个链接发给你好了，你自己看看。game-simulated-link.local/video123', 'chat', {
          simulatedLink: 'game-simulated-link.local/video123',
          revealAtReport: true,
          hiddenConsequenceId: 'mom_link_opened',
        }),
      ],
      share_suspicious_info: () => [
        msg(me, pick([
          '嗯！妈妈也觉得这个重要，你快看看！',
          '对对对，这个就是妈妈发你那个，你要注意哦。',
        ])),
      ],
      save_evidence: () => [
        msg(me, '截图好好留着，妈妈也存一份。'),
      ],
      challenge_identity: () => [
        msg(me, pick([
          '莉莉，妈妈的号就是妈妈啊，还要怎么证明……你怀疑妈妈？',
          '妈妈是真心替你好，你别多心了。',
        ])),
      ],
      small_talk: () => [
        msg(me, pick([
          '莉莉，别忘了吃饭啊，妈妈天天担心你。',
          '录取的事有消息了要第一时间告诉妈妈哦。',
          '妈妈就是想着你好，不是要给你压力。',
        ])),
      ],
      emergency_help: () => [
        msg(me, '怎么了莉莉？妈妈在，你说说看，不行就让你爸来帮你。'),
      ],
    };
  }

  protected defaultDelayedConsequences(input: AgentResponseInput): DelayedConsequence[] {
    if (input.intent === 'request_link' || input.intent === 'open_link') {
      return [makeConsequence('妈妈转发链接', {
        playerActionSummary: '通过妈妈获取并打开了来源不明的链接',
        lookedReasonableBecause: '来自家人，态度真诚，内容与保研相关',
        hiddenRisk: '链接来源是二次转发，无法核实原始发布者身份',
        laterImpact: '强化了非官方渠道的接受度，为后续假入口埋下伏笔',
        severity: 'medium',
      })];
    }
    return [];
  }

  getInitialMessages(): AgentResponseMessage[] {
    return [
      msg(
        this.displayName,
        '莉莉！妈妈刚看到一个说保研录取要先锁定名额的，不交就取消，你快看！game-simulated-link.local/video123',
        'chat',
        { simulatedLink: 'game-simulated-link.local/video123', revealAtReport: true },
      ),
    ];
  }
}
