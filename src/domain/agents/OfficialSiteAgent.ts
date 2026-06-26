import type { AgentResponseMessage, DelayedConsequence } from '@/domain/types/chat';
import { MockAgent, AgentResponseMap, msg, pick } from './BaseAgent';

export class OfficialSiteAgent extends MockAgent {
  readonly contactId = 'official_service';
  readonly displayName = 'Z大研究生院（官方）';
  readonly role = '官方服务号，提供正式核验路径';

  protected responseMap(): AgentResponseMap {
    const me = this.displayName;
    return {
      ask_verification: () => [
        msg(me, '【官方声明】本次录取确认通过研究生院官网（game-simulated-link.local/official）进行，全程免费，不涉及任何押金或私信操作。', 'official'),
      ],
      request_link: () => [
        msg(me, '【官方入口】录取确认系统：game-simulated-link.local/official —— 请用学号登录，验证身份后完成确认。无需向任何个人账号提交信息。', 'official', {
          simulatedLink: 'game-simulated-link.local/official',
        }),
      ],
      search_official_site: () => [
        msg(me, pick([
          '【官方】欢迎使用官方渠道。录取确认系统入口在首页右上角"录取确认"按钮。',
          '【官方】核验路径：官网 → 研究生招生 → 推免生录取确认 → 学号登录。',
        ]), 'official'),
      ],
      call_official: () => [
        msg(me, '【官方】招办联系电话：010-XXXX-XXXX（模拟）。工作时间8:30-17:00。或发送邮件至 admissions@game-simulated-link.local', 'official'),
      ],
      ask_source: () => [
        msg(me, '【官方】我院所有通知通过官网公告和学校邮件发布。任何通过私信、群聊链接发送的"通知"均非官方渠道，请提高警惕。', 'official'),
      ],
      challenge_identity: () => [
        msg(me, '【官方】本服务号认证信息：Z大学研究生院。认证机构：微信官方认证（模拟）。如有疑问可拨打官方电话核实。', 'official'),
      ],
      report: () => [
        msg(me, '【官方】如发现冒充本机构的账号，请截图后通过平台举报功能举报，并可拨打96110反诈热线。', 'official'),
      ],
      small_talk: () => [
        msg(me, '【官方】感谢关注Z大研究生院官方服务号。如需帮助请描述您的问题。', 'official'),
      ],
      emergency_help: () => [
        msg(me, '【官方】如已向可疑渠道提交信息，请：1.立即修改相关账号密码 2.拨打96110 3.联系您的辅导员 4.保存所有相关截图。', 'official'),
      ],
      save_evidence: () => [
        msg(me, '【官方】保存证据是正确做法。截图、聊天记录均可作为后续报案材料。', 'official'),
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
