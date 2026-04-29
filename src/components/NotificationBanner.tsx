'use client';
import { useState, useEffect } from 'react';
import { usePushSubscription } from '@/hooks/useTracker';

const NEXT_PUBLIC_VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function NotificationBanner({ streak }: { streak: number }) {
  const [show, setShow] = useState(false);
  const { saveSubscription } = usePushSubscription();

  useEffect(() => {
    async function checkPermission() {
      if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window) {
        if (Notification.permission === 'default') {
          setShow(true);
        } else if (Notification.permission === 'granted') {
          // If already granted, try to ensure we have a valid subscription in Supabase
          try {
            const registration = await navigator.serviceWorker.ready;
            let subscription = await registration.pushManager.getSubscription();
            if (!subscription) {
              subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(NEXT_PUBLIC_VAPID_PUBLIC_KEY)
              });
            }
            await saveSubscription(subscription);
          } catch (e) {
            console.error('Error syncing existing subscription:', e);
          }
        }
      }
    }
    checkPermission();
  }, []);

  const handleSubscribe = async () => {
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        const registration = await navigator.serviceWorker.register('/sw.js');
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(NEXT_PUBLIC_VAPID_PUBLIC_KEY)
        });
        await saveSubscription(subscription);
        setShow(false);
        alert('¡Notificaciones activadas con éxito! Te avisaremos a las 8 AM.');
      } else {
        setShow(false);
      }
    } catch (err) {
      console.error('Failed to subscribe:', err);
      alert('Hubo un error al activar las notificaciones.');
    }
  };

  if (!show) return null;

  return (
    <div className="bg-[#3a7bc8] text-white p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <span className="text-2xl">☕</span>
        <p className="text-sm font-medium">
          ¿Quieres que el Método Stack te recuerde tu racha de {streak} días a las 8 AM? Activa las notificaciones.
        </p>
      </div>
      <div className="flex gap-2">
        <button 
          onClick={() => setShow(false)} 
          className="px-4 py-2 text-xs font-bold text-white/80 hover:text-white transition-colors"
        >
          Ahora no
        </button>
        <button 
          onClick={handleSubscribe} 
          className="px-4 py-2 bg-white text-[#3a7bc8] text-xs font-black rounded hover:bg-white/90 transition-colors"
        >
          Activar
        </button>
      </div>
    </div>
  );
}
