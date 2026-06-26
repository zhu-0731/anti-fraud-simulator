import type { ChannelCard, InteractionChannel } from '@/domain/types/tactic';

export const CHANNEL_CARDS: Record<InteractionChannel, ChannelCard> = {
  group_chat: {
    id: 'group_chat',
    name: '群聊',
    description: '多人聊天环境，消息来源混杂，容易形成从众压力。',
    primaryEffect: '社会认同较强',
    primaryRiskSignal: '信息来源混乱',
    allowedModes: ['defender', 'red_team'],
  },
  private_chat: {
    id: 'private_chat',
    name: '私聊',
    description: '一对一交流，容易个性化施压，缺少公开监督。',
    primaryEffect: '易个性化交流',
    primaryRiskSignal: '缺乏公开监督',
    allowedModes: ['defender', 'red_team'],
  },
  sms: {
    id: 'sms',
    name: '短信',
    description: '短文本通知渠道，发送方名称容易被误信。',
    primaryEffect: '紧迫感较强',
    primaryRiskSignal: '身份难验证',
    allowedModes: ['defender', 'red_team'],
  },
  email: {
    id: 'email',
    name: '邮件',
    description: '形式较正式，但发件来源仍可能异常。',
    primaryEffect: '形式较正式',
    primaryRiskSignal: '发件来源可异常',
    allowedModes: ['defender', 'red_team'],
  },
  simulated_call: {
    id: 'simulated_call',
    name: '模拟电话',
    description: '语音或电话式交互，权威和情绪压力更强。',
    primaryEffect: '权威和情绪压力强',
    primaryRiskSignal: '缺乏可追溯文本',
    allowedModes: ['defender', 'red_team'],
  },
  simulated_browser: {
    id: 'simulated_browser',
    name: '模拟网页',
    description: '浏览器页面、表单或公告样式的游戏内模拟资产。',
    primaryEffect: '视觉可信度高',
    primaryRiskSignal: '域名和来源可核查',
    allowedModes: ['defender', 'red_team'],
  },
};

export function getAllChannelCards(): ChannelCard[] {
  return Object.values(CHANNEL_CARDS);
}

export function getChannelCard(id: InteractionChannel): ChannelCard {
  return CHANNEL_CARDS[id];
}
