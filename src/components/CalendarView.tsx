'use client';
import { daysInMonth } from '@/lib/dateUtils';
import { useTranslation } from '@/hooks/useTranslation';

interface Props {
  month: number;
  year: number;
  selectedDay: number;
  onSelectDay: (day: number) => void;
}

export default function CalendarView({ month, year, selectedDay, onSelectDay }: Props) {
  const { t } = useTranslation();
  const totalDays = daysInMonth(month, year);
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 (Sun) to 6 (Sat)
  
  // Adjust to start on Monday if preferred, but let's stick to standard 0=Sun
  const days = Array.from({ length: totalDays }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const dayNames = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

  return (
    <div className="bg-white border border-app-border rounded-xl p-4 shadow-sm">
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((d, i) => (
          <div key={i} className="text-[10px] font-black text-app-text3 text-center uppercase py-1">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {blanks.map(b => (
          <div key={`b-${b}`} className="h-10" />
        ))}
        {days.map(d => {
          const isSelected = d === selectedDay;
          const isToday = d === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
          
          return (
            <button
              key={d}
              onClick={() => onSelectDay(d)}
              className={`h-10 rounded-lg flex flex-col items-center justify-center transition-all duration-200 border
                ${isSelected 
                  ? 'bg-brand-green text-white border-brand-green shadow-md scale-105 z-10' 
                  : isToday
                    ? 'bg-brand-green/10 text-brand-green border-brand-green/30 font-bold'
                    : 'bg-app-bg/30 text-app-text2 border-transparent hover:border-app-border hover:bg-white'
                }`}
            >
              <span className="text-[12px] font-black">{d}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
