'use client';

export default function BrowserSimulation() {
  return (
    <div className="mx-4 my-3 rounded-xl border border-[#B45309] bg-[#111827] overflow-hidden">
      {/* Browser chrome */}
      <div className="flex items-center gap-2 px-3 py-2 bg-[#172033] border-b border-[#334155]">
        <div className="flex gap-1">
          <div className="w-2.5 h-2.5 rounded-full bg-[#7F1D1D]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#78350F]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#14532D]" />
        </div>
        <div className="flex-1 bg-[#1E293B] rounded text-[10px] text-[#94A3B8] px-2 py-1">
          game-simulated-link.local/verify
        </div>
      </div>

      {/* Warning banner */}
      <div className="px-3 py-2 bg-[#78350F] border-b border-[#B45309]">
        <p className="text-[11px] text-[#FCD34D] font-semibold">
          ⚠️ 教育模拟页面 — 请勿填写任何真实信息
        </p>
      </div>

      {/* Simulated form */}
      <div className="p-4 space-y-3">
        <p className="text-sm text-[#CBD5E1] font-semibold">录取确认（模拟演示）</p>

        <div className="space-y-2">
          <label className="text-xs text-[#94A3B8]">手机号</label>
          <input
            type="text"
            placeholder="模拟输入，请勿填写真实信息"
            className="w-full bg-[#172033] border border-[#334155] rounded-lg px-3 py-2 text-sm text-[#475569] placeholder-[#475569] cursor-not-allowed"
            readOnly
            aria-label="模拟手机号输入框"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs text-[#94A3B8]">身份证号</label>
          <input
            type="text"
            placeholder="模拟输入，请勿填写真实信息"
            className="w-full bg-[#172033] border border-[#334155] rounded-lg px-3 py-2 text-sm text-[#475569] placeholder-[#475569] cursor-not-allowed"
            readOnly
            aria-label="模拟身份证号输入框"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs text-[#94A3B8]">验证码</label>
          <input
            type="text"
            placeholder="模拟输入，请勿填写真实信息"
            className="w-full bg-[#172033] border border-[#334155] rounded-lg px-3 py-2 text-sm text-[#475569] placeholder-[#475569] cursor-not-allowed"
            readOnly
            aria-label="模拟验证码输入框"
          />
        </div>

        <div className="bg-[#7F1D1D] border border-[#B91C1C] rounded-lg p-3 text-center">
          <p className="text-sm text-[#FCA5A5]">⚠️（模拟支付按钮）¥500 确认押金</p>
          <p className="text-[10px] text-[#94A3B8] mt-1">此为模拟演示，点击行动按钮而非此处</p>
        </div>
      </div>
    </div>
  );
}
