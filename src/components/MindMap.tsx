'use client';
import React from 'react';
import { Zap } from 'lucide-react';

interface SubTask {
  id: string;
  label: string;
}

interface Branch {
  id: string;
  label: string;
  color: string;
  level: string;
  items: SubTask[];
}

const mindMapData: Branch[] = [
  {
    id: 'fundamentos',
    label: 'Fundamentos',
    level: 'Nivel 01',
    color: '#3b82f6', // Blue
    items: [
      { id: 'f1', label: 'Interés compuesto de la superación' },
      { id: 'f2', label: 'Mejoras marginales del 1%' },
      { id: 'f3', label: 'Meseta de potencial latente' },
      { id: 'f4', label: 'Sistemas vs. Metas' },
    ]
  },
  {
    id: 'identidad',
    label: 'Cambio de Identidad',
    level: 'Nivel 02',
    color: '#a855f7', // Purple
    items: [
      { id: 'i1', label: 'Capas: Resultados, Procesos, Identidad' },
      { id: 'i2', label: 'Enfoque en quién quieres llegar a ser' },
      { id: 'i3', label: 'Los hábitos como votos de identidad' },
      { id: 'i4', label: 'Proceso de dos pasos para cambiar' },
    ]
  },
  {
    id: 'ciclo',
    label: 'El Ciclo del Hábito',
    level: 'Nivel 03',
    color: '#f59e0b', // Amber
    items: [
      { id: 'c1', label: 'Señal' },
      { id: 'c2', label: 'Anhelo' },
      { id: 'c3', label: 'Respuesta' },
      { id: 'c4', label: 'Recompensa' },
    ]
  },
  {
    id: 'ley1',
    label: '1ra Ley: Hacerlo Obvio',
    level: 'Nivel 04',
    color: '#f97316', // Orange
    items: [
      { id: 'l1-1', label: 'Registro de hábitos' },
      { id: 'l1-2', label: 'Intención de implementación' },
      { id: 'l1-3', label: 'Acumulación de hábitos' },
      { id: 'l1-4', label: 'Diseño del ambiente' },
    ]
  },
  {
    id: 'ley2',
    label: '2da Ley: Hacerlo Atractivo',
    level: 'Nivel 05',
    color: '#f43f5e', // Rose
    items: [
      { id: 'l2-1', label: 'Acumulación de tentaciones' },
      { id: 'l2-2', label: 'Influencia del grupo' },
      { id: 'l2-3', label: 'Reprogramación mental' },
      { id: 'l2-4', label: 'Rituales de motivación' },
    ]
  },
  {
    id: 'ley3',
    label: '3ra Ley: Hacerlo Sencillo',
    level: 'Nivel 06',
    color: '#06b6d4', // Cyan
    items: [
      { id: 'l3-1', label: 'Ley del menor esfuerzo' },
      { id: 'l3-2', label: 'Regla de los 2 minutos' },
      { id: 'l3-3', label: 'Mecanismos de compromiso' },
      { id: 'l3-4', label: 'Automatización tecnológica' },
    ]
  },
  {
    id: 'ley4',
    label: '4ta Ley: Hacerlo Satisfactorio',
    level: 'Nivel 07',
    color: '#6366f1', // Indigo
    items: [
      { id: 'l4-1', label: 'Regla cardinal: recompensa inmediata' },
      { id: 'l4-2', label: 'Reforzamiento de conductas' },
      { id: 'l4-3', label: 'Historial y seguimiento' },
      { id: 'l4-4', label: 'Contratos de hábitos' },
    ]
  },
  {
    id: 'avanzado',
    label: 'Tácticas Avanzadas',
    level: 'Nivel 08',
    color: '#475569', // Slate
    items: [
      { id: 'a1', label: 'Jugar donde tus genes favorezcan' },
      { id: 'a2', label: 'Regla de Risitos de Oro' },
      { id: 'a3', label: 'Manejo del aburrimiento' },
      { id: 'a4', label: 'Reflexión y revisión periódica' },
    ]
  }
];

