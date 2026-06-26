'use client';

import { useGameStore } from '@/store/gameStore';

export default function OfficialSiteView() {
  const { gameState, sendMessage, setActiveView } = useGameStore();

  if (!gameState) return null;

  const handleAction = (action: string) => {
    // Open the official service contact and send a message
    sendMessage('official_service', action);
    setActiveView('chat_list');
  };

  return (
    <div className="flex flex-col flex-1 bg-[#07111F] overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center gap-2 px-4 py-3 bg-[#0B1728] border-b border-[#1E293B]">
        <button onClick={() => setActiveView('chat_list')} className="text-[#94A3B8] mr-1">←</button>
        <span className="text-lg">🏛️</span>
        <div>
          <p className="text-sm font-semibold text-[#F8FAFC]">Z大学研究生院</p>
          <p className="text-[10px] text-[#34D399]">✓ 官方认证页面</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Official banner */}
        <div className="bg-[#0F766E]/10 border border-[#0F766E]/30 rounded-xl p-4">
          <p className="text-xs font-semibold text-[#34D399] mb-2">官方声明</p>
          <p className="text-xs text-[#A7F3D0] leading-relaxed">
            Z大学研究生院是唯一官方录取信息发布渠道。所有录取确认操作均通过官网完成，全程免费。任何以“招生办”名义索要费用或私信要求提交信息的行为均属诈骗。
          </p>
        </div>

        {/* Contact info */}
        <div className="bg-[#172033] rounded-xl border border-[#334155] divide-y divide-[#1E293B]">
          <div className="p-4">
            <p className="text-xs text-[#64748B] mb-1">官方电话</p>
            <p className="text-sm font-mono text-[#38BDF8]">010-XXXX-XXXX（模拟）</p>
            <p className="text-[10px] text-[#475569] mt-0.5">工作日 8:30–17:00</p>
          </div>
          <div className="p-4">
            <p className="text-xs text-[#64748B] mb-1">官方邮箱</p>
            <p className="text-sm font-mono text-[#38BDF8]">admissions@game-simulated-link.local</p>
          </div>
          <div className="p-4">
            <p className="text-xs text-[#64748B] mb-1">录取确认系统</p>
            <p className="text-sm font-mono text-[#34D399]">game-simulated-link.local/official</p>
            <p className="text-[10px] text-[#475569] mt-0.5">学号登录，全程免费</p>
          </div>
        </div>

        {/* Key notices */}
        <div className="bg-[#172033] rounded-xl border border-[#334155] p-4">
          <p className="text-xs font-semibold text-[#E2E8F0] mb-3">招生办重要提示</p>
          <ul className="space-y-2 text-xs text-[#94A3B8]">
            {[
              '录取通知通过官网公告及学校邮箱发布，不通过私信',
              '录取确认全程免费，不涉及押金或保证金',
              '官方不会要求提供身份证照片或银行卡信息',
              '如遇可疑联系，请拨打96110反诈热线',
            ].map((notice, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-[#0F766E] flex-shrink-0">✓</span>
                {notice}
              </li>
            ))}
          </ul>
        </div>

        {/* Quick actions */}
        <div className="space-y-2">
          <p className="text-xs text-[#64748B] px-1">快捷操作</p>
          {[
            { label: '核实录取信息', msg: '我想核实我的录取信息是否真实' },
            { label: '查询官方录取渠道', msg: '请问录取确认的官方渠道是什么？' },
            { label: '举报可疑账号', msg: '我遇到了自称招办的可疑账号，如何举报？' },
          ].map(({ label, msg }) => (
            <button
              key={label}
              onClick={() => handleAction(msg)}
              className="w-full text-left text-sm text-[#E2E8F0] bg-[#172033] border border-[#334155] hover:border-[#0F766E] rounded-xl px-4 py-3 transition-colors"
            >
              {label} →
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
