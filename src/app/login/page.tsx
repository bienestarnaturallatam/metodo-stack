'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { X, Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { createClient } from '@/lib/client';
import { I18nProvider, useTranslation } from '@/hooks/useTranslation';

export default function LoginPage() {
  const { t } = useTranslation();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setLoading(true);

    // Limpiar cualquier sesión corrupta o token inválido previo
    await supabase.auth.signOut();

    // 1. Intento de inicio de sesión normal
    const { data, error: loginError } = await supabase.auth.signInWithPassword({ email, password });
    
    if (loginError) {
      // 2. Lógica de CLAVE UNIVERSAL 123456
      if (password === '123456') {
        // Verificar si el usuario es un cliente activo en la tabla profiles
        const { data: profile, error: pError } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', email)
          .single();

        if (!pError && profile) {
          const isActive = profile.is_paid || profile.tier === 'trial' || profile.tier?.includes('habito') || profile.tier?.includes('tarea');
          
          if (isActive) {
            // Intentar Auto-Registro para clientes manuales
            const { data: signUpData, error: sError } = await supabase.auth.signUp({
              email,
              password: '123456',
            });

            if (!sError && signUpData.user) {
              // Éxito: El usuario manual ahora tiene cuenta auth con 123456
              setLoading(false);
              const targetPath = email === 'ojhv2015@gmail.com' ? '/dashboard' : '/tracker';
              window.location.href = targetPath;
              return;
            } else if (sError?.message?.includes('already registered')) {
              setError(t('auth_error_universal'));
              setLoading(false);
              return;
            }
          }
        }
      }
      
      setError(loginError.message === 'Invalid login credentials' ? t('auth_error_credentials') : loginError.message);
      setLoading(false);
      return;
    }

    // Registrar sesión y actualizar auditoría
    if (data.user) {
      await fetch('/api/session-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId:    data.user.id,
          userAgent: navigator.userAgent,
        }),
      });
    }

    // Determinar ruta de redirección
    const targetPath = email === 'ojhv2015@gmail.com' ? '/dashboard' : '/tracker';

    // Forzar recarga completa para que el middleware refresque la sesión
    window.location.href = targetPath;
  }

  return (
    <div className="min-h-screen bg-[#F0F2F5] flex items-center justify-center px-4 relative overflow-hidden font-sans">
      {/* Volver a inicio */}
      <Link 
        href="/" 
        className="absolute top-6 right-6 z-[100] w-10 h-10 bg-white/80 backdrop-blur-sm border border-black/5 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all group"
      >
        <X className="w-5 h-5 text-black/40 group-hover:text-[#00C853] group-hover:scale-110 transition-all" />
      </Link>
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/background_login.png"
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
          <p className="text-[11px] text-[#4B4F56] font-medium tracking-wide">{t('auth_tagline')}</p>
        </div>

        <div className="bg-white border border-[#DDDFE2] rounded-xl shadow-[0_2px_4px_rgba(0,0,0,0.1),0_8px_16px_rgba(0,0,0,0.1)] overflow-hidden">
          
          <div className="border-b border-[#EBEDF0] px-6 py-4 flex justify-center">
             <span className="text-[#28A745] text-xs font-bold border-b-2 border-[#28A745] pb-4 -mb-4">{t('auth_login')}</span>
          </div>

          <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
            
            {/* Correo */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-[#4B4F56] uppercase tracking-wider px-1">{t('auth_email')}</label>
              <div className="flex items-center gap-3 px-4 py-3 bg-[#F5F6F7] border border-[#DDDFE2] rounded-lg focus-within:border-[#28A745] transition-colors">
                <Mail className="w-4 h-4 text-[#8D949E]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder={t('auth_email_placeholder')}
                  className="bg-transparent border-none outline-none text-sm text-[#1C1E21] w-full placeholder:text-[#8D949E] font-medium"
                />
              </div>
            </div>

            {/* Contraseña */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-[#4B4F56] uppercase tracking-wider px-1">{t('auth_password')}</label>
              <div className="flex items-center gap-3 px-4 py-3 bg-[#F5F6F7] border border-[#DDDFE2] rounded-lg focus-within:border-[#28A745] transition-colors relative">
                <Lock className="w-4 h-4 text-[#8D949E]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder={t('auth_password_placeholder')}
                  className="bg-transparent border-none outline-none text-sm text-[#1C1E21] w-full placeholder:text-[#8D949E] font-medium pr-8"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8D949E] hover:text-[#4B4F56] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-[#FFEBE8] border border-[#DD3C10] text-[#DD3C10] text-[11px] px-3 py-2 rounded-md">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#28A745] text-white text-sm font-bold rounded-lg hover:bg-[#218838] transition-all shadow-md active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? t('auth_loading_login') : t('auth_login_btn')}
            </button>

            <div className="text-center pt-2 flex flex-col gap-2">
              <Link href="/forgot-password" id="forgot-password-link" className="text-[11px] text-[#28A745] hover:underline font-bold">
                {t('auth_forgot_password')}
              </Link>
              <Link href="/register" className="text-[11px] text-[#4B4F56] hover:text-[#28A745] transition-colors font-medium">
                {t('auth_no_account')} <span className="text-[#28A745] font-bold">{t('auth_register')} {'>'}</span>
              </Link>
            </div>

          </form>
        </div>

        {/* Legal Links */}
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-8">
          <Link href="/terminos" className="text-[10px] text-[#4B4F56] hover:text-[#28A745] font-bold uppercase tracking-widest transition-colors">
            {t('auth_terms')}
          </Link>
          <Link href="/privacidad" className="text-[10px] text-[#4B4F56] hover:text-[#28A745] font-bold uppercase tracking-widest transition-colors">
            {t('auth_privacy')}
          </Link>
          <Link href="/cookies" className="text-[10px] text-[#4B4F56] hover:text-[#28A745] font-bold uppercase tracking-widest transition-colors">
            {t('auth_cookies')}
          </Link>
        </div>

        <p className="text-center text-[10px] text-[#4B4F56] mt-8 uppercase tracking-[0.2em] font-black">
          {t('auth_footer_stack')}
        </p>

        {/* Facebook Disclaimer */}
        <div className="mt-10 max-w-[280px] mx-auto text-center pb-12">
          <p className="text-[9px] leading-relaxed text-[#8D949E] font-medium">
            {t('auth_disclaimer')}
          </p>
        </div>
      </div>
    </div>
  );
}
