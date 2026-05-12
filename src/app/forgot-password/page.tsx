'use client';
import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/client';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/update-password`,
    });

    if (resetError) {
      setError(resetError.message);
    } else {
      setMessage('Si el correo es correcto, recibirás un enlace para cambiar tu contraseña en unos minutos.');
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-[#F0F2F5] flex items-center justify-center px-4 relative overflow-hidden font-sans">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/background_login.webp"
          alt="Background"
          className="w-full h-full object-cover opacity-100"
          loading="eager"
        />
      </div>
      {/* Light Overlay with Blur */}
      <div className="absolute inset-0 z-0 bg-white/70 backdrop-blur-[2px]" />

      <div className="w-full max-w-sm relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col items-center gap-1 mb-8 text-center">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-[#28A745] rounded-full" />
            <h1 className="text-[18px] font-bold tracking-tight text-[#1C1E21]">MÉTODO STACK</h1>
          </div>
          <p className="text-[11px] text-[#4B4F56] font-medium tracking-wide">Recuperar Contraseña</p>
        </div>

        <div className="bg-white border border-[#DDDFE2] rounded-xl shadow-[0_2px_4px_rgba(0,0,0,0.1),0_8px_16px_rgba(0,0,0,0.1)] overflow-hidden">
          
          <div className="border-b border-[#EBEDF0] px-6 py-4 flex justify-center">
             <span className="text-[#28A745] text-xs font-bold border-b-2 border-[#28A745] pb-4 -mb-4">Olvide mi contraseña</span>
          </div>

          <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
            <p className="text-[12px] text-[#4B4F56] text-center mb-2">
              Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
            </p>
            
            {/* Correo */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-[#4B4F56] uppercase tracking-wider px-1">Correo</label>
              <div className="flex items-center gap-3 px-4 py-3 bg-[#F5F6F7] border border-[#DDDFE2] rounded-lg focus-within:border-[#28A745] transition-colors">
                <svg className="w-4 h-4 text-[#8D949E]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <input
                  type="email"
                  id="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  className="bg-transparent border-none outline-none text-sm text-[#1C1E21] w-full placeholder:text-[#8D949E] font-medium"
                />
              </div>
            </div>

            {error && (
              <div className="bg-[#FFEBE8] border border-[#DD3C10] text-[#DD3C10] text-[11px] px-3 py-2 rounded-md">
                {error}
              </div>
            )}

            {message && (
              <div className="bg-[#E7F3FF] border border-[#1877F2] text-[#1877F2] text-[11px] px-3 py-2 rounded-md text-center">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              id="reset-submit"
              className="w-full py-3 bg-[#28A745] text-white text-sm font-bold rounded-lg hover:bg-[#218838] transition-all shadow-md active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
            </button>

            <div className="text-center pt-2">
              <Link href="/login" className="text-[11px] text-[#4B4F56] hover:text-[#28A745] transition-colors font-medium">
                 Volver al <span className="text-[#28A745] font-bold">Inicio de sesión</span>
              </Link>
            </div>

          </form>
        </div>

        <p className="text-center text-[10px] text-[#4B4F56] mt-8 uppercase tracking-[0.2em] font-black">
          STACK · TU SISTEMA DE HÁBITOS Y TAREAS
        </p>
      </div>
    </div>
  );
}
