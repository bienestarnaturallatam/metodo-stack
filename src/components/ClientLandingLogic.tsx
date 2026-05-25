'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { I18nProvider } from '@/hooks/useTranslation';

const MainSections = dynamic(() => import('@/components/MainSections'), {
  loading: () => <div className="min-h-screen bg-white" />
});

const ExitIntentPopup = dynamic(() => import('@/components/ExitIntentPopup'), {
  ssr: false
});

export default function ClientLandingLogic({ 
  onOpenPayment 
}: { 
  onOpenPayment: (name: string, price: string) => void 
}) {
  const [showFloatingCTA, setShowFloatingCTA] = useState(false);
  const [loadHeavy, setLoadHeavy] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowFloatingCTA(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll);
    
    // Defer rendering the 400+ nodes until AFTER the main thread has painted the Hero
    const timer = setTimeout(() => {
      setLoadHeavy(true);
    }, 100); // 100ms is enough to let the browser paint the first frame

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timer);
    };
  }, []);

  return (
    <I18nProvider>
      <div style={{ minHeight: '100vh' }}>
        {loadHeavy && (
          <MainSections 
            showFloatingCTA={showFloatingCTA} 
            onOpenPayment={onOpenPayment}
          />
        )}
      </div>
      {loadHeavy && <ExitIntentPopup />}
    </I18nProvider>
  );
}
