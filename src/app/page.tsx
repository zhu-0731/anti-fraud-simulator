'use client';

import { useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import DesktopLayout from '@/components/layout/DesktopLayout';
import StartScreen from '@/components/screens/StartScreen';
import ProfileScreen from '@/components/screens/ProfileScreen';
import GameScreen from '@/components/screens/GameScreen';
import EmergencyScreen from '@/components/screens/EmergencyScreen';
import ReportScreen from '@/components/screens/ReportScreen';

export default function Home() {
  const { gameState, restoreSession } = useGameStore();

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  const phase = gameState?.phase ?? 'start';

  return (
    <DesktopLayout>
      {phase === 'start' && <StartScreen />}
      {phase === 'profile' && <ProfileScreen />}
      {phase === 'playing' && <GameScreen />}
      {phase === 'emergency' && <EmergencyScreen />}
      {phase === 'report' && <ReportScreen />}
    </DesktopLayout>
  );
}
