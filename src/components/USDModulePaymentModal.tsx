'use client';
import React from 'react';
import { X, Check, Activity, Target, Wallet, BookOpen, ExternalLink } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  defaultModuleName: string;
}

export default function USDModulePaymentModal({ isOpen, onClose, defaultModuleName }: Props) {
  if (!isOpen) return null;

  const modules = [
    {
      id: 'habitos',
      name: 'MÓDULO HÁBITOS',
      icon: <Activity className="w-6 h-6 text-[#00C853]" />,
      iconBg: 'bg-[#00C853]/10',
      borderColor: 'hover:border-[#00C853]/40',
      activeBorder: 'border-2 border-[#00C853] shadow-[0_0_25px_rgba(0,200,83,0.15)]',
      desc: 'El sistema definitivo para romper la inercia y construir rutinas consistentes sin depender de la fuerza de voluntad.',
      features: [
        'Registro de hábitos ilimitados',
        'Rachas dinámicas (streaks) y recordatorios',
        'Gráficos de consistencia y análisis mensual',
        'Registro y correlación de estado de ánimo'
      ],
      price: '7.90',
      link: 'https://pay.hotmart.com/S105741679E?off=3wb78rk1&checkoutMode=10'
    },
    {
      id: 'enfoque',
      name: 'MÓDULO ENFOQUE',
      icon: <Target className="w-6 h-6 text-[#1565C0]" />,
      iconBg: 'bg-[#1565C0]/10',
      borderColor: 'hover:border-[#1565C0]/40',
      activeBorder: 'border-2 border-[#1565C0] shadow-[0_0_25px_rgba(21,101,192,0.15)]',
      desc: 'Planeación semanal táctica y gestión de tareas de alta prioridad para avanzar en tus metas reales cada día.',
      features: [
        'Planeador semanal interactivo premium',
        'Gestión de tareas con prioridades tácticas',
        'Temporizador integrado para Trabajo Profundo',
        'Bloqueo del tiempo y foco diario'
      ],
      price: '7.90',
      link: 'https://pay.hotmart.com/S105741679E?off=4777xbw2&checkoutMode=10'
    },
    {
      id: 'finanzas',
      name: 'MÓDULO FINANZAS',
      icon: <Wallet className="w-6 h-6 text-[#E65100]" />,
      iconBg: 'bg-[#E65100]/10',
      borderColor: 'hover:border-[#E65100]/40',
      activeBorder: 'border-2 border-[#E65100] shadow-[0_0_25px_rgba(230,81,0,0.15)]',
      desc: 'Toma el control absoluto de tus números. Registra tus ingresos, analiza egresos y acelera tu ahorro.',
      features: [
        'Motor financiero e historial detallado',
        'Visualizador inteligente de ingresos/gastos',
        'Semáforo de presupuesto por categorías',
        'Plan interactivo para liquidar deudas'
      ],
      price: '7.90',
      link: 'https://pay.hotmart.com/S105741679E?off=v52qrhx7&checkoutMode=10'
    },
    {
      id: 'recursos',
      name: 'MÓDULO RECURSOS',
      icon: <BookOpen className="w-6 h-6 text-[#6A1B9A]" />,
      iconBg: 'bg-[#6A1B9A]/10',
      borderColor: 'hover:border-[#6A1B9A]/40',
      activeBorder: 'border-2 border-[#6A1B9A] shadow-[0_0_25px_rgba(106,27,154,0.15)]',
      desc: 'Plantillas maestras optimizadas para Google Sheets y resúmenes accionables de libros para potenciar tu mente.',
      features: [
        'Plantilla premium descargable de Hábitos',
        'Plantilla premium de Planeación Semanal',
        'Resumen interactivo de Hábitos Atómicos',
        'Guías prácticas y de configuración'
      ],
      price: '7.90',
      link: 'https://pay.hotmart.com/S105741679E?off=4wr9mj25&checkoutMode=10'
    }
  ];

  // Helper to determine if a card should be highlighted by default
  const isCardActive = (modName: string) => {
    if (!defaultModuleName) return false;
    const cleanDefault = defaultModuleName.toLowerCase();
    const cleanMod = modName.toLowerCase();
    return cleanDefault.includes(cleanMod) || cleanMod.includes(cleanDefault);
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 overflow-y-auto">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative w-full max-w-5xl bg-[#0D0D0D] border border-white/10 rounded-[32px] md:rounded-[40px] overflow-hidden shadow-[0_0_60px_rgba(0,200,83,0.15)] text-white z-10 animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 hover:bg-white/5 rounded-full transition-colors z-20 text-white/40 hover:text-white"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Modal Header (Fixed at Top) */}
        <div className="p-8 md:p-12 pb-4 shrink-0">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-[#00C853]/10 text-[#00C853] text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-full">
              PAGO SEGURO VÍA HOTMART
            </span>
            <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
              Internacional (USD)
            </span>
          </div>
          <h3 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter text-white">
            Elige tu Módulo de Crecimiento
          </h3>
          <p className="text-xs font-bold text-white/40 uppercase tracking-widest mt-1">
            USD $7.90 por cada módulo / año · Pago único · Sin cobros sorpresa
          </p>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-8 md:p-12 pt-0 overflow-y-auto flex-grow space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {modules.map((mod) => {
              const active = isCardActive(mod.name);
              return (
                <div 
                  key={mod.id}
                  className={`flex flex-col justify-between p-6 bg-white/5 border rounded-[24px] md:rounded-[32px] transition-all duration-300 ${active ? mod.activeBorder : `border-white/10 ${mod.borderColor}`} group`}
                >
                  <div>
                    {/* Header Card */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 ${mod.iconBg} rounded-xl flex items-center justify-center shrink-0`}>
                          {mod.icon}
                        </div>
                        <div>
                          <h4 className="text-sm font-black italic uppercase tracking-tight text-white leading-none">
                            {mod.name}
                          </h4>
                          {active && (
                            <span className="text-[8px] font-black text-[#00C853] uppercase tracking-widest block mt-0.5 animate-pulse">
                              Selección actual
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-black text-white italic">USD $7.90</span>
                        <span className="text-[9px] font-bold text-white/30 uppercase block leading-none">/ año</span>
                      </div>
                    </div>

                    <p className="text-xs font-medium text-white/60 leading-relaxed mb-4">
                      {mod.desc}
                    </p>

                    {/* Features list */}
                    <ul className="space-y-2 mb-6">
                      {mod.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-[11px] font-semibold text-white/80 leading-snug">
                          <Check className="w-3.5 h-3.5 text-[#00C853] shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CTA Button */}
                  <a
                    href={mod.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 bg-white text-black hover:bg-[#00C853] hover:text-black rounded-xl font-black italic text-xs tracking-widest transition-all flex items-center justify-center gap-2 group-hover:scale-[1.02] active:scale-95 shadow-md shadow-black/10 no-underline"
                  >
                    <span>COMPRAR MÓDULO</span>
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                  </a>
                </div>
              );
            })}
          </div>

          {/* Guarantee and Safety disclaimer */}
          <div className="pt-6 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left text-white/40 text-[9px] font-bold uppercase tracking-wider">
            <div>
              🔒 Compra 100% segura procesada y respaldada por Hotmart.
            </div>
            <div>
              🛡️ Garantía incondicional de satisfacción de 7 días.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
