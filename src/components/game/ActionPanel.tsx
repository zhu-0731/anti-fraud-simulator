'use client';

import type { PlayerAction, ActionCategory } from '@/domain/types/game';

interface ActionPanelProps {
  actions: PlayerAction[];
  onAction: (actionId: string) => void;
  disabled?: boolean;
}

const CATEGORY_STYLES: Record<ActionCategory, { bg: string; text: string; border: string }> = {
  risky: { bg: '#7F1D1D', text: '#FCA5A5', border: '#991B1B' },
  verify: { bg: '#0C4A6E', text: '#7DD3FC', border: '#0369A1' },
  evidence: { bg: '#134E4A', text: '#6EE7B7', border: '#0F766E' },
  ignore: { bg: '#1E293B', text: '#94A3B8', border: '#334155' },
  safe: { bg: '#14532D', text: '#86EFAC', border: '#15803D' },
  emergency: { bg: '#7F1D1D', text: '#FCA5A5', border: '#B91C1C' },
};

export default function ActionPanel({ actions, onAction, disabled }: ActionPanelProps) {
  return (
    <div className="p-4 space-y-2.5 bg-[#0B1728] border-t border-[#334155]">
      <p className="text-[11px] text-[#475569] mb-1">选择你的行动：</p>
      {actions.map((action) => {
        const style = CATEGORY_STYLES[action.category];
        return (
          <button
            key={action.id}
            onClick={() => onAction(action.id)}
            disabled={disabled}
            className="w-full text-left text-sm font-medium px-4 py-3 rounded-xl border transition-opacity disabled:opacity-40 active:scale-[0.98]"
            style={{
              backgroundColor: style.bg,
              color: style.text,
              borderColor: style.border,
              minHeight: 44,
            }}
          >
            {action.label}
          </button>
        );
      })}
    </div>
  );
}