export default function MindMap() {
  const BRANCH_HEIGHT = 100;
  const totalHeight = mindMapData.length * BRANCH_HEIGHT;
  
  return (
    <div className="w-full overflow-x-auto overflow-y-hidden py-10 sm:py-20 px-4 sm:px-12 bg-[#fdfdfd] rounded-[24px] sm:rounded-[48px] relative border border-gray-100 font-sora">
      <div className="sm:hidden absolute top-4 right-4 bg-emerald-500 text-white text-[8px] font-black px-2 py-1 rounded-md z-50 animate-pulse uppercase">Desliza →</div>
      
      <div className="flex items-center gap-0 min-w-max relative pr-10" style={{ height: `${totalHeight + 40}px` }}>
        
        {/* CENTRAL NODE */}
        <div className="relative z-30 shrink-0">
          <div className="bg-[#1a2e1e] text-white px-4 py-3 sm:px-10 sm:py-6 rounded-xl sm:rounded-[32px] shadow-2xl border sm:border-4 border-emerald-500 font-black text-[10px] sm:text-2xl italic uppercase tracking-tighter shadow-emerald-900/20">
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="w-6 h-6 sm:w-12 sm:h-12 bg-emerald-500 rounded-lg sm:rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/40">
                <Zap className="w-3 h-3 sm:w-7 sm:h-7 fill-white text-white" />
              </div>
              <div className="flex flex-col items-start leading-none">
                <span className="text-[5px] sm:text-[9px] text-emerald-400 font-black tracking-[0.2em] mb-0.5 uppercase">Arquitectura</span>
                <span>HÁBITOS</span>
              </div>
            </div>
          </div>
        </div>

        {/* SVG CONNECTORS */}
        <div className="w-16 sm:w-40 h-full relative z-10 pointer-events-none">
          <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox={`0 0 100 ${totalHeight}`}>
            {mindMapData.map((branch, i) => {
              const startY = totalHeight / 2;
              const endY = (i * BRANCH_HEIGHT) + (BRANCH_HEIGHT / 2);
              
              return (
                <path
                  key={branch.id}
                  d={`M 0,${startY} C 50,${startY} 50,${endY} 100,${endY}`}
                  stroke={branch.color}
                  strokeWidth="3"
                  fill="none"
                  className="opacity-40 transition-opacity hover:opacity-100 duration-300"
                />
              );
            })}
          </svg>
        </div>

        {/* BRANCHES COLUMN */}
        <div className="flex flex-col relative z-20" style={{ height: `${totalHeight}px` }}>
          {mindMapData.map((branch, idx) => (
            <div 
              key={branch.id} 
              className="flex items-center gap-4 sm:gap-10 group" 
              style={{ height: `${BRANCH_HEIGHT}px` }}
            >
              {/* BRANCH NODE */}
              <div className="relative">
                <div 
                  className="px-3 py-2 sm:px-8 sm:py-4 rounded-lg sm:rounded-[20px] shadow-lg border sm:border-2 border-white font-black text-white transition-all duration-300 min-w-[130px] sm:min-w-[280px] text-left relative z-10 overflow-hidden"
                  style={{ backgroundColor: branch.color }}
                >
                  <div className="text-[5px] sm:text-[9px] opacity-80 uppercase tracking-widest font-black mb-0.5">{branch.level}</div>
                  <div className="uppercase text-[9px] sm:text-lg tracking-tighter italic leading-none">{branch.label}</div>
                </div>
                
                {/* Connector to sub-items */}
                <div className="absolute top-1/2 left-full w-4 sm:w-10 h-px bg-current opacity-20" style={{ color: branch.color }}>
                   <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full bg-current" />
                </div>
              </div>

              {/* SUB-ITEMS */}
              <div className="flex flex-col gap-1 sm:gap-1.5 pl-2 sm:pl-4 border-l border-gray-100">
                {branch.items.slice(0, 2).map((item) => (
                  <div key={item.id} className="px-2 py-1 sm:px-4 sm:py-1.5 bg-white border border-gray-50 rounded-md text-[7px] sm:text-[11px] font-bold text-gray-400 min-w-[100px] sm:min-w-[180px] shadow-sm">
                    {item.label}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}



