import type { AgentResponseInput, AgentResponseMessage, DelayedConsequence } from '@/domain/types/chat';
import { MockAgent, AgentResponseMap, msg, pick } from './BaseAgent';
import { makeConsequence } from '@/domain/narrative/DelayedConsequenceService';

const GROUP_MEMBERS = ['焦虑同学', '热心学姐', '谨慎同学', '群主'];

export class GroupAgent extends MockAgent {
  readonly contactId = 'group';
  readonly displayName = '保研交流群';
  readonly role = '多名同学，信息真假混杂';

  protected responseMap(_input: AgentResponseInput): AgentResponseMap {
    return {
      ask_verification: () => [
        msg(GROUP_MEMBERS[1], '我去官网看了，官网说全程免费，没有押金这回事。'),
        msg(GROUP_MEMBERS[2], '对，我问了辅导员，她也说以官网为准，不要从群里链接操作。'),
        msg(GROUP_MEMBERS[0], '但是那个链接看起来好像挺正式的……你们有没有试过？'),
      ],
      ask_source: () => [
        msg(GROUP_MEMBERS[3], '群公告是我发的，是一位自称招办的老师私信给我的，我就发群里了。'),
        msg(GROUP_MEMBERS[2], pick(['等等，招办会私信群主发通知吗？这不正常吧。', '正式通知不应该从这个渠道来……'])),
      ],
      request_link: () => [
        msg(GROUP_MEMBERS[0], '入口在群公告里，快去看！game-simulated-link.local/group-confirm', 'group', {
          simulatedLink: 'game-simulated-link.local/group-confirm',
          revealAtReport: true,
        }),
        msg(GROUP_MEMBERS[2], '等等，这个链接不是学校官网域名，大家先别乱点。'),
      ],
      open_link: () => [
        msg(GROUP_MEMBERS[0], '我点了！让你们填手机号和身份证，还要支付押金……'),
        msg(GROUP_MEMBERS[1], '⚠️ 我查了一下，官方不收任何押金！大家千万别填！'),
        msg(GROUP_MEMBERS[2], '已经有人填了就赶紧去改密码，这很可能是钓鱼页面！'),
      ],
      save_evidence: () => [
        msg(GROUP_MEMBERS[1], '截图是对的，我也截了。留存证据，说不定能报警。'),
      ],
      search_official_site: () => [
        msg(GROUP_MEMBERS[2], '官网是对的！我刚查了，录取系统在研究生院首页，登录学号即可。'),
        msg(GROUP_MEMBERS[1], '而且官方明确说了全程免费，不涉及任何费用。'),
      ],
      report: () => [
        msg(GROUP_MEMBERS[1], '对！已经有同学打了96110，建议大家都保存好截图。'),
        msg(GROUP_MEMBERS[2], '举报之后记录要存好，警方可能需要联系你们。'),
      ],
      emergency_help: () => [
        msg(GROUP_MEMBERS[1], '快停止操作！先修改支付宝和银行卡密码，然后联系银行！'),
        msg(GROUP_MEMBERS[2], '打96110！全国反诈骗热线，他们知道怎么处理。'),
      ],
      small_talk: () => [
        msg(GROUP_MEMBERS[0], '大家等通知真的好焦虑……'),
        msg(GROUP_MEMBERS[1], '淡定淡定，结果下来了我第一时间通知大家。'),
      ],
      share_suspicious_info: () => [
        msg(GROUP_MEMBERS[0], '我也收到了！好像很紧急，你们填了吗？'),
        msg(GROUP_MEMBERS[2], '等一下，先别急着填。去官网核实一下再说。'),
        msg(GROUP_MEMBERS[1], '我问了辅导员，她说这不是官方渠道，请大家不要操作。'),
      ],
    };
  }

  protected defaultDelayedConsequences(input: AgentResponseInput): DelayedConsequence[] {
    if (input.intent === 'request_link' || input.intent === 'open_link') {
      return [makeConsequence('保研群链接', {
        playerActionSummary: '在群聊中获取并关注了非官方链接',
        lookedReasonableBecause: '群里多位同学都在讨论，形成了从众效应',
        hiddenRisk: '群公告来源于私信，无法核实发布者身份',
        laterImpact: '为假确认页面的信任提供了社会证明',
        severity: 'high',
      })];
    }
    return [];
  }

  getInitialMessages(): AgentResponseMessage[] {
    return [
      msg(GROUP_MEMBERS[3], '【群公告】请各位推免生于今日24:00前完成录取确认，链接：game-simulated-link.local/group-confirm', 'group', {
        simulatedLink: 'game-simulated-link.local/group-confirm',
        revealAtReport: true,
      }),
      msg(GROUP_MEMBERS[0], '啊？今天截止？我怎么没收到学校通知……', 'group'),
      msg(GROUP_MEMBERS[1], '大家先别急，去官网查一下，链接不像官方域名。', 'group'),
    ];
  }
}
