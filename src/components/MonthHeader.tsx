'use client';

interface Props {
  month: number;
  year: number;
  habitCount: number;
  completed: number;
  pct: number;
  isCurrentMonth: boolean;
  onNavigate: (delta: number) => void;
  onDateChange: (m: number, y: number) => void;
  onOpenCalendar: () => void;
}

import { useTranslation } from '@/hooks/useTranslation';

export default function MonthHeader({ month, year, habitCount, completed, pct, isCurrentMonth, onNavigate, onDateChange, onOpenCalendar }: Props) {
  const { t } = useTranslation();

  return (
    <div className="bg-app-surface border border-app-border rounded shadow-card px-4 py-3 mb-4">

      {/* ── TOP ROW: month + navigation ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center justify-between sm:justify-start gap-3 w-full sm:w-auto">
          <div>
            <div className="text-[26px] font-light tracking-[-0.5px] leading-tight text-app-text">
              {t('months')[month]}
            </div>
            <div className="text-[11px] text-app-text3 font-medium">{year}</div>
          </div>
          <button 
            onClick={onOpenCalendar}
            className="w-9 h-9 rounded-lg bg-white border border-app-border flex items-center justify-center text-lg hover:bg-brand-green/5 hover:border-brand-green transition-all duration-200 shadow-sm"
            title={t('common_open_calendar')}
          >
            📅
          </button>
        </div>

        {/* Navigation arrows + Sliders */}
        <div className="flex flex-col items-center sm:items-end gap-4 w-full sm:w-auto">
          <div className="flex gap-1.5 w-full sm:w-auto justify-center sm:justify-end">
            {(['←', '→'] as const).map((arrow, i) => (
              <button
                key={arrow}
                onClick={() => onNavigate(i === 0 ? -1 : 1)}
                className="w-10 h-10 sm:w-8 sm:h-8 rounded-sm border border-app-border bg-app-surface text-app-text2 text-sm
                           flex items-center justify-center transition-colors hover:bg-app-surface2 hover:text-app-text"
              >
                {arrow}
              </button>
            ))}
          </div>
          
        </div>
      </div>

      {/* ── STATS GRID: 2 cols on mobile → 4 cols on md+ ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border border-app-border rounded overflow-hidden">

        {/* Hábitos */}
        <div className="flex flex-col p-3 border-r border-app-border">
          <span className="text-[9px] font-bold uppercase tracking-widest text-app-text3 mb-1">
            {t('habits_label')}
          </span>
          <span className="text-[22px] font-light font-mono text-app-text leading-none">{habitCount}</span>
        </div>

        {/* Completados */}
        <div className="flex flex-col p-3 md:border-r border-app-border">
          <span className="text-[9px] font-bold uppercase tracking-widest text-app-text3 mb-1">
            {t('completed_label')}
          </span>
          <span className="text-[22px] font-light font-mono text-app-text leading-none">{completed}</span>
        </div>

        {/* Progreso (barra) */}
        <div className="flex flex-col p-3 border-r border-t md:border-t-0 border-app-border gap-2 justify-center">
          <span className="text-[9px] font-bold uppercase tracking-widest text-app-text3">
            {t('progress_label')}
          </span>
          <div className="h-4 bg-[#e5e5e5] rounded-sm overflow-hidden w-full">
            <div
              className="h-full bg-brand-green rounded-sm transition-[width] duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Progress % */}
        <div className="flex flex-col p-3 border-t md:border-t-0 border-app-border">
          <span className="text-[9px] font-bold uppercase tracking-widest text-app-text3 mb-1">
            {t('common_progress_pct')}
          </span>
          <span className="text-[22px] font-light font-mono text-brand-green leading-none">
            {pct.toFixed(2)}%
          </span>
        </div>

      </div>
    </div>
  );
}
