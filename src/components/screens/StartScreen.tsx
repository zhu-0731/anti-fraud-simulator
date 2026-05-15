'use client';

import { useGameStore } from '@/store/gameStore';

export default function StartScreen() {
  const { startGame, isLoading, error, clearError } = useGameStore();

  return (
    <div className="flex flex-col flex-1 min-h-[100svh] bg-[#07111F]">
      {/* Header */}
      <div className="px-6 pt-12 pb-6">
        <p className="text-xs text-[#0F766E] font-semibold tracking-widest mb-2">防诈骗模拟训练</p>
        <h1 className="text-2xl font-bold text-[#F8FAFC] leading-tight">
          确认之前
        </h1>
        <p className="text-sm text-[#94A3B8] mt-1">— 保研录取反诈模拟 第一章</p>
      </div>

      {/* Cover card */}
      <div className="mx-6 rounded-2xl bg-[#111827] border border-[#334155] overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-[#0F766E] to-[#0E7490]" />
        <div className="p-5">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-[#134E4A] flex items-center justify-center shrink-0">
              <span className="text-2xl">🎓</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-[#F8FAFC]">场景：保研录取确认</p>
              <p className="text-xs text-[#94A3B8] mt-0.5">
                你是大四学生，正在等待保研录取通知
              </p>
            </div>
          </div>

          <p className="text-sm text-[#CBD5E1] leading-relaxed">
            面对妈妈转发、学长资料包、群公告、疑似招办老师私聊、倒计时确认页面……你能识别风险、保全信息、完成安全确认吗？
          </p>

          <div className="mt-4 space-y-2">
            {[
              '识别多渠道诈骗信息',
              '通过官方渠道核实身份',
              '遇险后正确应急处置',
            ].map((point) => (
              <div key={point} className="flex items-center gap-2">
                <span className="text-[#0F766E] text-sm">✓</span>
                <span className="text-xs text-[#94A3B8]">{point}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="mx-6 mt-4 p-4 rounded-xl bg-[#0C4A6E] border border-[#0369A1]">
        <p className="text-xs text-[#7DD3FC] leading-relaxed">
          本模拟仅用于防诈骗教育，所有链接均为模拟域名，不收集任何真实信息，不涉及真实支付。
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mx-6 mt-3 p-3 rounded-xl bg-[#7F1D1D] border border-[#B91C1C]">
          <p className="text-xs text-[#FCA5A5]">{error}</p>
          <button onClick={clearError} className="text-xs text-[#FCA5A5] underline mt-1">
            关闭
          </button>
        </div>
      )}

      <div className="flex-1" />

      {/* Start button */}
      <div className="px-6 pb-10 pt-4">
        <button
          onClick={() => startGame()}
          disabled={isLoading}
          className="w-full text-white font-semibold text-base py-4 rounded-2xl transition-opacity disabled:opacity-50 active:scale-[0.98]"
          style={{ backgroundColor: '#0E7490', minHeight: 56 }}
        >
          {isLoading ? '正在启动…' : '开始模拟'}
        </button>
        <p className="text-center text-[10px] text-[#475569] mt-3">
          约 10-15 分钟完成 · 支持随时暂停
        </p>
      </div>
    </div>
  );
}
