'use client';

import type { GamePhase } from '@/domain/types/game';

interface StatusBarProps {
  riskScore: number;
  anxietyScore: number;
  phase: GamePhase;
  evidenceCount: number;
}

function riskLabel(score: number): string {
  if (score < 20) return '安全';
  if (score < 40) return '轻微风险';
  if (score < 65) return '中等风险';
  if (score < 85) return '高风险';
  return '危险';
}

function riskColor(score: number): string {
  if (score < 20) return '#15803D';
  if (score < 40) return '#0E7490';
  if (score < 65) return '#B45309';
  if (score < 85) return '#C2410C';
  return '#B91C1C';
}

function anxietyLabel(score: number): string {
  if (score < 25) return '平静';
  if (score < 50) return '有些紧张';
  if (score < 75) return '焦虑';
  return '极度焦虑';
}

export default function StatusBar({ riskScore, anxietyScore, phase, evidenceCount }: StatusBarProps) {
  const rl = riskLabel(riskScore);
  const rc = riskColor(riskScore);
  const al = anxietyLabel(anxietyScore);

  return (
    <div className="sticky top-0 z-20 px-4 py-2 bg-[#0B1728] border-b border-[#1E293B]">
      <div className="flex items-center gap-3">
        {/* Status indicator */}
        <span
          className="text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0"
          style={{ backgroundColor: rc + '22', color: rc }}
        >
          {rl}
        </span>

        {/* Anxiety label */}
        <span className="text-[10px] text-[#64748B] shrink-0">{al}</span>

        {/* Risk bar */}
        <div className="flex-1 h-1 bg-[#1E293B] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${riskScore}%`, backgroundColor: rc }}
          />
        </div>

        {/* Evidence badge */}
        {evidenceCount > 0 && (
          <div className="flex items-center gap-1 shrink-0">
            <span className="text-[10px]">📋</span>
            <span className="text-[10px] font-semibold text-[#0F766E]">{evidenceCount}</span>
          </div>
        )}

        {/* Emergency tag */}
        {phase === 'emergency' && (
          <span className="text-[10px] bg-[#B91C1C]/20 text-[#F87171] px-1.5 py-0.5 rounded-full font-semibold shrink-0">
            应急
          </span>
        )}
      </div>
    </div>
  );
}
