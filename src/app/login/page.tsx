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
      // 2. Lógica de CLAVE UNIVERSAL (EXCLUSIVA: Mstack07)
      if (password === 'Mstack07') {
        // Verificar si el usuario es un cliente activo en la tabla profiles
        const { data: profile, error: pError } = await supabase
          .from('profiles')
          .select('*')
          .ilike('email', email)
          .single();

        if (!pError && profile) {
          const lowerEmail = email.toLowerCase();
          const isAdmin = lowerEmail === 'ojhv2015@gmail.com' || lowerEmail === 'metodostack@gmail.com';
          const isActive = profile.is_paid || isAdmin; // ADMINS SIEMPRE ACTIVOS
          
          if (isActive) {
            const { data: signUpData, error: sError } = await supabase.auth.signUp({
              email,
              password: password, // Usar la clave ingresada (Mstack07)
            });

            if (!sError && signUpData.user) {
              setLoading(false);
              const lowerEmailFinal = email.toLowerCase();
              const isAdminFinal = lowerEmailFinal === 'ojhv2015@gmail.com' || lowerEmailFinal === 'metodostack@gmail.com';
              const targetPath = isAdminFinal ? '/dashboard' : '/tracker';
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
        body: JSON.stringify({ userId: data.user.id, email: data.user.email })
      });
    }

    // Determinar ruta de redirección
    const lowerEmailRedir = email.toLowerCase();
    const isAdminRedir = lowerEmailRedir === 'ojhv2015@gmail.com' || lowerEmailRedir === 'metodostack@gmail.com';
    const targetPath = isAdminRedir ? '/dashboard' : '/tracker';

    // Forzar recarga completa para que el middleware refresque la sesión
    window.location.href = targetPath;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-cover bg-center bg-no-repeat relative" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?q=80&w=2072&auto=format&fit=crop")' }}>
      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm"></div>
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center mb-4">
          <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse mr-2 mt-1.5"></div>
          <h2 className="text-center text-xl font-bold tracking-tight text-slate-900">
            {t('onboarding_title')}
          </h2>
        </div>
        <p className="text-center text-xs text-slate-500 font-medium">
          {t('auth_tagline')}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white py-8 px-4 shadow-2xl sm:rounded-xl sm:px-10 border border-slate-100">
          <div className="mb-6 text-center">
            <h1 className="text-emerald-600 font-bold text-sm uppercase tracking-widest border-b-2 border-emerald-500 pb-2 inline-block">
              {t('auth_login')}
            </h1>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-xs font-bold text-slate-700 uppercase tracking-tighter mb-2">
                {t('auth_email')}
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-slate-400" aria-hidden="true" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent sm:text-sm transition-all bg-slate-50/50"
                  placeholder={t('auth_email_placeholder')}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold text-slate-700 uppercase tracking-tighter mb-2">
                {t('auth_password')}
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-400" aria-hidden="true" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent sm:text-sm transition-all bg-slate-50/50"
                  placeholder={t('auth_password_placeholder')}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-slate-600 focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <Eye className="h-4 w-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-3 border border-red-200">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <X className="h-4 w-4 text-red-400" aria-hidden="true" />
                  </div>
                  <div className="ml-3">
                    <p className="text-xs font-medium text-red-800">
                      {error}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all uppercase tracking-widest"
              >
                {loading ? t('auth_loading_login') : t('auth_login_btn')}
              </button>
            </div>
          </form>

          <div className="mt-6 flex flex-col space-y-4">
            <div className="text-center">
              <Link href="/forgot-password" title={t('auth_forgot_password')} className="text-xs font-bold text-emerald-600 hover:text-emerald-500 transition-colors uppercase tracking-tight">
                {t('auth_forgot_password')}
              </Link>
            </div>
            <div className="text-center text-xs">
              <span className="text-slate-500 font-medium">{t('auth_no_account')} </span>
              <Link href="/register" title={t('auth_register')} className="font-bold text-emerald-600 hover:text-emerald-500 transition-colors">
                {t('auth_register')} ›
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center space-x-4">
          <Link href="/terminos" title={t('auth_terms')} className="text-[10px] font-bold text-slate-500 hover:text-slate-700 uppercase tracking-widest transition-colors">
            {t('auth_terms')}
          </Link>
          <Link href="/privacidad" title={t('auth_privacy')} className="text-[10px] font-bold text-slate-500 hover:text-slate-700 uppercase tracking-widest transition-colors">
            {t('auth_privacy')}
          </Link>
          <Link href="/cookies" title={t('auth_cookies')} className="text-[10px] font-bold text-slate-500 hover:text-slate-700 uppercase tracking-widest transition-colors">
            {t('auth_cookies')}
          </Link>
        </div>

        <div className="mt-6 text-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">
            {t('auth_footer_stack')}
          </p>
          <p className="text-[8px] leading-relaxed text-slate-400 px-4">
            {t('auth_disclaimer')}
          </p>
        </div>
      </div>
    </div>
  );
}
