'use client';

import { useEffect, useRef } from 'react';
import { useGameStore } from '@/store/gameStore';
import StatusBar from '@/components/game/StatusBar';
import MessageBubble from '@/components/game/MessageBubble';
import ActionPanel from '@/components/game/ActionPanel';
import EvidencePanel from '@/components/game/EvidencePanel';
import BrowserSimulation from '@/components/game/BrowserSimulation';

export default function GameScreen() {
  const { gameState, currentEvent, submitAction, isLoading, feedback } = useGameStore();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [gameState?.messageHistory.length]);

  if (!gameState || !currentEvent) {
    return (
      <div className="flex items-center justify-center flex-1 bg-[#07111F]">
        <p className="text-[#475569] text-sm">加载中…</p>
      </div>
    );
  }

  const handleAction = (actionId: string) => {
    submitAction(currentEvent.id, actionId);
  };

  return (
    <div className="flex flex-col min-h-[100svh] bg-[#07111F]">
      <StatusBar
        riskScore={gameState.riskScore}
        anxietyScore={gameState.anxietyScore}
        phase={gameState.phase}
        evidenceCount={gameState.evidenceList.length}
      />

      {/* Message area */}
      <div className="flex-1 overflow-y-auto py-4">
        {/* Event title */}
        <div className="px-4 mb-4">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-px bg-[#334155]" />
            <span className="text-[10px] text-[#475569] px-2">{currentEvent.title}</span>
            <div className="flex-1 h-px bg-[#334155]" />
          </div>
        </div>

        {/* Messages */}
        {gameState.messageHistory.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {/* Browser sim for browser channel */}
        {currentEvent.channel === 'browser' && <BrowserSimulation />}

        {/* Feedback */}
        {feedback && (
          <div className="mx-4 mb-3 p-3 rounded-xl bg-[#172033] border border-[#334155]">
            <p className="text-xs text-[#94A3B8] leading-relaxed">{feedback}</p>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Evidence panel */}
      <EvidencePanel evidenceList={gameState.evidenceList} />

      {/* Action panel */}
      <ActionPanel
        actions={currentEvent.actions}
        onAction={handleAction}
        disabled={isLoading}
      />
    </div>
  );
}
