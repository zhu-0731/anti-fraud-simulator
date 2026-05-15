'use client';

interface AdvicePanelProps {
  advice: string[];
  teachingPoints: string[];
}

export default function AdvicePanel({ advice, teachingPoints }: AdvicePanelProps) {
  return (
    <div className="mx-4 mb-6 space-y-4">
      {advice.length > 0 && (
        <div className="rounded-2xl bg-[#0C4A6E] border border-[#0369A1] p-4">
          <p className="text-sm font-semibold text-[#7DD3FC] mb-3">现实建议</p>
          <div className="space-y-2">
            {advice.map((tip, i) => (
              <div key={i} className="flex gap-2 text-xs text-[#CBD5E1] leading-relaxed">
                <span className="text-[#0369A1] shrink-0">{i + 1}.</span>
                <span>{tip}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {teachingPoints.length > 0 && (
        <div className="rounded-2xl bg-[#172033] border border-[#334155] p-4">
          <p className="text-sm font-semibold text-[#CBD5E1] mb-3">本章知识点</p>
          <div className="space-y-2">
            {teachingPoints.map((point, i) => (
              <div key={i} className="flex gap-2 text-xs text-[#94A3B8] leading-relaxed">
                <span className="text-[#0F766E] shrink-0">▸</span>
                <span>{point}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-xl bg-[#172033] border border-[#334155] p-3">
        <p className="text-xs text-[#475569] text-center">
          遇到疑似诈骗，随时拨打全国反诈热线：96110
        </p>
      </div>
    </div>
  );
}
