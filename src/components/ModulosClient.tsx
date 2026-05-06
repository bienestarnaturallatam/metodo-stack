'use client';
import React, { useState, useRef } from 'react';
import { Target, Layers, Wallet, BookOpen, ChevronRight, Zap, Shield, BarChart3, Clock, Play } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

const ModulosClient: React.FC = () => {
  const { t } = useTranslation();
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handlePlay = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const modulos = [
    {
      id: 'tracker',
      title: t('tracker_tab'),
      icon: <Target className="w-8 h-8 text-emerald-500" />,
      desc: 'El primer pilar para la transformación de identidad a través de la repetición cuantificable.',
      color: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      points: [
        { title: 'Registro de Votos', text: 'Cada cumplimiento es un voto por la persona que quieres ser.' },
        { title: 'Termómetro Emocional', text: 'Mide la correlación entre tus hábitos y tu estado mental.' },
        { title: 'Racha Dorada', text: 'La Regla de Oro: Nunca falles dos veces.' }
      ]
    },
    {
      id: 'planner',
      title: t('planner_tab'),
      icon: <Layers className="w-8 h-8 text-blue-500" />,
      desc: 'Ingeniería táctica para eliminar el ruido mental y dominar el enfoque diario.',
      color: 'bg-blue-50',
      borderColor: 'border-blue-200',
      points: [
        { title: '3 Batallas Críticas', text: 'Priorización extrema. Menos es más impacto.' },
        { title: 'Modo Deep Work', text: 'Elimina distracciones y entra en estado de flujo técnico.' },
        { title: 'Vaciado Mental', text: 'Libera RAM cerebral anotando todo lo que drena tu energía.' }
      ]
    },
    {
      id: 'finanzas',
      title: t('finances_tab'),
      icon: <Wallet className="w-8 h-8 text-amber-500" />,
      desc: 'Optimización de recursos para comprar tiempo y libertad acumulada.',
      color: 'bg-amber-50',
      borderColor: 'border-amber-200',
      points: [
        { title: 'Supervivencia Real', text: 'Calcula cuántos días puedes vivir sin ingresos hoy.' },
        { title: 'Semáforo de Gasto', text: 'Visualiza si tu dinero alimenta o drena tu sistema.' },
        { title: 'Ahorro Estratégico', text: 'No ahorres lo que sobra, gasta lo que sobra tras ahorrar.' }
      ]
    }
  ];

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-green/10 text-brand-green rounded-full text-[10px] font-black uppercase tracking-widest mb-4 border border-brand-green/20">
          <Zap size={12} className="fill-current" />
          <span>Manual de Operaciones</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-app-text mb-4 tracking-tighter uppercase italic">
          Arquitectura del <span className="text-brand-green">Sistema</span>
        </h1>
        <p className="text-app-text3 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed font-medium">
          El MÉTODO STACK no es un conjunto de herramientas aisladas, es un Sistema Operativo Personal diseñado con ingeniería conductual.
        </p>
      </header>

      {/* TUTORIAL VIDEO SECTION (VERTICAL 9:16) */}
      <section className="mb-20 max-w-[400px] mx-auto px-4">
        <div className="relative aspect-[9/16] bg-black rounded-[40px] overflow-hidden border-4 border-white shadow-2xl group cursor-pointer">
          <video 
            ref={videoRef}
            src="/videos/tutorial_modulos.mp4"
            className={`w-full h-full object-cover transition-opacity duration-1000 ${isPlaying ? 'opacity-100' : 'opacity-40'}`}
            controls={isPlaying}
          />
          {!isPlaying && (
            <div 
              onClick={handlePlay}
              className="absolute inset-0 flex flex-col items-center justify-center bg-black/20 hover:bg-black/40 transition-all duration-500"
            >
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-500">
                <Play className="text-brand-green ml-1" size={40} fill="currentColor" />
              </div>
              <p className="mt-8 text-white font-black uppercase tracking-[0.4em] text-xs sm:text-sm drop-shadow-lg">
                🎥 TUTORIAL: CÓMO USAR MIS MÓDULOS
              </p>
            </div>
          )}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
        {modulos.map((m) => (
          <div 
            key={m.id} 
            className={`${m.color} border ${m.borderColor} rounded-[32px] p-8 shadow-xl hover:scale-[1.02] transition-all duration-500 group flex flex-col`}
          >
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg mb-8 group-hover:rotate-6 transition-transform">
              {m.icon}
            </div>
            
            <h2 className="text-2xl font-black text-app-text mb-3 uppercase tracking-tight italic">
              {m.title}
            </h2>
            <p className="text-app-text2 text-sm leading-relaxed mb-8 font-medium italic">
              {m.desc}
            </p>

            <div className="space-y-6 mt-auto">
              {m.points.map((p, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm text-[10px] font-black text-app-text">
                    {idx + 1}
                  </div>
                  <div>
                    <h4 className="text-[11px] font-black uppercase text-app-text tracking-widest mb-1">{p.title}</h4>
                    <p className="text-[10px] text-app-text3 leading-relaxed font-medium">{p.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <section className="bg-white border border-app-border rounded-[40px] p-8 sm:p-16 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none">
          <Shield size={300} />
        </div>
        
        <div className="relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <h3 className="text-3xl font-black text-app-text mb-6 uppercase tracking-tight italic leading-none">
                La Regla de Oro del <br/>
                <span className="text-brand-green text-5xl sm:text-6xl">Ingeniero STACK</span>
              </h3>
              <p className="text-app-text2 text-sm sm:text-base leading-relaxed mb-8 font-medium">
                Un sistema no falla cuando hay un error, un sistema falla cuando el error se ignora. En el Método STACK, aplicamos la auditoría constante para rediseñar nuestros procesos.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <div className="px-6 py-4 bg-app-bg rounded-2xl border border-app-border flex items-center gap-4">
                  <BarChart3 className="text-brand-green" size={24} />
                  <div>
                    <p className="text-[10px] font-black uppercase text-app-text3">Métrica Clave</p>
                    <p className="text-sm font-black text-app-text italic">Consistencia {'>'} Intensidad</p>
                  </div>
                </div>
                <div className="px-6 py-4 bg-app-bg rounded-2xl border border-app-border flex items-center gap-4">
                  <Clock className="text-brand-green" size={24} />
                  <div>
                    <p className="text-[10px] font-black uppercase text-app-text3">Ciclo de Ajuste</p>
                    <p className="text-sm font-black text-app-text italic">Reflexión Semanal</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-brand-green/5 border border-brand-green/10 rounded-3xl p-8 italic">
              <p className="text-xl sm:text-2xl font-black text-brand-green leading-tight mb-6">
                "No te elevas al nivel de tus metas. Caes al nivel de tus sistemas."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-brand-green flex items-center justify-center text-white font-black italic">
                  JC
                </div>
                <div>
                  <p className="text-xs font-black uppercase text-app-text tracking-widest">James Clear</p>
                  <p className="text-[10px] text-app-text3 font-bold">Inspiración del Método STACK</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="mt-20 text-center pb-12">
        <p className="text-[10px] font-black text-app-text3 uppercase tracking-[0.4em]">
          MÉTODO STACK · Ingeniería Conductual Aplicada
        </p>
      </footer>
    </div>
  );
};

export default ModulosClient;
