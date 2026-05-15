'use client';

import { useEffect, useRef, useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import type { ChatMessage } from '@/domain/types/chat';

const QUICK_SUGGESTIONS: string[] = [
  '你们有官方核实渠道吗？',
  '这个链接安全吗？',
  '我想截图保存',
  '我要举报这个账号',
  '麻烦你帮我确认一下',
];

function ChatBubble({ msg, playerName }: { msg: ChatMessage; playerName: string }) {
  const isPlayer = msg.sender === 'player';
  const isSystem = msg.sender === 'system';

  if (isSystem) {
    return (
      <div className="flex justify-center my-2">
        <span className="text-[10px] text-[#475569] bg-[#0B1728] px-3 py-1 rounded-full">
          {msg.content}
        </span>
      </div>
    );
  }

  const channelColor: Record<string, string> = {
    official: 'border-[#0F766E]',
    chat: 'border-transparent',
    group: 'border-transparent',
  };

  return (
    <div className={`flex gap-2 mb-3 ${isPlayer ? 'flex-row-reverse' : 'flex-row'} px-4`}>
      {!isPlayer && (
        <div className="w-8 h-8 rounded-lg bg-[#172033] flex items-center justify-center text-sm flex-shrink-0 mt-0.5">
          {msg.senderName.slice(0, 1)}
        </div>
      )}

      <div className={`max-w-[75%] ${isPlayer ? 'items-end' : 'items-start'} flex flex-col gap-0.5`}>
        {!isPlayer && (
          <span className="text-[10px] text-[#64748B] px-1">{msg.senderName}</span>
        )}
        <div
          className={`px-3 py-2 rounded-2xl text-sm leading-relaxed border ${
            isPlayer
              ? 'bg-[#0E7490] text-white border-transparent rounded-tr-sm'
              : `bg-[#172033] text-[#E2E8F0] ${channelColor[msg.channel] ?? 'border-transparent'} rounded-tl-sm`
          }`}
        >
          {msg.metadata?.simulatedLink && (
            <div className="mb-1.5 text-[10px] text-[#38BDF8] opacity-70 font-mono">
              🔗 {msg.metadata.simulatedLink}
            </div>
          )}
          <span style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</span>
        </div>
        <span className="text-[9px] text-[#334155] px-1">
          {new Date(msg.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
}

export default function ChatWindow() {
  const { gameState, sendMessage, openContact, isChatLoading } = useGameStore();
  const [inputText, setInputText] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const contactId = gameState?.activeContactId;
  const contact = gameState?.contacts.find((c) => c.id === contactId);
  const messages: ChatMessage[] = (contactId ? gameState?.chatHistories[contactId] : undefined) ?? [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  if (!gameState || !contactId || !contact) return null;

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || isChatLoading) return;
    setInputText('');
    await sendMessage(contactId, text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-[#07111F] overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center gap-3 px-3 py-2.5 bg-[#0B1728] border-b border-[#1E293B]">
        <button
          onClick={() => openContact('')}
          className="text-[#94A3B8] text-lg p-1"
          aria-label="返回"
        >
          ←
        </button>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-xl">{contact.avatarEmoji}</span>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-medium text-[#F8FAFC] truncate">{contact.name}</span>
              {contact.isOfficial && (
                <span className="text-[9px] bg-[#0F766E]/20 text-[#34D399] px-1 rounded">官方</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="min-h-0 flex-1 overflow-y-auto py-3">
        {messages.map((msg) => (
          <ChatBubble key={msg.id} msg={msg} playerName={gameState.playerProfile.name} />
        ))}
        {isChatLoading && (
          <div className="flex gap-2 px-4 mb-3">
            <div className="w-8 h-8 rounded-lg bg-[#172033] flex items-center justify-center text-sm flex-shrink-0">
              {contact.avatarEmoji}
            </div>
            <div className="bg-[#172033] px-4 py-2 rounded-2xl rounded-tl-sm">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#475569] animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-[#475569] animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-[#475569] animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick suggestions */}
      <div className="flex-shrink-0 px-3 pb-2 flex gap-2 overflow-x-auto">
        {QUICK_SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => setInputText(s)}
            className="flex-shrink-0 text-[11px] text-[#94A3B8] bg-[#172033] border border-[#334155] px-2.5 py-1 rounded-full hover:border-[#0E7490] transition-colors"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="flex-shrink-0 flex items-center gap-2 px-3 py-2 bg-[#0B1728] border-t border-[#1E293B]">
        <input
          ref={inputRef}
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="输入消息…"
          className="flex-1 bg-[#172033] text-[#F8FAFC] placeholder-[#475569] text-sm px-3 py-2 rounded-xl border border-[#334155] focus:outline-none focus:border-[#0E7490]"
        />
        <button
          onClick={handleSend}
          disabled={!inputText.trim() || isChatLoading}
          className="w-9 h-9 rounded-xl bg-[#0E7490] text-white flex items-center justify-center disabled:opacity-40 transition-opacity"
        >
          ↑
        </button>
      </div>
    </div>
  );
}
