'use client';
import React, { useState, useRef, useEffect } from 'react';
import {
  BookOpen,
  FileText,
  HelpCircle,
  Copy,
  Table,
  GraduationCap,
  Share2,
  Video,
  Mic,
  Download,
  ChevronRight,
  ExternalLink,
  Clock,
  Layers,
  Target,
  CheckCircle2,
  XCircle,
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Film,
  Zap,
  Info,
  Library,
  Volume2,
  Maximize2
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import MindMap from '@/components/MindMap';

interface Props {
  userId: string;
  userEmail: string;
}

export default function RecursosClient({ userId, userEmail }: Props) {
  const { t, lang } = useTranslation();
  const [selectedId, setSelectedId] = React.useState<number | null>(null);
  const [showModal, setShowModal] = useState(false); // Estado para los Planos (PPT)

  // Estados para Video
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Estados para Audio
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  // --- LÓGICA DE VIDEO ---
  const handleVideoPlay = () => {
    setIsVideoPlaying(true);
    if (videoRef.current) {
      videoRef.current.play();
    }
  };

  // --- LÓGICA DE AUDIO ---
  const toggleAudio = () => {
    if (audioRef.current) {
      if (isAudioPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsAudioPlaying(!isAudioPlaying);
    }
  };

  const skipAudio = (amount: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime += amount;
    }
  };

  const onTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const onLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const recursos = [
    {
      id: 1,
      titulo: t('recursos_item_0_title'),
      subtitulo: `1 ${t('recursos_min_read')}`,
      icon: <FileText className="w-5 h-5" />,
      color: "text-amber-600",
      bg: "bg-amber-50",
      content: (
        <div className="space-y-6 text-[#1a2e1e]/80 leading-relaxed">
          {/* BOTÓN PRINCIPAL: PLANOS INTERACTIVOS */}
          <div className="p-8 bg-gradient-to-br from-[#2d5a3d] to-[#1f3d2a] rounded-[40px] text-white shadow-2xl mb-8 group overflow-hidden relative border-4 border-white/10">
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-[9px] font-black uppercase tracking-[0.2em] mb-4">
                <Zap size={10} fill="currentColor" /> {t('recursos_impact_badge')}
              </div>
              <h3 className="text-3xl font-serif font-bold mb-4 italic leading-tight">{t('recursos_planos_title')}</h3>
              <p className="text-sm text-white/70 mb-8 max-w-md leading-relaxed">{t('recursos_planos_desc')}</p>
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-3 bg-white text-[#2d5a3d] px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/20"
              >
                <Maximize2 size={18} /> {t('recursos_open_planos')}
              </button>
            </div>
            <div className="absolute -right-20 -bottom-20 opacity-10 group-hover:scale-110 transition-transform duration-1000 rotate-12">
              <Layers size={300} />
            </div>
          </div>

          {/* PILARES TÉCNICOS */}
          <section className="space-y-8">
            <div className="grid gap-6">
              {/* PILAR 1 */}
              <div className="p-6 bg-white border border-[#e8f1e9] rounded-[28px] hover:border-emerald-200 transition-colors">
                <h4 className="text-sm font-black text-[#2d5a3d] uppercase mb-2 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                  {t('recursos_pilar_1_title')}
                </h4>
                <p className="text-xs mb-3 font-medium">{t('recursos_pilar_1_desc')}</p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(Array.isArray(t('recursos_pilar_1_points')) ? t('recursos_pilar_1_points') : []).map((item: string, i: number) => (
                    <li key={i} className="flex items-center gap-2 text-[11px] font-bold text-gray-500 bg-[#f4faf6] px-3 py-1.5 rounded-lg border border-[#d8eadb]">
                      <CheckCircle2 size={10} className="text-emerald-500" /> {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* PILAR 2 */}
              <div className="p-6 bg-white border border-[#e8f1e9] rounded-[28px] hover:border-emerald-200 transition-colors">
                <h4 className="text-sm font-black text-[#2d5a3d] uppercase mb-2 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                  {t('recursos_pilar_2_title')}
                </h4>
                <p className="text-xs mb-3 font-medium">{t('recursos_pilar_2_desc')}</p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(Array.isArray(t('recursos_pilar_2_points')) ? t('recursos_pilar_2_points') : []).map((item: string, i: number) => (
                    <li key={i} className="flex items-center gap-2 text-[11px] font-bold text-gray-500 bg-[#f4faf6] px-3 py-1.5 rounded-lg border border-[#d8eadb]">
                      <CheckCircle2 size={10} className="text-emerald-500" /> {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* PILAR 3 */}
              <div className="p-6 bg-white border border-[#e8f1e9] rounded-[28px] hover:border-emerald-200 transition-colors">
                <h4 className="text-sm font-black text-[#2d5a3d] uppercase mb-2 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                  {t('recursos_pilar_3_title')}
                </h4>
                <p className="text-xs mb-3 font-medium">{t('recursos_pilar_3_desc')}</p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(Array.isArray(t('recursos_pilar_3_points')) ? t('recursos_pilar_3_points') : []).map((item: string, i: number) => (
                    <li key={i} className="flex items-center gap-2 text-[11px] font-bold text-gray-500 bg-[#f4faf6] px-3 py-1.5 rounded-lg border border-[#d8eadb]">
                      <CheckCircle2 size={10} className="text-emerald-500" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* RESUMEN EJECUTIVO (AL FINAL) */}
          <div className="p-8 bg-emerald-50 border-2 border-emerald-100 rounded-[32px] mt-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-emerald-500 text-white rounded-lg flex items-center justify-center">
                <Info size={16} />
              </div>
              <h4 className="text-sm font-black text-emerald-800 uppercase tracking-widest">{t('recursos_executive_summary')}</h4>
            </div>
            <p className="text-sm font-medium text-emerald-900/70 leading-relaxed italic">
              {t('recursos_executive_desc')}
            </p>
          </div>

          <div className="pt-8 border-t border-[#d8eadb] italic text-[10px] text-[#1a2e1e]/40 font-bold uppercase tracking-widest flex justify-between items-center">
            <span>Fuente: MEMORIA_METODO_STACK.md</span>
            <span>Ref: V.2026.04</span>
          </div>
        </div>
      )
    },
    {
      id: 2,
      titulo: t('recursos_item_1_title'),
      subtitulo: `8 ${t('recursos_min_read')}`,
      icon: <BookOpen className="w-5 h-5" />,
      color: "text-purple-600",
      bg: "bg-purple-50",
      content: (
        <div className="space-y-12">
          <div className="text-center space-y-4">
            <h3 className="text-2xl sm:text-4xl font-black text-[#2d5a3d] italic uppercase tracking-tighter" dangerouslySetInnerHTML={{ __html: t('recursos_item_1_content_title') }} />
            <p className="text-sm font-bold text-[#1a2e1e]/40 uppercase tracking-widest">{t('recursos_item_1_content_sub')}</p>
          </div>

          <div className="bg-gradient-to-br from-white to-emerald-50/30 rounded-[32px] border border-[#d8eadb] p-8 relative overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
              <div className="space-y-6">
                <div className="inline-block px-4 py-2 bg-emerald-500 text-white rounded-2xl font-black text-xl italic shadow-lg shadow-emerald-500/20">
                  {t('recursos_item_1_content_rule')}
                </div>
                <p className="text-lg font-medium text-[#1a2e1e]/70 leading-relaxed" dangerouslySetInnerHTML={{ __html: t('recursos_item_1_content_text') }} />
              </div>
              <div className="relative h-48 flex items-end justify-between gap-2 px-4">
                {[20, 25, 35, 50, 75, 110, 160].map((h, i) => (
                  <div key={i} className="w-full bg-gradient-to-t from-emerald-500 to-emerald-300 rounded-t-lg shadow-lg" style={{ height: `${h}%` }}></div>
                ))}
                <div className="absolute top-0 right-0 p-4 bg-white border-2 border-emerald-500 rounded-2xl shadow-xl -translate-y-4 translate-x-4">
                  <span className="text-2xl font-black text-emerald-600 italic">37x</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="p-8 bg-[#1a2e1e] text-white rounded-[32px] shadow-xl relative overflow-hidden">
              <h4 className="text-xl font-black uppercase italic mb-4 text-emerald-400">{t('recursos_systems_over_goals')}</h4>
              <p className="text-sm text-white/70 leading-relaxed">
                {t('recursos_systems_quote')}
              </p>
            </div>
            <div className="p-8 bg-emerald-500 text-white rounded-[32px] shadow-xl relative overflow-hidden">
              <h4 className="text-xl font-black uppercase italic mb-4 text-[#1a2e1e]">{t('recursos_identity_habits')}</h4>
              <p className="text-sm text-white/90 leading-relaxed" dangerouslySetInnerHTML={{ __html: t('recursos_identity_desc') }} />
            </div>
          </div>
        </div>
      )
    },
    {
      id: 3,
      titulo: t('recursos_item_2_title'),
      subtitulo: `9 ${t('recursos_min_read')}`,
      icon: <HelpCircle className="w-5 h-5" />,
      color: "text-blue-600",
      bg: "bg-blue-50",
      content: <QuizComponent />
    },
    {
      id: 4,
      titulo: t('recursos_item_3_title'),
      subtitulo: `9 ${t('recursos_min_read')}`,
      icon: <Copy className="w-5 h-5" />,
      color: "text-rose-600",
      bg: "bg-rose-50",
      content: (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-[#f4faf6] p-4 rounded-2xl border border-[#d8eadb]">
            <span className="text-[10px] font-black uppercase text-[#2d5a3d] tracking-widest">
              {(t('recursos_flashcards') as any[]).length} {t('recursos_flashcards_available')}
            </span>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('recursos_academy')}</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 py-4">
            {(Array.isArray(t('recursos_flashcards')) ? t('recursos_flashcards') : []).map((card: any, i: number) => (
              <FlashcardItem key={i} card={card} index={i} />
            ))}
          </div>
        </div>
      )
    },
    {
      id: 5,
      titulo: t('recursos_item_4_title'),
      subtitulo: `12 ${t('recursos_min_read')}`,
      icon: <Table className="w-5 h-5" />,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      content: (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-[32px] border border-emerald-100 shadow-sm">
            <div>
              <h3 className="text-xl font-black text-[#2d5a3d] uppercase italic tracking-tighter">{t('recursos_item_1_content_title_short') || 'HÁBITOS ATÓMICOS'}</h3>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">{t('recursos_study_case_sub')}</p>
            </div>
            <div className="px-4 py-2 bg-emerald-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-200">
              {t('recursos_study_case')} [1]
            </div>
          </div>

          <div className="overflow-x-auto rounded-[40px] border border-gray-100 shadow-2xl bg-white scrollbar-hide">
            <table className="w-full text-left border-collapse min-w-[1200px]">
              <thead>
                <tr className="bg-[#f7f9f7] border-b border-gray-100">
                  {(Array.isArray(t('recursos_challenges_table.headers')) ? t('recursos_challenges_table.headers') : []).map((header: string, i: number) => (
                    <th key={i} className="p-6 text-[10px] font-black uppercase text-[#2d5a3d] tracking-widest">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {(Array.isArray(t('recursos_challenges_table.rows')) ? t('recursos_challenges_table.rows') : []).map((row: string[], i: number) => (
                  <tr key={i} className="hover:bg-emerald-50/30 transition-colors">
                    <td className="p-6 text-sm font-bold text-[#1a2e1e] max-w-[200px] leading-snug">{row[0]}</td>
                    <td className="p-6 text-xs font-medium text-gray-500 max-w-[180px]">{row[1]}</td>
                    <td className="p-6 text-sm font-black text-emerald-600 max-w-[220px] italic leading-tight">{row[2]}</td>
                    <td className="p-6">
                      <span className="text-[9px] font-black uppercase text-white bg-emerald-500 px-3 py-1.5 rounded-full shadow-sm whitespace-nowrap">
                        {row[3]}
                      </span>
                    </td>
                    <td className="p-6 text-sm font-bold text-[#2d5a3d] max-w-[200px] leading-relaxed">{row[4]}</td>
                    <td className="p-6 text-xs font-medium text-gray-400 italic max-w-[200px]">{row[5]}</td>
                    <td className="p-6 text-[10px] font-black text-emerald-300">{row[6]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('recursos_swipe_hint')}</p>
          </div>
        </div>
      )
    },
    {
      id: 6,
      titulo: t('recursos_item_5_title'),
      subtitulo: `15 ${t('recursos_min_read')}`,
      icon: <GraduationCap className="w-5 h-5" />,
      color: "text-orange-600",
      bg: "bg-orange-50",
      content: (
        <div className="space-y-12 animate-in fade-in duration-700">
          {/* INTRO */}
          <div className="bg-orange-500 rounded-[40px] p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-3xl sm:text-4xl font-black uppercase italic tracking-tighter mb-4 leading-tight">
                {t('recursos_guide.title')}
              </h3>
              <p className="text-lg font-medium text-white/80 leading-relaxed max-w-2xl">
                {t('recursos_guide.intro')}
              </p>
            </div>
            <GraduationCap className="absolute -bottom-8 -right-8 text-white/10 w-64 h-64" />
          </div>

          {/* CUESTIONARIO */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 border-b border-orange-100 pb-4">
              <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center font-black">01</div>
              <h4 className="text-xl font-black text-[#2d5a3d] uppercase tracking-tighter italic">{t('recursos_guide.questions_title')}</h4>
            </div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{t('recursos_guide.questions_intro')}</p>
            <div className="grid gap-3">
              {(Array.isArray(t('recursos_guide.questions')) ? t('recursos_guide.questions') : []).map((q: string, i: number) => (
                <div key={i} className="p-5 bg-white border border-gray-100 rounded-2xl shadow-sm hover:border-orange-200 transition-colors flex gap-4">
                  <span className="text-orange-500 font-black text-xs pt-1">{i + 1}.</span>
                  <p className="text-sm font-bold text-[#2d5a3d]">{q}</p>
                </div>
              ))}
            </div>
          </section>

          {/* RESPUESTAS */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 border-b border-orange-100 pb-4">
              <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center font-black">02</div>
              <h4 className="text-xl font-black text-[#2d5a3d] uppercase tracking-tighter italic">{t('recursos_guide.answers_title')}</h4>
            </div>
            <div className="space-y-4">
              {(Array.isArray(t('recursos_guide.answers')) ? t('recursos_guide.answers') : []).map((ans: string, i: number) => (
                <div key={i} className="p-6 bg-[#fdfaf8] border-l-4 border-orange-400 rounded-r-2xl">
                  <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest block mb-2">{t('recursos_answer_label')} {i + 1}</span>
                  <p className="text-sm font-medium text-gray-700 leading-relaxed">{ans}</p>
                </div>
              ))}
            </div>
          </section>

          {/* TEMAS DE ENSAYO */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 border-b border-orange-100 pb-4">
              <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center font-black">03</div>
              <h4 className="text-xl font-black text-[#2d5a3d] uppercase tracking-tighter italic">{t('recursos_guide.essays_title')}</h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(Array.isArray(t('recursos_guide.essays')) ? t('recursos_guide.essays') : []).map((essay: string, i: number) => (
                <div key={i} className="p-6 bg-white border border-gray-100 rounded-[32px] shadow-sm hover:shadow-md transition-all">
                  <div className="w-8 h-8 bg-orange-50 text-orange-500 rounded-lg flex items-center justify-center mb-4 font-black text-xs">
                    {i + 1}
                  </div>
                  <p className="text-sm font-bold text-[#2d5a3d] leading-snug">{essay}</p>
                </div>
              ))}
            </div>
          </section>

          {/* GLOSARIO */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 border-b border-orange-100 pb-4">
              <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center font-black">04</div>
              <h4 className="text-xl font-black text-[#2d5a3d] uppercase tracking-tighter italic">{t('recursos_guide.glossary_title')}</h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(Array.isArray(t('recursos_guide.glossary')) ? t('recursos_guide.glossary') : []).map((item: any, i: number) => (
                <div key={i} className="p-6 bg-white border-2 border-orange-50 rounded-[28px] hover:border-orange-200 transition-all group">
                  <h5 className="text-xs font-black text-orange-600 uppercase tracking-widest mb-2 group-hover:text-orange-700">{item.t}</h5>
                  <p className="text-xs font-medium text-gray-500 leading-relaxed">{item.d}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      )
    },
    {
      id: 7,
      titulo: t('recursos_item_6_title'),
      subtitulo: `10 ${t('recursos_min_read')}`,
      icon: <Share2 className="w-5 h-5" />,
      color: "text-pink-600",
      bg: "bg-pink-50",
      content: (
        <div className="w-full h-full min-h-screen">
          <div className="pt-24 pb-12 px-6 sm:px-20">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-pink-100 text-pink-600 rounded-[28px] flex items-center justify-center shadow-lg shadow-pink-100">
                  <Target size={32} />
                </div>
                <div>
                  <h4 className="text-3xl font-black text-[#1a2e1e] uppercase tracking-tighter italic leading-none">{t('recursos_mindmap_dynamic')}</h4>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-2">{t('recursos_mindmap_sub')}</p>
                </div>
              </div>
              
              <div className="hidden md:flex items-center gap-3 px-6 py-3 bg-pink-50 rounded-full border-2 border-pink-100">
                <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-black text-pink-700 uppercase tracking-widest">{t('recursos_architecture_system')}</span>
              </div>
            </div>
            
            <div className="bg-[#fdfdfd] border-4 border-gray-50 rounded-[60px] shadow-2xl overflow-hidden relative min-h-[800px]">
              <MindMap />
            </div>
          </div>
        </div>
      )
    },
  ];

  const selectedResource = recursos.find(r => r.id === selectedId);

  return (
    <div className={`min-h-screen bg-[#f7f9f7] pb-20 ${selectedId === 7 ? 'px-0 pt-0' : 'px-4 sm:px-10 pt-10'} transition-all duration-500`}>
      <div className={`${selectedId === 7 ? 'max-w-none' : 'max-w-5xl'} mx-auto transition-all duration-500`}>
        <div className="mb-10 text-center sm:text-left">
          <h2 className="font-fraunces text-[#2d5a3d] text-2xl font-black tracking-tight mb-1">{t('recursos_header')}</h2>
        </div>

        {!selectedId ? (
          <div className="space-y-12">
            {/* CABECERA */}
            <header className="text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#2d5a3d]/10 text-[#2d5a3d] rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
                <Library className="w-3 h-3" />
                {t('recursos_academy')}
              </div>
              <h1 className="text-4xl sm:text-6xl font-black text-[#2d5a3d] italic tracking-tighter uppercase mb-4" dangerouslySetInnerHTML={{ __html: t('recursos_atomic_wisdom') }} />
            </header>

            {/* 🎥 VIDEO MAESTRO */}
            <section>
              <div className="relative aspect-video w-full bg-black rounded-[40px] shadow-2xl overflow-hidden border-4 border-white group">
                <video
                  ref={videoRef}
                  className={`w-full h-full object-cover transition-opacity duration-700 ${isVideoPlaying ? 'opacity-100' : 'opacity-40'}`}
                  controls={isVideoPlaying}
                  src="/videos/introduccion.mp4"
                />
                {!isVideoPlaying && (
                  <div onClick={handleVideoPlay} className="absolute inset-0 z-10 cursor-pointer flex flex-col items-center justify-center bg-black/40">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                      <Play className="text-[#2d5a3d] ml-1" fill="#2d5a3d" size={28} />
                    </div>
                    <h3 className="text-white font-serif text-xl font-bold mt-6">{t('recursos_masterclass_title')}</h3>
                  </div>
                )}
              </div>
            </section>

            {/* 🎧 PODCAST AUDIO */}
            <section>
              <div className="bg-white rounded-[32px] p-6 sm:p-8 border border-[#e8f1e9] shadow-sm flex flex-col md:flex-row items-center gap-8">
                <div className="w-24 h-24 bg-[#f4faf6] rounded-3xl flex items-center justify-center text-4xl shadow-inner border border-[#d8eadb]">
                  🎙️
                </div>
                <div className="flex-1 w-full">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-[#2d4a3e]">{t('recursos_podcast_title')}</h3>
                      <p className="text-xs text-[#7a9b82] font-black uppercase tracking-widest">{t('recursos_podcast_sub')} • {formatTime(duration)}</p>
                    </div>
                    <div className="flex items-center gap-2 text-[#6aaf7a]">
                      <Volume2 size={16} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Audio HQ</span>
                    </div>
                  </div>

                  <audio
                    ref={audioRef}
                    src="/audio/podcast_habitos.mp3"
                    onTimeUpdate={onTimeUpdate}
                    onLoadedMetadata={onLoadedMetadata}
                    onEnded={() => setIsAudioPlaying(false)}
                  />

                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-[10px] font-mono text-[#7a9b82]">{formatTime(currentTime)}</span>
                    <input
                      type="range"
                      min="0"
                      max={duration || 0}
                      value={currentTime}
                      onChange={handleProgressChange}
                      className="flex-1 h-1.5 bg-[#f4faf6] rounded-full appearance-none cursor-pointer accent-[#2d5a3d]"
                    />
                    <span className="text-[10px] font-mono text-[#7a9b82]">{formatTime(duration)}</span>
                  </div>

                  <div className="flex items-center justify-center gap-8">
                    <button onClick={() => skipAudio(-15)} className="text-[#7a9b82] hover:text-[#2d5a3d] transition-colors"><RotateCcw size={24} /></button>
                    <button onClick={toggleAudio} className="w-14 h-14 bg-[#2d5a3d] text-white rounded-full flex items-center justify-center shadow-lg transform active:scale-95 transition-all">
                      {isAudioPlaying ? <Pause fill="white" size={24} /> : <Play fill="white" className="ml-1" size={24} />}
                    </button>
                    <button onClick={() => skipAudio(15)} className="text-[#7a9b82] hover:text-[#2d5a3d] transition-colors"><RotateCw size={24} /></button>
                  </div>
                </div>
              </div>
            </section>

            <div className="grid gap-4">
              {recursos.filter(r => r.id !== 1).map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedId(item.id)}
                  className="group bg-white p-6 rounded-[32px] border border-[#e8f1e9] flex items-center justify-between hover:border-[#2d5a3d] hover:shadow-xl transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-6">
                    <div className={`w-14 h-14 ${item.bg} ${item.color} rounded-[22px] flex items-center justify-center text-2xl transition-transform group-hover:scale-110`}>
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="text-[15px] font-bold text-[#2d4a3e] tracking-tight group-hover:text-[#2d5a3d] uppercase">{item.titulo}</h4>
                      <div className="flex items-center gap-3 mt-1 text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                        <span className="flex items-center gap-1"><Info size={10} /> {t('recursos_support_material')}</span>
                        <span className="text-[#6aaf7a]">• {item.subtitulo}</span>
                      </div>
                    </div>
                  </div>
                  <button className="flex items-center gap-2 px-6 py-3 bg-[#f4faf6] rounded-full border border-[#d8eadb] text-[10px] font-black text-[#2d5a3d] uppercase tracking-widest hover:bg-[#2d5a3d] hover:text-white transition-all">
                    {t('recursos_open_btn')} <ChevronRight size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className={`animate-in fade-in slide-in-from-bottom-4 duration-500 ${selectedId === 7 ? 'w-full' : ''}`}>
            {selectedId !== 7 && (
              <button onClick={() => setSelectedId(null)} className="mb-8 flex items-center gap-2 text-[10px] font-black uppercase text-[#2d5a3d] hover:text-emerald-600 transition-colors px-4 sm:px-0">
                ← {t('common_back_to_academy')}
              </button>
            )}
            <div className={`${selectedId === 7 ? 'bg-white min-h-screen' : 'bg-white rounded-[40px] border border-[#d8eadb] p-8 sm:p-12 shadow-2xl'} overflow-hidden relative transition-all duration-500`}>
              {selectedId === 7 && (
                <div className="absolute top-8 left-8 z-50">
                  <button onClick={() => setSelectedId(null)} className="flex items-center gap-2 px-5 py-2.5 bg-[#1a2e1e] text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-2xl hover:scale-105 active:scale-95">
                    ← {t('common_back_to_academy')}
                  </button>
                </div>
              )}
              
              {selectedId !== 7 && (
                <div className="flex items-center gap-6 mb-10 pb-10 border-b border-[#d8eadb]">
                  <div className={`w-16 h-16 ${selectedResource?.bg} ${selectedResource?.color} rounded-2xl flex items-center justify-center shadow-lg scale-110`}>
                    {selectedResource?.icon}
                  </div>
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-black text-[#2d5a3d] uppercase italic tracking-tighter leading-tight">{selectedResource?.titulo}</h2>
                    <p className="text-[11px] text-[#1a2e1e]/40 font-bold uppercase tracking-widest mt-2">{selectedResource?.subtitulo}</p>
                  </div>
                </div>
              )}

              <div className={selectedId === 7 ? '' : 'prose prose-emerald max-w-none'}>
                {selectedResource?.content}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* --- MODAL PARA PLANOS (PPT) --- */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 sm:p-10 animate-in fade-in duration-300">
          <div className="relative w-full max-w-[1340px] h-full flex flex-col">
            <div className="absolute -top-12 left-0 right-0 flex items-center justify-between">
              <button
                onClick={() => setShowModal(false)}
                className="text-white flex items-center gap-2 font-black text-[10px] tracking-[0.3em] hover:text-emerald-400 transition-colors"
              >
                ← {t('common_back').toUpperCase()}
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="text-white flex items-center gap-2 font-black text-[10px] tracking-[0.3em] hover:text-emerald-400 transition-colors"
              >
                {t('recursos_close_planos')} <XCircle size={20} />
              </button>
            </div>

            <div className="flex-1 bg-white rounded-[32px] overflow-hidden shadow-2xl">
              <iframe
                src={`/planos/planos.html?lang=${lang}`}
                className="w-full h-full border-none"
                title="Presentación Arquitectura Conductual"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function QuizComponent() {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = React.useState(0);
  const [selectedOption, setSelectedOption] = React.useState<number | null>(null);
  const [score, setScore] = React.useState(0);
  const [showResult, setShowResult] = React.useState(false);

  const questions = [
    { q: t('quiz_q1'), options: t('quiz_q1_o') as string[], correct: 1 },
    { q: t('quiz_q2'), options: t('quiz_q2_o') as string[], correct: 2 },
    { q: t('quiz_q3'), options: t('quiz_q3_o') as string[], correct: 0 },
    { q: t('quiz_q4'), options: t('quiz_q4_o') as string[], correct: 1 },
    { q: t('quiz_q5'), options: t('quiz_q5_o') as string[], correct: 0 },
    { q: t('quiz_q6'), options: t('quiz_q6_o') as string[], correct: 3 },
    { q: t('quiz_q7'), options: t('quiz_q7_o') as string[], correct: 2 },
    { q: t('quiz_q8'), options: t('quiz_q8_o') as string[], correct: 1 },
    { q: t('quiz_q9'), options: t('quiz_q9_o') as string[], correct: 3 },
    { q: t('quiz_q10'), options: t('quiz_q10_o') as string[], correct: 3 },
    { q: t('quiz_q11'), options: t('quiz_q11_o') as string[], correct: 3 },
    { q: t('quiz_q12'), options: t('quiz_q12_o') as string[], correct: 2 },
    { q: t('quiz_q13'), options: t('quiz_q13_o') as string[], correct: 0 },
    { q: t('quiz_q14'), options: t('quiz_q14_o') as string[], correct: 0 },
    { q: t('quiz_q15'), options: t('quiz_q15_o') as string[], correct: 1 },
    { q: t('quiz_q16'), options: t('quiz_q16_o') as string[], correct: 2 },
    { q: t('quiz_q17'), options: t('quiz_q17_o') as string[], correct: 3 },
    { q: t('quiz_q18'), options: t('quiz_q18_o') as string[], correct: 1 },
    { q: t('quiz_q19'), options: t('quiz_q19_o') as string[], correct: 0 },
    { q: t('quiz_q20'), options: t('quiz_q20_o') as string[], correct: 2 }
  ];

  const handleSelect = (idx: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(idx);
    if (idx === questions[currentStep].correct) setScore(s => s + 1);
    setTimeout(() => {
      if (currentStep < questions.length - 1) {
        setCurrentStep(s => s + 1);
        setSelectedOption(null);
      } else {
        setShowResult(true);
      }
    }, 1500);
  };

  if (showResult) {
    return (
      <div className="text-center py-12 bg-white rounded-[32px] border border-[#d8eadb] shadow-xl">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl font-black">
          {Math.round((score / questions.length) * 100)}%
        </div>
        <h3 className="text-2xl font-black text-[#2d5a3d] uppercase italic tracking-tighter mb-2">
          {t('quiz_completed')}
        </h3>
        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
          {score} / {questions.length} {t('quiz_correct_label')}
        </p>
      </div>
    );
  }

  const q = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Barra de Progreso */}
      <div className="w-full h-2 bg-[#f4faf6] rounded-full overflow-hidden border border-[#d8eadb]">
        <div 
          className="h-full bg-emerald-500 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex justify-between items-center">
        <span className="text-[10px] font-black uppercase text-[#2d5a3d] tracking-widest bg-[#f4faf6] px-4 py-2 rounded-full border border-[#d8eadb]">
          {t('quiz_question_counter').replace('{current}', (currentStep + 1).toString()).replace('{total}', questions.length.toString())}
        </span>
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          Atomic Academy
        </span>
      </div>

      <h3 className="text-xl sm:text-2xl font-black text-[#2d5a3d] leading-tight">
        {q.q}
      </h3>

      <div className="grid gap-3">
        {(Array.isArray(q.options) ? q.options : []).map((opt, idx) => {
          const isSelected = selectedOption === idx;
          const isCorrect = idx === q.correct;
          const showFeedback = selectedOption !== null;

          return (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              disabled={showFeedback}
              className={`
                w-full p-5 rounded-2xl border-2 transition-all duration-300 text-left relative overflow-hidden group
                ${isSelected 
                  ? (isCorrect ? 'bg-emerald-50 border-emerald-500' : 'bg-rose-50 border-rose-500')
                  : (showFeedback && isCorrect ? 'bg-emerald-50 border-emerald-500' : 'bg-white border-[#e8f1e9] hover:border-emerald-200')
                }
              `}
            >
              <div className="flex items-center gap-4 relative z-10">
                <div className={`
                  w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs transition-colors
                  ${isSelected
                    ? (isCorrect ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white')
                    : (showFeedback && isCorrect ? 'bg-emerald-500 text-white' : 'bg-[#f4faf6] text-[#2d5a3d] group-hover:bg-emerald-100')
                  }
                `}>
                  {String.fromCharCode(65 + idx)}
                </div>
                <span className={`text-sm font-bold ${showFeedback && isCorrect ? 'text-emerald-900' : 'text-gray-700'}`}>
                  {opt}
                </span>
                
                {showFeedback && isCorrect && (
                  <CheckCircle2 className="ml-auto text-emerald-500 shrink-0" size={20} />
                )}
                {showFeedback && isSelected && !isCorrect && (
                  <XCircle className="ml-auto text-rose-500 shrink-0" size={20} />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function FlashcardItem({ card, index }: { card: any; index: number }) {
  const { t } = useTranslation();
  const [isFlipped, setIsFlipped] = useState(false);
  const colors = ["bg-rose-500", "bg-blue-500", "bg-emerald-500", "bg-amber-500", "bg-purple-500", "bg-indigo-500", "bg-cyan-500"];
  const color = colors[index % colors.length];

  return (
    <div 
      className="group h-64 [perspective:1000px] cursor-pointer"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div className={`relative h-full w-full rounded-[32px] transition-all duration-500 [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}>
        <div className={`absolute inset-0 h-full w-full rounded-[32px] ${color} p-8 flex flex-col items-center justify-center text-center [backface-visibility:hidden] shadow-xl`}>
          <h3 className="text-lg font-black text-white uppercase italic tracking-tighter leading-tight">{card.q}</h3>
          <div className="mt-4 flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full">
            <span className="text-[9px] font-black text-white uppercase tracking-widest">{t('recursos_tap_to_flip')}</span>
          </div>
        </div>
        <div className="absolute inset-0 h-full w-full rounded-[32px] bg-[#1a2e1e] p-8 flex flex-col items-center justify-center text-center [transform:rotateY(180deg)] [backface-visibility:hidden] shadow-xl border-4 border-emerald-500/20">
          <p className="text-sm sm:text-base font-medium text-white leading-relaxed">{card.a}</p>
        </div>
      </div>
    </div>
  );
}