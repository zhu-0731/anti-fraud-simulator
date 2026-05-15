import { NextRequest, NextResponse } from 'next/server';
import { gameSessionRepository } from '@/domain/repositories/GameSessionRepository';
import { narrativeDirector } from '@/domain/narrative/NarrativeDirector';
import { patchWorldState } from '@/domain/narrative/WorldState';
import { generateId } from '@/lib/id';
import type { SystemNotification } from '@/domain/types/chat';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, contactId } = body as { sessionId: string; contactId?: string };

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });
    }

    const state = await gameSessionRepository.findById(sessionId);
    if (!state) {
      return NextResponse.json({ error: `Session not found: ${sessionId}` }, { status: 404 });
    }

    // Tick narrative for a passive event (no player intent — use small_talk as neutral)
    const tickResult = narrativeDirector.tick(
      state.worldState,
      'small_talk',
      contactId ?? 'group',
    );

    // Inject proactive NPC messages (e.g. group chat activity)
    const incomingNotif: SystemNotification | null = tickResult.newNotifications[0] ?? null;
    const updatedNotifications = incomingNotif
      ? [...state.notifications, ...tickResult.newNotifications]
      : state.notifications;

    // Update contact unread counts for new notifications
    const updatedContacts = tickResult.newNotifications.reduce((contacts, notif) => {
      return contacts.map((c) =>
        c.id === notif.contactId
          ? {
              ...c,
              unreadCount: c.unreadCount + 1,
              lastMessagePreview: notif.preview,
              lastMessageAt: notif.timestamp,
            }
          : c,
      );
    }, state.contacts);

    // Add automatic system messages to group chat when fake_entry_seeded stage hits
    const updatedChatHistories = { ...state.chatHistories };
    for (const notif of tickResult.newNotifications) {
      const existing = updatedChatHistories[notif.contactId] ?? [];
      updatedChatHistories[notif.contactId] = [
        ...existing,
        {
          id: generateId('msg'),
          contactId: notif.contactId,
          sender: 'system' as const,
          senderName: '系统通知',
          content: notif.preview,
          channel: 'group' as const,
          timestamp: notif.timestamp,
          metadata: { isSystemGenerated: true },
        },
      ];
    }

    const updatedWorldState = patchWorldState(state.worldState, tickResult.updatedWorldState);

    const updatedState = {
      ...state,
      worldState: updatedWorldState,
      contacts: updatedContacts,
      chatHistories: updatedChatHistories,
      notifications: updatedNotifications,
    };

    await gameSessionRepository.update(updatedState);

    return NextResponse.json({
      state: updatedState,
      notifications: tickResult.newNotifications,
      triggerEmergency: tickResult.triggerEmergency,
      triggerReport: tickResult.triggerReport,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
