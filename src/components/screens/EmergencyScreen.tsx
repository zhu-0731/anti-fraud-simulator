'use client';

import { useGameStore } from '@/store/gameStore';
import StatusBar from '@/components/game/StatusBar';
import ActionPanel from '@/components/game/ActionPanel';
import type { EventCard } from '@/domain/types/game';
import { chapter01Events } from '@/data/chapter01';

export default function EmergencyScreen() {
  const { gameState, currentEvent, submitAction, isLoading, feedback } = useGameStore();

  if (!gameState) return null;

  const emergencyEvent =
    currentEvent?.id === 'E11'
      ? (currentEvent as EventCard)
      : (chapter01Events.find((event) => event.id === 'E11') ?? (currentEvent as EventCard | null));

  return (
    <div className="flex flex-col min-h-[100svh] bg-[#07111F]">
      <StatusBar
        riskScore={gameState.riskScore}
        anxietyScore={gameState.anxietyScore}
        phase="emergency"
        evidenceCount={gameState.evidenceList.length}
      />

      {/* Header */}
      <div className="px-6 pt-5 pb-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-[#7F1D1D] border border-[#B91C1C] flex items-center justify-center shrink-0">
            <span className="text-xl">🚨</span>
          </div>
          <div>
            <p className="text-base font-bold text-[#FCA5A5]">紧急处置</p>
            <p className="text-xs text-[#94A3B8]">立即采取行动，减少损失</p>
          </div>
        </div>

        {/* Status summary */}
        <div className="rounded-xl bg-[#7F1D1D] border border-[#B91C1C] p-4 space-y-1.5">
          {gameState.sensitiveInfoLeaked && (
            <p className="text-sm text-[#FCA5A5]">⚠ 个人信息可能已泄露</p>
          )}
          {gameState.moneyLost > 0 && (
            <p className="text-sm text-[#FCA5A5]">⚠ 模拟资金损失：¥{gameState.moneyLost}</p>
          )}
          <p className="text-xs text-[#94A3B8] mt-2">
            已完成应急步骤：{gameState.emergencyActionsCompleted.length}
          </p>
        </div>
      </div>

      {/* Completed actions */}
      {gameState.emergencyActionsCompleted.length > 0 && (
        <div className="mx-6 mb-3">
          <p className="text-xs text-[#0F766E] font-semibold mb-2">已完成：</p>
          <div className="space-y-1">
            {gameState.emergencyActionsCompleted.map((id) => (
              <div key={id} className="flex items-center gap-2">
                <span className="text-[#0F766E] text-sm">✓</span>
                <span className="text-xs text-[#94A3B8]">{id}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Feedback */}
      {feedback && (
        <div className="mx-6 mb-3 p-3 rounded-xl bg-[#172033] border border-[#334155]">
          <p className="text-xs text-[#94A3B8] leading-relaxed">{feedback}</p>
        </div>
      )}

      <div className="flex-1" />

      {/* Action panel */}
      {emergencyEvent && (
        <ActionPanel
          actions={emergencyEvent.actions}
          onAction={(actionId) => submitAction(emergencyEvent.id, actionId)}
          disabled={isLoading}
        />
      )}

      {/* Proceed to report */}
      <div className="px-4 pb-6 pt-2 bg-[#0B1728] border-t border-[#334155]">
        <button
          onClick={() => submitAction(emergencyEvent?.id ?? 'E11', 'view_report')}
          disabled={isLoading}
          className="w-full text-[#F8FAFC] font-semibold text-sm py-3 rounded-xl border border-[#334155] bg-[#172033] active:scale-[0.98]"
        >
          查看复盘报告 →
        </button>
      </div>
    </div>
  );
}
