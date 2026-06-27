'use client';

import { useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import ScoreCard from '@/components/report/ScoreCard';
import TimelineReview from '@/components/report/TimelineReview';
import MistakeList from '@/components/report/MistakeList';
import AdvicePanel from '@/components/report/AdvicePanel';
import EpisodeReview from '@/components/report/EpisodeReview';

export default function ReportScreen() {
  const { report, loadReport, isLoading, resetGame, gameState } = useGameStore();

  useEffect(() => {
    if (!report) {
      loadReport();
    }
  }, [report, loadReport]);

  if (isLoading || !report) {
    return (
      <div className="flex h-full min-h-0 items-center justify-center bg-[#07111F]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-[#0E7490] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-[#94A3B8]">正在生成复盘报告…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-y-auto bg-[#07111F]">
      {/* Header */}
      <div className="px-6 pt-10 pb-5">
        <p className="text-xs text-[#0F766E] font-semibold tracking-widest mb-1">模拟结束</p>
        <h2 className="text-xl font-bold text-[#F8FAFC]">复盘报告</h2>
        <p className="text-xs text-[#475569] mt-1">
          {gameState?.playerProfile.name} · {report.generatedAt.slice(0, 10)}
        </p>
      </div>

      {/* Score */}
      <ScoreCard score={report.score} endingType={report.endingType} />

      {/* Mistakes */}
      <MistakeList mistakes={report.keyMistakes} />

      {/* Timeline */}
      <TimelineReview timeline={report.timeline} />

      {/* Episode review */}
      <EpisodeReview report={report} />

      {/* Advice */}
      <AdvicePanel advice={report.realWorldAdvice} teachingPoints={report.teachingPoints} />

      {/* Evidence summary */}
      {report.evidenceSummary.length > 0 && (
        <div className="mx-4 mb-4 rounded-2xl bg-[#111827] border border-[#334155] p-4">
          <p className="text-sm font-semibold text-[#CBD5E1] mb-2">
            收集证据 ({report.evidenceSummary.length})
          </p>
          <div className="space-y-1">
            {report.evidenceSummary.map((ev) => (
              <div key={ev.id} className="flex items-center gap-2 text-xs text-[#94A3B8]">
                <span className="text-[#0F766E]">■</span>
                <span>{ev.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Restart */}
      <div className="px-6 pb-10 pt-2">
        <button
          onClick={resetGame}
          className="w-full text-[#F8FAFC] font-semibold text-base py-4 rounded-2xl active:scale-[0.98]"
          style={{ backgroundColor: '#0E7490', minHeight: 56 }}
        >
          重新开始
        </button>
        <p className="text-center text-[10px] text-[#475569] mt-3">
          再次尝试，探索不同结局
        </p>
      </div>
    </div>
  );
}
