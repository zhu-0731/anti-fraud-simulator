'use client';

import { useGameStore } from '@/store/gameStore';

export default function ProfileScreen() {
  const { gameState, setPhase } = useGameStore();
  const profile = gameState?.playerProfile;

  if (!profile) return null;

  return (
    <div className="flex flex-col min-h-[100svh] bg-[#07111F]">
      <div className="px-6 pt-10 pb-4">
        <p className="text-xs text-[#0F766E] font-semibold tracking-widest mb-1">你的角色</p>
        <h2 className="text-xl font-bold text-[#F8FAFC]">认识陈莉</h2>
      </div>

      {/* Avatar */}
      <div className="flex justify-center py-4">
        <div className="w-20 h-20 rounded-full bg-[#134E4A] border-2 border-[#0F766E] flex items-center justify-center">
          <span className="text-3xl font-bold text-[#0F766E]">{profile.avatarInitials}</span>
        </div>
      </div>

      {/* Profile card */}
      <div className="mx-6 rounded-2xl bg-[#111827] border border-[#334155] p-5 space-y-3">
        {[
          { label: '姓名', value: profile.name },
          { label: '学校', value: profile.school },
          { label: '专业', value: profile.major },
          { label: '年级', value: profile.year },
          { label: '目标院校', value: profile.targetSchool },
          { label: '目标专业', value: profile.targetMajor },
        ].map(({ label, value }) => (
          <div key={label} className="flex items-center gap-3">
            <span className="text-xs text-[#475569] w-16 shrink-0">{label}</span>
            <span className="text-sm text-[#CBD5E1] font-medium">{value}</span>
          </div>
        ))}
      </div>

      {/* Backstory */}
      <div className="mx-6 mt-4 rounded-xl bg-[#172033] border border-[#334155] p-4">
        <p className="text-xs text-[#0F766E] font-semibold mb-2">背景故事</p>
        <p className="text-sm text-[#94A3B8] leading-relaxed">{profile.backstory}</p>
      </div>

      <div className="flex-1" />

      <div className="px-6 pb-10 pt-4">
        <button
          onClick={() => setPhase('playing')}
          className="w-full text-white font-semibold text-base py-4 rounded-2xl active:scale-[0.98]"
          style={{ backgroundColor: '#0E7490', minHeight: 56 }}
        >
          进入游戏
        </button>
      </div>
    </div>
  );
}
