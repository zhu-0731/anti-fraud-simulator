'use client';

import { useState } from 'react';
import type { Evidence } from '@/domain/types/game';

interface EvidencePanelProps {
  evidenceList: Evidence[];
}

export default function EvidencePanel({ evidenceList }: EvidencePanelProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-t border-[#334155] bg-[#111827]">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm text-[#CBD5E1]"
      >
        <span className="flex items-center gap-2">
          <span className="text-[#0F766E]">■</span>
          证据链 ({evidenceList.length})
        </span>
        <span className="text-[#475569] text-xs">{open ? '收起' : '展开'}</span>
      </button>
      {open && (
        <div className="px-4 pb-3 space-y-2">
          {evidenceList.length === 0 ? (
            <p className="text-xs text-[#475569]">暂无证据</p>
          ) : (
            evidenceList.map((ev) => (
              <div
                key={ev.id}
                className="flex items-start gap-2 text-xs text-[#94A3B8] bg-[#172033] rounded-lg p-2.5"
              >
                <span className="text-[#0F766E] shrink-0 mt-0.5">✓</span>
                <div>
                  <p className="font-medium text-[#CBD5E1]">{ev.label}</p>
                  <p className="mt-0.5">{ev.description}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
