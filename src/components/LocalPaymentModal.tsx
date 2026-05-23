'use client';
import React, { useState } from 'react';
import { X, Check, Smartphone, Copy, CheckCircle2, Zap } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  planName: string;
  price: string;
}

export default function LocalPaymentModal({ isOpen, onClose, planName, price }: Props) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText('989078285');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const finalPlanName = "STACK COMPLETO (SISTEMA ENTERO)";
  const finalPrice = "19.90";

  const WSP_LINK = "https://wa.me/51914587375?text=Hola%20Orlando!%20Acabo%20de%20hacer%20el%20pago%20de%20la%20suscripci%C3%B3n%20" + encodeURIComponent(finalPlanName) + "%20por%20S/." + encodeURIComponent(finalPrice) + ".%20Aquí%20tienes%20la%20captura.";

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 overflow-y-auto">
      <div className="absolute inset-0 bg-black/95 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative w-full max-w-6xl bg-[#0D0D0D] border border-white/10 rounded-[32px] md:rounded-[40px] overflow-hidden shadow-[0_0_60px_rgba(0,200,83,0.2)] text-white z-10 animate-in zoom-in-95 duration-300 max-h-[95vh] md:max-h-[90vh] flex flex-col">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 hover:bg-white/5 rounded-full transition-colors z-20 text-white/40 hover:text-white"
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
            Activa el Sistema Completo
          </h3>
          <p className="text-xs font-bold text-white/40 uppercase tracking-widest mt-1.5">
            S/. 19.90 soles / año · Pago único · Acceso total
          </p>
        </div>

        {/* Modal Content - Split Layout on Desktop */}
        <div className="p-6 md:p-10 pt-2 overflow-y-auto flex-grow grid grid-cols-1 lg:grid-cols-5 gap-8">
          
          {/* Left Column: Stack Completo visual card with glow */}
          <div className="lg:col-span-3 space-y-4 overflow-y-visible">
            <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-2">Detalles de tu suscripción</p>
            
            <div className="p-6 bg-white/5 border-2 border-[#00C853] shadow-[0_0_25px_rgba(0,200,83,0.15)] rounded-[24px] flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#00C853]/10 rounded-xl flex items-center justify-center shrink-0">
                      <Zap className="w-6 h-6 text-[#00C853] fill-[#00C853]" />
                    </div>
                    <div>
                      <h4 className="text-base font-black italic uppercase tracking-tight text-white leading-none">
                        {finalPlanName}
                      </h4>
                      <span className="text-[9px] font-black text-[#00C853] uppercase tracking-widest block mt-1 animate-pulse">
                        Acceso Total Ilimitado
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-black text-white italic">S/. {finalPrice}</span>
                    <span className="text-[9px] font-bold text-white/30 uppercase block leading-none">/ año</span>
                  </div>
                </div>

                <p className="text-xs font-medium text-white/60 leading-relaxed mb-5">
                  El sistema definitivo completo. Incluye el acceso ilimitado a los 4 módulos de crecimiento personal para transformar tus hábitos, enfoque semanal, control financiero y mentalidad.
                </p>

                {/* Features list */}
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
                  <li className="flex items-start gap-2 text-xs font-semibold text-white/90 leading-snug">
                    <Check className="w-4 h-4 text-[#00C853] shrink-0 mt-0.5" />
                    <span><strong>Módulo Hábitos</strong> — Hábitos ilimitados y rachas</span>
                  </li>
                  <li className="flex items-start gap-2 text-xs font-semibold text-white/90 leading-snug">
                    <Check className="w-4 h-4 text-[#00C853] shrink-0 mt-0.5" />
                    <span><strong>Módulo Enfoque</strong> — Planeador y deep work</span>
                  </li>
                  <li className="flex items-start gap-2 text-xs font-semibold text-white/90 leading-snug">
                    <Check className="w-4 h-4 text-[#00C853] shrink-0 mt-0.5" />
                    <span><strong>Módulo Finanzas</strong> — Motor e historial</span>
                  </li>
                  <li className="flex items-start gap-2 text-xs font-semibold text-white/90 leading-snug">
                    <Check className="w-4 h-4 text-[#00C853] shrink-0 mt-0.5" />
                    <span><strong>Módulo Recursos</strong> — Libros y plantillas</span>
                  </li>
                  <li className="flex items-start gap-2 text-xs font-semibold text-white/90 leading-snug">
                    <Check className="w-4 h-4 text-[#00C853] shrink-0 mt-0.5" />
                    <span><strong>Soporte 24/7</strong> — Atención prioritaria</span>
                  </li>
                  <li className="flex items-start gap-2 text-xs font-semibold text-white/90 leading-snug">
                    <Check className="w-4 h-4 text-[#00C853] shrink-0 mt-0.5" />
                    <span><strong>Pago Único Anual</strong> — Sin sorpresas</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Right Column: Local Yape / Plin Payment Instructions */}
          <div className="lg:col-span-2 flex flex-col justify-between bg-white/5 border border-white/10 rounded-[32px] p-6 shadow-2xl relative overflow-hidden group">
            {/* Ambient Background Glow */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#00C853]/15 rounded-full blur-3xl pointer-events-none group-hover:bg-[#00C853]/25 transition-all duration-500" />
            
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-white/5">
                <div className="w-10 h-10 bg-[#00C853]/10 rounded-xl flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-[#00C853]" />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-white/40 leading-none">Detalles del pago</h4>
                  <h3 className="text-lg font-black italic uppercase tracking-tighter text-white mt-1 leading-none">YAPE O PLIN</h3>
                </div>
              </div>

              {/* Selected Plan and Price Display */}
              <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">Plan a activar</p>
                <div className="text-sm font-black uppercase text-[#00C853] tracking-wide mb-3 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  {finalPlanName}
                </div>
                
                <div className="flex justify-between items-end border-t border-white/5 pt-3">
                  <span className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Total a transferir</span>
                  <div className="text-right">
                    <span className="text-3xl font-black text-white italic">S/. {finalPrice}</span>
                    <span className="text-[8px] font-bold text-white/30 uppercase block">Pago único / año</span>
                  </div>
                </div>
              </div>

              {/* Visual payment logos */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-white/[0.02] rounded-xl border border-white/5 flex flex-col items-center gap-2">
                  <img src="/pagos/yape.png" alt="Yape" className="h-9 object-contain" />
                  <span className="text-[8px] font-black uppercase text-white/40">Disponible</span>
                </div>
                <div className="p-3 bg-white/[0.02] rounded-xl border border-white/5 flex flex-col items-center gap-2">
                  <img src="/pagos/plin.png" alt="Plin" className="h-9 object-contain" />
                  <span className="text-[8px] font-black uppercase text-white/40">Disponible</span>
                </div>
              </div>

              {/* Payment details */}
              <div className="space-y-3 bg-white/[0.01] p-4 rounded-2xl border border-white/5 text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-white/5">
                  <span className="font-semibold text-white/40 uppercase tracking-wider text-[10px]">Titular</span>
                  <span className="font-black uppercase italic text-white text-right">Orlando Hurtado Valle</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-white/40 uppercase tracking-wider text-[10px]">Celular</span>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-[#00C853] text-base tracking-wide">989078285</span>
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

              <p className="text-[9px] font-semibold text-white/40 uppercase text-center leading-relaxed">
                👉 Envía la captura del yape o plin para darte acceso de inmediato.
              </p>
            </div>

            {/* CTA Button */}
            <a
              href={WSP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full mt-6 py-4 bg-[#00C853] text-black hover:scale-[1.02] active:scale-95 rounded-2xl font-black italic text-xs tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#00C853]/20 no-underline"
            >
              <span>NOTIFICAR PAGO POR WHATSAPP</span>
            </a>
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
