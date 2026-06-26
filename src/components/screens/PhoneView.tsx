'use client';

import { useState } from 'react';
import { useGameStore } from '@/store/gameStore';

interface PhoneOption {
  id: string;
  name: string;
  number: string;
  type: 'official' | 'suspicious';
  description: string;
}

const CALL_OPTIONS: PhoneOption[] = [
  {
    id: 'anti_fraud_hotline',
    name: '96110 反诈热线',
    number: '96110',
    type: 'official',
    description: '24小时全国反诈咨询，免费',
  },
  {
    id: 'official_admissions',
    name: 'Z大招生办（官网）',
    number: '010-XXXX-XXXX',
    type: 'official',
    description: '工作日 8:30–17:00',
  },
  // {
  //   id: 'fake_teacher_phone',
  //   name: '张老师提供的电话',
  //   number: '138-XXXX-XXXX',
  //   type: 'suspicious',
  //   description: '⚠️ 非官方公布号码，存在风险',
  // },
  {
    id: 'fake_teacher_phone',
    name: '张老师提供的电话',
    number: '138-XXXX-XXXX',
    type: 'suspicious',
    description: '',
  },
];

const CALL_RESULTS: Record<string, string> = {
  anti_fraud_hotline: '【96110】你好，这里是全国反诈中心。您描述的情况符合冒充高校招生办诈骗的特征。建议：①停止操作 ②通过官网核实 ③如已损失请拨打110报案。',
  official_admissions: '【招生办】你好，我们这里确认：今年录取确认全部通过官网进行，不会通过私信联系学生，也不收取任何费用。如果有人私信要求操作，请提高警惕。',
  fake_teacher_phone: '【无法接通】该号码无人接听，或已关机。（提示：此号码并非官方公布，官方电话请查阅学校官网。）',
};

export default function PhoneView() {
  const { gameState, sendMessage, setActiveView } = useGameStore();
  const [callingId, setCallingId] = useState<string | null>(null);
  const [callResult, setCallResult] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  if (!gameState) return null;

  const handleCall = async (option: PhoneOption) => {
    setCallingId(option.id);
    setShowResult(false);
    setCallResult(null);

    // Simulate call delay
    await new Promise((r) => setTimeout(r, 1500));

    const result = CALL_RESULTS[option.id] ?? '对方无法接通。';
    setCallResult(result);
    setShowResult(true);
    setCallingId(null);

    // Inform the agent system about the call
    await sendMessage('anti_fraud', `我拨打了${option.name}（${option.number}）`);
  };

  return (
    <div className="flex flex-col flex-1 bg-[#07111F] overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center gap-2 px-4 py-3 bg-[#0B1728] border-b border-[#1E293B]">
        <button onClick={() => setActiveView('chat_list')} className="text-[#94A3B8] mr-1">←</button>
        <span className="text-lg">📞</span>
        <p className="text-sm font-semibold text-[#F8FAFC]">拨打电话</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Tip */}
        <div className="bg-[#172033] border border-[#334155] rounded-xl p-3">
          <p className="text-xs text-[#94A3B8] leading-relaxed">
            💡 通过官方渠道核实是识破诈骗的最可靠方式。务必使用从官网查询到的电话号码，而非对方提供的号码。
          </p>
        </div>

        {/* Call options */}
        {CALL_OPTIONS.map((opt) => (
          <div key={opt.id} className={`rounded-xl border p-4 ${
            opt.type === 'official'
              ? 'bg-[#0F766E]/10 border-[#0F766E]/30'
              : 'bg-[#B45309]/10 border-[#B45309]/30'
          }`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`text-[10px] px-1.5 rounded ${
                    opt.type === 'official'
                      ? 'bg-[#0F766E]/20 text-[#34D399]'
                      : 'bg-[#B45309]/20 text-[#F59E0B]'
                  }`}>
                    {opt.type === 'official' ? '官方' : '未知'}
                  </span>
                  <span className="text-sm font-medium text-[#E2E8F0]">{opt.name}</span>
                </div>
                <p className="text-sm font-mono text-[#94A3B8] mb-1">{opt.number}</p>
                <p className="text-[11px] text-[#475569]">{opt.description}</p>
              </div>
              <button
                aria-label={`拨打${opt.name}`}
                onClick={() => handleCall(opt)}
                disabled={callingId !== null}
                className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  callingId === opt.id
                    ? 'bg-[#334155] text-[#64748B]'
                    : opt.type === 'official'
                    ? 'bg-[#0F766E] text-white hover:bg-[#0d6460]'
                    : 'bg-[#334155] text-[#94A3B8] hover:bg-[#3f4f63]'
                }`}
              >
                {callingId === opt.id ? '拨打中…' : '拨打'}
              </button>
            </div>
          </div>
        ))}

        {/* Call result */}
        {showResult && callResult && (
          <div className="bg-[#172033] border border-[#334155] rounded-xl p-4">
            <p className="text-xs text-[#64748B] mb-2">通话结果</p>
            <p className="text-sm text-[#E2E8F0] leading-relaxed" style={{ whiteSpace: 'pre-wrap' }}>
              {callResult}
            </p>
            <button
              onClick={() => setShowResult(false)}
              className="mt-3 text-xs text-[#475569] hover:text-[#94A3B8]"
            >
              关闭
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
