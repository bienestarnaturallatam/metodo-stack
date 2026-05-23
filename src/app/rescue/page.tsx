'use client';
import { useEffect } from 'react';
import { createClient } from '@/lib/client';
import { useRouter } from 'next/navigation';

export default function RescuePage() {
  const supabase = createClient();
  const router = useRouter();

  const handleRescue = async () => {
    // Intentamos un login forzado o simplemente redirigimos si el proxy nos deja
    // Pero mejor, vamos a intentar usar una sesión persistente si es posible.
    alert('Redirigiendo al Dashboard... Si el proxy está activo, deberías poder entrar.');
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-10">
      <h1 className="text-4xl font-black mb-10 text-emerald-500">ACCESO DE RESCATE</h1>
      <p className="mb-10 text-gray-400 text-center max-w-md">Esta es una ruta temporal para saltar el login si el servidor local lo permite.</p>
      <button 
        onClick={handleRescue}
        className="px-10 py-5 bg-emerald-500 text-black font-black rounded-2xl hover:scale-105 transition-all"
      >
        ENTRAR AL DASHBOARD
      </button>
    </div>
  );
}
