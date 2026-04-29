'use client';
import { useTranslation } from '@/hooks/useTranslation';
import { getHabitIcon } from '@/lib/habitIcons';
import type { Habit } from '@/lib/types';
import { toISODate } from '@/lib/dateUtils';

interface Props {
  day: number;
  month: number;
  year: number;
  habits: Habit[];
  completionMap: Map<string, Set<string>>;
  onToggle: (habitId: string, date: string) => void;
  onOpenCalendar: () => void;
}

export default function DaySummary({ day, month, year, habits, completionMap, onToggle, onOpenCalendar }: Props) {
  const { t } = useTranslation();
  const dateStr = toISODate(year, month, day);
  const dateObj = new Date(year, month, day);
  const formattedDate = dateObj.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });

  const completedCount = habits.filter(h => completionMap.get(h.id)?.has(dateStr)).length;
  const totalCount = habits.length;
  const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="bg-white border-2 border-brand-green rounded-2xl p-6 shadow-xl animate-in zoom-in-95 duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-green mb-1">
              Día Seleccionado
            </h2>
            <h1 className="text-2xl font-black text-app-text capitalize">
              {formattedDate}
            </h1>
          </div>
          <button 
            onClick={onOpenCalendar}
            className="w-10 h-10 rounded-xl bg-app-bg border border-app-border flex items-center justify-center text-xl hover:bg-brand-green/10 hover:border-brand-green transition-all duration-200 shadow-sm"
            title="Abrir calendario"
          >
            📅
          </button>
        </div>
        <div className="flex items-center gap-3 bg-brand-green/5 px-4 py-2 rounded-xl border border-brand-green/10">
          <div className="text-right">
            <p className="text-[9px] font-black text-app-text3 uppercase tracking-tighter">Progreso Diario</p>
            <p className="text-lg font-black text-brand-green">{pct}%</p>
          </div>
          <div className="w-12 h-12 rounded-full border-4 border-brand-green/20 flex items-center justify-center relative">
             <svg className="w-full h-full -rotate-90">
                <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="4" className="text-brand-green/10" />
                <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray={126} strokeDashoffset={126 - (126 * pct) / 100} className="text-brand-green transition-all duration-500" />
             </svg>
             <span className="absolute text-[10px] font-black text-brand-green">{completedCount}/{totalCount}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {habits.map(hab => {
          const isDone = completionMap.get(hab.id)?.has(dateStr);
          return (
            <button
              key={hab.id}
              onClick={() => onToggle(hab.id, dateStr)}
              className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-200 text-left
                ${isDone 
                  ? 'bg-brand-green/5 border-brand-green shadow-sm' 
                  : 'bg-white border-app-border hover:border-brand-green/30'
                }`}
            >
              <span className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl shrink-0
                ${isDone ? 'bg-brand-green text-white' : 'bg-app-bg text-app-text3'}`}>
                {getHabitIcon(hab.name)}
              </span>
              <div className="min-w-0">
                <p className={`text-[12px] font-bold truncate ${isDone ? 'text-brand-green' : 'text-app-text'}`}>
                  {hab.name}
                </p>
                <p className="text-[10px] font-black uppercase text-app-text3 tracking-tighter">
                  {isDone ? 'Completado' : 'Pendiente'}
                </p>
              </div>
              {isDone && <span className="ml-auto text-brand-green text-lg">✓</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
