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

  useEffect(() => {
    const handleScroll = () => {
      setShowFloatingCTA(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <I18nProvider>
      <div>
        <MainSections 
          showFloatingCTA={showFloatingCTA} 
          onOpenPayment={onOpenPayment}
        />
      </div>
      <ExitIntentPopup />
    </I18nProvider>
  );
}
