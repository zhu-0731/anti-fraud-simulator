'use client';

import React from 'react';
import MobileFrame from './MobileFrame';
import { useGameStore } from '@/store/gameStore';

interface DesktopLayoutProps {
  children: React.ReactNode;
}

export default function DesktopLayout({ children }: DesktopLayoutProps) {
  const { gameState } = useGameStore();

  return (
    <div className="min-h-screen w-full flex items-start justify-center bg-[#030B15]">
      {/* Phone frame */}
      <div
        className="relative shadow-[0_24px_80px_rgba(0,0,0,0.6)]"
        style={{ borderRadius: 30, overflow: 'hidden', maxWidth: 430, width: '100%' }}
      >
        <MobileFrame>{children}</MobileFrame>
      </div>

      {/* Debug panel — only visible on desktop at md+ */}
      {gameState && (
        <div className="hidden lg:block ml-6 w-64 p-4 rounded-xl bg-[#111827] border border-[#334155] text-[#94A3B8] text-xs shrink-0 self-start mt-0">
          <p className="text-[#F8FAFC] font-semibold mb-3 text-sm">调试面板</p>
          <div className="space-y-1">
            <Row label="阶段" value={gameState.phase} />
            <Row label="当前事件" value={gameState.currentEventId} />
            <Row label="风险值" value={gameState.riskScore} />
            <Row label="焦虑值" value={gameState.anxietyScore} />
            <Row label="信息泄露" value={gameState.sensitiveInfoLeaked ? '是' : '否'} />
            <Row label="资金损失" value={`¥${gameState.moneyLost}`} />
            <Row label="官方核验" value={gameState.officialVerified ? '是' : '否'} />
            <Row label="任务完成" value={gameState.taskCompleted ? '是' : '否'} />
            <Row label="证据数量" value={gameState.evidenceList.length} />
            <Row label="行动记录" value={gameState.actionHistory.length} />
          </div>
          {Object.keys(gameState.flags).length > 0 && (
            <>
              <p className="text-[#F8FAFC] font-semibold mt-3 mb-1 text-sm">已触发标记</p>
              <div className="space-y-1">
                {Object.keys(gameState.flags).map((f) => (
                  <span key={f} className="block text-[#0F766E]">{f}</span>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | number | boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-[#94A3B8]">{label}</span>
      <span className="text-[#CBD5E1]">{String(value)}</span>
    </div>
  );
}
