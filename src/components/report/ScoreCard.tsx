'use client';

import type { ScoreBreakdown } from '@/domain/types/report';
import type { EndingType } from '@/domain/types/game';

interface ScoreCardProps {
  score: ScoreBreakdown;
  endingType: EndingType;
}

const ENDING_INFO: Record<EndingType, { label: string; color: string; desc: string }> = {
  safe_confirmed: { label: '稳健确认', color: '#15803D', desc: '全程保持冷静，安全完成录取确认' },
  near_miss: { label: '险中脱险', color: '#0369A1', desc: '有惊险操作，但最终正确处理' },
  info_leaked: { label: '信息泄露', color: '#B45309', desc: '个人信息泄露但未造成资金损失' },
  money_lost_but_handled: { label: '止损成功', color: '#C2410C', desc: '发生模拟损失但完成了应急处置' },
  fully_scammed: { label: '完全受骗', color: '#B91C1C', desc: '未能识别风险，损失未得到处置' },
};

const SCORE_ITEMS = [
  { key: 'riskIdentification' as const, label: '风险识别', max: 35 },
  { key: 'verificationPath' as const, label: '核验路径', max: 25 },
  { key: 'taskCompletion' as const, label: '任务完成', max: 15 },
  { key: 'emergencyHandling' as const, label: '应急处置', max: 15 },
  { key: 'reviewUnderstanding' as const, label: '复盘理解', max: 10 },
];

export default function ScoreCard({ score, endingType }: ScoreCardProps) {
  const ending = ENDING_INFO[endingType];

  return (
    <div className="mx-4 mb-4">
      {/* Ending badge */}
      <div
        className="rounded-2xl p-4 mb-4 border"
        style={{ backgroundColor: ending.color + '22', borderColor: ending.color + '44' }}
      >
        <div className="flex items-center gap-3">
          <div className="text-4xl font-bold tabular-nums" style={{ color: ending.color }}>
            {score.total}
          </div>
          <div>
            <p className="text-sm font-bold text-[#F8FAFC]">{ending.label}</p>
            <p className="text-xs text-[#94A3B8] mt-0.5">{ending.desc}</p>
          </div>
        </div>
      </div>

      {/* Score breakdown */}
      <div className="rounded-2xl bg-[#111827] border border-[#334155] p-4 space-y-3">
        {SCORE_ITEMS.map(({ key, label, max }) => {
          const val = score[key];
          const pct = Math.round((val / max) * 100);
          return (
            <div key={key}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[#94A3B8]">{label}</span>
                <span className="text-[#CBD5E1] font-semibold">{val}/{max}</span>
              </div>
              <div className="h-1.5 rounded-full bg-[#334155] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${pct}%`, backgroundColor: pct >= 70 ? '#15803D' : pct >= 40 ? '#B45309' : '#B91C1C' }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
