'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, Eye, EyeOff, Mail, Lock, Phone } from 'lucide-react';
import { createClient } from '@/lib/client';
import { I18nProvider, useTranslation } from '@/hooks/useTranslation';

export default function RegisterPage() {
  const { t } = useTranslation();
  const [email, setEmail]       = useState('');
  const [phone, setPhone]       = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [country, setCountry]   = useState({ code: '+51', flag: '🇵🇪' });
  const [showCountries, setShowCountries] = useState(false);

  const countries = [
    { code: '+51', flag: '🇵🇪', name: 'Perú', iso: 'PE' },
    { code: '+57', flag: '🇨🇴', name: 'Colombia', iso: 'CO' },
    { code: '+56', flag: '🇨🇱', name: 'Chile', iso: 'CL' },
    { code: '+52', flag: '🇲🇽', name: 'México', iso: 'MX' },
    { code: '+54', flag: '🇦🇷', name: 'Argentina', iso: 'AR' },
    { code: '+593', flag: '🇪🇨', name: 'Ecuador', iso: 'EC' },
    { code: '+55', flag: '🇧🇷', name: 'Brasil', iso: 'BR' },
    { code: '+1', flag: '🇺🇸', name: 'USA', iso: 'US' },
    { code: '+598', flag: '🇺🇾', name: 'Uruguay', iso: 'UY' },
    { code: '+595', flag: '🇵🇾', name: 'Paraguay', iso: 'PY' },
    { code: '+507', flag: '🇵🇦', name: 'Panamá', iso: 'PA' },
    { code: '+591', flag: '🇧🇴', name: 'Bolivia', iso: 'BO' },
    { code: '+58', flag: '🇻🇪', name: 'Venezuela', iso: 'VE' },
    { code: '+506', flag: '🇨🇷', name: 'Costa Rica', iso: 'CR' },
    { code: '+502', flag: '🇬🇹', name: 'Guatemala', iso: 'GT' },
    { code: '+503', flag: '🇸🇻', name: 'El Salvador', iso: 'SV' },
    { code: '+504', flag: '🇭🇳', name: 'Honduras', iso: 'HN' },
    { code: '+505', flag: '🇳🇮', name: 'Nicaragua', iso: 'NI' },
    { code: '+1', flag: '🇩🇴', name: 'R. Dominicana', iso: 'DO' },
    { code: '+1', flag: '🇵🇷', name: 'Puerto Rico', iso: 'PR' },
    { code: '+34', flag: '🇪🇸', name: 'España', iso: 'ES' },
  ];

  const supabase = createClient();

  useEffect(() => {
    async function detectCountry() {
      try {
        const res = await fetch('https://ipapi.co/json/');
        const data = await res.json();
        if (data.country_code) {
          const match = countries.find(c => c.iso === data.country_code);
          if (match) setCountry({ code: match.code, flag: match.flag });
        }
      } catch (e) {
        console.error('Error detectando país:', e);
      }
    }
    detectCountry();
  }, []);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setLoading(true);

    // Limpiar sesión corrupta previa
    await supabase.auth.signOut();

    // 1. Registro en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (authData.user) {
      // 2. Insertar perfil con tier 'trial' y 3 días de prueba
      const now     = new Date();
      const expires = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

      const res = await fetch('https://ipapi.co/json/');
      const geoData = await res.json();
      const detected_country = geoData.country_code || 'PE';
      const detected_lang = detected_country === 'US' ? 'en' : detected_country === 'BR' ? 'pt' : 'es';

      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: authData.user.id,
          email,
          phone_number: `${country.code}${phone}`,
          country_code: detected_country,
          detected_lang: detected_lang,
          tier: 'trial',
          is_paid: false,
          trial_starts_at: now.toISOString(),
          plan_starts_at:  now.toISOString(),
          plan_expires_at: expires.toISOString(),
        });


      if (profileError) {
        console.error('Error creating profile:', profileError);
        setError('Error al crear perfil: ' + profileError.message);
        setLoading(false);
        return;
      }
      
      console.log('Perfil creado con éxito para:', email);


      // Registrar sesión inicial para auditoría
      await fetch('/api/session-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId:    authData.user.id,
          userAgent: navigator.userAgent,
        }),
      });

      // Redirección completa para refrescar sesión
      window.location.href = '/tracker?new=true';
    }
  }

  return (
    <div className="min-h-screen bg-[#F0F2F5] flex items-center justify-center px-4 relative overflow-hidden font-sans text-[#1C1E21]">
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

        <div className="bg-white border border-[#DDDFE2] rounded-xl shadow-[0_2px_4px_rgba(0,0,0,0.1),0_8px_16px_rgba(0,0,0,0.1)] overflow-visible">
          
          <div className="border-b border-[#EBEDF0] px-6 py-4 flex justify-center gap-8">
             <Link href="/login" className="text-[#8D949E] text-xs font-bold hover:text-[#4B4F56]">{t('auth_login')}</Link>
             <span className="text-[#28A745] text-xs font-bold border-b-2 border-[#28A745] pb-4 -mb-4">{t('auth_register')}</span>
          </div>

          <form onSubmit={handleRegister} className="p-6 flex flex-col gap-5">
            
            {/* Teléfono FIRST */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-[#4B4F56] uppercase tracking-wider px-1">{t('auth_phone')}</label>
              <div className="flex items-center bg-[#F5F6F7] border border-[#DDDFE2] rounded-lg focus-within:border-[#28A745] transition-colors relative">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowCountries(!showCountries)}
                    className="flex items-center gap-1 px-3 py-3 hover:bg-black/5 transition-colors border-r border-[#DDDFE2] rounded-l-lg"
                  >
                    <span className="text-sm">{country.flag}</span>
                    <span className="text-[13px] font-bold text-[#4B4F56]">{country.code}</span>
                    <svg className="w-3 h-3 text-[#8D949E]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  {showCountries && (
                    <div className="absolute top-full left-0 mt-1 bg-white border border-[#DDDFE2] rounded-lg shadow-xl z-[999] w-48 max-h-48 overflow-y-auto">
                      {countries.map(c => (
                        <button
                          key={c.code}
                          type="button"
                          onClick={() => { setCountry(c); setShowCountries(false); }}
                          className="w-full flex items-center gap-3 px-4 py-2 hover:bg-[#F5F6F7] text-left text-xs font-semibold text-[#4B4F56]"
                        >
                          <span>{c.flag}</span>
                          <span>{c.name} ({c.code})</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-1 px-3">
                  <Phone className="w-4 h-4 text-[#28A745]" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder={t('auth_phone_placeholder')}
                    className="bg-transparent border-none outline-none text-sm text-[#1C1E21] w-full placeholder:text-[#8D949E] font-medium"
                  />
                </div>
              </div>
            </div>
            
            {/* Correo SECOND */}
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
                  minLength={6}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder={t('auth_password_min')}
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
              {loading ? t('auth_loading_register') : t('auth_trial_btn')}
            </button>

            <div className="text-center pt-2">
              <Link href="/login" className="text-[11px] text-[#4B4F56] hover:text-[#28A745] transition-colors font-medium">
                {t('auth_already_account')} <span className="text-[#28A745] font-bold">{t('auth_login_btn')} {'>'}</span>
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
