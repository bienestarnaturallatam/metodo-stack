'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const MainSections = dynamic(() => import('@/components/MainSections'), {
  ssr: false,
  loading: () => <div className="min-h-screen bg-white" />
});

const ExitIntentPopup = dynamic(() => import('@/components/ExitIntentPopup'), {
  ssr: false
});

export default function ClientLandingLogic() {
  const [showFloatingCTA, setShowFloatingCTA] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowFloatingCTA(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <MainSections showFloatingCTA={showFloatingCTA} />
      <ExitIntentPopup />
    </>
  );
}
