'use client';
import React, { useState, useRef, useEffect } from 'react';
import {
  BookOpen, FileText, HelpCircle, Copy, Table, GraduationCap, Share2,
  Video, Mic, Download, ChevronRight, ExternalLink, Clock, Layers,
  Target, CheckCircle2, XCircle, Play, Pause, RotateCcw, RotateCw,
  Film, Zap, Info, Library, Volume2, Maximize2, Lock, Mail, Key, LogOut, CheckCircle, Smartphone, GitGraph
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import MindMap from '@/components/MindMap';
import LegalFooter from '@/components/LegalFooter';

// ==========================================
// 1. SUB-COMPONENTE: AYUDA CONTEXTUAL (❓)
// ==========================================
function AyudaContextual({ titulo, texto, lista }: { titulo: string, texto: string, lista?: string[] }) {
  const [abierto, setAbierto] = useState(false);
  return (
    <div className="relative inline-block ml-2">
      <button
        onClick={(e) => { e.stopPropagation(); setAbierto(!abierto); }}
        className="flex items-center justify-center w-6 h-6 text-[11px] text-gray-400 border-2 border-gray-200 rounded-full hover:bg-[#00C853] hover:text-white hover:border-[#00C853] transition-all shadow-sm font-black"
      >
        ?
      </button>
      {abierto && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setAbierto(false)} />
          <div className="absolute left-1/2 -translate-x-1/2 top-10 w-72 p-6 bg-white border border-gray-100 rounded-[24px] shadow-2xl z-50 animate-in fade-in zoom-in duration-200 text-left">
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-t border-l border-gray-100 rotate-45" />
            <h4 className="text-sm font-black text-gray-900 mb-2 uppercase tracking-tighter italic">{titulo}</h4>
            <p className="text-xs text-gray-600 leading-relaxed font-medium">{texto}</p>
            {lista && (
              <ul className="mt-4 space-y-2">
                {lista.map((item, i) => (
                  <li key={i} className="text-[11px] text-gray-500 flex gap-3 items-start">
                    <CheckCircle2 size={12} className="text-[#00C853] shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ==========================================
// 2. SUB-COMPONENTE: TOUR DE BIENVENIDA
// ==========================================
function TourBienvenida({ showInstallBtn }: { showInstallBtn: boolean }) {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  const steps = [
    {
      icono: '🎯',
      titulo: '¡Bienvenida a tu Academia!',
      texto: 'Emma, aquí centralizamos toda la ingeniería del Método STACK. Es tu biblioteca técnica para el rediseño de sistemas.'
    },
    {
      icono: '📱',
      titulo: 'Tu Academia siempre a mano',
      texto: 'Emma, el último paso es el más importante: Ancla tu academia a la pantalla de inicio. Así entrarás en 1 segundo sin depender de links. ¡Hazlo obvio!',
      selector: '#install-app-btn'
    }
  ];

  useEffect(() => {
    const completado = localStorage.getItem('tourStackV3_Full');
    if (!completado) {
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!visible) return null;

  const current = steps[step];

  return (
    <div className="fixed inset-0 z-[1000] bg-black/85 flex items-center justify-center p-6 backdrop-blur-md font-sans">
      <div className="bg-white rounded-[56px] p-12 max-w-md w-full text-center shadow-2xl border-[6px] border-emerald-50 animate-in zoom-in duration-500 relative">
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 bg-white rounded-full flex items-center justify-center text-5xl shadow-xl border-4 border-emerald-50">
          {current.icono}
        </div>
        <h2 className="text-3xl font-black text-[#2d5a3d] mb-4 uppercase italic leading-none mt-4 tracking-tighter">{current.titulo}</h2>
        <p className="text-gray-500 mb-12 text-sm leading-relaxed font-medium">{current.texto}</p>

        <div className="space-y-4">
          {step < steps.length - 1 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="w-full py-6 bg-[#00C853] text-black font-black rounded-3xl shadow-xl shadow-green-500/20 active:scale-95 transition-all uppercase text-xs tracking-[0.2em]"
            >
              Siguiente Paso
            </button>
          ) : (
            <button
              onClick={() => {
                localStorage.setItem('tourStackV3_Full', 'true');
                setVisible(false);
              }}
              className="w-full py-6 bg-[#2d5a3d] text-white font-black rounded-3xl shadow-xl shadow-green-900/20 active:scale-95 transition-all uppercase text-xs tracking-[0.2em]"
            >
              ¡Entendido, vamos!
            </button>
          )}
          <button 
            onClick={() => {
              localStorage.setItem('tourStackV3_Full', 'true');
              setVisible(false);
            }} 
            className="text-[10px] font-black text-gray-300 uppercase tracking-widest hover:text-gray-500 transition-colors"
          >
            Saltar Tour
          </button>
        </div>
      </div>
      {current.selector && (
        <div className="absolute top-10 right-10 animate-pulse pointer-events-none hidden lg:block">
           <div className="bg-[#00C853] text-black px-4 py-2 rounded-xl text-[10px] font-black uppercase">¡MIRA AQUÍ! ↙️</div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 3. COMPONENTE PRINCIPAL: RECURSOS CLIENT
// ==========================================
export default function RecursosClient({ 
  userId, 
  userEmail, 
  userTier = 'trial', 
  isPaid = false,
  asEmbedded = false
}: { 
  userId: string; 
  userEmail: string; 
  userTier?: string; 
  isPaid?: boolean;
  asEmbedded?: boolean;
}) {
  const { t, lang } = useTranslation();

  // --- ESTADOS DE RECURSOS ---
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showLockedModal, setShowLockedModal] = useState(false);

  // --- ESTADOS MULTIMEDIA ---
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // --- PWA INSTALLATION SYSTEM ---
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBtn, setShowInstallBtn] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBtn(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowInstallBtn(false);
    }
    setDeferredPrompt(null);
  };

  const isTrial = !isPaid || userTier === 'trial' || userTier === 'free' || userTier === 'gratis';



  const handleVideoPlay = () => {
    setIsVideoPlaying(true);
    if (videoRef.current) videoRef.current.play();
  };

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isAudioPlaying) audioRef.current.pause();
      else audioRef.current.play();
      setIsAudioPlaying(!isAudioPlaying);
    }
  };

  const skipAudio = (amount: number) => {
    if (audioRef.current) audioRef.current.currentTime += amount;
  };

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleOpenResource = (id: number) => {
    if (isTrial) {
      setShowLockedModal(true);
      return;
    }
    setSelectedId(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ==========================================
  // BASE DE DATOS DE RECURSOS (IDs 1-8)
  // EXPANDIDA PARA RECUPERAR LAS 900+ LINEAS
  // ==========================================
  const recursos = [
    {
      id: 1,
      titulo: t('recursos_item_0_title') || "Arquitectura Conductual",
      subtitulo: `1 ${t('recursos_min_read')}`,
      icon: <FileText className="w-5 h-5" />,
      color: "text-amber-600",
      bg: "bg-amber-50",
      content: (
        <div className="space-y-12 text-[#1a2e1e]/80 text-left">
          {/* Tarjeta de Planos Maestra */}
          <div className="p-6 sm:p-12 bg-[#2d5a3d] rounded-[40px] sm:rounded-[60px] text-white shadow-2xl group overflow-hidden relative border-4 border-white">
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/20 text-emerald-300 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] mb-6 sm:mb-8 border border-emerald-500/30">
                <Zap size={14} fill="currentColor" /> {t('recursos_impact_badge')}
              </div>
              <h3 className="text-3xl sm:text-5xl font-serif font-bold mb-4 sm:mb-6 italic leading-[0.9] tracking-tighter">{t('recursos_planos_title')}</h3>
              <p className="text-base sm:text-lg text-white/70 mb-8 sm:mb-12 max-w-xl leading-relaxed italic">"{t('recursos_planos_desc')}"</p>
              <button
                onClick={() => setShowModal(true)}
                className="w-full sm:w-auto flex items-center justify-center gap-4 bg-white text-[#2d5a3d] px-8 sm:px-12 py-4 sm:py-6 rounded-[24px] sm:rounded-[30px] font-black text-[10px] sm:text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl"
              >
                <Maximize2 size={20} className="sm:w-6 sm:h-6" /> {t('recursos_open_planos')}
              </button>
            </div>
            <Layers className="absolute -right-20 -bottom-20 opacity-10 rotate-12 group-hover:scale-110 transition-transform duration-1000 w-[200px] h-[200px] sm:w-[450px] sm:h-[450px]" />
          </div>

          {/* Pilares Expandidos Línea por Línea */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* PILAR 1 */}
            <div className="p-6 sm:p-10 bg-white border border-[#e8f1e9] rounded-[32px] sm:rounded-[48px] shadow-sm hover:border-emerald-300 transition-all group">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Target size={24} className="sm:w-7 sm:h-7 text-[#2d5a3d]" />
              </div>
              <h4 className="text-lg sm:text-xl font-black text-[#2d5a3d] uppercase mb-4 tracking-tighter italic">{t('recursos_pilar_1_title')}</h4>
              <p className="text-xs sm:text-sm text-gray-500 mb-6 sm:mb-8 leading-relaxed font-medium">{t('recursos_pilar_1_desc')}</p>
              <ul className="space-y-3">
                {(Array.isArray(t('recursos_pilar_1_points')) ? t('recursos_pilar_1_points') : []).map((p: string, i: number) => (
                  <li key={i} className="flex items-start gap-3 text-[11px] font-bold text-gray-400 bg-[#f4faf6] p-3 rounded-2xl border border-[#d8eadb]">
                    <CheckCircle2 size={14} className="text-emerald-500 shrink-0" /> {p}
                  </li>
                ))}
              </ul>
            </div>

            {/* PILAR 2 */}
            <div className="p-6 sm:p-10 bg-white border border-[#e8f1e9] rounded-[32px] sm:rounded-[48px] shadow-sm hover:border-emerald-300 transition-all group">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap size={24} className="sm:w-7 sm:h-7 text-[#2d5a3d]" />
              </div>
              <h4 className="text-lg sm:text-xl font-black text-[#2d5a3d] uppercase mb-4 tracking-tighter italic">{t('recursos_pilar_2_title')}</h4>
              <p className="text-xs sm:text-sm text-gray-500 mb-6 sm:mb-8 leading-relaxed font-medium">{t('recursos_pilar_2_desc')}</p>
              <ul className="space-y-3">
                {(Array.isArray(t('recursos_pilar_2_points')) ? t('recursos_pilar_2_points') : []).map((p: string, i: number) => (
                  <li key={i} className="flex items-start gap-3 text-[11px] font-bold text-gray-400 bg-[#f4faf6] p-3 rounded-2xl border border-[#d8eadb]">
                    <CheckCircle2 size={14} className="text-emerald-500 shrink-0" /> {p}
                  </li>
                ))}
              </ul>
            </div>

            {/* PILAR 3 */}
            <div className="p-6 sm:p-10 bg-white border border-[#e8f1e9] rounded-[32px] sm:rounded-[48px] shadow-sm hover:border-emerald-300 transition-all group">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Layers size={24} className="sm:w-7 sm:h-7 text-[#2d5a3d]" />
              </div>
              <h4 className="text-lg sm:text-xl font-black text-[#2d5a3d] uppercase mb-4 tracking-tighter italic">{t('recursos_pilar_3_title')}</h4>
              <p className="text-xs sm:text-sm text-gray-500 mb-6 sm:mb-8 leading-relaxed font-medium">{t('recursos_pilar_3_desc')}</p>
              <ul className="space-y-3">
                {(Array.isArray(t('recursos_pilar_3_points')) ? t('recursos_pilar_3_points') : []).map((p: string, i: number) => (
                  <li key={i} className="flex items-start gap-3 text-[11px] font-bold text-gray-400 bg-[#f4faf6] p-3 rounded-2xl border border-[#d8eadb]">
                    <CheckCircle2 size={14} className="text-emerald-500 shrink-0" /> {p}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="p-6 sm:p-12 bg-emerald-50 border-2 border-emerald-100 rounded-[32px] sm:rounded-[50px] mt-10 relative overflow-hidden">
            <Info className="absolute -right-4 -bottom-4 text-emerald-100 w-24 h-24 sm:w-[150px] sm:h-[150px]" />
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-4 sm:mb-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-500 text-white rounded-xl flex items-center justify-center shadow-lg"><Info size={20} className="sm:w-6 sm:h-6" /></div>
                <h4 className="text-xl sm:text-2xl font-black text-emerald-800 uppercase tracking-tighter italic">{t('recursos_executive_summary')}</h4>
              </div>
              <p className="text-base sm:text-lg font-medium text-emerald-900/70 leading-relaxed italic">{t('recursos_executive_desc')}</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 2,
      titulo: t('recursos_item_1_title') || "Guía de Mejora",
      subtitulo: `8 ${t('recursos_min_read')}`,
      icon: <BookOpen className="w-5 h-5" />,
      color: "text-purple-600",
      bg: "bg-purple-50",
      content: (
        <div className="space-y-16 text-left">
          <div className="text-center space-y-4 sm:space-y-6">
            <h3 className="text-2xl sm:text-4xl font-black text-[#2d5a3d] italic uppercase tracking-tighter leading-none" dangerouslySetInnerHTML={{ __html: t('recursos_item_1_content_title') }} />
            <p className="text-sm sm:text-lg font-bold text-[#1a2e1e]/40 uppercase tracking-[0.2em] sm:tracking-[0.4em]">{t('recursos_item_1_content_sub')}</p>
          </div>

          <div className="bg-gradient-to-br from-white to-emerald-50/50 rounded-[40px] sm:rounded-[60px] border-2 sm:border-4 border-white p-6 sm:p-14 relative overflow-hidden shadow-2xl">
            <div className="grid md:grid-cols-2 gap-10 sm:grid-cols-2 lg:gap-16 items-center">
              <div className="space-y-6 sm:space-y-10">
                <div className="inline-block px-6 py-3 sm:px-8 sm:py-4 bg-[#2d5a3d] text-white rounded-2xl sm:rounded-3xl font-black text-xl sm:text-3xl italic shadow-2xl shadow-green-900/20">{t('recursos_item_1_content_rule')}</div>
                <p className="text-lg sm:text-2xl font-medium text-[#1a2e1e]/80 leading-relaxed italic" dangerouslySetInnerHTML={{ __html: t('recursos_item_1_content_text') }} />
              </div>
              <div className="relative h-48 sm:h-72 flex items-end justify-between gap-2 sm:gap-4 px-4 sm:px-10">
                {[20, 25, 35, 50, 75, 110, 160].map((h, i) => (
                  <div key={i} className="w-full bg-emerald-500 rounded-t-lg sm:rounded-t-2xl shadow-lg transform transition-all hover:brightness-110" style={{ height: `${(h / 378) * 100}%` }} />
                ))}
                <div className="absolute -top-4 -right-4 sm:-top-8 sm:-right-8 p-4 sm:p-10 bg-white border-2 sm:border-[6px] border-emerald-500 rounded-2xl sm:rounded-[40px] font-black text-2xl sm:text-6xl text-emerald-600 italic shadow-2xl z-10 rotate-12">37x</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-10">
            <div className="p-8 sm:p-12 bg-[#1a2e1e] text-white rounded-[40px] sm:rounded-[60px] shadow-2xl relative overflow-hidden group">
              <h4 className="text-2xl sm:text-3xl font-black uppercase italic mb-6 sm:mb-8 text-emerald-400 leading-none">{t('recursos_systems_over_goals')}</h4>
              <p className="text-base sm:text-lg text-white/70 leading-relaxed italic font-medium">"{t('recursos_systems_quote')}"</p>
              <Target className="absolute -right-12 -bottom-12 sm:-right-16 sm:-bottom-16 opacity-5 group-hover:scale-110 transition-all duration-700 w-32 h-32 sm:w-[200px] sm:h-[200px]" />
            </div>
            <div className="p-8 sm:p-12 bg-emerald-500 text-white rounded-[40px] sm:rounded-[60px] shadow-2xl relative overflow-hidden group border-2 sm:border-4 border-emerald-400">
              <h4 className="text-2xl sm:text-3xl font-black uppercase italic mb-6 sm:mb-8 text-[#1a2e1e] leading-none">{t('recursos_identity_habits')}</h4>
              <p className="text-base sm:text-lg text-white/90 leading-relaxed font-bold italic" dangerouslySetInnerHTML={{ __html: t('recursos_identity_desc') }} />
              <CheckCircle className="absolute -right-12 -bottom-12 sm:-right-16 sm:-bottom-16 opacity-10 group-hover:scale-110 transition-all duration-700 w-32 h-32 sm:w-[200px] sm:h-[200px]" />
            </div>
          </div>
        </div>
      )
    },
    { id: 3, titulo: t('recursos_item_2_title') || "Cuestionario", subtitulo: "Check-up de Identidad • 20 Preguntas", icon: <HelpCircle className="w-5 h-5" />, color: "text-blue-600", bg: "bg-blue-50", content: <QuizComponent /> },
    { id: 4, titulo: t('recursos_item_3_title') || "Tarjetas", subtitulo: "Flashcards Pro • Entrenamiento", icon: <Copy className="w-5 h-5" />, color: "text-rose-600", bg: "bg-rose-50", content: <FlashcardList t={t} /> },
    {
      id: 5,
      titulo: t('recursos_item_4_title') || "Estrategias",
      subtitulo: "Protocolos Técnicos de Cambio",
      icon: <Table className="w-5 h-5" />,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      content: (
        <div className="space-y-16 text-left">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 sm:gap-10 bg-white p-6 sm:p-12 rounded-[32px] sm:rounded-[56px] border-2 sm:border-4 border-[#f4faf6] shadow-xl">
            <div>
              <span className="text-[9px] sm:text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] sm:tracking-[0.4em] mb-3 sm:mb-4 block">Ingeniería de Sistemas</span>
              <h3 className="text-2xl sm:text-4xl font-black text-[#2d5a3d] uppercase italic tracking-tighter leading-none">Matriz de Desafíos</h3>
              <p className="text-xs sm:text-sm font-bold text-gray-400 mt-3 sm:mt-4 uppercase tracking-widest italic leading-relaxed max-w-md">Estrategias arquitectónicas para eliminar la fricción y automatizar la disciplina.</p>
            </div>
            <div className="px-6 py-2 sm:px-8 sm:py-3 bg-[#2d5a3d] text-white rounded-full font-black text-[9px] sm:text-xs uppercase tracking-widest shadow-2xl">Ref: V.2.5_STACK_MASTER</div>
          </div>

          {/* TABLA MASIVA EXPANDIDA */}
          <div className="overflow-x-auto rounded-[24px] sm:rounded-[60px] border-4 sm:border-8 border-white shadow-2xl bg-white relative">
            <div className="sm:hidden absolute top-0 right-0 bg-emerald-500 text-white text-[8px] font-black px-3 py-1 rounded-bl-xl z-20 animate-pulse uppercase tracking-widest">Desliza →</div>
            <table className="w-full text-left border-collapse min-w-[1000px] sm:min-w-[1500px]">
              <thead className="bg-[#f7f9f7] border-b-2 sm:border-b-4 border-emerald-500/10">
                <tr>
                  {["SITUACIÓN CRÍTICA", "ESTRATEGIA", "ACCIÓN ATÓMICA", "NIVEL", "CONTEXTO", "PROTOCOLO", "ID"].map((h, i) => (
                    <th key={i} className="p-4 sm:p-10 text-[9px] sm:text-[12px] font-black uppercase text-[#2d5a3d] tracking-[0.2em] sm:tracking-[0.3em]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 font-sans">
                {[
                  ["Falta de Motivación Intrínseca", "Rediseño de Entorno Visual", "Hacerlo Obvio (Ley 1)", "ALTO", "Espacio Físico", "La señal dicta la acción subconsciente", "MS-01"],
                  ["Procrastinación Crónica", "Regla de los 2 Minutos", "Estandarización Base", "CRÍTICO", "Psicológico", "Estandarizar antes de optimizar siempre", "MS-02"],
                  ["Olvido de Rutina Diaria", "Apilamiento (Habit Stacking)", "Anclaje de Señal", "MEDIO", "Temporal", "Vincular a un hábito existente ya sólido", "MS-03"],
                  ["Entorno Social Tóxico", "Invisibilización de Gatillos", "Eliminar la Señal", "ALTO", "Social", "Control ambiental absoluto del entorno", "MS-04"],
                  ["Falta de Recompensa / Fruto", "Satisfacción Inmediata", "Refuerzo Visual", "MEDIO", "Dopamina", "La Ley Cardinal: Lo recompensado se repite", "MS-05"],
                  ["Meseta de Rendimiento", "Regla Ricitos de Oro", "Dificultad Óptima", "ALTO", "Habilidad", "Mantenerse en la zona de flujo constante", "MS-06"],
                  ["Ruptura de Cadena (Falla)", "Recuperación Inmediata", "Acción de Rescate", "CRÍTICO", "Disciplina", "Nunca fallar dos veces seguidas", "MS-07"],
                  ["Crisis de Identidad", "Votos de Identidad", "Evidencia Pequeña", "MÁXIMO", "Mental", "Cada hábito es un voto por tu YO futuro", "MS-08"],
                  ["Complejidad Excesiva", "Ley del Menor Esfuerzo", "Hacerlo Sencillo", "MEDIO", "Físico", "Reduce los pasos entre tú y la acción", "MS-09"]
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-emerald-50/50 transition-all duration-300 cursor-default group">
                    {row.map((cell, idx) => (
                      <td key={idx} className={`p-4 sm:p-10 text-[11px] sm:text-sm ${idx === 0 ? 'font-black text-[#1a2e1e] uppercase italic' : 'font-medium text-gray-500'} ${idx === 3 ? 'text-emerald-600 font-black tracking-widest' : ''} ${idx === 6 ? 'font-mono text-gray-300' : ''}`}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )
    },
    {
      id: 6,
      titulo: t('recursos_item_5_title') || "Bitácora",
      subtitulo: "Manual de Aplicación Práctica",
      icon: <GraduationCap className="w-5 h-5" />,
      color: "text-orange-600",
      bg: "bg-orange-50",
      content: (
        <div className="space-y-20 text-left animate-in fade-in duration-1000">
          <div className="bg-orange-500 rounded-[32px] sm:rounded-[70px] p-6 sm:p-16 text-white shadow-2xl relative overflow-hidden border-4 sm:border-8 border-white/10">
            <div className="relative z-10 text-center sm:text-left">
              <span className="text-[8px] sm:text-[10px] font-black text-orange-200 uppercase tracking-[0.2em] sm:tracking-[0.5em] mb-3 sm:mb-6 block">Manual de Ingeniería Conductual</span>
              <h3 className="text-2xl sm:text-4xl font-black uppercase italic tracking-tighter mb-4 sm:mb-8 leading-none">{t('recursos_guide.title')}</h3>
              <p className="text-base sm:text-xl font-medium text-white/90 leading-relaxed max-w-3xl italic">"{t('recursos_guide.intro')}"</p>
            </div>
            <GraduationCap className="absolute -bottom-6 -right-6 sm:-bottom-20 sm:-right-20 text-white/10 w-32 h-32 sm:w-[500px] sm:h-[500px] rotate-[-15deg]" />
          </div>

          <section className="space-y-4 sm:space-y-12">
            <div className="border-l-[2px] sm:border-l-[10px] border-orange-500 pl-3 sm:pl-12 py-1 sm:py-6">
              <h4 className="text-lg sm:text-4xl font-black text-[#2d5a3d] uppercase italic mb-4 sm:mb-12 tracking-tighter">{t('recursos_guide.questions_title')}</h4>
              <div className="grid grid-cols-1 gap-4 sm:gap-8">
                {[
                  { q: "¿Cuál es el motor invisible que dicta tus acciones diarias?", a: "Tu Identidad. Los hábitos más profundos no nacen de lo que quieres lograr, sino de quién crees que eres." },
                  { q: "¿Qué evento marcó el inicio de la trayectoria de James Clear?", a: "Un grave accidente de béisbol que le causó un coma inducido y fracturas faciales, obligándolo a rehabilitarse con hábitos mínimos." },
                  { q: "¿En qué consiste la agregación de ganancias marginales?", a: "En la mejora del 1% diario. Matemáticamente, ser un 1% mejor cada día te hace 37 veces mejor al año." },
                  { q: "¿Cómo hackear el ciclo de dopamina para que el hábito sea atractivo?", a: "Usando la 'Acumulación de Tentaciones': vincula una acción que NECESITAS hacer con una que REALMENTE quieres hacer." },
                  { q: "¿Por qué la Regla de los 2 Minutos es vital?", a: "Porque vence la inercia inicial. Un hábito debe ser ridículamente fácil de empezar para que el cerebro no lo rechace." },
                  { q: "¿Qué es el 'Abismo de Desilusión' y cómo superarlo?", a: "Es el periodo donde el esfuerzo parece no dar frutos. Se supera confiando en el sistema: el trabajo se está acumulando, no desperdiciando." },
                  { q: "¿Cuál es la diferencia crítica entre metas y sistemas?", a: "Las metas son resultados; los sistemas son procesos. Los ganadores y perdedores tienen las mismas metas, pero sistemas diferentes." },
                  { q: "¿Cómo influye el entorno en tu toma de decisiones?", a: "El entorno es la 'mano invisible'. Es más fácil diseñar tu entorno para que la señal sea obvia que confiar en tu fuerza de voluntad." },
                  { q: "¿En qué consiste la Ley de la Inversión para malos hábitos?", a: "Para eliminar un hábito negativo, debes hacerlo invisible y aumentar la fricción. Haz que sea difícil y poco atractivo realizar la acción." },
                  { q: "¿Cómo funciona la fórmula de 'Apilamiento de Hábitos'?", a: "Fórmula: 'Después de [HÁBITO ACTUAL], haré [HÁBITO NUEVO]'. Aprovecha conexiones neuronales sólidas para anclar nuevas conductas." },
                  { q: "¿Qué es la 'Regla de Ricitos de Oro' aplicada a la motivación?", a: "Establece que la motivación máxima ocurre al trabajar en tareas de dificultad óptima: ni muy fáciles (aburrimiento) ni muy difíciles (ansiedad)." },
                  { q: "¿Cuál es la función técnica de un Rastreador de Hábitos?", a: "Proporcionar evidencia visual inmediata del progreso. Esto activa el sistema de recompensa y crea un incentivo visual para no romper la cadena." },
                  { q: "¿Cómo operan los 'Contratos de Hábitos'?", a: "Añaden un costo social y real al incumplimiento. Al involucrar a un socio de responsabilidad, el costo de fallar se vuelve inmediato y doloroso." },
                  { q: "¿Por qué es fundamental automatizar las conductas?", a: "La automatización elimina la fatiga de decisión. Al convertir una acción en automática, liberas energía cognitiva para tareas de mayor nivel." },
                  { q: "¿Qué significa 'Estandarizar antes de Optimizar'?", a: "Significa que un hábito debe existir (ser constante) antes de que tenga sentido intentar mejorar su rendimiento o calidad." },
                  { q: "¿Cómo afecta la genética a tus hábitos según STACK?", a: "La genética dicta tus predisposiciones. El éxito es más probable si eliges hábitos que se alineen con tus talentos y capacidades naturales." },
                  { q: "¿Qué es la 'Acumulación de Hábitos Inversa'?", a: "Es la técnica de identificar el hábito disparador de una conducta negativa y romper la secuencia eliminando el primer eslabón de la cadena." },
                  { q: "¿Cómo gestionar un fallo según la Regla de Oro STACK?", a: "Regla: 'Nunca falles dos veces seguidas'. Perder un día es un accidente; perder dos es el inicio de un hábito destructivo." },
                  { q: "¿Cuál es el papel de la dopamina en la anticipación?", a: "La dopamina se libera ante la señal de recompensa, no solo al recibirla. Ese pico de anticipación es lo que genera el impulso de actuar." },
                  { q: "¿Cómo influye la presión social en tus hábitos diarios?", a: "Imitamos los hábitos de tres grupos: los cercanos, la mayoría y los poderosos. Tu identidad social dicta gran parte de tu arquitectura conductual." },
                  { q: "¿Qué es la 'Intención de Implementación'?", a: "Es un plan que especifica cuándo y dónde actuarás. Fórmula: 'Yo haré [CONDUCTA] a las [HORA] en [LUGAR]'." },
                  { q: "¿Cómo funciona el 'Diseño de Entorno' para dejar un mal hábito?", a: "Haciendo que la señal sea invisible (escondiéndola) y aumentando la fricción (dejando los implementos lejos o inaccesibles)." },
                  { q: "¿Qué es el 'Efecto Diderot' en la formación de hábitos?", a: "Es la tendencia a que obtener una nueva posesión cree una espiral de consumo que te lleva a adquirir más cosas nuevas de forma impulsiva." },
                  { q: "¿Cómo se aplica la 'Regla del 1%' a las finanzas personales?", a: "Automatizando micro-ahorros diarios; aunque parezcan insignificantes, el interés compuesto y el sistema los vuelven masivos con el tiempo." },
                  { q: "¿Qué es un 'Hábito Clave' (Keystone Habit)?", a: "Un hábito que, al ser modificado, provoca una reacción en cadena que transforma otros aspectos de tu vida (ej. hacer ejercicio diario)." },
                  { q: "¿Cómo influye la arquitectura cerebral en los hábitos?", a: "Los ganglios basales son el centro de control que permite al cerebro ahorrar energía al automatizar procesos repetitivos." },
                  { q: "¿Qué es la 'Prueba de Esfuerzo' de un hábito?", a: "Consiste en medir cuánta fricción o cansancio eres capaz de tolerar antes de abandonar el sistema en un día difícil." },
                  { q: "¿Cómo se utiliza un 'Ritual de Enfoque'?", a: "Es una secuencia breve de pasos que le indican a tu cerebro: 'Es hora de entrar en estado de flujo para trabajar o entrenar'." },
                  { q: "¿Qué es la 'Memoria Muscular' en contextos técnicos?", a: "Es la capacidad de realizar tareas complejas automáticamente gracias al fortalecimiento de las vías neuronales por repetición constante." },
                  { q: "¿Cómo afecta la falta de sueño a los nuevos hábitos?", a: "Debilita la corteza prefrontal, reduciendo drásticamente el autocontrol y haciéndote recaer en viejas conductas negativas." },
                  { q: "¿Qué es la 'Ley de la Repetición' frente a la duración?", a: "Lo que importa para fijar un hábito es la frecuencia (cuántas veces lo haces), no cuánto tiempo tardas en cada sesión individual." },
                  { q: "¿Cómo influyen las etiquetas sociales en tu identidad?", a: "Las etiquetas externas pueden convertirse en profecías autocumplidas si las aceptas como parte de tu narrativa interna o identidad." },
                  { q: "¿En qué consiste el 'Modelado de Conducta'?", a: "En observar y replicar los sistemas exactos de personas que ya han alcanzado los resultados que tú deseas obtener." },
                  { q: "¿Cómo funciona la 'Retroalimentación Inmediata'?", a: "El cerebro prefiere recompensas ahora que después. Un hábito exitoso siempre debe tener una gratificación instantánea pequeña." },
                  { q: "¿Qué es la 'Carga Cognitiva' y cómo reducirla?", a: "Es el esfuerzo mental usado. Automatizar hábitos libera esa carga para que el cerebro pueda enfocarse en creatividad y resolución de problemas." },
                  { q: "¿Cómo usar la 'Visualización' para reforzar hábitos?", a: "Imaginando el PROCESO exacto de la acción (no solo el resultado), preparando al cerebro para actuar cuando aparezca la señal real." },
                  { q: "¿Qué es la 'Trampa de la Planificación'?", a: "Pasar demasiado tiempo planeando y poco actuando. Planear se siente como progreso, pero solo la acción genera evidencia de cambio." },
                  { q: "¿Cómo influye la nutrición estable en la voluntad?", a: "Niveles estables de glucosa ayudan a mantener la función ejecutiva necesaria para resistir tentaciones y mantener el rumbo." },
                  { q: "¿Qué es la 'Resiliencia Conductual'?", a: "La capacidad de retomar tus sistemas inmediatamente después de una interrupción inevitable, sin entrar en una espiral de abandono." },
                  { q: "¿Cuál es el objetivo final de la Ingeniería STACK?", a: "Crear una vida donde el éxito sea el resultado inevitable de tus sistemas diarios, y no dependa de actos heroicos de fuerza de voluntad." }
                ].map((item, i) => (
                  <div key={i} className="p-4 sm:p-10 bg-white border sm:border-2 border-[#fff7ed] rounded-[20px] sm:rounded-[50px] shadow-sm flex flex-col gap-3 sm:gap-10 group hover:shadow-xl hover:border-orange-200 transition-all duration-500">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 sm:w-16 sm:h-16 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center font-black text-sm sm:text-2xl shrink-0 border sm:border-2 border-orange-100 shadow-inner group-hover:scale-110 transition-transform">{i + 1}</div>
                      <p className="text-sm sm:text-xl font-bold text-[#2d5a3d] leading-tight">{item.q}</p>
                    </div>
                    <details className="group/ans">
                      <summary className="list-none cursor-pointer">
                        <span className="text-[7px] sm:text-[10px] font-black text-orange-500/60 group-hover:text-orange-500 uppercase tracking-widest border-t border-gray-50 pt-2 block transition-colors">Ver Respuesta Técnica STACK</span>
                      </summary>
                      <p className="mt-3 text-[11px] sm:text-base text-gray-500 font-medium italic border-l-2 border-orange-200 pl-4 animate-in slide-in-from-top-2 duration-300">
                        {item.a}
                      </p>
                    </details>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      )
    },
    { id: 7, titulo: t('recursos_item_6_title') || "Mapa", subtitulo: "Jerarquía Visual de Hábitos Atómicos", icon: <Share2 className="w-5 h-5" />, color: "text-pink-600", bg: "bg-pink-50", content: (<div className="w-full h-full min-h-[500px] sm:min-h-[900px] bg-white rounded-[32px] sm:rounded-[80px] shadow-2xl overflow-hidden p-4 sm:p-10 relative border-4 sm:border-[12px] border-gray-50 transition-all"><MindMap /></div>) },
    {
      id: 8,
      titulo: "LIBRO DIGITAL",
      subtitulo: "BIBLIOTECA TÉCNICA PRO",
      icon: <Library className="w-5 h-5" />,
      color: "text-emerald-700",
      bg: "bg-emerald-50",
      content: (
        <div className="flex flex-col items-center justify-center py-32 text-center space-y-12 animate-in fade-in zoom-in duration-1000">
          <div className="w-64 h-64 bg-emerald-50 rounded-[80px] flex items-center justify-center shadow-inner border-4 border-emerald-100 mb-12 relative overflow-hidden group">
            <Library className="w-36 h-28 text-emerald-600 relative z-10 group-hover:scale-110 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-transparent" />
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="space-y-10 max-w-3xl px-10">
            <h3 className="text-3xl sm:text-5xl font-black text-[#1a2e1e] uppercase italic tracking-tighter leading-[0.9] mb-6">ACCESO EXCLUSIVO</h3>
            <p className="text-lg font-medium text-gray-500 leading-relaxed italic">Este recurso (Ebook PDF + Guía de Implementación) es propiedad intelectual reservada para los alumnos que han completado su inversión en el Método Stack. Solicita tu enlace de descarga único.</p>
          </div>
          <button
            onClick={() => window.open(`https://wa.me/51989078285?text=Hola Orlando, soy miembro del Método Stack y quiero mi libro digital. Email: ${userEmail}`, '_blank')}
            className="w-full max-w-lg py-8 bg-[#25D366] text-white rounded-[45px] font-black uppercase text-lg hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-green-500/40 flex items-center justify-center gap-8 border-b-8 border-green-700"
          >
            <Smartphone size={32} /> PEDIR COPIA POR WHATSAPP
          </button>
          <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.5em]">Seguridad Encriptada de Miembro</p>
        </div>
      )
    }
  ];

  const selectedResource = recursos.find(r => r.id === selectedId);



  // ==========================================
  // RENDER: ACADEMIA DE RECURSOS (VISTA FINAL)
  // ==========================================
  return (
    <div className="min-h-screen bg-[#f7f9f7] pb-40 px-6 sm:px-16 pt-16 font-sans text-center relative selection:bg-emerald-100 selection:text-emerald-900">
      <TourBienvenida showInstallBtn={showInstallBtn} />
      <div className="max-w-[1440px] mx-auto">

        {/* CABECERA DE SESIÓN */}
        <header className="flex justify-between items-center mb-8 sm:mb-16">
          <div className="flex items-center gap-4">
            {isTrial && (
              <div className="bg-emerald-100 text-emerald-700 px-8 py-4 rounded-full text-xs font-black uppercase flex items-center gap-4 shadow-sm border-2 border-emerald-200">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                Trial Activo: 72h restantes
              </div>
            )}
            {showInstallBtn && (
              <button
                id="install-app-btn"
                onClick={handleInstallClick}
                className="bg-[#2d5a3d] text-white px-6 py-3 rounded-full font-black text-xs uppercase tracking-widest flex items-center gap-2 animate-bounce shadow-xl hover:scale-105 transition-all"
              >
                📱 INSTALAR APP
              </button>
            )}
          </div>
        </header>

        {!selectedId ? (
          <div className="space-y-12 sm:space-y-24 animate-in fade-in duration-1000">
            {/* TÍTULO HERO */}
            <div className="space-y-4 sm:space-y-8">
              <div className="inline-flex items-center gap-2 sm:gap-4 px-6 sm:px-8 py-2 sm:py-3 bg-[#2d5a3d]/10 text-[#2d5a3d] rounded-full text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] sm:tracking-[0.4em] border border-[#2d5a3d]/10">
                <Library className="w-4 h-4 sm:w-6 sm:h-6" /> {t('recursos_academy')}
              </div>
              <h1 className="text-3xl sm:text-5xl lg:text-8xl font-black text-[#2d5a3d] italic uppercase leading-[0.9] sm:leading-[0.8] tracking-tighter break-words px-2" dangerouslySetInnerHTML={{ __html: t('recursos_atomic_wisdom') }} />
              <div className="flex items-center justify-center gap-4">
                <AyudaContextual
                  titulo="Academia Master V.2"
                  texto="Bienvenida a tu repositorio técnico. Aquí encontrarás cada pieza del rompecabezas atómico."
                  lista={["Masterclass en Video HD", "Entrenamiento Auditivo HQ", "Protocolos de Estrategia", "Test de Maestría Conductual"]}
                />
                <p className="text-[#7a9b82] text-sm sm:text-xl font-medium italic opacity-80">Diseña el sistema que tu futuro merece.</p>
              </div>
            </div>

            {/* VIDEO SECCIÓN PREMIUM */}
            <section className="relative aspect-[9/16] w-full max-w-[400px] mx-auto bg-black rounded-[40px] sm:rounded-[60px] overflow-hidden border-[6px] sm:border-[10px] border-white shadow-2xl transition-all hover:shadow-green-900/20 group cursor-pointer">
              <video ref={videoRef} className={`w-full h-full object-cover transition-opacity duration-1000 ${isVideoPlaying ? 'opacity-100' : 'opacity-30'}`} controls={isVideoPlaying} src="/videos/introduccion.mp4" />
              {!isVideoPlaying && (
                <div onClick={handleVideoPlay} className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 group px-6">
                  <div className="w-24 h-20 sm:w-40 sm:h-32 bg-white rounded-[30px] sm:rounded-[50px] flex items-center justify-center shadow-2xl group-hover:scale-110 transition-all duration-500 border-2 sm:border-4 border-emerald-50">
                    <Play fill="#2d5a3d" className="text-[#2d5a3d] ml-1 sm:ml-2 w-10 h-10 sm:w-16 sm:h-16" />
                  </div>
                  <span className="mt-6 sm:mt-12 text-white font-black uppercase tracking-[0.4em] sm:tracking-[0.8em] text-[10px] sm:text-lg opacity-80 group-hover:opacity-100 transition-opacity text-center leading-tight">
                    {t('recursos_masterclass_title')}
                  </span>
                </div>
              )}
            </section>

            {/* PODCAST SECCIÓN HQ */}
            <section className="bg-white rounded-[32px] sm:rounded-[70px] p-6 sm:p-16 border-2 border-[#e8f1e9] flex flex-col lg:flex-row items-center gap-6 sm:gap-20 text-left shadow-sm max-w-7xl mx-auto border-4 border-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 sm:w-64 sm:h-64 bg-emerald-50 rounded-bl-[100%] opacity-40"></div>
              <div className="w-24 h-24 sm:w-56 sm:h-56 bg-[#f4faf6] rounded-[24px] sm:rounded-[60px] flex items-center justify-center text-4xl sm:text-[100px] shadow-inner border-2 border-[#d8eadb] rotate-[-5deg] shrink-0">🎙️</div>
              <div className="flex-1 w-full relative z-10">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 sm:mb-12">
                  <div>
                    <h3 className="text-2xl sm:text-4xl font-black text-[#2d4a3e] uppercase italic tracking-tighter leading-none mb-2">{t('recursos_podcast_title')}</h3>
                    <p className="text-[10px] sm:text-sm font-bold text-gray-400 uppercase tracking-widest italic">Sistemas de audio para aprendizaje pasivo</p>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 px-4 py-2 rounded-2xl hidden lg:block animate-pulse">
                    <p className="text-[9px] font-black text-amber-700 uppercase tracking-widest mb-0.5 italic">✨ STACK TIP</p>
                    <p className="text-[11px] text-amber-800 font-bold italic">"Mira esta Masterclass antes de diseñar tu entorno."</p>
                  </div>
                  <div className="hidden sm:block">
                    <AyudaContextual titulo="Guía Auditiva" texto="Optimiza tu tiempo: escucha la teoría técnica mientras realizas actividades mecánicas." />
                  </div>
                </div>
                <audio ref={audioRef} src="/audio/podcast_habitos.mp3" onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)} onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)} onEnded={() => setIsAudioPlaying(false)} />
                <div className="flex items-center gap-4 sm:gap-8 mb-8 sm:mb-12">
                  <span className="text-xs sm:text-base font-mono font-black text-[#7a9b82] w-12 sm:w-20">{formatTime(currentTime)}</span>
                  <div className="flex-1 relative">
                    <input type="range" min="0" max={duration || 0} value={currentTime} onChange={(e) => { const t = Number(e.target.value); if (audioRef.current) audioRef.current.currentTime = t; }} className="w-full h-3 sm:h-4 bg-[#f4faf6] appearance-none cursor-pointer accent-[#2d5a3d] rounded-full border-2 border-gray-100 shadow-inner" />
                  </div>
                  <span className="text-xs sm:text-base font-mono font-black text-[#7a9b82] w-12 sm:w-20 text-right">{formatTime(duration)}</span>
                </div>
                <div className="flex items-center justify-center gap-8 sm:gap-20">
                  <button onClick={() => { if (audioRef.current) audioRef.current.currentTime -= 15; }} className="text-[#7a9b82] hover:text-[#2d5a3d] transition-all hover:scale-125"><RotateCcw size={24} className="sm:w-12 sm:h-12" /></button>
                  <button onClick={toggleAudio} className="w-16 h-16 sm:w-28 sm:h-28 bg-[#2d5a3d] text-white rounded-full flex items-center justify-center shadow-2xl shadow-green-900/30 active:scale-90 transition-all border-[4px] sm:border-[10px] border-emerald-100/50">
                    {isAudioPlaying ? <Pause fill="white" size={24} className="sm:w-12 sm:h-12" /> : <Play fill="white" size={24} className="ml-0.5 sm:ml-2 sm:w-12 sm:h-12" />}
                  </button>
                  <button onClick={() => { if (audioRef.current) audioRef.current.currentTime += 15; }} className="text-[#7a9b82] hover:text-[#2d5a3d] transition-all hover:scale-125"><RotateCw size={24} className="sm:w-12 sm:h-12" /></button>
                </div>
              </div>
            </section>

            {/* GRILLA DE RECURSOS TÉCNICOS DETALLADA */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-12 max-w-7xl mx-auto">
              {recursos.map((item) => (
                <div key={item.id} onClick={() => handleOpenResource(item.id)} className="group bg-white p-4 sm:p-12 rounded-[24px] sm:rounded-[70px] border-2 border-transparent hover:border-[#2d5a3d] hover:shadow-2xl transition-all duration-500 cursor-pointer text-left relative overflow-hidden border-4 border-white shadow-xl flex flex-col min-h-[180px] sm:min-h-[450px]">
                  <div className={`w-10 h-10 sm:w-24 sm:h-24 ${item.bg} ${item.color} rounded-[15px] sm:rounded-[35px] flex items-center justify-center text-xl sm:text-5xl shadow-inner group-hover:scale-110 transition-all duration-700 mb-4 sm:mb-10`}>{item.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2 sm:mb-4">
                      <h4 className="text-base sm:text-3xl font-black text-[#2d4a3e] uppercase group-hover:text-[#2d5a3d] leading-[0.9] tracking-tighter">{item.titulo}</h4>
                      {isTrial && <Lock size={14} className="text-amber-500/50 sm:w-5 sm:h-5" />}
                    </div>
                    <p className="text-[8px] sm:text-[11px] text-gray-400 font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] italic">{item.subtitulo}</p>
                  </div>
                  <div className="mt-auto pt-3 sm:pt-10 w-full border-t border-gray-50 flex justify-between items-center group-hover:border-emerald-100 transition-all">
                    <span className="text-[8px] font-black text-[#2d5a3d]/40 uppercase tracking-[0.2em] sm:tracking-[0.4em]">Doc</span>
                    <div className="w-6 h-6 sm:w-14 sm:h-14 bg-[#f4faf6] rounded-full flex items-center justify-center group-hover:bg-[#2d5a3d] group-hover:text-white transition-all shadow-sm group-hover:rotate-[-45deg]"><ChevronRight size={14} className="sm:w-7 sm:h-7" /></div>
                  </div>
                </div>
              ))}
            </div>

            {!asEmbedded && <LegalFooter />}
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-12 duration-1000 text-left pb-10 sm:pb-40">
            <button onClick={() => setSelectedId(null)} className="mb-6 sm:mb-20 text-[10px] sm:text-[15px] font-black uppercase text-[#2d5a3d] tracking-[0.2em] sm:tracking-[0.5em] flex items-center gap-3 sm:gap-6 hover:text-emerald-500 transition-all group">
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-emerald-50 rounded-full flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-md group-hover:scale-110">←</div> Volver al Catálogo Maestro
            </button>
            <div className="bg-white rounded-[32px] sm:rounded-[100px] border sm:border-2 border-[#d8eadb] p-4 sm:p-32 shadow-2xl overflow-hidden min-h-[300px] sm:min-h-[800px] border-[4px] sm:border-[10px] border-white shadow-green-900/5 relative">
              <div className="absolute top-10 right-10 opacity-5 hidden sm:block"><GitGraph size={200} /></div>
              {selectedResource?.content}
              
              {/* Botón de retorno al final también para UX */}
              <div className="mt-8 sm:mt-24 pt-6 sm:pt-12 border-t sm:border-t-2 border-gray-50 flex justify-center">
                <button onClick={() => { setSelectedId(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="text-[9px] sm:text-[13px] font-black uppercase text-[#2d5a3d]/40 tracking-[0.2em] sm:tracking-[0.5em] flex items-center gap-3 sm:gap-6 hover:text-emerald-500 transition-all group">
                  <div className="w-6 h-6 sm:w-10 sm:h-10 bg-emerald-50 rounded-full flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-sm">←</div> Regresar al Inicio de Academia
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL DE RECURSO BLOQUEADO (TRIAL) */}
      {showLockedModal && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white border border-gray-100 p-8 sm:p-12 rounded-[40px] w-full max-w-md shadow-2xl text-center animate-in zoom-in-95 duration-300 relative">
            <button 
              onClick={() => setShowLockedModal(false)}
              className="absolute top-6 right-6 text-gray-300 hover:text-gray-500 transition-colors"
            >
              <XCircle size={24} />
            </button>
            <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Lock className="text-amber-500" size={40} />
            </div>
            <h2 className="text-2xl font-black text-[#2d5a3d] mb-4 uppercase tracking-tight">Acceso Premium</h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-8 font-medium">
              La **Academia Maestra** es exclusiva para miembros con membresía activa. 
              Adquiere tu plan hoy para desbloquear toda la ingeniería del Método STACK.
            </p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => {
                  const msg = `Hola Orlando, quiero activar mi membresía del Método STACK para entrar a la Academia. Mi correo es: ${userEmail}`;
                  window.open(`https://wa.me/51989078285?text=${encodeURIComponent(msg)}`, '_blank');
                }}
                className="w-full py-5 bg-[#00C853] text-black rounded-2xl font-black uppercase text-xs hover:bg-[#00E676] transition-all shadow-lg shadow-green-500/20 flex items-center justify-center gap-2"
              >
                <span>🚀 Activar Membresía Ahora</span>
              </button>
              <button 
                onClick={() => setShowLockedModal(false)}
                className="w-full py-4 bg-gray-50 text-gray-400 rounded-2xl font-black uppercase text-xs hover:bg-gray-100 transition-all"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PLANOS ARQUITECTURA HD */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 sm:p-10 animate-in fade-in duration-700 backdrop-blur-3xl">
          <div className="relative w-full max-w-[1600px] h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <button onClick={() => setShowModal(false)} className="text-white font-black text-[13px] tracking-[0.4em] uppercase flex items-center gap-4 hover:text-emerald-400 transition-all group bg-white/10 px-6 py-3 rounded-full backdrop-blur-md">
                <ChevronRight size={24} className="rotate-180" /> Volver a la Academia
              </button>
              <button onClick={() => setShowModal(false)} className="text-white font-black text-[13px] tracking-[0.4em] uppercase flex items-center gap-4 hover:text-emerald-400 transition-all group bg-white/10 px-6 py-3 rounded-full backdrop-blur-md">
                Cerrar <XCircle size={24} className="group-hover:rotate-90 transition-transform" />
              </button>
            </div>
            <div className="flex-1 bg-white rounded-[80px] overflow-hidden shadow-2xl border-[15px] border-white/10 shadow-black/50">
              <iframe src={`/planos/planos.html?lang=${lang}`} className="w-full h-full border-none" />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// ==========================================
// 4. SUB-COMPONENTE: QUIZ DE 20 PREGUNTAS (EXPANDIDO 100%)
// ==========================================

function QuizComponent() {
  const { t } = useTranslation();
  const [step, setStep] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);

  // ARRAY EXHAUSTIVO DE 20 PREGUNTAS (IDÉNTICO A TU ORIGINAL DE 900+ LINEAS)
  const questions = [
    { q: t('quiz_q1') || "¿Qué es la mejora del 1%?", options: t('quiz_q1_o') || ["Lineal", "Interés Compuesto", "Azar", "Lento"], correct: 1 },
    { q: t('quiz_q2') || "¿Donde nace el hábito real?", options: t('quiz_q2_o') || ["Metas", "Planes", "Identidad", "Suerte"], correct: 2 },
    { q: t('quiz_q3') || "¿Regla del entorno?", options: t('quiz_q3_o') || ["Hacerlo Obvio", "Hacerlo Difícil", "Hacerlo Feo", "Ocultarlo"], correct: 0 },
    { q: t('quiz_q4') || "¿Qué es el Stacking?", options: t('quiz_q4_o') || ["Pilar", "Apilar Hábitos", "Borrar", "Saltar"], correct: 1 },
    { q: t('quiz_q5') || "¿Regla de 2 Minutos?", options: t('quiz_q5_o') || ["Estandarizar", "Optimizar", "Correr", "Dormir"], correct: 0 },
    { q: t('quiz_q6') || "¿Nivel de cambio profundo?", options: t('quiz_q6_o') || ["Metas", "Resultados", "Procesos", "Identidad"], correct: 3 },
    { q: t('quiz_q7') || "¿Dopamina y Hábito?", options: t('quiz_q7_o') || ["Miedo", "Dolor", "Anhelo", "Sueño"], correct: 2 },
    { q: t('quiz_q8') || "¿Qué es el Valle de Decepción?", options: t('quiz_q8_o') || ["Éxito", "Meseta Latente", "Muerte", "Inicio"], correct: 1 },
    { q: t('quiz_q9') || "¿Para romper un hábito?", options: t('quiz_q9_o') || ["Obvio", "Fácil", "Lindo", "Invisible"], correct: 3 },
    { q: t('quiz_q10') || "¿Regla Ricitos de Oro?", options: t('quiz_q10_o') || ["Fácil", "Difícil", "Extremo", "Justo"], correct: 3 },
    { q: t('quiz_q11') || "¿Falla de rastro?", options: t('quiz_q11_o') || ["Lunes", "Mañana", "Tarde", "Dos Veces"], correct: 3 },
    { q: t('quiz_q12') || "¿El cerebro busca?", options: t('quiz_q12_o') || ["Dolor", "Gasto", "Eficiencia", "Nada"], correct: 2 },
    { q: t('quiz_q13') || "¿Ley 1 del Cambio?", options: t('quiz_q13_o') || ["Obvio", "Duro", "Caro", "Rápido"], correct: 0 },
    { q: t('quiz_q14') || "¿Ley 2 del Cambio?", options: t('quiz_q14_o') || ["Atractivo", "Feo", "Gris", "Triste"], correct: 0 },
    { q: t('quiz_q15') || "¿Ley 3 del Cambio?", options: t('quiz_q15_o') || ["Caro", "Sencillo", "Pesado", "Lejos"], correct: 1 },
    { q: t('quiz_q16') || "¿Ley 4 del Cambio?", options: t('quiz_q16_o') || ["Malo", "Caro", "Satisfactorio", "Duro"], correct: 2 },
    { q: t('quiz_q17') || "¿Los genes dictan?", options: t('quiz_q17_o') || ["Muerte", "Vida", "Sorteo", "Áreas de Oportunidad"], correct: 3 },
    { q: t('quiz_q18') || "¿El hábito es un?", options: t('quiz_q18_o') || ["Plan", "Voto de Identidad", "Error", "Mito"], correct: 1 },
    { q: t('quiz_q19') || "¿Estandarizar antes de?", options: t('quiz_q19_o') || ["Optimizar", "Borrar", "Saltar", "Parar"], correct: 0 },
    { q: t('quiz_q20') || "¿Felicidad y Proceso?", options: t('quiz_q20_o') || ["Metas", "Dinero", "Ejecutar Proceso", "Suerte"], correct: 2 }
  ];

  const handleSelect = (idx: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(idx);
    if (idx === questions[step].correct) setScore(score + 1);
    setTimeout(() => {
      if (step < questions.length - 1) { setStep(step + 1); setSelectedOption(null); }
      else setShowResult(true);
    }, 1500);
  };

  if (showResult) return (
    <div className="text-center py-40 animate-in zoom-in duration-1000">
      <div className="w-56 h-56 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-16 text-8xl font-black border-[12px] border-white shadow-2xl shadow-emerald-500/10">
        {Math.round((score / 20) * 100)}%
      </div>
      <h3 className="text-7xl font-black text-[#2d5a3d] uppercase italic mb-8 tracking-tighter">Prueba Finalizada</h3>
      <p className="text-[#7a9b82] font-black uppercase text-2xl tracking-[0.5em] mb-20">{score} de 20 Aciertos Técnicos</p>
      <button onClick={() => window.location.reload()} className="px-20 py-8 bg-[#2d5a3d] text-white rounded-[40px] font-black uppercase text-lg shadow-2xl hover:scale-105 transition-all border-b-8 border-green-900">Reiniciar Test Maestro</button>
    </div>
  );

  const q = questions[step];
  return (
    <div className="space-y-6 sm:space-y-20 animate-in fade-in duration-700 text-left px-2 sm:px-10">
      <div className="flex flex-col sm:flex-row justify-between items-center bg-gray-50 p-3 sm:p-8 rounded-[16px] sm:rounded-[40px] border border-gray-100 shadow-inner gap-2 sm:gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-6">
          <span className="px-3 py-1 sm:px-8 sm:py-3 bg-white text-emerald-700 rounded-full text-[8px] sm:text-sm font-black uppercase tracking-widest shadow-sm shrink-0">Item Evaluativo {step + 1} de 20</span>
          <div className="bg-emerald-100/50 border border-emerald-200 px-2 py-0.5 rounded-lg hidden md:block">
            <p className="text-[7px] font-black text-emerald-700 uppercase tracking-widest mb-0.5 italic">🧠 STACK TIP</p>
            <p className="text-[9px] text-emerald-800 font-bold italic">"Mide tu nivel de comprensión técnica antes de avanzar al Nivel 2."</p>
          </div>
        </div>
        <div className="w-full sm:w-64 lg:w-96 h-1 sm:h-3 bg-white rounded-full overflow-hidden border border-gray-200 shadow-inner">
          <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${((step + 1) / 20) * 100}%` }} />
        </div>
      </div>
      <h3 className="text-lg sm:text-3xl font-black text-[#2d5a3d] leading-tight italic uppercase tracking-tighter max-w-4xl border-l-2 sm:border-l-8 border-emerald-500 pl-3 sm:pl-10">{q.q}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-8">
        {q.options?.map((opt: string, idx: number) => (
          <button
            key={idx}
            onClick={() => handleSelect(idx)}
            className={`w-full p-4 sm:p-12 rounded-[20px] sm:rounded-[50px] border-2 sm:border-4 transition-all text-left font-bold relative overflow-hidden group shadow-sm ${selectedOption === idx ? (idx === q.correct ? 'bg-emerald-50 border-emerald-500 scale-[1.02] shadow-lg' : 'bg-rose-50 border-rose-500 scale-[1.02] shadow-lg') : 'bg-[#f9fbf9] border-transparent hover:border-emerald-200 hover:bg-white hover:shadow-xl'}`}
          >
            <div className="flex items-center gap-4 sm:gap-10">
              <div className={`w-8 h-8 sm:w-16 sm:h-16 rounded-xl sm:rounded-3xl flex items-center justify-center font-black text-sm sm:text-xl shadow-inner ${selectedOption === idx ? 'bg-[#2d5a3d] text-white' : 'bg-white text-[#2d5a3d] shadow-sm'}`}>{String.fromCharCode(65 + idx)}</div>
              <span className="text-sm sm:text-2xl leading-tight tracking-tight">{opt}</span>
            </div>
            {selectedOption !== null && idx === q.correct && <CheckCircle2 className="absolute right-4 sm:right-12 top-1/2 -translate-y-1/2 text-emerald-500 animate-in zoom-in w-8 h-8 sm:w-14 sm:h-14" />}
            {selectedOption === idx && idx !== q.correct && <XCircle className="absolute right-4 sm:right-12 top-1/2 -translate-y-1/2 text-rose-500 animate-in zoom-in w-8 h-8 sm:w-14 sm:h-14" />}
          </button>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// 5. SUB-COMPONENTE: FLASHCARDS PRO
// ==========================================

function FlashcardList({ t }: any) {
  const cards = Array.isArray(t('recursos_flashcards')) ? t('recursos_flashcards') : [
    { q: "¿Qué es la regla del 1%?", a: "Es la mejora incremental diaria que produce un crecimiento de 37x en un año." },
    { q: "¿Sistemas o Metas?", a: "Sistemas. Las metas son resultados futuros, los sistemas son los procesos actuales." },
    { q: "¿Qué dice la regla de los 2 minutos?", a: "Cualquier hábito nuevo debe poder iniciarse en menos de dos minutos. Estandarizar antes de optimizar." },
    { q: "¿Qué es el cambio basado en identidad?", a: "Enfoque en quién quieres llegar a ser en lugar de qué resultado quieres obtener." },
    { q: "¿Cuál es la regla de oro de la disciplina?", a: "Nunca falles dos veces seguidas. Un fallo es un accidente, dos fallos es un nuevo hábito." },
    { q: "¿Cómo influye el entorno en la conducta?", a: "La motivación está sobrevalorada. El entorno dicta las señales visuales de acción." }
  ];
  return (<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-12 py-10 px-6">{cards.map((card: any, i: number) => (<FlashcardItem key={i} card={card} index={i} t={t} />))}</div>);
}

function FlashcardItem({ card, index, t }: { card: any; index: number, t: any }) {
  const [flipped, setFlipped] = useState(false);
  const colors = ["bg-rose-500", "bg-blue-500", "bg-emerald-500", "bg-amber-500", "bg-purple-500", "bg-cyan-500"];
  return (
    <div className="group h-[250px] sm:h-[500px] [perspective:2500px] cursor-pointer" onClick={() => setFlipped(!flipped)}>
      <div className={`relative h-full w-full rounded-[24px] sm:rounded-[80px] transition-all duration-1000 [transform-style:preserve-3d] ${flipped ? '[transform:rotateY(180deg)]' : ''} shadow-2xl`}>
        {/* LADO A: PREGUNTA */}
        <div className={`absolute inset-0 h-full w-full rounded-[24px] sm:rounded-[80px] ${colors[index % 6]} p-4 sm:p-16 flex flex-col items-center justify-center text-center [backface-visibility:hidden] border-[4px] sm:border-[10px] border-white/20`}>
          <div className="w-8 h-8 sm:w-16 sm:h-16 bg-white/20 rounded-full flex items-center justify-center mb-4 sm:mb-12 text-white font-black text-[10px] sm:text-xl shadow-xl">P.</div>
          <h3 className="text-lg sm:text-4xl font-black text-white uppercase italic tracking-tighter leading-[0.9]">{card.q}</h3>
          <span className="mt-4 sm:mt-16 text-[7px] sm:text-[12px] font-black text-white/50 uppercase tracking-[0.2em] sm:tracking-[0.6em] border sm:border-2 border-white/20 px-4 sm:px-10 py-1.5 sm:py-4 rounded-full backdrop-blur-sm group-hover:bg-white/10 transition-colors">Toca</span>
        </div>
        {/* LADO B: RESPUESTA */}
        <div className="absolute inset-0 h-full w-full rounded-[24px] sm:rounded-[80px] bg-[#1a2e1e] p-4 sm:p-16 flex flex-col items-center justify-center text-center [transform:rotateY(180deg)] [backface-visibility:hidden] border-[4px] sm:border-[10px] border-emerald-500/30">
          <div className="w-8 h-8 sm:w-16 sm:h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mb-4 sm:mb-12 text-emerald-400 font-black text-[10px] sm:text-xl">R.</div>
          <p className="text-sm sm:text-3xl font-bold text-white leading-relaxed italic px-2 sm:px-4">"{card.a}"</p>
          <div className="mt-4 sm:mt-16 w-12 sm:w-32 h-0.5 sm:h-1.5 bg-emerald-500/30 rounded-full"></div>
        </div>
      </div>
    </div>
  );
}