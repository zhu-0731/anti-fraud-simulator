import type { DelayedConsequence } from '@/domain/types/chat';
import { generateId } from '@/lib/id';

export function makeConsequence(
  source: string,
  opts: {
    playerActionSummary: string;
    lookedReasonableBecause: string;
    hiddenRisk: string;
    laterImpact: string;
    severity?: DelayedConsequence['severity'];
    revealAt?: DelayedConsequence['revealAt'];
  },
): DelayedConsequence {
  return {
    id: generateId('dc'),
    source,
    playerActionSummary: opts.playerActionSummary,
    lookedReasonableBecause: opts.lookedReasonableBecause,
    hiddenRisk: opts.hiddenRisk,
    laterImpact: opts.laterImpact,
    severity: opts.severity ?? 'medium',
    revealAt: opts.revealAt ?? 'report',
    timestamp: new Date().toISOString(),
  };
}

// Pre-built consequence templates for each key player action
export const CONSEQUENCE_TEMPLATES = {
  mom_link_opened: makeConsequence('妈妈转发链接', {
    playerActionSummary: '打开了妈妈转发的视频链接',
    lookedReasonableBecause: '来自家人，内容涉及保研，时间紧迫',
    hiddenRisk: '链接来源不明，可能收集了浏览器信息或展示了虚假确认流程',
    laterImpact: '为后续疑似招办老师私聊提供了"你已经看过我们的通知"的话术依据',
    severity: 'medium',
  }),

  senior_link_followed: makeConsequence('学长资料包', {
    playerActionSummary: '下载或访问了学长发来的资料链接',
    lookedReasonableBecause: '学长是同校已确认的学生，分享经验看起来合理',
    hiddenRisk: '链接域名非官方，资料中嵌入了虚假"快速通道"入口',
    laterImpact: '增强了对非官方渠道的接受度，为后续假确认页面的信任埋下基础',
    severity: 'medium',
  }),

  group_link_trusted: makeConsequence('保研群公告', {
    playerActionSummary: '相信了群公告中的非官方链接',
    lookedReasonableBecause: '群里多位同学都在讨论，形成从众效应',
    hiddenRisk: '群聊链接无法验证发布者身份，可伪造官方格式',
    laterImpact: '为假确认页面提供了"群里都在用"的社会证明背书',
    severity: 'high',
  }),

  fake_teacher_info_submitted: makeConsequence('疑似招办老师私聊', {
    playerActionSummary: '向自称招办老师的账号提交了个人信息',
    lookedReasonableBecause: '对方使用了官方语气，账号名含"招生办"',
    hiddenRisk: '任何私信渠道均不能用于官方身份核验，账号名可随意设置',
    laterImpact: '个人信息被记录，可能被用于后续精准诈骗或身份冒用',
    severity: 'high',
  }),

  browser_form_submitted: makeConsequence('模拟确认页面', {
    playerActionSummary: '在倒计时页面中填写了个人信息或点击了支付',
    lookedReasonableBecause: '页面设计模仿了官方系统，有倒计时和"确认"按钮',
    hiddenRisk: '非官方域名的页面无论外观多像官方，提交的信息都会流向骗子',
    laterImpact: '信息泄露，可能造成资金损失或身份冒用',
    severity: 'high',
  }),

  official_verified_early: makeConsequence('主动核验官方渠道', {
    playerActionSummary: '主动查询了学校官网或联系了辅导员核实',
    lookedReasonableBecause: '这是正确的防骗行为',
    hiddenRisk: '无风险',
    laterImpact: '发现非官方渠道与官方信息的矛盾，大幅降低被骗风险',
    severity: 'low',
    revealAt: 'report',
  }),
};
