'use client';

import { useGameStore } from '@/store/gameStore';

const TYPE_ICON: Record<string, string> = {
  screenshot: '📸',
  record: '🎙️',
  report: '📋',
};

export default function EvidenceView() {
  const { gameState, setActiveView } = useGameStore();

  if (!gameState) return null;

  const evidence = gameState.evidenceList;

  return (
    <div className="flex flex-col flex-1 bg-[#07111F] overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center gap-2 px-4 py-3 bg-[#0B1728] border-b border-[#1E293B]">
        <button onClick={() => setActiveView('chat_list')} className="text-[#94A3B8] mr-1">←</button>
        <span className="text-lg">📋</span>
        <div>
          <p className="text-sm font-semibold text-[#F8FAFC]">证据收集</p>
          <p className="text-[10px] text-[#64748B]">{evidence.length} 份材料</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {evidence.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
            <span className="text-4xl">📋</span>
            <p className="text-[#475569] text-sm">还没有收集到证据</p>
            <p className="text-[10px] text-[#334155] max-w-xs">
              在聊天中说“我要截图保存”或“帮我保存证据”，可以收集关键证据
            </p>
          </div>
        ) : (
          <>
            <div className="mb-4 p-3 bg-[#15803D]/10 border border-[#15803D]/30 rounded-xl">
              <p className="text-xs text-[#86EFAC]">
                ✓ 保存证据非常重要！这些材料可作为向警方报案的关键依据。
              </p>
            </div>

            <div className="space-y-3">
              {evidence.map((ev) => (
                <div
                  key={ev.id}
                  className="bg-[#172033] border border-[#334155] rounded-xl p-4"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xl flex-shrink-0">{TYPE_ICON[ev.type] ?? '📎'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#E2E8F0] mb-0.5">{ev.label}</p>
                      <p className="text-xs text-[#64748B] leading-relaxed">{ev.description}</p>
                      <p className="text-[10px] text-[#334155] mt-1.5">
                        {new Date(ev.timestamp).toLocaleString('zh-CN', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 bg-[#172033] border border-[#334155] rounded-xl">
              <p className="text-xs text-[#64748B] mb-2">如何使用这些证据</p>
              <ul className="space-y-1 text-xs text-[#94A3B8]">
                <li>• 拨打96110提供截图描述</li>
                <li>• 前往派出所时携带截图</li>
                <li>• 在平台上举报时附上截图</li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
