'use client';

import React from 'react';

interface MobileFrameProps {
  children: React.ReactNode;
}

export default function MobileFrame({ children }: MobileFrameProps) {
  return (
    <div
      className="relative flex flex-col bg-[#07111F] overflow-hidden"
      style={{
        width: '100%',
        maxWidth: 430,
        minWidth: 320,
        minHeight: '100svh',
        borderRadius: 0,
      }}
    >
      {children}
    </div>
  );
}
