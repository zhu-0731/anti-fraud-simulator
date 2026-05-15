'use client';

import React, { useEffect, useState } from 'react';
import MobileFrame from './MobileFrame';
import { useGameStore } from '@/store/gameStore';

interface DesktopLayoutProps {
  children: React.ReactNode;
}

export default function DesktopLayout({ children }: DesktopLayoutProps) {
  const { gameState } = useGameStore();
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setShowDebug(params.get('debug') === '1');
  }, []);

  return (
    <div className="h-screen w-full overflow-hidden flex items-start justify-center bg-[#030B15]">
      {/* Phone frame */}
      <div
        className="relative h-[100svh] shadow-[0_24px_80px_rgba(0,0,0,0.6)]"
        style={{ borderRadius: 30, overflow: 'hidden', maxWidth: 430, width: '100%' }}
      >
        <MobileFrame>{children}</MobileFrame>
      </div>

      {/* Debug panel — only visible with ?debug=1 on desktop lg+ */}
      {showDebug && gameState && (
        <div className="hidden lg:block ml-6 w-72 p-4 rounded-xl bg-[#111827] border border-[#334155] text-[#94A3B8] text-xs shrink-0 self-start mt-0">
          <p className="text-[#F8FAFC] font-semibold mb-3 text-sm">调试面板</p>
          <div className="space-y-1">
            <Row label="阶段" value={gameState.phase} />
            <Row label="当前视图" value={gameState.activeView ?? '—'} />
            <Row label="风险值" value={gameState.riskScore} />
            <Row label="焦虑值" value={gameState.anxietyScore} />
            <Row label="信息泄露" value={gameState.sensitiveInfoLeaked ? '是' : '否'} />
            <Row label="官方核验" value={gameState.officialVerified ? '是' : '否'} />
            <Row label="证据数量" value={gameState.evidenceList.length} />
          </div>
          {gameState.worldState && (
            <>
              <p className="text-[#F8FAFC] font-semibold mt-3 mb-1 text-sm">WorldState</p>
              <div className="space-y-1">
                <Row label="阶段" value={gameState.worldState.narrativeStage} />
                <Row label="家庭信任链" value={gameState.worldState.trustFamilyChain} />
                <Row label="同伴信任链" value={gameState.worldState.trustPeerChain} />
                <Row label="权威压力" value={gameState.worldState.authorityPressure} />
                <Row label="截止压力" value={gameState.worldState.deadlinePressure} />
                <Row label="官方路径认知" value={gameState.worldState.officialPathAwareness} />
                <Row label="可疑链接暴露" value={gameState.worldState.suspiciousLinkExposure} />
                <Row label="已提交信息" value={gameState.worldState.submittedInfoLevel} />
              </div>
            </>
          )}
          {gameState.notifications.length > 0 && (
            <>
              <p className="text-[#F8FAFC] font-semibold mt-3 mb-1 text-sm">通知</p>
              {gameState.notifications.slice(-3).map((n) => (
                <p key={n.id} className="text-[10px] text-[#64748B] truncate">{n.preview}</p>
              ))}
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
