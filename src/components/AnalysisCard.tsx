'use client';
import { daysInMonth, toISODate } from '@/lib/dateUtils';
import type { Habit } from '@/lib/types';
import { getHabitIcon } from '@/lib/habitIcons';

interface Props {
  habits: Habit[];
  month: number;
  year: number;
  completionMap: Map<string, Set<string>>;
}

import { useTranslation } from '@/hooks/useTranslation';

export default function AnalysisCard({ habits, month, year, completionMap }: Props) {
  const { t } = useTranslation();
  const days = daysInMonth(month, year);

  return (
    <div className="bg-app-surface border border-app-border rounded-xl shadow-card p-5">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-app-text2 mb-6 text-center">
        {t('analysis_title')}
      </p>

      <div className="mt-4 space-y-6">
        {habits
          .map(hab => {
            let done = 0;
            for (let d = 1; d <= days; d++) {
              if (completionMap.get(hab.id)?.has(toISODate(year, month, d))) done++;
            }
            const pct = Math.min(100, Math.round(done / days * 100));
            return { hab, done, pct };
          })
          .sort((a, b) => b.done - a.done)
          .map(({ hab, done, pct }) => (
            <div key={hab.id}>
              <div className="flex justify-between items-end mb-2 px-0.5">
                <div className="flex items-center gap-3 pr-4 overflow-hidden">
                   <span className="scale-110">{getHabitIcon(hab.name)}</span>
                   <span className="text-[11px] font-bold text-app-text truncate">{hab.name}</span>
                </div>
                <span className="text-[10px] font-bold text-app-text2 whitespace-nowrap">
                  <span className="text-brand-green mr-2 text-[11px]">{pct}%</span>
                  {done} <span className="text-app-text3 text-[9px] font-medium">{t('habits_done_label')} /</span> {days} <span className="text-app-text3 text-[9px] font-medium">{t('days_goal_label')}</span>
                </span>
              </div>
              <div className="w-full h-3 bg-app-surface2 rounded-full overflow-hidden shadow-inner">
                <div
                  className="h-full bg-brand-green rounded-full transition-all duration-700 shadow-[0_0_8px_rgba(45,158,107,0.3)]"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className={`text-[9.5px] mt-2 font-bold pl-0.5 ${pct >= 90 ? 'text-brand-green' : 'text-app-text3'}`}>
                {pct >= 90 ? t('analysis_90') :
                 pct >= 75 ? t('analysis_75') :
                 pct >= 50 ? t('analysis_50') :
                 pct > 0   ? t('analysis_avg') :
                 t('analysis_none')}
              </p>
            </div>
          ))}
      </div>

      {!habits.length && (
        <p className="text-[10px] text-app-text3 text-center mt-4 font-bold uppercase tracking-widest">{t('no_habits')}</p>
      )}
    </div>
  );
}
