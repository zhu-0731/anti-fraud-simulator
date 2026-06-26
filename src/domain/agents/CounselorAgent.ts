import type { AgentResponseMessage, DelayedConsequence } from '@/domain/types/chat';
import { MockAgent, AgentResponseMap, msg, pick } from './BaseAgent';

export class CounselorAgent extends MockAgent {
  readonly contactId = 'counselor';
  readonly displayName = '王老师（辅导员）';
  readonly role = '辅导员，可靠权威，引导学生走官方渠道';

  protected responseMap(): AgentResponseMap {
    const me = this.displayName;
    return {
      ask_verification: () => [
        msg(me, pick([
          '陈莉同学，任何录取确认请通过研究生院官网进行，聊天链接均不可信。',
          '正式确认只走官方系统，我没有看到任何需要私信操作的通知。请以官网公告为准。',
          '这类信息我们院没有发布过，请不要从群聊或私信链接进行操作。',
        ])),
      ],
      ask_source: () => [
        msg(me, pick([
          '正式通知会通过学校邮件和研究生院官网发布，其他渠道请勿轻信。',
          '如果你收到可疑信息，建议截图发给我，我帮你确认。',
        ])),
      ],
      call_official: () => [
        msg(me, '招办公布电话请在研究生院官网查询，号码在"联系我们"栏目。打过去核实是最可靠的方式。'),
      ],
      search_official_site: () => [
        msg(me, pick([
          '对，以官网为准。录取确认入口在研究生院官网首页，登录学号即可查询。',
          '你去官网查，这是正确的做法。不确定的可以随时问我。',
        ])),
      ],
      save_evidence: () => [
        msg(me, '好！截图保存，如果后续需要报告，有证据更好处理。'),
      ],
      report: () => [
        msg(me, '你做得对。我会向学院报告这个情况，你把截图发给我一份，我来处理。'),
      ],
      share_suspicious_info: () => [
        msg(me, '这个链接看起来不像官方域名，请不要点击，更不要填写任何信息。截图给我。'),
      ],
      emergency_help: () => [
        msg(me, '同学别着急，你先停止一切操作，保存所有聊天记录截图，然后告诉我发生了什么，我们来处理。'),
      ],
      small_talk: () => [
        msg(me, pick([
          '同学，有问题直接来找我，不要犹豫。',
          '好的，录取消息出来我会通知你们的。',
        ])),
      ],
    };
  }

  protected defaultDelayedConsequences(): DelayedConsequence[] {
    return [];
  }

  getInitialMessages(): AgentResponseMessage[] {
    return [
      msg(
        this.displayName,
        '同学们好！温馨提醒：保研录取确认全程通过研究生院官网进行，全程免费，不需要私信发送密码或身份信息。收到可疑消息请及时告知我。',
        'chat',
      ),
    ];
  }
}
