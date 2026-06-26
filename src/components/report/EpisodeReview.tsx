'use client';

import type { GameReport } from '@/domain/types/report';

interface EpisodeReviewProps {
  report: GameReport;
}

export default function EpisodeReview({ report }: EpisodeReviewProps) {
  const turns = report.episode?.turns ?? [];

  return (
    <div className="mx-4 mb-4 rounded-2xl bg-[#111827] border border-[#334155] p-4">
      <p className="text-sm font-semibold text-[#CBD5E1] mb-3">AI 技能与核实复盘</p>

      <div className="space-y-3">
        <SummaryRow label="首次官方核实" value={report.firstOfficialVerificationTurnId ?? '未记录'} />
        <SummaryRow label="信息泄露" value={report.informationLeakSummary} />
        <SummaryRow label="应急处置" value={report.emergencyEvaluation} />
      </div>

      <div className="mt-4 space-y-2">
        {report.aiTacticSummary.slice(0, 4).map((item) => (
          <p key={item} className="text-xs text-[#94A3B8] leading-relaxed">
            {item}
          </p>
        ))}
      </div>

      <div className="mt-4 space-y-2">
        <p className="text-xs font-semibold text-[#CBD5E1]">证据追踪</p>
        {turns.slice(0, 5).map((turn) => (
          <div key={turn.id} className="rounded-xl bg-[#172033] border border-[#334155] p-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-medium text-[#E2E8F0]">第 {turn.turnNumber} 轮</p>
              <p className="text-[10px] text-[#64748B]">{turn.messageId ?? turn.actionId ?? turn.id}</p>
            </div>
            <p className="text-[11px] text-[#94A3B8] mt-1">{turn.playerAction}</p>
            <p className="text-[11px] text-[#64748B] mt-1">更安全的行动：{turn.saferAction}</p>
          </div>
        ))}
      </div>

      {(report.contradictionSummary.discovered.length > 0 || report.contradictionSummary.missed.length > 0) && (
        <div className="mt-4 rounded-xl bg-[#0B1728] border border-[#1E293B] p-3">
          <p className="text-xs font-semibold text-[#CBD5E1] mb-2">矛盾识别</p>
          {report.contradictionSummary.discovered.map((item) => (
            <p key={item} className="text-[11px] text-[#86EFAC] leading-relaxed">已发现：{item}</p>
          ))}
          {report.contradictionSummary.missed.map((item) => (
            <p key={item} className="text-[11px] text-[#FCA5A5] leading-relaxed">遗漏：{item}</p>
          ))}
        </div>
      )}
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] text-[#64748B] mb-0.5">{label}</p>
      <p className="text-xs text-[#CBD5E1] leading-relaxed">{value}</p>
    </div>
  );
}
