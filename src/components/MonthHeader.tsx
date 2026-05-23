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
    <div className="bg-white/80 backdrop-blur-xl border border-emerald-100/50 rounded-[32px] p-8 mb-8 shadow-xl shadow-emerald-900/5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8 mb-8">
        <div className="flex items-center gap-6">
          <div className="relative group">
            <div className="text-5xl font-black tracking-tighter text-emerald-950 italic transition-transform group-hover:scale-105">
              {t('months')[month]}
            </div>
            <div className="absolute -bottom-2 right-0 text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em] bg-white px-2 py-0.5 rounded-full border border-emerald-100 shadow-sm">
              {year}
            </div>
          </div>
          
          <button 
            onClick={onOpenCalendar}
            className="w-14 h-14 rounded-2xl bg-white border border-emerald-100 flex items-center justify-center text-2xl hover:bg-emerald-600 hover:text-white hover:rotate-6 transition-all duration-300 shadow-lg shadow-emerald-900/5 group"
            title={t('common_open_calendar')}
          >
            <span className="group-hover:scale-110 transition-transform">📅</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          {(['←', '→'] as const).map((arrow, i) => (
            <button
              key={arrow}
              onClick={() => onNavigate(i === 0 ? -1 : 1)}
              className="w-12 h-12 rounded-xl border border-emerald-100 bg-white text-emerald-950 text-xl font-black
                         flex items-center justify-center transition-all hover:bg-emerald-600 hover:text-white hover:scale-105 shadow-sm active:scale-95"
            >
              {arrow}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: t('habits_label'), val: habitCount, color: 'text-emerald-950' },
          { label: t('completed_label'), val: completed, color: 'text-emerald-600' },
          { label: t('progress_label'), isProgress: true },
          { label: t('common_progress_pct'), val: `${pct.toFixed(1)}%`, color: 'text-emerald-600' }
        ].map((item, i) => (
          <div key={i} className="bg-emerald-50/30 rounded-2xl p-6 border border-emerald-100/50 group hover:bg-white hover:shadow-lg transition-all duration-500">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-800/40 mb-3 block">
              {item.label}
            </span>
            {item.isProgress ? (
              <div className="h-4 bg-emerald-100/50 rounded-full overflow-hidden w-full mt-2 relative">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-[width] duration-1000 ease-out shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                  style={{ width: `${pct}%` }}
                />
              </div>
            ) : (
              <span className={`text-3xl font-black tracking-tighter ${item.color} leading-none block group-hover:scale-110 transition-transform origin-left`}>
                {item.val}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
