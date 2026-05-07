'use client';
import React, { useState, useEffect } from 'react';

export default function TourBienvenida() {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  const steps = [
    {
      icono: '🎯',
      titulo: '¡BIENVENIDA AL MÉTODO STACK!',
      texto: 'Aquí centralizamos toda la ingeniería conductual para tu rediseño de sistemas.'
    },
    {
      icono: '📱',
      titulo: 'MÉTODO STACK SIEMPRE A MANO',
      texto: 'El último paso es el más importante: Ancla el Método STACK a la pantalla de inicio. Así entrarás en 1 segundo sin depender de links. ¡Hazlo obvio!',
      selector: '#install-app-btn'
    }
  ];

  useEffect(() => {
    const completado = localStorage.getItem('tourStack_Global_v1');
    if (!completado) {
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!visible) return null;

  const current = steps[step];

  return (
    <div className="fixed inset-0 z-[10000] bg-black/85 flex items-center justify-center p-6 backdrop-blur-md font-sans">
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
                localStorage.setItem('tourStack_Global_v1', 'true');
                setVisible(false);
              }}
              className="w-full py-6 bg-[#2d5a3d] text-white font-black rounded-3xl shadow-xl shadow-green-900/20 active:scale-95 transition-all uppercase text-xs tracking-[0.2em]"
            >
              ¡Entendido, vamos!
            </button>
          )}
          <button 
            onClick={() => {
              localStorage.setItem('tourStack_Global_v1', 'true');
              setVisible(false);
            }} 
            className="text-[10px] font-black text-gray-300 uppercase tracking-widest hover:text-gray-500 transition-colors"
          >
            Saltar Tour
          </button>
        </div>
      </div>
    </div>
  );
}