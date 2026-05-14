'use client';

import React, { useState, useEffect } from 'react';
import '../app/globals.css';
import dynamic from 'next/dynamic';
import { I18nProvider } from '@/hooks/useTranslation';

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
    <I18nProvider>
      <MainSections showFloatingCTA={showFloatingCTA} />
      <ExitIntentPopup />
    </I18nProvider>
  );
}
