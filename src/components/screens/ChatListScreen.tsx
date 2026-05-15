'use client';

import { useGameStore } from '@/store/gameStore';
import type { Contact } from '@/domain/types/chat';

function timeAgo(isoStr?: string): string {
  if (!isoStr) return '';
  const diff = Date.now() - new Date(isoStr).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return '刚刚';
  if (min < 60) return `${min}分钟前`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}小时前`;
  return `${Math.floor(hr / 24)}天前`;
}

interface ContactRowProps {
  contact: Contact;
  onClick: () => void;
}

function ContactRow({ contact, onClick }: ContactRowProps) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#172033] transition-colors text-left"
    >
      {/* Avatar */}
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${
        contact.isOfficial ? 'bg-[#0F766E]/20 ring-1 ring-[#0F766E]' :
        contact.type === 'group' ? 'bg-[#0369A1]/20' :
        contact.type === 'system' ? 'bg-[#15803D]/20' :
        'bg-[#172033]'
      }`}>
        {contact.avatarEmoji}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="font-medium text-[#F8FAFC] text-sm truncate">{contact.name}</span>
            {contact.isOfficial && (
              <span className="text-[10px] bg-[#0F766E]/20 text-[#34D399] px-1 rounded">官方</span>
            )}
          </div>
          <span className="text-[10px] text-[#475569] flex-shrink-0">
            {timeAgo(contact.lastMessageAt)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <span className="text-xs text-[#64748B] truncate">
            {contact.lastMessagePreview ?? ''}
          </span>
          {contact.unreadCount > 0 && (
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#0E7490] text-white text-[10px] font-bold flex items-center justify-center">
              {contact.unreadCount > 9 ? '9+' : contact.unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

export default function ChatListScreen() {
  const { gameState, openContact } = useGameStore();

  if (!gameState) return null;

  const visibleContacts = gameState.contacts.filter((c) => !c.isHidden);

  return (
    <div className="flex flex-col flex-1 bg-[#07111F] overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 px-4 pt-4 pb-3 border-b border-[#1E293B]">
        <h1 className="text-base font-semibold text-[#F8FAFC]">消息</h1>
      </div>

      {/* Notification banner */}
      {gameState.notifications.length > 0 && (
        <div className="flex-shrink-0 mx-4 mt-3 p-2.5 rounded-lg bg-[#172033] border border-[#334155]">
          <p className="text-xs text-[#94A3B8]">
            📣 {gameState.notifications[gameState.notifications.length - 1].preview}
          </p>
        </div>
      )}

      {/* Contact list */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#1E293B]">
        {visibleContacts.map((contact) => (
          <ContactRow
            key={contact.id}
            contact={contact}
            onClick={() => openContact(contact.id)}
          />
        ))}
      </div>
    </div>
  );
}
