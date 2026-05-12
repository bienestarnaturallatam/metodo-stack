'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/client';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    
    setLoading(true);
    setError('');

    const { error: updateError } = await supabase.auth.updateUser({
      password: password
    });

    if (updateError) {
      setError(updateError.message);
    } else {
      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 3000);
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
          <p className="text-[11px] text-[#4B4F56] font-medium tracking-wide">Nueva Contraseña</p>
        </div>

        <div className="bg-white border border-[#DDDFE2] rounded-xl shadow-[0_2px_4px_rgba(0,0,0,0.1),0_8px_16px_rgba(0,0,0,0.1)] overflow-hidden">
          
          <div className="border-b border-[#EBEDF0] px-6 py-4 flex justify-center">
             <span className="text-[#28A745] text-xs font-bold border-b-2 border-[#28A745] pb-4 -mb-4">Restablecer clave</span>
          </div>

          <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
            <p className="text-[12px] text-[#4B4F56] text-center mb-2">
              Ingresa tu nueva contraseña para acceder a tu cuenta.
            </p>
            
            {/* Nueva Contraseña */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-[#4B4F56] uppercase tracking-wider px-1">Nueva Contraseña</label>
              <div className="flex items-center gap-3 px-4 py-3 bg-[#F5F6F7] border border-[#DDDFE2] rounded-lg focus-within:border-[#28A745] transition-colors relative">
                <svg className="w-4 h-4 text-[#8D949E]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="new-password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="********"
                  className="bg-transparent border-none outline-none text-sm text-[#1C1E21] w-full placeholder:text-[#8D949E] font-medium pr-8"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8D949E] hover:text-[#4B4F56] transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Confirmar Contraseña */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-[#4B4F56] uppercase tracking-wider px-1">Confirmar Contraseña</label>
              <div className="flex items-center gap-3 px-4 py-3 bg-[#F5F6F7] border border-[#DDDFE2] rounded-lg focus-within:border-[#28A745] transition-colors relative">
                <svg className="w-4 h-4 text-[#8D949E]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="confirm-password"
                  required
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="********"
                  className="bg-transparent border-none outline-none text-sm text-[#1C1E21] w-full placeholder:text-[#8D949E] font-medium pr-8"
                />
              </div>
            </div>

            {error && (
              <div className="bg-[#FFEBE8] border border-[#DD3C10] text-[#DD3C10] text-[11px] px-3 py-2 rounded-md">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-[#E7F3FF] border border-[#1877F2] text-[#1877F2] text-[11px] px-3 py-2 rounded-md text-center">
                ¡Contraseña actualizada! Redirigiendo al login...
              </div>
            )}

            <button
              type="submit"
              disabled={loading || success}
              id="save-password-btn"
              className="w-full py-3 bg-[#28A745] text-white text-sm font-bold rounded-lg hover:bg-[#218838] transition-all shadow-md active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Guardar nueva contraseña'}
            </button>

          </form>
        </div>

        <p className="text-center text-[10px] text-[#4B4F56] mt-8 uppercase tracking-[0.2em] font-black">
          STACK · TU SISTEMA DE HÁBITOS Y TAREAS
        </p>
      </div>
    </div>
  );
}
