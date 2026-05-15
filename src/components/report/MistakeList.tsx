'use client';

import type { ActionRecord } from '@/domain/types/game';

interface MistakeListProps {
  mistakes: ActionRecord[];
}

export default function MistakeList({ mistakes }: MistakeListProps) {
  if (mistakes.length === 0) {
    return (
      <div className="mx-4 mb-4 p-4 rounded-2xl bg-[#14532D22] border border-[#15803D44]">
        <p className="text-sm text-[#86EFAC]">🎉 没有高风险操作！表现出色。</p>
      </div>
    );
  }

  return (
    <div className="mx-4 mb-4">
      <p className="text-sm font-semibold text-[#FCA5A5] mb-3">需要改进的操作</p>
      <div className="space-y-2">
        {mistakes.map((m, i) => (
          <div key={i} className="rounded-xl bg-[#7F1D1D22] border border-[#B91C1C44] p-3">
            <p className="text-xs font-medium text-[#FCA5A5]">{m.actionLabel}</p>
            <p className="text-[10px] text-[#475569] mt-0.5">事件：{m.eventId}</p>
            {m.feedback && (
              <p className="text-[10px] text-[#94A3B8] mt-1 leading-relaxed">{m.feedback}</p>
            )}
            <div className="flex gap-3 mt-1.5">
              {m.riskScoreDelta !== 0 && (
                <span className="text-[10px] text-[#FCA5A5]">
                  风险 {m.riskScoreDelta > 0 ? '+' : ''}{m.riskScoreDelta}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
