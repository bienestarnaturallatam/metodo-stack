'use client';
import Link from 'next/link';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  PointElement, LineElement, Filler, Tooltip, Legend
} from 'chart.js';
import { useYearCompletions, useYearMoodLogs } from '@/hooks/useTracker';
import { MONTHS, daysInMonth, toISODate } from '@/lib/dateUtils';
import { getHabitIcon } from '@/lib/habitIcons';
import type { Habit } from '@/lib/types';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

interface Props {
  year: number;
  habits: Habit[];
  currentMonth: number;
  onMonthClick: (m: number) => void;
}

import { useTranslation } from '@/hooks/useTranslation';

export default function DashboardPage({ year, habits, currentMonth, onMonthClick }: Props) {
  const { t, months } = useTranslation();
  const allCompletions = useYearCompletions(year, habits.map(h => h.id));
  const allMoodLogs = useYearMoodLogs(year);

  // 1. Per-month stats
  const monthStats = months.map((name, mi) => {
    const days = daysInMonth(mi, year);
    const start = `${year}-${String(mi + 1).padStart(2, '0')}-01`;
    const end = `${year}-${String(mi + 1).padStart(2, '0')}-${String(days).padStart(2, '0')}`;
    
    // Exact same habit filtering as TrackerClient
    const monthStart = new Date(year, mi, 1);
    const monthEnd   = new Date(year, mi + 1, 0, 23, 59, 59);

    const displayHabits = habits.filter(h => {
      const created = new Date(h.created_at);
      if (created > monthEnd) return false;
      if (!h.archived_at) return true;
      const archived = new Date(h.archived_at);
      if (archived <= monthStart) return false;
      return archived > monthEnd;
    });

    const displayHabitIds = new Set(displayHabits.map(h => h.id));
    const comp = allCompletions.filter(c => c.date >= start && c.date <= end && displayHabitIds.has(c.habit_id)).length;

    let goal = 0;
    displayHabits.forEach(h => {
      if (!h.archived_at) { goal += days; } else {
        const arch = new Date(h.archived_at);
        const mStart = new Date(year, mi, 1);
        const mEnd = new Date(year, mi + 1, 0);
        const effectiveEnd = arch > mEnd ? mEnd : arch;
        if (arch >= mStart) {
          const daysActive = Math.ceil((effectiveEnd.getTime() - mStart.getTime()) / (1000 * 60 * 60 * 24));
          goal += Math.max(0, Math.min(days, daysActive));
        }
      }
    });

    const pct = goal ? Math.min(100, Math.round((comp / goal) * 100)) : 0;

    // Mood averages
    const monthLogs = allMoodLogs.filter(l => l.date >= start && l.date <= end);
    const moodLogsWithVal = monthLogs.filter((l: any) => l.mood !== null && l.mood !== undefined);
    const motLogsWithVal  = monthLogs.filter((l: any) => l.motivation !== null && l.motivation !== undefined);

    const avgMood = moodLogsWithVal.length 
      ? (moodLogsWithVal.reduce((acc: number, l: any) => acc + (l.mood || 0), 0) / moodLogsWithVal.length) 
      : null;
      
    const avgMot = motLogsWithVal.length 
      ? (motLogsWithVal.reduce((acc: number, l: any) => acc + (l.motivation || 0), 0) / motLogsWithVal.length) 
      : null;

    return { name, comp, goal, pct, avgMood, avgMot };
  });

  // Best habit = highest completion % in the currently selected month
  const currentMonthDays = daysInMonth(currentMonth, year);
  const currentMonthStart = `${year}-${String(currentMonth + 1).padStart(2, '0')}-01`;
  const currentMonthEnd   = `${year}-${String(currentMonth + 1).padStart(2, '0')}-${String(currentMonthDays).padStart(2, '0')}`;

  const habitCompletion = habits.map(h => {
    const count = allCompletions.filter(
      c => c.habit_id === h.id && c.date >= currentMonthStart && c.date <= currentMonthEnd
    ).length;
    const pct = currentMonthDays ? Math.min(100, Math.round(count / currentMonthDays * 100)) : 0;
    return { name: h.name, count, pct };
  }).sort((a, b) => b.pct - a.pct)[0];

  const bestMonthObj = [...monthStats].sort((a, b) => b.pct - a.pct)[0];

  const todayDate = new Date();
  const todayStr = toISODate(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate());
  const yesterdayDate = new Date(todayDate);
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayStr = toISODate(yesterdayDate.getFullYear(), yesterdayDate.getMonth(), yesterdayDate.getDate());

  const checkDay = (dStr: string) => {
    const dObj = new Date(dStr + "T00:00:00");
    const active = habits.filter(h => {
      const created = new Date(h.created_at);
      created.setHours(0,0,0,0);
      if (created > dObj) return false;
      if (!h.archived_at) return true;
      const archived = new Date(h.archived_at);
      archived.setHours(0,0,0,0);
      return archived > dObj;
    });
    // Check if there were any active habits that day to avoid unwarranted streak continuations
    if (active.length === 0) return false;
    
    const activeIds = new Set(active.map(h => h.id));
    const compCount = allCompletions.filter(c => c.date === dStr && activeIds.has(c.habit_id)).length;
    
    return compCount === active.length; // 100% de los hábitos
  };

  let rachaActual = 0;
  let currDate = new Date(todayDate);
  let streakStartDate: Date | null = null;
  
  if (!checkDay(todayStr)) {
    if (checkDay(yesterdayStr)) {
       currDate = new Date(yesterdayDate);
    } else {
       currDate = null as any; 
    }
  }

  if (currDate) {
    while (true) {
      const dStr = toISODate(currDate.getFullYear(), currDate.getMonth(), currDate.getDate());
      if (checkDay(dStr)) {
        rachaActual++;
        streakStartDate = new Date(currDate);
        currDate.setDate(currDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  let streakLevel = t('streak_sub');
  if (rachaActual >= 15) streakLevel = "¡Nivel Imparable!";
  else if (rachaActual >= 4) streakLevel = "¡Estás en racha!";
  else if (rachaActual >= 1) streakLevel = "¡Buen comienzo!";

  const streakMsg = streakStartDate 
    ? `¡No fallas desde el ${streakStartDate.getDate()} de ${months[streakStartDate.getMonth()]}! · ${streakLevel}`
    : streakLevel;

  return (
    <div className="px-6 py-8 max-w-[1400px] mx-auto animate-in fade-in duration-500">
      
      {/* CABECERA */}
      <div className="mb-8">
         <h2 className="font-fraunces text-3xl font-black text-app-text tracking-tight">Centro Estratégico</h2>
         <p className="text-[10px] uppercase font-bold tracking-widest text-app-text3 mt-1">Reflexión profunda y planificación anual</p>
      </div>

      {/* ── HIGHLIGHTS CARDS ── */}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <HighlightCard 
          emoji="🏆" 
          title={t('best_habit')} 
          value={habitCompletion?.name || '—'} 
          subValue={habitCompletion ? `${habitCompletion.pct}%  ·  ${habitCompletion.count}/${currentMonthDays} días` : '—'}
          color="bg-brand-green/10 text-brand-green"
          icon={getHabitIcon(habitCompletion?.name || '')}
        />
        <HighlightCard 
          emoji="📅" 
          title={t('best_month')} 
          value={bestMonthObj?.name || '—'} 
          subValue={`${bestMonthObj?.pct || 0}% ${t('progress_label').toLowerCase()}`}
          color="bg-brand-blue/10 text-brand-blue"
        />
        <HighlightCard 
          emoji="🔥" 
          title={t('best_streak')} 
          value={`${rachaActual} ${rachaActual === 1 ? 'Día Consecutivo' : 'Días Consecutivos'}`} 
          subValue={streakMsg}
          color="bg-brand-pink/10 text-brand-pink"
        />
      </div>

      <div className="flex flex-col gap-6">
        
        {/* ── GRÁFICO PROGRESO MENSUAL ── */}
        <div className="bg-app-surface border border-app-border rounded-xl shadow-card p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xs font-black uppercase tracking-widest text-app-text2">{t('monthly_progress')}</h3>
          </div>
          <div className="h-44">
            <Line
              data={{
                labels: months.map(m => m.slice(0, 3)),
                datasets: [{
                  data: monthStats.map(s => s.pct),
                  fill: true,
                  backgroundColor: 'rgba(45,158,107,0.1)',
                  borderColor: '#2d9e6b',
                  borderWidth: 2.5,
                  pointRadius: 5,
                  pointBackgroundColor: '#2d9e6b',
                  tension: 0.4,
                }],
              }}
              options={chartOptions(100, '%')}
            />
          </div>
        </div>

        {/* ── GRÁFICO ESTADO MENTAL ANUAL ── */}
        <div className="bg-app-surface border border-app-border rounded-xl shadow-card p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <h3 className="text-xs font-black uppercase tracking-widest text-app-text2">{t('mood_avg')}</h3>
            <div className="flex items-center gap-4 bg-app-bg/50 px-3 py-1.5 rounded-full border border-app-border/50">
              <span className="flex items-center gap-2 text-[10px] font-black text-[#c94f7a]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#c94f7a] shadow-[0_0_8px_rgba(201,79,122,0.4)]" /> {t('mood_legend')}
              </span>
              <span className="flex items-center gap-2 text-[10px] font-black text-[#3a7bc8]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#3a7bc8] shadow-[0_0_8px_rgba(58,123,200,0.4)]" /> {t('mot_legend')}
              </span>
            </div>
          </div>
          <div className="h-56">
            <Line
              data={{
                labels: months.map(m => m.slice(0, 3)),
                datasets: [
                  {
                    label: t('mood_legend'),
                    data: monthStats.map(s => s.avgMood),
                    borderColor: '#c94f7a',
                    backgroundColor: 'rgba(201,79,122,0.06)',
                    borderWidth: 3,
                    pointRadius: 6,
                    pointHoverRadius: 8,
                    pointBackgroundColor: '#fff',
                    pointBorderColor: '#c94f7a',
                    pointBorderWidth: 2,
                    fill: true,
                    tension: 0.35,
                    spanGaps: false,
                    clip: false,
                  },
                  {
                    label: t('mot_legend'),
                    data: monthStats.map(s => s.avgMot),
                    borderColor: '#3a7bc8',
                    backgroundColor: 'rgba(58,123,200,0.06)',
                    borderWidth: 3,
                    pointRadius: 6,
                    pointHoverRadius: 8,
                    pointBackgroundColor: '#fff',
                    pointBorderColor: '#3a7bc8',
                    pointBorderWidth: 2,
                    fill: true,
                    tension: 0.35,
                    spanGaps: false,
                    clip: false,
                  }
                ],
              }}
              options={chartOptions(5.5, '', 1)}
            />
          </div>
        </div>

        {/* ── GRID DE MESES ── */}
        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {monthStats.map((s, mi) => (
            <button
              key={mi}
              onClick={() => onMonthClick(mi)}
              className={`bg-app-surface border-2 rounded-xl shadow-sm p-4 transition-all hover:scale-[1.03] hover:shadow-lg text-left relative group 
                ${mi === currentMonth ? 'border-brand-green ring-4 ring-brand-green/5' : 'border-app-border hover:border-app-text3/30'}`}
            >
              <div className="flex justify-between items-start mb-3">
                <span className="text-[14px] font-black uppercase tracking-tighter text-app-text leading-none">{s.name}</span>
                <CircularProgress pct={s.pct} size={30} stroke={2.5} />
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] text-app-text3 font-medium uppercase tracking-tight">
                  <span>{t('completed_label')}</span>
                  <span className="text-app-text">{s.comp}</span>
                </div>
                <div className="flex justify-between text-[9px] text-app-text3 font-medium uppercase tracking-tight">
                   <span>{t('progress_label')}</span>
                   <span className="text-brand-green font-bold">{s.pct}%</span>
                </div>
              </div>

              {/* Mini analytics summary icons */}
              <div className="mt-4 flex gap-2 overflow-hidden opacity-30 group-hover:opacity-60 transition-opacity">
                 <span className="text-[10px]">📈</span>
                 <span className="text-[10px]">🔥</span>
                 <span className="text-[10px]">⚡</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────── HELPERS ───────────────

function HighlightCard({ emoji, title, value, subValue, color, icon }: any) {
  return (
    <div className="bg-app-surface border border-app-border rounded-2xl p-5 shadow-sm relative overflow-hidden group">
      <div className={`absolute -right-4 -top-4 w-20 h-20 rounded-full opacity-[0.03] scale-150 rotate-12 transition-transform group-hover:scale-[1.8] group-hover:bg-current ${color}`} />
      <div className="flex items-center gap-4 relative">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-inner ${color} shrink-0`}>
          {icon || emoji}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold text-app-text3 uppercase tracking-widest mb-0.5 truncate">{title}</p>
          <h4 className="text-[17px] sm:text-lg font-black text-app-text leading-tight truncate">{value}</h4>
          <p className="text-[10px] text-app-text3 font-medium line-clamp-2 leading-snug mt-0.5">{subValue}</p>
        </div>
      </div>
    </div>
  );
}

function CircularProgress({ pct, size, stroke }: { pct: number, size: number, stroke: number }) {
  const radius = (size - stroke) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size/2} cy={size/2} r={radius} stroke="var(--app-border)" strokeWidth={stroke} fill="transparent" />
      <circle 
        cx={size/2} cy={size/2} r={radius} stroke="var(--brand-green)" strokeWidth={stroke} fill="transparent" 
        strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
        className="transition-all duration-700 ease-out"
      />
    </svg>
  );
}

const chartOptions = (max: number, suffix: string, step = 2) => ({
  responsive: true,
  maintainAspectRatio: false,
  layout: { padding: { top: 12, bottom: 5, left: 5, right: 15 } },
  plugins: { legend: { display: false } },
  scales: {
    y: {
      min: 0, max,
      ticks: { font: { size: 9, family: 'DM Mono' }, color: '#9e9b90', stepSize: step, callback: (v: any) => `${v}${suffix}` },
      grid: { color: 'rgba(0,0,0,0.03)' },
    },
    x: {
      ticks: { font: { size: 9, family: 'DM Mono' }, color: '#9e9b90', autoSkip: false },
      grid: { display: false },
    },
  },
});
