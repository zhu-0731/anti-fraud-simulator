import type { AgentResponseInput, AgentResponseMessage, DelayedConsequence } from '@/domain/types/chat';
import { MockAgent, AgentResponseMap, msg, pick } from './BaseAgent';

export class AntiFraudAgent extends MockAgent {
  readonly contactId = 'anti_fraud';
  readonly displayName = '反诈咨询';
  readonly role = '反诈骗公益咨询，仅在主动咨询或应急时出现';

  protected responseMap(input: AgentResponseInput): AgentResponseMap {
    const me = this.displayName;
    const ws = input.worldState;
    const hasSubmitted = ws.submittedInfoLevel > 0;

    return {
      emergency_help: () => [
        msg(me, hasSubmitted
          ? '发现被骗请立即：\n① 停止一切转账操作\n② 修改学信网、支付宝、银行卡密码\n③ 截图保存所有聊天记录\n④ 拨打96110反诈热线\n⑤ 联系辅导员说明情况'
          : '如果你感觉遇到了可疑情况，先不要操作，截图保存证据，然后通过官方渠道核实。'),
      ],
      report: () => [
        msg(me, '举报步骤：\n① 截图保存可疑账号/链接截图\n② 在聊天软件内点击"举报"功能\n③ 拨打96110全国反诈热线（24小时）\n④ 如有损失，去最近派出所报案'),
      ],
      ask_verification: () => [
        msg(me, pick([
          '判断官方与否的三步：① 查域名是否为学校官网 ② 电话号码是否在官网公布 ③ 是否要求付款——官方录取从不收费',
          '保研录取的官方渠道只有：学校官网 + 官方邮件 + 招办公布电话。其他渠道请核实后再操作。',
        ])),
      ],
      save_evidence: () => [
        msg(me, '截图保存很重要！\n• 截完整的聊天对话\n• 截链接地址栏\n• 截转账记录（如有）\n• 这些都是报案关键材料。'),
      ],
      search_official_site: () => [
        msg(me, '官网核查是正确的第一步！核查时注意：浏览器地址栏的域名是否和学校官网一致，不要被页面外观迷惑。'),
      ],
      call_official: () => [
        msg(me, '致电官方是可靠的核实方法。电话号码请从学校官网查询，不要使用对方提供的号码。'),
      ],
      small_talk: () => [
        msg(me, pick([
          '你好！我是反诈咨询。有任何可疑情况都可以问我。',
          '防诈骗关键词：免费无押金、官网核实、不向个人账号转账。',
        ])),
      ],
      challenge_identity: () => [
        msg(me, '核实对方身份的方法：通过官网公布的联系方式主动致电，而非通过对方提供的渠道。这是最可靠的身份核实方式。'),
      ],
    };
  }

  protected defaultDelayedConsequences(): DelayedConsequence[] {
    return [];
  }

  getInitialMessages(): AgentResponseMessage[] {
    return [];
  }
}
