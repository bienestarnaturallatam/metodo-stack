'use client';
import React, { useState } from 'react';
import { X, Check, Activity, Target, Wallet, BookOpen, Smartphone, Copy, CheckCircle2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  defaultModuleName: string;
}

export default function LocalModulePaymentModal({ isOpen, onClose, defaultModuleName }: Props) {
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
      price: '9.90'
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
      price: '9.90'
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
      price: '9.90'
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
      price: '9.90'
    }
  ];

  // Initialize selected module based on defaultModuleName
  const [selectedModule, setSelectedModule] = useState(() => {
    if (!defaultModuleName) return 'habitos';
    const clean = defaultModuleName.toLowerCase();
    if (clean.includes('habito')) return 'habitos';
    if (clean.includes('enfoque')) return 'enfoque';
    if (clean.includes('finanza')) return 'finanzas';
    if (clean.includes('recurso')) return 'recursos';
    return 'habitos';
  });

  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentMod = modules.find(m => m.id === selectedModule) || modules[0];

  const handleCopy = () => {
    navigator.clipboard.writeText('989078285');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const WSP_LINK = "https://wa.me/51914587375?text=Hola%20Orlando!%20Acabo%20de%20hacer%20el%20pago%20de%20la%20suscripci%C3%B3n%20" + encodeURIComponent(currentMod.name) + "%20por%20S/." + encodeURIComponent(currentMod.price) + ".%20Aquí%20tienes%20la%20captura.";

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 overflow-y-auto">
      <div className="absolute inset-0 bg-black/95 backdrop-blur-md" onClick={onClose} />
      
      {/* Mobile Floating Close Button */}
      <button 
        onClick={onClose}
        className="fixed lg:hidden top-4 right-4 p-2.5 bg-black/60 hover:bg-black/80 border border-white/10 backdrop-blur-md rounded-full transition-all duration-300 z-[1050] text-white/70 hover:text-white flex items-center justify-center shadow-lg"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="relative w-full max-w-6xl bg-[#0D0D0D] border border-white/10 rounded-[32px] md:rounded-[40px] overflow-hidden shadow-[0_0_60px_rgba(0,200,83,0.2)] text-white z-10 animate-in zoom-in-95 duration-300 max-h-none lg:max-h-[90vh] flex flex-col">
        {/* Desktop Close Button */}
        <button 
          onClick={onClose}
          className="hidden lg:block absolute top-6 right-6 p-2 hover:bg-white/5 rounded-full transition-colors z-20 text-white/40 hover:text-white"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Modal Header */}
        <div className="p-6 md:p-10 pb-2 shrink-0">
          <div className="flex items-center gap-3 mb-3">
            <span className="bg-[#00C853]/10 text-[#00C853] text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-full">
              🇵🇪 PAGO LOCAL PERÚ
            </span>
            <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
              Activación Inmediata
            </span>
          </div>
          <h3 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter text-white leading-none">
            Elige tu Módulo de Crecimiento
          </h3>
          <p className="text-xs font-bold text-white/40 uppercase tracking-widest mt-1.5">
            S/. 9.90 soles por cada módulo / año · Pago único · Yape o Plin
          </p>
        </div>

        {/* Modal Content - Split Layout on Desktop */}
        <div className="p-4 md:p-10 pt-1 lg:overflow-y-auto flex-grow lg:min-h-0 flex flex-col lg:grid lg:grid-cols-5 gap-4 lg:gap-8">
          
          {/* Left Column: 4 Modules Grid Selector */}
          <div className="lg:col-span-3 space-y-3 lg:space-y-4 overflow-y-visible">
            <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-1 lg:mb-2">Selecciona un módulo para ver detalles de pago</p>
            <div className="grid grid-cols-2 gap-2 lg:gap-3">
              {modules.map((mod) => {
                const active = selectedModule === mod.id;
                return (
                  <div 
                    key={mod.id}
                    onClick={() => setSelectedModule(mod.id)}
                    className={`flex flex-col justify-center p-2.5 sm:p-3 md:p-5 bg-white/5 border rounded-[16px] md:rounded-[24px] cursor-pointer transition-all duration-300 ${active ? mod.activeBorder : `border-white/10 ${mod.borderColor}`} hover:scale-[1.02] active:scale-98 group`}
                  >
                    {/* Card Header */}
                    <div className="flex flex-col items-center text-center gap-1">
                      <div className={`w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 ${mod.iconBg} rounded-xl flex items-center justify-center shrink-0 mb-1`}>
                        {React.cloneElement(mod.icon as React.ReactElement<any>, { className: 'w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5' })}
                      </div>
                      <h4 className="text-[9px] sm:text-[10px] md:text-xs font-black italic uppercase tracking-tight text-white leading-tight">
                        {mod.name}
                      </h4>
                      <span className="text-[10px] sm:text-[11px] md:text-sm font-black text-white italic">S/. {mod.price}</span>
                      {active && (
                        <span className="text-[7px] sm:text-[8px] font-black text-[#00C853] uppercase tracking-widest block animate-pulse">
                          Seleccionado
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Local Yape / Plin Payment Instructions */}
          <div className="lg:col-span-2 flex flex-col justify-between bg-white/5 border border-white/10 rounded-[24px] lg:rounded-[32px] p-4 lg:p-6 shadow-2xl relative overflow-hidden group">
            {/* Ambient Background Glow matching selected module */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#00C853]/15 rounded-full blur-3xl pointer-events-none group-hover:bg-[#00C853]/25 transition-all duration-500" />
            
            <div className="space-y-4 lg:space-y-6">
              {/* Header: Yape or Plin */}
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-[#00C853]" />
                  <h3 className="text-xs lg:text-sm font-black italic uppercase tracking-tight text-white">PAGO YAPE O PLIN</h3>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 bg-white/5 px-2 py-1 rounded-lg">
                  <img src="/pagos/yape.png" alt="Yape" className="h-4 object-contain" />
                  <img src="/pagos/plin.png" alt="Plin" className="h-4 object-contain" />
                </div>
              </div>

              {/* Selected Plan and Price Display - SUPER COMPACT */}
              <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <span className="text-[8px] font-black text-white/30 uppercase tracking-widest block mb-0.5">Módulo</span>
                  <span className="text-xs font-black uppercase text-[#00C853] truncate block">
                    {currentMod.name.replace('MÓDULO ', '')}
                  </span>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[8px] font-black text-white/30 uppercase tracking-widest block mb-0.5">Total a transferir</span>
                  <span className="text-xl lg:text-2xl font-black text-white italic">S/. {currentMod.price}</span>
                </div>
              </div>

              {/* Payment details */}
              <div className="space-y-2 bg-white/[0.01] p-3 rounded-xl border border-white/5 text-[11px] lg:text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-white/5">
                  <span className="text-white/40 font-bold uppercase tracking-wider text-[8px] lg:text-[10px]">Titular</span>
                  <span className="font-black uppercase italic text-white text-right text-xs">Orlando Hurtado Valle</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/40 font-bold uppercase tracking-wider text-[8px] lg:text-[10px]">Celular Yape/Plin</span>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-[#00C853] text-sm lg:text-base tracking-wide">989078285</span>
                    <button 
                      onClick={handleCopy}
                      className="p-1.5 bg-white/5 hover:bg-white/10 active:scale-95 rounded-lg text-white/60 hover:text-white transition-all"
                      title="Copiar número"
                    >
                      {copied ? (
                        <Check className="w-3.5 h-3.5 text-[#00C853]" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <p className="text-[8px] lg:text-[9px] font-semibold text-white/40 uppercase text-center leading-relaxed">
                👉 Envía la captura del yape o plin para darte acceso de inmediato.
              </p>
            </div>

            {/* CTA Button */}
            <a
              href={WSP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full mt-4 py-3 lg:py-4 bg-[#00C853] text-black hover:scale-[1.02] active:scale-95 rounded-xl lg:rounded-2xl font-black italic text-[10px] lg:text-xs tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#00C853]/20 no-underline"
            >
              <span>NOTIFICAR PAGO POR WHATSAPP</span>
            </a>

            {/* Mobile Close Link */}
            <button
              onClick={onClose}
              className="block lg:hidden w-full text-center mt-3 text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-white/60 transition-colors py-2"
            >
              ← Volver y Cerrar
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-white/5 bg-[#0A0A0A] flex flex-col sm:flex-row justify-between items-center gap-3 text-center sm:text-left text-white/40 text-[9px] font-black uppercase tracking-wider shrink-0">
          <div>
            🔒 Activación 100% garantizada y atendida por soporte en Perú.
          </div>
          <div>
            🛡️ Soporte directo por WhatsApp las 24 horas del día.
          </div>
        </div>
      </div>
    </div>
  );
}
