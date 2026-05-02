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
  const BRANCH_HEIGHT = 110; // Slightly more compact but still spacious
  const totalHeight = mindMapData.length * BRANCH_HEIGHT;
  
  return (
    <div className="w-full overflow-x-auto py-12 sm:py-20 px-6 sm:px-12 scrollbar-hide bg-[#fdfdfd] rounded-[32px] sm:rounded-[48px] relative">
      <div className="flex items-center gap-6 sm:gap-12 min-w-max relative pr-20">
        
        {/* CENTRAL NODE */}
        <div className="relative z-30 shrink-0">
          <div className="bg-[#1a2e1e] text-white px-5 py-3.5 sm:px-10 sm:py-6 rounded-2xl sm:rounded-[32px] shadow-2xl border-2 sm:border-4 border-emerald-500 font-black text-sm sm:text-2xl italic uppercase tracking-tighter hover:scale-105 transition-all duration-500 shadow-emerald-900/20">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-emerald-500 rounded-lg sm:rounded-2xl flex items-center justify-center animate-pulse shadow-lg shadow-emerald-500/40">
                <Zap className="w-4 h-4 sm:w-7 sm:h-7 fill-white text-white" />
              </div>
              <div className="flex flex-col items-start leading-none">
                <span className="text-[6px] sm:text-[9px] text-emerald-400 font-black tracking-[0.2em] mb-1">ARQUITECTURA</span>
                <span>HÁBITOS</span>
              </div>
            </div>
          </div>
        </div>

        {/* CONNECTOR & BRANCHES CONTAINER */}
        <div className="relative flex items-center" style={{ height: `${totalHeight + 40}px` }}>
          {/* SVG CONNECTORS - Wider for smoother curves */}
          <div className="w-24 sm:w-48 pointer-events-none z-10 h-full relative">
            <svg className="w-full h-full overflow-visible" viewBox={`0 0 100 ${totalHeight}`}>
              <defs>
                {mindMapData.map((branch) => (
                  <marker
                    key={`arrow-${branch.id}`}
                    id={`arrow-${branch.id}`}
                    viewBox="0 0 10 10"
                    refX="9"
                    refY="5"
                    markerWidth="4"
                    markerHeight="4"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 0 L 10 5 L 0 10 z" fill={branch.color} />
                  </marker>
                ))}
              </defs>
              {mindMapData.map((branch, i) => {
                const startY = totalHeight / 2;
                const endY = (i * BRANCH_HEIGHT) + (BRANCH_HEIGHT / 2);
                
                // Adjusted Bezier points for better curvature
                return (
                  <path
                    key={i}
                    d={`M 0,${startY} C 70,${startY} 30,${endY} 100,${endY}`}
                    stroke={branch.color}
                    strokeWidth="2.5"
                    fill="none"
                    markerEnd={`url(#arrow-${branch.id})`}
                    className="opacity-60 transition-opacity hover:opacity-100 duration-300"
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
                className="flex items-center gap-6 sm:gap-16 group animate-in fade-in slide-in-from-right-8 duration-700 fill-mode-both" 
                style={{ height: `${BRANCH_HEIGHT}px`, animationDelay: `${idx * 40}ms` }}
              >
                {/* BRANCH NODE */}
                <div className="relative">
                  <div 
                    className="px-5 py-3 sm:px-10 sm:py-5 rounded-xl sm:rounded-[24px] shadow-lg border-2 sm:border-4 border-white font-black text-white transition-all duration-500 min-w-[170px] sm:min-w-[300px] text-left relative z-10 overflow-hidden cursor-default hover:translate-x-2"
                    style={{ backgroundColor: branch.color }}
                  >
                    <div className="text-[7px] sm:text-[10px] opacity-80 uppercase tracking-[0.2em] font-black mb-0.5">{branch.level}</div>
                    <div className="uppercase text-xs sm:text-xl tracking-tighter italic leading-none">{branch.label}</div>
                    <div className="absolute -right-3 -bottom-3 opacity-10 scale-[1.5] rotate-12">
                      <Zap size={40} />
                    </div>
                  </div>
                  
                  {/* Connector to sub-items */}
                  <div className="absolute top-1/2 left-full w-8 sm:w-20 h-px bg-current opacity-30" style={{ color: branch.color }}>
                     <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-current" />
                  </div>
                </div>

                {/* SUB-ITEMS - Elegant horizontal list */}
                <div className="relative pl-4">
                  <div className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full opacity-20" style={{ backgroundColor: branch.color }} />
                  
                  <div className="flex flex-col gap-1.5 sm:gap-2">
                    {branch.items.slice(0, 3).map((item, i) => (
                      <div key={item.id} className="flex items-center gap-3">
                        <div className="w-3 sm:w-6 h-px bg-current opacity-20" style={{ color: branch.color }} />
                        <div className="px-3 py-1.5 sm:px-5 sm:py-2.5 bg-white border border-gray-100 rounded-lg sm:rounded-xl text-[9px] sm:text-[13px] font-bold text-gray-500 min-w-[130px] sm:min-w-[220px] shadow-sm hover:shadow-md transition-all">
                          {item.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}



