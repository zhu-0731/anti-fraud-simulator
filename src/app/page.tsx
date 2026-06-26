'use client';

import { Suspense, useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import DesktopLayout from '@/components/layout/DesktopLayout';
import StartScreen from '@/components/screens/StartScreen';
import ProfileScreen from '@/components/screens/ProfileScreen';
import EmergencyScreen from '@/components/screens/EmergencyScreen';
import ReportScreen from '@/components/screens/ReportScreen';
import ChatListScreen from '@/components/screens/ChatListScreen';
import ChatWindow from '@/components/screens/ChatWindow';
import BrowserView from '@/components/screens/BrowserView';
import OfficialSiteView from '@/components/screens/OfficialSiteView';
import PhoneView from '@/components/screens/PhoneView';
import EvidenceView from '@/components/screens/EvidenceView';
import BottomNavigation from '@/components/layout/BottomNavigation';
import StatusBar from '@/components/game/StatusBar';

function PlayingView() {
  const { gameState, setActiveView, openContact } = useGameStore();
  if (!gameState) return null;

  const activeView = gameState.activeView ?? 'chat_list';
  const unreadTotal = gameState.contacts.reduce((sum, c) => sum + c.unreadCount, 0);

  const handleChangeView = (view: typeof activeView) => {
    if (view === 'chat_list' && gameState.activeContactId) {
      // Navigate back to list from chat window
      openContact('');
    }
    setActiveView(view);
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#07111F]">
      <StatusBar
        riskScore={gameState.riskScore}
        anxietyScore={gameState.anxietyScore}
        phase={gameState.phase}
        evidenceCount={gameState.evidenceList.length}
      />

      {/* Main content area */}
      <div className="min-h-0 flex-1 flex flex-col overflow-hidden">
        {activeView === 'chat_list' && !gameState.activeContactId && <ChatListScreen />}
        {(activeView === 'chat_window' || (activeView === 'chat_list' && gameState.activeContactId)) && <ChatWindow />}
        {activeView === 'browser' && <BrowserView />}
        {activeView === 'official_site' && <OfficialSiteView />}
        {activeView === 'phone' && <PhoneView />}
        {activeView === 'evidence' && <EvidenceView />}
      </div>

      <BottomNavigation
        activeView={activeView}
        onChangeView={handleChangeView}
        unreadTotal={unreadTotal}
      />
    </div>
  );
}

export default function Home() {
  const { gameState, restoreSession } = useGameStore();

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  const phase = gameState?.phase ?? 'start';

  return (
    <Suspense fallback={null}>
      <DesktopLayout>
        {phase === 'start' && <StartScreen />}
        {phase === 'profile' && <ProfileScreen />}
        {phase === 'playing' && <PlayingView />}
        {phase === 'emergency' && <EmergencyScreen />}
        {phase === 'report' && <ReportScreen />}
      </DesktopLayout>
    </Suspense>
  );
}
