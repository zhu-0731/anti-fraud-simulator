'use client';

import { useState, useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';

const FAKE_PAGES: Record<string, { title: string; isOfficial: boolean; hasFakeForm: boolean; countdown?: number }> = {
  'game-simulated-link.local/fake-confirm': {
    title: '推免录取确认系统（非官方）',
    isOfficial: false,
    hasFakeForm: true,
    countdown: 3600,
  },
  'game-simulated-link.local/official': {
    title: 'Z大学研究生院 · 录取确认',
    isOfficial: true,
    hasFakeForm: false,
  },
  'game-simulated-link.local/group-link': {
    title: '保研确认通道 - 内部系统',
    isOfficial: false,
    hasFakeForm: true,
    countdown: 1800,
  },
};

const DEFAULT_PAGE = {
  title: '新标签页',
  isOfficial: false,
  hasFakeForm: false,
};

export default function BrowserView() {
  const { gameState, setActiveView } = useGameStore();
  const [urlInput, setUrlInput] = useState('');

  const browserState = gameState?.browserState;
  const currentUrl = browserState?.url ?? '';
  const page = FAKE_PAGES[currentUrl] ?? DEFAULT_PAGE;

  return (
    <div className="flex flex-col flex-1 bg-[#07111F] overflow-hidden">
      {/* Browser chrome */}
      <div className="flex-shrink-0 bg-[#0B1728] border-b border-[#1E293B]">
        {/* Navigation bar */}
        <div className="flex items-center gap-2 px-3 py-2">
          <button
            onClick={() => setActiveView('chat_list')}
            className="text-[#94A3B8] text-sm px-2 py-1"
          >
            ←
          </button>
          <div className="flex-1 flex items-center gap-1.5 bg-[#172033] border border-[#334155] rounded-lg px-3 py-1.5">
            <span className={`text-[10px] ${page.isOfficial ? 'text-[#34D399]' : 'text-[#B45309]'}`}>
              {page.isOfficial ? '🔒' : '⚠️'}
            </span>
            <input
              value={urlInput || currentUrl}
              onChange={(e) => setUrlInput(e.target.value)}
              className="flex-1 bg-transparent text-xs text-[#94A3B8] focus:outline-none font-mono"
              placeholder="game-simulated-link.local/…"
            />
          </div>
        </div>
        {/* Title bar */}
        <div className="px-4 pb-2 flex items-center gap-2">
          <span className="text-xs text-[#64748B] truncate">{page.title}</span>
          {!page.isOfficial && currentUrl && (
            <span className="text-[9px] bg-[#B45309]/20 text-[#F59E0B] px-1.5 rounded">
              ⚠ 非官方页面
            </span>
          )}
        </div>
      </div>

      {/* Page content */}
      <div className="flex-1 overflow-y-auto p-4">
        {!currentUrl ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
            <span className="text-4xl">🌐</span>
            <p className="text-[#475569] text-sm">在消息中点击链接，或输入地址访问页面</p>
            <p className="text-[10px] text-[#334155]">【模拟浏览器 · 安全沙箱】</p>
          </div>
        ) : (
          <>
            {/* Countdown */}
            {page.countdown && <Countdown key={currentUrl} initialSeconds={page.countdown} />}

            {/* Page body */}
            <div className="bg-[#0B1728] rounded-xl border border-[#1E293B] p-4 mb-4">
              <h2 className="text-sm font-semibold text-[#E2E8F0] mb-1">{page.title}</h2>
              <p className="text-xs text-[#64748B]">
                {page.isOfficial
                  ? '欢迎使用Z大研究生院官方录取确认系统。请用学号和密码登录，确认录取信息无误。全程免费，无需向任何个人账号提交资金。'
                  : '请在以下表单中填写您的基本信息以完成录取确认。系统将在确认后发送短信通知。'}
              </p>
            </div>

            {/* Fake form */}
            {page.hasFakeForm && (
              <div className="bg-[#172033] rounded-xl border border-[#334155] p-4">
                <p className="text-[10px] text-center text-[#F59E0B] bg-[#B45309]/10 border border-[#B45309]/20 rounded-lg px-3 py-2 mb-4">
                  ⚠️ 模拟输入 · 请勿填写真实个人信息
                </p>
                <div className="space-y-3">
                  {[
                    { label: '学号', type: 'text', placeholder: '（模拟）请勿填写' },
                    { label: '姓名', type: 'text', placeholder: '（模拟）请勿填写' },
                    { label: '身份证号', type: 'text', placeholder: '（模拟）请勿填写' },
                    { label: '手机号', type: 'tel', placeholder: '（模拟）请勿填写' },
                  ].map(({ label, type, placeholder }) => (
                    <div key={label}>
                      <label className="block text-xs text-[#64748B] mb-1">{label}</label>
                      <input
                        type={type}
                        placeholder={placeholder}
                        readOnly
                        className="w-full bg-[#0B1728] border border-[#334155] rounded-lg px-3 py-2 text-xs text-[#475569] cursor-not-allowed focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
                <button
                  disabled
                  className="mt-4 w-full bg-[#334155] text-[#475569] rounded-lg py-2 text-sm cursor-not-allowed"
                >
                  提交（模拟 · 不可操作）
                </button>
              </div>
            )}

            {/* Official site — safe content */}
            {page.isOfficial && (
              <div className="bg-[#0F766E]/10 border border-[#0F766E]/30 rounded-xl p-4 text-xs text-[#A7F3D0] leading-relaxed">
                <p className="font-semibold mb-2">【官方提示】</p>
                <ul className="space-y-1 list-disc pl-4">
                  <li>录取确认全程免费，无需缴纳任何押金</li>
                  <li>官方不会通过私信要求提交身份证或密码</li>
                  <li>如收到非本页面的“确认通知”，请致电招办核实</li>
                  <li>招办电话：010-XXXX-XXXX（模拟）</li>
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function Countdown({ initialSeconds }: { initialSeconds: number }) {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    if (seconds <= 0) return;
    const timer = setInterval(() => {
      setSeconds((current) => (current > 0 ? current - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [seconds]);

  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const formatted = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s
    .toString()
    .padStart(2, '0')}`;

  if (seconds <= 0) return null;

  return (
    <div className="mb-4 p-3 rounded-xl bg-[#B91C1C]/10 border border-[#B91C1C]/30 text-center">
      <p className="text-xs text-[#94A3B8] mb-1">⏳ 录取确认截止倒计时</p>
      <p className="text-2xl font-mono font-bold text-[#F87171]">{formatted}</p>
    </div>
  );
}
