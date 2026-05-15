'use client';

import type { ActiveView } from '@/domain/types/chat';

interface BottomNavigationProps {
  activeView: ActiveView;
  onChangeView: (view: ActiveView) => void;
  unreadTotal: number;
}

const NAV_ITEMS: { view: ActiveView; label: string; icon: string }[] = [
  { view: 'chat_list', label: '消息', icon: '💬' },
  { view: 'browser', label: '浏览器', icon: '🌐' },
  { view: 'official_site', label: '官网', icon: '🏛️' },
  { view: 'phone', label: '电话', icon: '📞' },
  { view: 'evidence', label: '证据', icon: '📋' },
];

export default function BottomNavigation({ activeView, onChangeView, unreadTotal }: BottomNavigationProps) {
  return (
    <nav className="flex-shrink-0 flex bg-[#0B1728] border-t border-[#334155]">
      {NAV_ITEMS.map(({ view, label, icon }) => {
        const isActive = activeView === view;
        const showBadge = view === 'chat_list' && unreadTotal > 0;
        return (
          <button
            key={view}
            onClick={() => onChangeView(view)}
            className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 relative transition-colors ${
              isActive ? 'text-[#38BDF8]' : 'text-[#475569]'
            }`}
          >
            <span className="text-lg leading-none">{icon}</span>
            <span className="text-[10px] leading-tight">{label}</span>
            {showBadge && (
              <span className="absolute top-1.5 right-[calc(50%-12px)] w-4 h-4 rounded-full bg-[#B91C1C] text-white text-[9px] font-bold flex items-center justify-center">
                {unreadTotal > 9 ? '9+' : unreadTotal}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
