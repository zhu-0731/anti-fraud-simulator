'use client';

import RiskMeter from './RiskMeter';
import AnxietyMeter from './AnxietyMeter';
import type { GamePhase } from '@/domain/types/game';

interface StatusBarProps {
  riskScore: number;
  anxietyScore: number;
  phase: GamePhase;
  evidenceCount: number;
}

const PHASE_LABELS: Record<GamePhase, string> = {
  start: '开始',
  profile: '档案',
  playing: '进行中',
  emergency: '应急',
  report: '复盘',
};

const PHASE_COLORS: Record<GamePhase, string> = {
  start: '#0369A1',
  profile: '#0369A1',
  playing: '#0F766E',
  emergency: '#B91C1C',
  report: '#475569',
};

export default function StatusBar({ riskScore, anxietyScore, phase, evidenceCount }: StatusBarProps) {
  return (
    <div className="sticky top-0 z-20 px-4 py-2.5 bg-[#0B1728] border-b border-[#334155]">
      <div className="flex items-center gap-3">
        <span
          className="text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0"
          style={{ backgroundColor: PHASE_COLORS[phase] + '33', color: PHASE_COLORS[phase] }}
        >
          {PHASE_LABELS[phase]}
        </span>
        <RiskMeter value={riskScore} />
        <AnxietyMeter value={anxietyScore} />
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-[10px] text-[#94A3B8]">证据</span>
          <span className="text-[10px] font-semibold text-[#0F766E]">{evidenceCount}</span>
        </div>
      </div>
    </div>
  );
}
