'use client';

import type { Message, ChannelType, RiskLevel } from '@/domain/types/game';

interface MessageBubbleProps {
  message: Message;
}

const CHANNEL_COLORS: Record<ChannelType, string> = {
  wechat: '#15803D',
  sms: '#0369A1',
  email: '#475569',
  browser: '#B45309',
  call: '#C2410C',
  official_site: '#0F766E',
  system: '#475569',
};

const CHANNEL_LABELS: Record<ChannelType, string> = {
  wechat: '微信',
  sms: '短信',
  email: '邮件',
  browser: '浏览器',
  call: '电话',
  official_site: '官网',
  system: '系统',
};

function getRiskBg(risk: RiskLevel | undefined): string {
  switch (risk) {
    case 'critical': return '#7F1D1D';
    case 'high': return '#78350F';
    case 'medium': return '#1E293B';
    default: return '#1E293B';
  }
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  if (message.isPlayer) {
    return (
      <div className="flex justify-end mb-3 px-4">
        <div
          className="text-sm text-white px-4 py-2.5 rounded-[16px] rounded-tr-sm max-w-[78%]"
          style={{ backgroundColor: '#0E7490' }}
        >
          {message.content}
        </div>
      </div>
    );
  }

  const channelColor = CHANNEL_COLORS[message.channel];
  const bubbleBg = message.riskLevel === 'none' || message.riskLevel === 'low'
    ? '#134E4A'
    : getRiskBg(message.riskLevel);

  return (
    <div className="mb-4 px-4">
      <div className="flex items-center gap-2 mb-1.5">
        <span
          className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
          style={{ backgroundColor: channelColor + '22', color: channelColor }}
        >
          {CHANNEL_LABELS[message.channel]}
        </span>
        <span className="text-xs font-semibold text-[#CBD5E1]">{message.senderName}</span>
        <span className="text-[10px] text-[#475569]">{message.senderRole}</span>
      </div>
      <div
        className="text-sm text-[#F8FAFC] px-4 py-3 rounded-[16px] rounded-tl-sm max-w-[78%] whitespace-pre-wrap leading-relaxed"
        style={{ backgroundColor: bubbleBg }}
      >
        {message.content}
      </div>
    </div>
  );
}
