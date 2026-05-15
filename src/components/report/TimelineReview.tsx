'use client';

import type { TimelineEntry } from '@/domain/types/report';

interface TimelineReviewProps {
  timeline: TimelineEntry[];
}

export default function TimelineReview({ timeline }: TimelineReviewProps) {
  if (timeline.length === 0) {
    return (
      <div className="mx-4 mb-4 p-4 rounded-2xl bg-[#111827] border border-[#334155]">
        <p className="text-xs text-[#475569]">暂无行动记录</p>
      </div>
    );
  }

  return (
    <div className="mx-4 mb-4">
      <p className="text-sm font-semibold text-[#CBD5E1] mb-3">行动时间轴</p>
      <div className="space-y-2">
        {timeline.map((entry, i) => (
          <div
            key={i}
            className="flex gap-3 rounded-xl p-3"
            style={{
              backgroundColor: entry.isCorrect ? '#14532D22' : '#7F1D1D22',
              borderLeft: `3px solid ${entry.isCorrect ? '#15803D' : '#B91C1C'}`,
            }}
          >
            <div className="shrink-0 mt-0.5">
              <span style={{ color: entry.isCorrect ? '#15803D' : '#B91C1C' }}>
                {entry.isCorrect ? '✓' : '✗'}
              </span>
            </div>
            <div>
              <p className="text-xs font-medium text-[#CBD5E1]">{entry.actionLabel}</p>
              <p className="text-[10px] text-[#475569] mt-0.5">事件：{entry.eventId}</p>
              {entry.feedback && (
                <p className="text-[10px] text-[#94A3B8] mt-1 leading-relaxed">{entry.feedback}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
