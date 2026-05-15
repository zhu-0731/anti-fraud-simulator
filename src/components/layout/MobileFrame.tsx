'use client';

import React from 'react';

interface MobileFrameProps {
  children: React.ReactNode;
}

export default function MobileFrame({ children }: MobileFrameProps) {
  return (
    <div
      className="relative flex h-[100svh] min-h-0 flex-col bg-[#07111F] overflow-hidden"
      style={{
        width: '100%',
        maxWidth: 430,
        minWidth: 320,
        borderRadius: 0,
      }}
    >
      {children}
    </div>
  );
}
