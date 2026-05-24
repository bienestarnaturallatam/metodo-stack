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
      
      {/* Mobile Floating Close Button */}
      <button 
        onClick={onClose}
        className="fixed lg:hidden top-4 right-4 p-2.5 bg-black/60 hover:bg-black/80 border border-white/10 backdrop-blur-md rounded-full transition-all duration-300 z-[1050] text-white/70 hover:text-white flex items-center justify-center shadow-lg"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="relative w-full max-w-5xl bg-[#0D0D0D] border border-white/10 rounded-[32px] md:rounded-[40px] overflow-hidden shadow-[0_0_60px_rgba(0,200,83,0.15)] text-white z-10 animate-in zoom-in-95 duration-300 max-h-none lg:max-h-[90vh] flex flex-col">
        {/* Desktop Close Button */}
        <button 
          onClick={onClose}
          className="hidden lg:block absolute top-6 right-6 p-2 hover:bg-white/5 rounded-full transition-colors z-20 text-white/40 hover:text-white"
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
        <div className="p-8 md:p-12 pt-0 lg:overflow-y-auto flex-grow lg:min-h-0 flex flex-col space-y-8">
          <div className="grid grid-cols-2 gap-3 md:gap-6">
            {modules.map((mod) => {
              const active = isCardActive(mod.name);
              return (
                <div 
                  key={mod.id}
                  className={`flex flex-col justify-center p-3 md:p-6 bg-white/5 border rounded-[16px] md:rounded-[32px] transition-all duration-300 ${active ? mod.activeBorder : `border-white/10 ${mod.borderColor}`} group`}
                >
                  <div>
                    {/* Header Card */}
                    <div className="flex flex-col items-center text-center gap-1 mb-3">
                      <div className={`w-8 h-8 md:w-10 md:h-10 ${mod.iconBg} rounded-xl flex items-center justify-center shrink-0 mb-1`}>
                        {React.cloneElement(mod.icon as React.ReactElement<any>, { className: 'w-4 h-4 md:w-5 md:h-5' })}
                      </div>
                      <h4 className="text-[10px] md:text-sm font-black italic uppercase tracking-tight text-white leading-tight">
                        {mod.name}
                      </h4>
                      <div className="text-center mt-1">
                        <span className="text-[11px] md:text-lg font-black text-white italic">USD $7.90</span>
                        <span className="text-[8px] md:text-[9px] font-bold text-white/30 uppercase block leading-none">/ año</span>
                      </div>
                      {active && (
                        <span className="text-[8px] font-black text-[#00C853] uppercase tracking-widest block mt-1 animate-pulse">
                          Selección actual
                        </span>
                      )}
                    </div>

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

          {/* Mobile Close Link */}
          <button
            onClick={onClose}
            className="block lg:hidden w-full text-center text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-white/60 transition-colors py-2"
          >
            ← Volver y Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
