'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Download, Trash2, Save, Check } from 'lucide-react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from 'chart.js';
import { createClient } from '@/lib/client';
import { toISODate } from '@/lib/dateUtils';
import { I18nProvider, useTranslation } from '@/hooks/useTranslation';
import LegalFooter from '@/components/LegalFooter';
import TourBienvenida from '@/components/TourBienvenida';
import SignatureFooter from '@/components/SignatureFooter';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const COLORS = {
  g900: '#1f3d2a',
  g800: '#2d5a3d',
  g700: '#3d7a4e',
  g600: '#4e9a60',
  g500: '#6aaf7a',
  g400: '#8fc99e',
  g200: '#c8e6c9',
  g100: '#e8f5e9',
  g50: '#f4faf6',
  emerald: '#10b981',
  bg: '#f7f9f7',
  text: '#1a2e1e',
  text3: '#7a9b82',
};

interface TaskRecurrence {
  dayOfMonth: number;   // día del mes (1-31)
  endMonth: number;     // mes fin (0-11)
  endYear: number;      // año fin
}

interface PlannerTask {
  text: string;
  done: boolean;
  priority?: 'critical' | 'important' | 'growth';
  created_at?: string;
  scheduled_time?: string;
  recurrence?: TaskRecurrence;
  note?: string;
}

interface PlannerData {
  day_index: number;
  mood: number | null;
  tasks: PlannerTask[];
  reflections: {
    notes: string[];
    improve: string[];
    thanks: string[];
  };
}

export default function PlannerClient({ userId, userEmail = '', asEmbedded = false, isPaid: initialIsPaid = false, userTier: initialUserTier = 'trial' }: { userId: string; userEmail?: string; asEmbedded?: boolean, isPaid?: boolean, userTier?: string }) {
  return (
    <PlannerContent userId={userId} userEmail={userEmail} asEmbedded={asEmbedded} isPaid={initialIsPaid} userTier={initialUserTier} />
  );
}

function PlannerContent({ userId, userEmail = '', asEmbedded = false, isPaid: initialIsPaid = false, userTier: initialUserTier = 'trial' }: { userId: string; userEmail?: string; asEmbedded?: boolean, isPaid?: boolean, userTier?: string }) {
  const { t, lang, months } = useTranslation();

  const DAYS: string[] = t('planner_days') || ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const ABBR: string[] = t('planner_days_abbr') || ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];

  const [view, setView] = useState<'tasks' | 'reflect'>('tasks');
  const [isDeepWork, setIsDeepWork] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1500); // 25 mins
  const [newTaskPriority, setNewTaskPriority] = useState<'critical' | 'important' | 'growth'>('important');
  const [newTaskTime, setNewTaskTime] = useState('');
  const [newTaskText, setNewTaskText] = useState('');
  const [ringingTasks, setRingingTasks] = useState<Set<string>>(new Set());

  const quotes: string[] = useMemo(() => {
    const val = t('planner_atomic_quotes');
    return Array.isArray(val) ? val : [
      "Los hábitos son el interés compuesto de la superación personal. 📈"
    ];
  }, [t]);

  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const currentQuote = quotes[currentQuoteIndex % quotes.length] || '';

  const [weekStart, setWeekStart] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - d.getDay()); // Sunday
    return toISODate(d.getFullYear(), d.getMonth(), d.getDate());
  });

  const [localData, setLocalData] = useState<PlannerData[]>(
    Array.from({ length: 7 }, (_, i) => ({
      day_index: i,
      mood: null,
      tasks: [],
      reflections: { notes: ['', '', ''], improve: ['', '', ''], thanks: ['', '', ''] },
    }))
  );

  const [loading, setLoading] = useState(true);
  const [userTier, setUserTier] = useState<string>(initialUserTier);
  const [isPaid, setIsPaid] = useState(initialIsPaid);
  const [isExpired, setIsExpired] = useState(false);
  const [showLockedModal, setShowLockedModal] = useState(false);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    async function checkUserPlan() {
      const { data: profile } = await supabase
        .from('profiles')
        .select('tier, is_paid, created_at')
        .eq('id', userId)
        .single();

      if (profile) {
        setUserTier(profile.tier || 'trial');
        setIsPaid(profile.is_paid || false);

        // Verificación de Expiración de Prueba (72h)
        const isTrialUser = !profile.is_paid || profile.tier === 'trial' || profile.tier === 'free' || profile.tier === 'gratis';
        if (isTrialUser && profile.created_at) {
          const start = new Date(profile.created_at);
          const now = new Date();
          const diffHours = (now.getTime() - start.getTime()) / (1000 * 60 * 60);
          if (diffHours >= 72) {
            setIsExpired(true);
          }
        }

        // Verificación de Suspensión
        if (profile.tier?.startsWith('suspended_')) {
          setIsExpired(true);
        }

        // Si no es embedded y el plan es habitos (y es de pago), bloquear
        if (!asEmbedded && profile.is_paid && profile.tier === 'habitos') {
          setShowLockedModal(true);
        }
      }
    }
    checkUserPlan();
  }, [userId, asEmbedded]);

  const [selectedDayIndex, setSelectedDayIndex] = useState(() => {
    const d = new Date();
    return d.getDay();
  });

  // Calendar modal state
  const [movingTaskIdx, setMovingTaskIdx] = useState<number | null>(null);
  const [calendarMonth, setCalendarMonth] = useState(() => new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(() => new Date().getFullYear());

  // Recurrence modal state
  const [recurrenceTaskIdx, setRecurrenceTaskIdx] = useState<number | null>(null);
  const [recurDayOfMonth, setRecurDayOfMonth] = useState(1);
  const [recurEndMonth, setRecurEndMonth] = useState(() => new Date().getMonth());
  const [recurEndYear, setRecurEndYear] = useState(() => new Date().getFullYear() + 1);

  // Note panel state
  const [openNoteIdx, setOpenNoteIdx] = useState<number | null>(null);

  // Month View state
  const [showMonthModal, setShowMonthModal] = useState(false);
  const [monthModalMonth, setMonthModalMonth] = useState(() => new Date().getMonth());
  const [monthModalYear, setMonthModalYear] = useState(() => new Date().getFullYear());
  const [monthData, setMonthData] = useState<any[]>([]);
  const [loadingMonth, setLoadingMonth] = useState(false);

  useEffect(() => {
    if (!showMonthModal) return;
    async function fetchMonth() {
      setLoadingMonth(true);
      const { data } = await supabase.from('weekly_planner_data').select('*').eq('user_id', userId);
      setMonthData(data || []);
      setLoadingMonth(false);
    }
    fetchMonth();
  }, [showMonthModal, userId, supabase]);

  // 24h <-> 12h helpers
  const to12h = (t24: string) => {
    if (!t24) return { h: '', m: '', ampm: 'AM' as 'AM' | 'PM' };
    const [hh, mm] = t24.split(':').map(Number);
    const ampm = hh >= 12 ? 'PM' : 'AM';
    const h12 = hh === 0 ? 12 : hh > 12 ? hh - 12 : hh;
    return { h: String(h12).padStart(2, '0'), m: String(mm).padStart(2, '0'), ampm };
  };
  const to24h = (h: string, m: string, ampm: string) => {
    let hh = parseInt(h) || 0;
    if (ampm === 'PM' && hh < 12) hh += 12;
    if (ampm === 'AM' && hh === 12) hh = 0;
    return `${String(hh).padStart(2, '0')}:${(m || '00').padStart(2, '0')}`;
  };

  // Pomodoro Timer Logic
  useEffect(() => {
    let interval: any;
    if (isDeepWork && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isDeepWork, timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const getTaskIcon = (text: string) => {
    const t = text.toLowerCase();
    if (t.includes('leer') || t.includes('biblia') || t.includes('libro')) return '📖';
    if (t.includes('lavar') || t.includes('carro') || t.includes('auto')) return '🚗';
    if (t.includes('facturar') || t.includes('pago') || t.includes('guía') || t.includes('recibo')) return '📄';
    if (t.includes('gym') || t.includes('entren') || t.includes('ejercic') || t.includes('pesas')) return '🏋️';
    if (t.includes('pc') || t.includes('laptop') || t.includes('computadora') || t.includes('reparar')) return '💻';
    if (t.includes('agua') || t.includes('beber')) return '💧';
    if (t.includes('meditar') || t.includes('respirar')) return '🧘';
    if (t.includes('dormir') || t.includes('descansar')) return '😴';
    if (t.includes('comida') || t.includes('almuerzo') || t.includes('cena') || t.includes('cocinar')) return '🍳';
    if (t.includes('objetivo') || t.includes('meta') || t.includes('puntuar') || t.includes('target')) return '🎯';
    if (t.includes('dinero') || t.includes('banco') || t.includes('invertir') || t.includes('pago')) return '💰';
    if (t.includes('llamar') || t.includes('teléfono') || t.includes('celular')) return '📞';
    if (t.includes('estudiar') || t.includes('aprender') || t.includes('clase')) return '🎓';
    if (t.includes('iglesia') || t.includes('orar') || t.includes('dios')) return '🙏';
    if (t.includes('super') || t.includes('comprar') || t.includes('tienda')) return '🛒';
    return '✨';
  };

  const playBellSound = () => {
    try {
      const AppAudioCtx = (window as any).AppAudioCtx || new (window.AudioContext || (window as any).webkitAudioContext)();
      (window as any).AppAudioCtx = AppAudioCtx;
      const osc = AppAudioCtx.createOscillator();
      const gain = AppAudioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, AppAudioCtx.currentTime);
      gain.gain.setValueAtTime(0.3, AppAudioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, AppAudioCtx.currentTime + 0.1);
      osc.connect(gain).connect(AppAudioCtx.destination);
      osc.start();
      osc.stop(AppAudioCtx.currentTime + 0.15);
    } catch (e) { /* silent fallback */ }
  };

  const handleExportXLS = () => {
    const day = localData[selectedDayIndex];
    const dateObj = weekDates[selectedDayIndex];
    const dateStr = dateObj.toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US', { day: '2-digit', month: '2-digit', year: 'numeric' });
    
    let html = `
      <table border="1">
        <thead>
          <tr style="background-color: #2d5a3d; color: white;">
            <th colspan="5" style="font-size: 16px; padding: 10px;">METODO STACK - ENFOQUE SEMANAL (${dateStr})</th>
          </tr>
          <tr style="background-color: #f4faf6;">
            <th style="padding: 8px;">Estado</th>
            <th style="padding: 8px;">Tarea / Propósito</th>
            <th style="padding: 8px;">Nota</th>
            <th style="padding: 8px;">Prioridad</th>
            <th style="padding: 8px;">Hora</th>
          </tr>
        </thead>
        <tbody>
    `;

    day.tasks.forEach(task => {
      const pText = t(`planner_priority_${task.priority || 'important'}`);
      const statusText = task.done ? 'COMPLETADA' : 'PENDIENTE';
      html += `
        <tr>
          <td style="padding: 5px; text-align: center;">${statusText}</td>
          <td style="padding: 5px;">${task.text}</td>
          <td style="padding: 5px;">${task.note || '-'}</td>
          <td style="padding: 5px; text-align: center;">${pText}</td>
          <td style="padding: 5px; text-align: center;">${task.scheduled_time || '-'}</td>
        </tr>
      `;
    });

    html += `
        </tbody>
      </table>
    `;

    const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Stack_Enfoque_${dateStr.replace(/\//g, '-')}.xls`;
    a.click();
  };

  const handleExportMonthXLS = () => {
    const monthName = months[monthModalMonth];
    const daysInMonthNum = new Date(monthModalYear, monthModalMonth + 1, 0).getDate();
    
    let html = `
      <table border="1">
        <thead>
          <tr style="background-color: #2d5a3d; color: white;">
            <th colspan="6" style="font-size: 16px; padding: 10px;">METODO STACK - VISTA MENSUAL (${monthName} ${monthModalYear})</th>
          </tr>
          <tr style="background-color: #f4faf6;">
            <th style="padding: 8px;">Día</th>
            <th style="padding: 8px;">Estado</th>
            <th style="padding: 8px;">Tarea / Propósito</th>
            <th style="padding: 8px;">Nota</th>
            <th style="padding: 8px;">Prioridad</th>
            <th style="padding: 8px;">Hora</th>
          </tr>
        </thead>
        <tbody>
    `;

    for (let d = 1; d <= daysInMonthNum; d++) {
      const dateObj = new Date(monthModalYear, monthModalMonth, d);
      const targetSunday = new Date(dateObj);
      targetSunday.setDate(dateObj.getDate() - dateObj.getDay());
      const weekStartStr = toISODate(targetSunday.getFullYear(), targetSunday.getMonth(), targetSunday.getDate());
      const dayIndex = dateObj.getDay();

      const row = monthData.find(r => r.week_start_date === weekStartStr && r.day_index === dayIndex);
      const tasks = row?.tasks || [];

      if (tasks.length === 0) {
        html += `
          <tr>
            <td style="padding: 5px; text-align: center;">${d}</td>
            <td colspan="5" style="padding: 5px; text-align: center; color: #999;">Sin tareas</td>
          </tr>
        `;
      } else {
        tasks.forEach((task: any, idx: number) => {
          const pText = t(`planner_priority_${task.priority || 'important'}`);
          const statusText = task.done ? 'COMPLETADA' : 'PENDIENTE';
          html += `
            <tr>
              <td style="padding: 5px; text-align: center;">${idx === 0 ? d : ''}</td>
              <td style="padding: 5px; text-align: center;">${statusText}</td>
              <td style="padding: 5px;">${task.text}</td>
              <td style="padding: 5px;">${task.note || '-'}</td>
              <td style="padding: 5px; text-align: center;">${pText}</td>
              <td style="padding: 5px; text-align: center;">${task.scheduled_time || '-'}</td>
            </tr>
          `;
        });
      }
    }

    html += `
        </tbody>
      </table>
    `;

    const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Stack_Mensual_${monthName}_${monthModalYear}.xls`;
    a.click();
  };

  // Sound loop effect for intermittent ringing
  useEffect(() => {
    if (ringingTasks.size === 0) return;
    const interval = setInterval(playBellSound, 1000);
    return () => clearInterval(interval);
  }, [ringingTasks.size]);

  // Alarm checker - runs every 30s
  useEffect(() => {
    const check = () => {
      const now = new Date();
      const nowHHMM = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const currentDay = localData[selectedDayIndex];
      if (!currentDay) return;
      const newRinging = new Set<string>();
      currentDay.tasks.forEach((task, idx) => {
        if (task.scheduled_time && !task.done && task.scheduled_time === nowHHMM) {
          newRinging.add(`${selectedDayIndex}-${idx}`);
        }
      });
      if (newRinging.size > 0) {
        setRingingTasks(prev => {
          const addedKeys: string[] = [];
          newRinging.forEach(k => { if (!prev.has(k)) addedKeys.push(k); });
          if (addedKeys.length === 0) return prev;

          // Schedule 7s stop for each NEW ringing task
          addedKeys.forEach(key => {
            setTimeout(() => {
              setRingingTasks(current => {
                const next = new Set(current);
                next.delete(key);
                return next;
              });
            }, 7000);
          });

          return new Set([...prev, ...addedKeys]);
        });
      }
    };
    check();
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, [localData, selectedDayIndex]);

  // Load data from Supabase
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const { data, error } = await supabase
        .from('weekly_planner_data')
        .select('*')
        .eq('user_id', userId)
        .eq('week_start_date', weekStart);

      if (data) {
        const merged = Array.from({ length: 7 }, (_, i) => {
          const found = data.find((d: any) => d.day_index === i);
          if (found) {
            const refl = found.reflections || { notes: [], improve: [], thanks: [] };
            // Asegurar al menos 3 slots
            while (refl.notes.length < 3) refl.notes.push('');
            while (refl.improve.length < 3) refl.improve.push('');
            while (refl.thanks.length < 3) refl.thanks.push('');

            return {
              day_index: i,
              mood: found.mood ?? null,
              tasks: found.tasks ?? [],
              reflections: refl,
            };
          }
          return {
            day_index: i,
            mood: null,
            tasks: [],
            reflections: { notes: ['', '', ''], improve: ['', '', ''], thanks: ['', '', ''] },
          };
        });
        setLocalData(merged);
      }
      setLoading(false);
    }
    fetchData();
  }, [weekStart, userId]);

  // Save single day to Supabase
  const saveDay = async (dayIndex: number, dayData: PlannerData) => {
    // Optimización: No guardar tareas vacías ni reflexiones vacías para ahorrar espacio en JSONB
    const cleanTasks = dayData.tasks.filter(t => t.text.trim() !== '');
    const cleanReflections = dayData.reflections;

    await supabase.from('weekly_planner_data').upsert({
      user_id: userId,
      week_start_date: weekStart,
      day_index: dayIndex,
      tasks: cleanTasks,
      reflections: cleanReflections,
      mood: dayData.mood,
    }, { onConflict: 'user_id,week_start_date,day_index' });
  };

  const deleteReflectionItem = (dayIndex: number, type: 'notes' | 'improve' | 'thanks', itemIndex: number) => {
    const newData = [...localData];
    newData[dayIndex].reflections[type].splice(itemIndex, 1);
    if (newData[dayIndex].reflections[type].length === 0) {
      newData[dayIndex].reflections[type] = [''];
    }
    setLocalData(newData);
    saveDay(dayIndex, newData[dayIndex]);
  };


  const handleTaskToggle = (dayIndex: number, taskIndex: number) => {
    const newData = [...localData];
    const dayData = { ...newData[dayIndex] };
    const taskWasDone = dayData.tasks[taskIndex].done;

    dayData.tasks = dayData.tasks.map((t, i) =>
      i === taskIndex ? { ...t, done: !t.done } : t
    );

    // Change quote on completion
    if (!taskWasDone && dayData.tasks[taskIndex].done) {
      const idx = Math.floor(Math.random() * quotes.length);
      setCurrentQuoteIndex(idx);
    }

    newData[dayIndex] = dayData;
    setLocalData(newData);
    saveDay(dayIndex, dayData);
  };

  const handleTaskTextChange = (dayIndex: number, taskIndex: number, text: string) => {
    const newData = [...localData];
    const dayData = { ...newData[dayIndex] };
    dayData.tasks = dayData.tasks.map((t, i) =>
      i === taskIndex ? { ...t, text } : t
    );
    newData[dayIndex] = dayData;
    setLocalData(newData);
  };

  const addTask = (dayIndex: number, text: string) => {
    if (!text.trim()) return;
    const newData = [...localData];
    const dayData = { ...newData[dayIndex] };

    // Validar límite de 3 tareas críticas (STACK TIP)
    if (newTaskPriority === 'critical') {
      const criticalCount = dayData.tasks.filter(t => t.priority === 'critical' && !t.done).length;
      if (criticalCount >= 3) {
        alert("STACK TIP: Si todo es prioridad, nada es prioridad. Elige solo tus 3 batallas críticas de hoy.");
        return;
      }
    }

    dayData.tasks = [...dayData.tasks, { text, done: false, priority: newTaskPriority, created_at: new Date().toISOString(), scheduled_time: newTaskTime || undefined }];
    newData[dayIndex] = dayData;
    setLocalData(newData);
    saveDay(dayIndex, dayData);
    setNewTaskPriority('important');
    setNewTaskTime('');
    setNewTaskText('');
  };

  const handleTaskTimeChange = (dayIndex: number, taskIndex: number, time: string) => {
    const newData = [...localData];
    const dayData = { ...newData[dayIndex] };
    dayData.tasks = dayData.tasks.map((t, i) =>
      i === taskIndex ? { ...t, scheduled_time: time || undefined } : t
    );
    newData[dayIndex] = dayData;
    setLocalData(newData);
  };

  const handleReflectionChange = (dayIndex: number, field: 'notes' | 'improve' | 'thanks', idx: number, val: string) => {
    const newData = [...localData];
    const dayData = { ...newData[dayIndex] };
    dayData.reflections = { ...dayData.reflections };
    dayData.reflections[field] = [...dayData.reflections[field]];
    dayData.reflections[field][idx] = val;
    newData[dayIndex] = dayData;
    setLocalData(newData);
  };

  const deleteTask = (dayIndex: number, taskIndex: number) => {
    const newData = [...localData];
    const dayData = { ...newData[dayIndex] };
    dayData.tasks = [...dayData.tasks];
    dayData.tasks.splice(taskIndex, 1);
    newData[dayIndex] = dayData;
    setLocalData(newData);
    saveDay(dayIndex, dayData);
  };

  const duplicateTask = (dayIndex: number, taskIndex: number) => {
    const newData = [...localData];
    const dayData = { ...newData[dayIndex] };
    const original = dayData.tasks[taskIndex];
    const copy: PlannerTask = {
      ...original,
      done: false,
      created_at: new Date().toISOString(),
      recurrence: undefined,
    };
    dayData.tasks = [
      ...dayData.tasks.slice(0, taskIndex + 1),
      copy,
      ...dayData.tasks.slice(taskIndex + 1),
    ];
    newData[dayIndex] = dayData;
    setLocalData(newData);
    saveDay(dayIndex, dayData);
  };

  const handleNoteChange = (dayIndex: number, taskIndex: number, note: string) => {
    const newData = [...localData];
    const dayData = { ...newData[dayIndex] };
    dayData.tasks = dayData.tasks.map((t, i) =>
      i === taskIndex ? { ...t, note } : t
    );
    newData[dayIndex] = dayData;
    setLocalData(newData);
  };

  // ── RECURRENCIA MENSUAL ──────────────────────────────────────────────────────
  const handleSetRecurrence = async (dayIndex: number, taskIndex: number) => {
    const newData = [...localData];
    const dayData = { ...newData[dayIndex] };
    dayData.tasks = dayData.tasks.map((t, i) =>
      i === taskIndex
        ? { ...t, recurrence: { dayOfMonth: recurDayOfMonth, endMonth: recurEndMonth, endYear: recurEndYear } }
        : t
    );
    newData[dayIndex] = dayData;
    setLocalData(newData);
    await saveDay(dayIndex, dayData);

    // Auto-aplicar: insertar la tarea recurrente en todos los meses futuros hasta la fecha fin
    const baseTask = dayData.tasks[taskIndex];
    const recurrence = { dayOfMonth: recurDayOfMonth, endMonth: recurEndMonth, endYear: recurEndYear };
    const today = new Date();

    for (let y = today.getFullYear(); y <= recurrence.endYear; y++) {
      const startM = y === today.getFullYear() ? today.getMonth() : 0;
      const endM = y === recurrence.endYear ? recurrence.endMonth : 11;

      for (let m = startM; m <= endM; m++) {
        // Verificar que el día exista en ese mes
        const maxDay = new Date(y, m + 1, 0).getDate();
        const targetDay = Math.min(recurrence.dayOfMonth, maxDay);
        const targetDate = new Date(y, m, targetDay);

        // No repetir en la misma semana actual que ya guardamos
        const targetSunday = new Date(targetDate);
        targetSunday.setDate(targetDate.getDate() - targetDate.getDay());
        const targetWeekStart = `${targetSunday.getFullYear()}-${String(targetSunday.getMonth() + 1).padStart(2, '0')}-${String(targetSunday.getDate()).padStart(2, '0')}`;

        if (targetWeekStart === weekStart) continue; // ya guardado arriba

        const targetDayIndex = targetDate.getDay();

        // Traer datos existentes de esa semana/día
        const { data: existing } = await supabase
          .from('weekly_planner_data')
          .select('*')
          .eq('user_id', userId)
          .eq('week_start_date', targetWeekStart)
          .eq('day_index', targetDayIndex)
          .maybeSingle();

        const existingTasks: PlannerTask[] = existing?.tasks ?? [];

        // Evitar duplicados: si ya existe una tarea con mismo texto y recurrencia
        const alreadyExists = existingTasks.some(
          (et) => et.text === baseTask.text && et.recurrence?.dayOfMonth === recurrence.dayOfMonth
        );
        if (alreadyExists) continue;

        const newTask: PlannerTask = {
          text: baseTask.text,
          done: false,
          priority: baseTask.priority,
          created_at: new Date().toISOString(),
          scheduled_time: baseTask.scheduled_time,
          recurrence,
        };

        await supabase.from('weekly_planner_data').upsert({
          user_id: userId,
          week_start_date: targetWeekStart,
          day_index: targetDayIndex,
          tasks: [...existingTasks, newTask],
          reflections: existing?.reflections ?? { notes: ['', '', ''], improve: ['', '', ''], thanks: ['', '', ''] },
          mood: existing?.mood ?? null,
        }, { onConflict: 'user_id,week_start_date,day_index' });
      }
    }

    setRecurrenceTaskIdx(null);
  };

  const removeRecurrence = async (dayIndex: number, taskIndex: number) => {
    const newData = [...localData];
    const dayData = { ...newData[dayIndex] };
    dayData.tasks = dayData.tasks.map((t, i) => {
      if (i !== taskIndex) return t;
      const { recurrence: _r, ...rest } = t;
      return rest;
    });
    newData[dayIndex] = dayData;
    setLocalData(newData);
    await saveDay(dayIndex, dayData);
  };

  // Move task to any date (possibly a different week)
  const moveTaskToDate = async (fromDayIdx: number, taskIdx: number, targetDate: Date) => {
    const task = localData[fromDayIdx].tasks[taskIdx];
    if (!task) return;

    const targetSunday = new Date(targetDate);
    targetSunday.setDate(targetDate.getDate() - targetDate.getDay());
    const newWeekStart = toISODate(targetSunday.getFullYear(), targetSunday.getMonth(), targetSunday.getDate());
    const targetDayIndex = targetDate.getDay();

    // 1. Remove from current day
    const newData = [...localData];
    const fromDay = { ...newData[fromDayIdx] };
    fromDay.tasks = [...fromDay.tasks];
    fromDay.tasks.splice(taskIdx, 1);
    newData[fromDayIdx] = fromDay;
    setLocalData(newData);
    await saveDay(fromDayIdx, fromDay);

    // 2. If same week, add to that day
    if (newWeekStart === weekStart) {
      const toDay = { ...newData[targetDayIndex] };
      toDay.tasks = [...toDay.tasks, { ...task, done: false }];
      newData[targetDayIndex] = toDay;
      setLocalData([...newData]);
      await saveDay(targetDayIndex, toDay);
    } else {
      // Different week – upsert directly to Supabase
      const { data: existing } = await supabase
        .from('weekly_planner_data')
        .select('*')
        .eq('user_id', userId)
        .eq('week_start_date', newWeekStart)
        .eq('day_index', targetDayIndex)
        .maybeSingle();

      const existingTasks = existing?.tasks ?? [];
      await supabase.from('weekly_planner_data').upsert({
        user_id: userId,
        week_start_date: newWeekStart,
        day_index: targetDayIndex,
        tasks: [...existingTasks, { ...task, done: false }],
        reflections: existing?.reflections ?? { notes: ['', '', ''], improve: ['', '', ''], thanks: ['', '', ''] },
        mood: existing?.mood ?? null,
      }, { onConflict: 'user_id,week_start_date,day_index' });

      // Navigate to that week
      setWeekStart(newWeekStart);
      setSelectedDayIndex(targetDayIndex);
    }
  };

  const handleMoodSelect = (dayIndex: number, mood: number) => {
    const newData = [...localData];
    const dayData = { ...newData[dayIndex], mood };
    newData[dayIndex] = dayData;
    setLocalData(newData);
    saveDay(dayIndex, dayData);
  };

  // Stats
  const dayStats = useMemo(() => {
    return localData.map(d => {
      const nonEmpty = d.tasks.filter(t => t.text.trim());
      const done = nonEmpty.filter(t => t.done).length;
      return { total: nonEmpty.length, done };
    });
  }, [localData]);

  const overallStats = useMemo(() => {
    const total = dayStats.reduce((acc, curr) => acc + curr.total, 0);
    const done = dayStats.reduce((acc, curr) => acc + curr.done, 0);
    return { total, done, pct: total ? Math.round((done / total) * 100) : 0 };
  }, [dayStats]);

  const getWeekDates = () => {
    const start = new Date(weekStart + 'T00:00:00');
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      return d;
    });
  };
  const weekDates = getWeekDates();



  const changeWeek = (delta: number) => {
    const d = new Date(weekStart + 'T00:00:00');
    d.setDate(d.getDate() + delta * 7);
    setWeekStart(toISODate(d.getFullYear(), d.getMonth(), d.getDate()));
  };

  const day = localData[selectedDayIndex];
  const dateStr = toISODate(weekDates[selectedDayIndex].getFullYear(), weekDates[selectedDayIndex].getMonth(), weekDates[selectedDayIndex].getDate());
  const todayStr = toISODate(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
  const isToday = dateStr === todayStr;
  const pct = dayStats[selectedDayIndex].total > 0 ? Math.round((dayStats[selectedDayIndex].done / dayStats[selectedDayIndex].total) * 100) : 0;
  const isFull = pct === 100 && dayStats[selectedDayIndex].total > 0;
  const isProgress75 = pct >= 75 && pct < 100;

  // Mood labels from translations
  const moodLabels = [
    { v: 1, e: '😫', l: t('planner_mood_exhausted') },
    { v: 2, e: '😕', l: t('planner_mood_low') },
    { v: 3, e: '😐', l: t('planner_mood_neutral') },
    { v: 4, e: '🙂', l: t('planner_mood_good') },
    { v: 5, e: '🤩', l: t('planner_mood_amazing') },
  ];
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f9f7] flex items-center justify-center font-fraunces text-[#2d5a3d]">
        {t('planner_loading')}
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-[#f7f9f7] text-[#1a2e1e] font-sans transition-all duration-1000 ${asEmbedded ? 'pt-2' : ''} ${isDeepWork ? 'bg-black' : ''}`}>
      <TourBienvenida />
      {/* TOPBAR */}
      {!asEmbedded && (
        <nav className={`bg-[#2d5a3d] h-[54px] flex items-center px-4 sm:px-7 sticky top-0 z-[200] shadow-lg transition-all duration-700 ${isDeepWork ? 'opacity-0 -translate-y-full pointer-events-none' : 'opacity-100'}`}>
          <div className="flex items-center gap-3 mr-8">
            <div className="w-7 h-7 bg-[#6aaf7a] rounded-full rounded-bl-none -rotate-45 flex items-center justify-center text-[13px]">
              <span className="rotate-45">🌿</span>
            </div>
            <Link href="/tracker" className="font-fraunces text-white text-lg font-bold tracking-tight">{t('planner_weekly')}</Link>
          </div>

          <div className="hidden sm:flex bg-white/10 border border-white/20 rounded-lg overflow-hidden mr-auto">
            <button
              onClick={() => setView('tasks')}
              className={`px-5 py-1.5 text-[11px] font-bold transition-all ${view === 'tasks' ? 'bg-[#2d5a3d] text-white' : 'text-white/70 hover:bg-white/5'}`}
            >
              {t('planner_tasks')}
            </button>
            <button
              onClick={() => setView('reflect')}
              className={`px-5 py-1.5 text-[11px] font-bold transition-all ${view === 'reflect' ? 'bg-[#2d5a3d] text-white' : 'text-white/70 hover:bg-white/5'}`}
            >
              {t('planner_reflect')}
            </button>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <button onClick={() => changeWeek(-1)} className="w-[30px] h-[30px] flex items-center justify-center bg-white/10 border border-white/20 rounded text-white hover:bg-white/20 transition-all">←</button>
            <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-lg px-3 py-1">
              <span className="text-[10px] text-[#c8e6c9] font-mono uppercase">{t('planner_week_nav')}</span>
              <input
                type="date"
                value={weekStart}
                onChange={(e) => setWeekStart(e.target.value)}
                className="bg-transparent border-none text-white text-[11px] font-mono outline-none cursor-pointer"
              />
            </div>
            <button onClick={() => changeWeek(1)} className="w-[30px] h-[30px] flex items-center justify-center bg-white/10 border border-white/20 rounded text-white hover:bg-white/20 transition-all">→</button>
          </div>
        </nav>
      )}

      {/* HEADER DE BIENVENIDA */}
      {!isDeepWork && (
        <div className="bg-white px-7 pt-8 pb-4">
          <div className="max-w-[1200px] mx-auto w-full flex items-center gap-6">
            <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#7a9b82] mb-1">
              {t('planner_header')}
            </h5>
            {(!isPaid || userTier === 'trial' || userTier === 'free' || userTier === 'gratis') && (
              <div className="bg-emerald-100 text-emerald-700 px-6 py-2 rounded-full text-[10px] font-black uppercase flex items-center gap-3 border border-emerald-200 animate-pulse mb-1 shadow-sm">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                Trial Activo: 72h restantes
              </div>
            )}
          </div>
        </div>
      )}

      {/* Control bar (Day Selector) */}
      <div className={`px-7 py-5 flex flex-col items-center gap-6 bg-white border-b border-[#d8eadb] shadow-sm transition-all duration-700 ${isDeepWork ? 'blur-xl opacity-20 pointer-events-none' : 'blur-0 opacity-100'}`}>
        <div className="w-full flex flex-wrap items-center justify-center sm:justify-between gap-3 sm:gap-6 max-w-[800px]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#2d5a3d] rounded-lg flex items-center justify-center text-[12px] shadow-sm">🌿</div>
            <h2 className="hidden xs:block font-fraunces text-[#2d5a3d] text-xl font-black tracking-tight">{asEmbedded ? t('planner_daily_focus') : t('planner_weekly')}</h2>
          </div>

          <div className="flex bg-[#f4faf6] border border-[#d8eadb] rounded-xl overflow-hidden p-0.5 sm:p-1 shadow-inner">
            <button
              onClick={() => setView('tasks')}
              className={`px-2.5 sm:px-6 py-2 text-[9px] sm:text-[10px] font-black tracking-widest transition-all rounded-lg ${view === 'tasks' ? 'bg-[#2d5a3d] text-white shadow-md' : 'text-[#7a9b82] hover:bg-white'}`}
            >
              {t('planner_tasks')}
            </button>
            <button
              onClick={() => setView('reflect')}
              className={`px-2.5 sm:px-6 py-2 text-[9px] sm:text-[10px] font-black tracking-widest transition-all rounded-lg ${view === 'reflect' ? 'bg-[#2d5a3d] text-white shadow-md' : 'text-[#7a9b82] hover:bg-white'}`}
            >
              {t('planner_reflect')}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => changeWeek(-1)} className="w-8 h-8 rounded-full border border-[#d8eadb] text-[#7a9b82] hover:bg-[#f4faf6] transition-all">←</button>
            <span className="font-mono text-[10px] font-bold text-[#2d5a3d] uppercase tracking-tighter">{t('planner_week_label')} {weekStart.split('-').reverse().slice(0, 2).join('/')}</span>
            <button onClick={() => changeWeek(1)} className="w-8 h-8 rounded-full border border-[#d8eadb] text-[#7a9b82] hover:bg-[#f4faf6] transition-all">→</button>
            {/* ── BOTÓN HOY ── */}
            {(() => {
              const now = new Date();
              const todaySunday = new Date(now);
              todaySunday.setDate(now.getDate() - now.getDay());
              const todayWeekStart = toISODate(todaySunday.getFullYear(), todaySunday.getMonth(), todaySunday.getDate());
              const isCurrentWeek = weekStart === todayWeekStart;
              return (
                <button
                  onClick={() => {
                    setWeekStart(todayWeekStart);
                    setSelectedDayIndex(now.getDay());
                  }}
                  title="Ir al día de hoy"
                  className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all shadow-sm hover:scale-105 active:scale-95
                    ${isCurrentWeek
                      ? 'bg-emerald-500 text-white border border-emerald-400 shadow-emerald-200'
                      : 'bg-[#2d5a3d] text-white border border-[#2d5a3d] animate-pulse hover:animate-none'
                    }`}
                >
                  📍 HOY
                </button>
              );
            })()}
            <button 
              onClick={() => setShowMonthModal(true)} 
              title={t('planner_full_month_title')}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 bg-white border border-[#d8eadb] rounded-full text-[10px] font-black uppercase text-[#2d5a3d] hover:bg-[#f4faf6] transition-all shadow-sm hover:scale-105"
            >
              📅 {t('planner_full_month')}
            </button>
          </div>
        </div>

        {/* DAY SELECTOR BAR */}
        <div className="w-full overflow-x-auto no-scrollbar py-2">
          <div className="flex justify-start sm:justify-center min-w-max gap-1.5 sm:gap-4 p-1 sm:p-1.5 bg-[#f4faf6] rounded-2xl border border-[#d8eadb] shadow-inner mx-auto w-fit">
            {ABBR.map((label, idx) => {
              const d = weekDates[idx];
              const isSel = selectedDayIndex === idx;
              const isTodayDay = toISODate(d.getFullYear(), d.getMonth(), d.getDate()) === todayStr;
              const dayPct = dayStats[idx].total > 0 ? Math.round((dayStats[idx].done / dayStats[idx].total) * 100) : 0;
              const dayFull = dayPct === 100 && dayStats[idx].total > 0;

              return (
                <button
                  key={idx}
                  onClick={() => setSelectedDayIndex(idx)}
                  className={`relative flex flex-col items-center justify-center w-9 h-12 sm:w-16 sm:h-20 rounded-xl transition-all duration-300 group
                  ${isSel ? 'bg-[#2d5a3d] text-white shadow-xl scale-110 -translate-y-1' : 'bg-white text-[#7a9b82] hover:bg-[#ebf5ed] border border-[#d8eadb]'}`}
                >
                  <span className={`text-[10px] font-black mb-1 ${isSel ? 'text-white/60' : 'text-[#7a9b82]'}`}>{label}</span>
                  <span className={`font-fraunces text-base sm:text-lg font-black ${isSel ? 'text-white' : 'text-[#2d5a3d]'}`}>{d.getDate()}</span>

                  {isTodayDay && (
                    <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white shadow-sm ${isSel ? 'bg-[#6aaf7a]' : 'bg-[#e74b6c]'}`} />
                  )}

                  {dayStats[idx].total > 0 && (
                    <div className="absolute -bottom-1 left-1 right-1 h-1 bg-white/20 rounded-full overflow-hidden">
                      <div className={`h-full transition-all duration-500 ${dayFull ? 'bg-emerald-400' : 'bg-[#6aaf7a]'}`} style={{ width: `${dayPct}%` }} />
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <main className="p-2 sm:p-10 max-w-[1200px] mx-auto min-h-[calc(100vh-250px)] flex flex-col items-center">


        {/* FOCUS CARD */}
        <div
          key={selectedDayIndex}
          className={`w-full max-w-[900px] bg-white border transition-all duration-500 ${isDeepWork ? 'border-emerald-500 ring-[20px] ring-emerald-500/10' : isToday ? 'border-emerald-500 ring-4 ring-emerald-500/5' : 'border-[#d8eadb]'} rounded-[32px] shadow-[0_20px_50px_-15px_rgba(45,90,61,0.12)] overflow-hidden animate-in fade-in slide-in-from-right-8 duration-500 flex flex-col md:flex-row`}
        >
          {/* LEFT SIDE */}
          <div className="flex-1 p-4 sm:p-12">
            <header className="mb-10 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white ${isToday ? 'bg-emerald-500' : 'bg-[#6aaf7a]'}`}>
                    {isToday ? t('planner_focus_today') : DAYS[selectedDayIndex]}
                  </span>
                  <span className="font-mono text-xs text-[#7a9b82] font-bold">
                    {lang === 'en'
                      ? `${months[weekDates[selectedDayIndex].getMonth()]} ${String(weekDates[selectedDayIndex].getDate()).padStart(2, '0')}, ${weekDates[selectedDayIndex].getFullYear()}`
                      : `${String(weekDates[selectedDayIndex].getDate()).padStart(2, '0')} de ${months[weekDates[selectedDayIndex].getMonth()].toLowerCase()} de ${weekDates[selectedDayIndex].getFullYear()}`}
                  </span>
                </div>
                <h3 className="font-fraunces text-4xl sm:text-5xl font-black text-[#2d5a3d] leading-tight">
                  {isToday ? t('planner_dominate') : t('planner_purposes_for', { day: DAYS[selectedDayIndex] })}
                </h3>
              </div>

              <button
                onClick={() => {
                  setIsDeepWork(!isDeepWork);
                  if (!isDeepWork) setTimeLeft(1500);
                }}
                className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl transition-all duration-500 shadow-lg ${isDeepWork ? 'bg-emerald-500 text-white scale-125 rotate-[360deg]' : 'bg-[#f4faf6] text-[#6aaf7a] hover:scale-110'}`}
                title={t('planner_deep_work_mode')}
              >
                ⚡
              </button>
            </header>

            {isDeepWork && (
              <div className="mb-8 flex items-center gap-4 bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/20 animate-pulse">
                <span className="text-2xl font-mono font-black text-emerald-600 tracking-tighter">{formatTime(timeLeft)}</span>
                <div className="flex-1 h-1 bg-emerald-200 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${(timeLeft / 1500) * 100}%` }} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">{t('planner_deep_work_active')}</span>
              </div>
            )}

            {view === 'tasks' ? (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6 px-2">
                  <div className="flex flex-wrap items-center gap-4">
                    <h4 className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-[#7a9b82] whitespace-nowrap">{t('planner_stack_list')}</h4>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const dateObj = weekDates[selectedDayIndex];
                          const dateStr = dateObj.toLocaleDateString(lang === 'es' ? 'es-ES' : lang === 'pt' ? 'pt-BR' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' });
                          const tasksText = day.tasks.length > 0
                            ? day.tasks.map((t, i) => `\n${i + 1}. ${t.text}${t.note ? `\n   📝 Nota: ${t.note}` : ''}`).join('')
                            : `\n${t('planner_no_tasks')}`;

                          const message = t('planner_whatsapp_msg', { tasks: tasksText });
                          const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
                          window.open(whatsappUrl, '_blank');
                        }}
                        className="flex items-center gap-1.5 px-2 py-1 bg-[#25D366] text-white rounded-md hover:scale-105 transition-all shadow-sm group shrink-0"
                      >
                        <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                        <span className="text-[9px] font-black uppercase">WSP</span>
                      </button>

                      <button
                        onClick={handleExportXLS}
                        className="flex items-center gap-1.5 px-3 py-1 bg-[#2d5a3d] text-white rounded-md hover:scale-105 transition-all shadow-sm shrink-0"
                        title={t('common_export_excel')}
                      >
                        <Download size={12} />
                        <span className="text-[9px] font-black uppercase">XLS</span>
                      </button>
                    </div>
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-bold text-[#2d5a3d] bg-[#f4faf6] px-3 py-1 rounded-full border border-[#d8eadb] shrink-0">
                    {dayStats[selectedDayIndex].done} / {dayStats[selectedDayIndex].total} {t('planner_completed')}
                  </span>
                </div>

                {/* QUICK ADD BLOCK (Moved here) */}
                <div className={`transition-all duration-700 ${isDeepWork ? 'opacity-0 scale-90 pointer-events-none hidden' : 'opacity-100'}`}>
                  <div className="flex items-center justify-between mb-3 px-2">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-[#7a9b82]">{t('planner_add_task_global')}</h4>
                    {newTaskPriority === 'critical' && (
                      <div className="bg-amber-50 border border-amber-200 px-3 py-1 rounded-lg animate-in fade-in slide-in-from-right-4">
                        <p className="text-[9px] font-black text-amber-700 uppercase italic">✨ "Elige tus 3 batallas de hoy."</p>
                      </div>
                    )}
                  </div>
                  <div className="bg-[#f4faf6] border border-[#d8eadb] p-3 sm:p-5 rounded-[24px] shadow-inner group mb-6">
                    <div className="flex items-center gap-3 bg-white border border-[#d8eadb] p-3 rounded-xl shadow-sm focus-within:border-[#2d5a3d] transition-all mb-3">
                      <span className="text-xl opacity-40">+</span>
                      <input
                        type="text"
                        value={newTaskText}
                        onChange={(e) => setNewTaskText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addTask(selectedDayIndex, newTaskText)}
                        placeholder={t('planner_add_placeholder')}
                        className="flex-1 bg-transparent border-none outline-none text-sm font-bold text-[#2d5a3d] placeholder-[#c8e6c9]"
                      />
                    </div>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      {['critical', 'important', 'growth'].map((p) => (
                        <button
                          key={p}
                          onClick={() => setNewTaskPriority(p as any)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${newTaskPriority === p ? 'bg-[#2d5a3d] text-white shadow-md' : 'bg-white border border-[#d8eadb] text-[#7a9b82] hover:bg-[#ebf5ed]'}`}
                          title={t(`planner_priority_${p}`)}
                        >
                          <span className={`w-2 h-2 rounded-full ${p === 'critical' ? 'bg-rose-500' : p === 'important' ? 'bg-amber-400' : 'bg-emerald-500'}`} />
                          <span className="inline">{t(`planner_priority_${p}`)}</span>
                        </button>
                      ))}
                      <input
                        type="time"
                        value={newTaskTime}
                        onChange={(e) => setNewTaskTime(e.target.value)}
                        title={t('planner_time_hint')}
                        className="w-[72px] bg-[#f4faf6] border border-[#d8eadb] focus:border-[#2d5a3d] rounded-lg text-[11px] font-mono font-black text-center outline-none py-1 text-[#2d5a3d]"
                      />

                      <button
                        onClick={() => addTask(selectedDayIndex, newTaskText)}
                        className="px-4 py-2 bg-[#2d5a3d] text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:scale-105 active:scale-95 transition-all shadow-md"
                      >
                        {t('planner_add_btn')}
                      </button>
                    </div>
                  </div>
                </div>

                <div className={`space-y-3 min-h-[200px] transition-all duration-500 ${isDeepWork ? 'scale-105 origin-left' : ''}`}>
                  {(() => {
                    const PRIORITY_ORDER = { critical: 0, important: 1, growth: 2 };
                    const sortedTasks = day.tasks
                      .map((task, origIdx) => ({ ...task, origIdx }))
                      .sort((a, b) => {
                        if (a.done !== b.done) return a.done ? 1 : -1;
                        return (PRIORITY_ORDER[a.priority || 'important'] as number || 1) - (PRIORITY_ORDER[b.priority || 'important'] as number || 1);
                      });
                    return (
                      <>
                        {sortedTasks.map((task) => {
                          const tIdx = task.origIdx;
                          const p = task.priority || 'important';
                          const isUrgent = p === 'critical' && !task.done && task.created_at && (Date.now() - new Date(task.created_at).getTime() > 3 * 60 * 60 * 1000);
                          const borderColor = task.done ? 'border-[#d8eadb]' : p === 'critical' ? 'border-rose-400' : p === 'growth' ? 'border-emerald-400' : 'border-amber-400';
                          return (
                            <div key={tIdx} className="relative group">
                              <div className={`flex flex-col gap-1 p-2 sm:p-4 rounded-2xl transition-all border-2 ${task.done ? 'bg-[#f4faf6] opacity-60' : 'bg-white shadow-sm'} ${borderColor} ${isUrgent ? 'animate-[urgentGlow_2s_ease-in-out_infinite]' : ''}`}
                                style={isUrgent ? { boxShadow: '0 0 12px rgba(239,68,68,0.3)' } : undefined}
                              >
                                {/* ROW 1: Priority + Checkbox + Text */}
                                <div className="flex items-center gap-2 sm:gap-3">
                                  <div className={`w-2 sm:w-2.5 h-6 sm:h-8 rounded-full flex-shrink-0 ${p === 'critical' ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]' : p === 'growth' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]'}`} />
                                  <input
                                    type="checkbox"
                                    checked={task.done}
                                    onChange={() => handleTaskToggle(selectedDayIndex, tIdx)}
                                    className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-[#8fc99e] rounded-md text-[#2d5a3d] focus:ring-[#2d5a3d] cursor-pointer flex-shrink-0"
                                  />
                                  <span className="text-base sm:text-xl flex-shrink-0" title={t('common_auto_icon')}>
                                    {getTaskIcon(task.text)}
                                  </span>
                                  <textarea
                                    rows={1}
                                    value={task.text}
                                    onChange={(e) => handleTaskTextChange(selectedDayIndex, tIdx, e.target.value)}
                                    onBlur={() => saveDay(selectedDayIndex, day)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        e.preventDefault();
                                        (e.target as HTMLElement).blur();
                                      }
                                    }}
                                    onInput={(e) => {
                                      const el = e.target as HTMLTextAreaElement;
                                      el.style.height = 'auto';
                                      el.style.height = el.scrollHeight + 'px';
                                    }}
                                    className={`flex-1 min-w-0 text-xs sm:text-base bg-transparent border-none outline-none font-medium transition-all resize-none overflow-hidden ${task.done ? 'line-through text-[#7a9b82] italic' : 'text-[#1a2e1e]'}`}
                                  />
                                </div>

                                {/* ROW 2: Time + Actions */}
                                <div className="flex items-center gap-2 pl-6 sm:pl-8">
                                  {/* TIME BADGE */}
                                  {(() => {
                                    const tt = to12h(task.scheduled_time || '');
                                    return (
                                      <div className="flex items-center gap-1.5 flex-shrink-0">
                                        <input
                                          type="time"
                                          value={task.scheduled_time || ''}
                                          onChange={(e) => handleTaskTimeChange(selectedDayIndex, tIdx, e.target.value)}
                                          onBlur={() => saveDay(selectedDayIndex, day)}
                                          title={t('planner_time_hint')}
                                          className={`w-[68px] bg-[#f4faf6] border border-[#d8eadb] hover:border-[#6aaf7a] focus:border-[#2d5a3d] rounded-lg text-[10px] font-mono font-black text-center outline-none transition-all py-0.5 cursor-pointer ${task.scheduled_time ? 'text-[#2d5a3d]' : 'text-[#c8e6c9]'}`}
                                        />
                                        {task.scheduled_time && (
                                          <span className={`text-[7px] sm:text-[8px] font-black rounded px-1 py-0.5 ${tt.ampm === 'PM' ? 'bg-indigo-100 text-indigo-600' : 'bg-amber-100 text-amber-600'}`}>
                                            {tt.h}:{tt.m} {tt.ampm}
                                          </span>
                                        )}
                                      </div>
                                    );
                                  })()}
                                  {/* BELL */}
                                  {task.scheduled_time && (
                                    <button
                                      onClick={() => {
                                        setRingingTasks(prev => {
                                          const next = new Set(prev);
                                          const key = `${selectedDayIndex}-${tIdx}`;
                                          if (next.has(key)) next.delete(key); else playBellSound();
                                          return next;
                                        });
                                      }}
                                      className={`text-sm transition-all ${ringingTasks.has(`${selectedDayIndex}-${tIdx}`) ? 'animate-[bellShake_0.5s_ease-in-out_infinite] text-amber-500' : 'text-[#c8e6c9] hover:text-amber-400'}`}
                                      title={t('common_alarm')}
                                    >
                                      {ringingTasks.has(`${selectedDayIndex}-${tIdx}`) ? '🔔' : '🔕'}
                                    </button>
                                  )}

                                  {/* TASK ACTIONS */}
                                  <div className="flex items-center gap-0.5 ml-auto">
                                    {/* RECURRENCE BADGE */}
                                    {task.recurrence && (
                                      <div className="flex items-center gap-1 mr-1">
                                        <span
                                          className="text-[7px] font-black bg-violet-100 text-violet-700 border border-violet-200 px-1.5 py-0.5 rounded-full flex items-center gap-0.5 cursor-pointer hover:bg-violet-200 transition-all"
                                          onClick={() => removeRecurrence(selectedDayIndex, tIdx)}
                                          title="Quitar recurrencia"
                                        >
                                          🔁 hasta {months[task.recurrence.endMonth]?.slice(0,3)} {task.recurrence.endYear}
                                        </span>
                                      </div>
                                    )}
                                    {/* NOTE BUTTON */}
                                    <button
                                      onClick={() => setOpenNoteIdx(openNoteIdx === tIdx ? null : tIdx)}
                                      title="Agregar nota a esta tarea"
                                      className={`flex flex-col items-center gap-0.5 p-1 sm:p-2 rounded-lg transition-all
                                        ${task.note ? 'bg-amber-100 text-amber-600' : openNoteIdx === tIdx ? 'bg-amber-500 text-white' : 'text-[#7a9b82] hover:bg-amber-50 hover:text-amber-500'}`}
                                    >
                                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                      </svg>
                                      <span className="text-[7px] font-black uppercase">Nota</span>
                                    </button>
                                    {/* COPY / DUPLICATE BUTTON */}
                                    <button
                                      onClick={() => duplicateTask(selectedDayIndex, tIdx)}
                                      title="Duplicar tarea"
                                      className="flex flex-col items-center gap-0.5 p-1 sm:p-2 rounded-lg transition-all text-[#7a9b82] hover:bg-sky-50 hover:text-sky-600 active:scale-90"
                                    >
                                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                                      </svg>
                                      <span className="text-[7px] font-black uppercase">Copiar</span>
                                    </button>
                                    <button
                                      onClick={() => {
                                        setMovingTaskIdx(movingTaskIdx === tIdx ? null : tIdx);
                                        setCalendarMonth(new Date().getMonth());
                                        setCalendarYear(new Date().getFullYear());
                                      }}
                                      title={t('planner_move_title')}
                                      className={`flex flex-col items-center gap-0.5 p-1 sm:p-2 rounded-lg transition-all ${movingTaskIdx === tIdx ? 'bg-[#2d5a3d] text-white shadow-md' : 'text-[#7a9b82] hover:bg-[#f4faf6] hover:text-[#2d5a3d]'}`}
                                    >
                                      <span className="text-sm">📅</span>
                                      <span className="text-[7px] font-black uppercase">{t('planner_move_date')}</span>
                                    </button>
                                    {/* RECURRENCE BUTTON */}
                                    <button
                                      onClick={() => {
                                        setRecurrenceTaskIdx(recurrenceTaskIdx === tIdx ? null : tIdx);
                                        if (task.recurrence) {
                                          setRecurDayOfMonth(task.recurrence.dayOfMonth);
                                          setRecurEndMonth(task.recurrence.endMonth);
                                          setRecurEndYear(task.recurrence.endYear);
                                        } else {
                                          setRecurDayOfMonth(weekDates[selectedDayIndex].getDate());
                                          setRecurEndMonth(new Date().getMonth());
                                          setRecurEndYear(new Date().getFullYear() + 1);
                                        }
                                      }}
                                      title="Configurar recurrencia mensual"
                                      className={`flex flex-col items-center gap-0.5 p-1 sm:p-2 rounded-lg transition-all ${task.recurrence ? 'bg-violet-100 text-violet-700' : 'text-[#7a9b82] hover:bg-violet-50 hover:text-violet-600'}`}
                                    >
                                      <span className="text-sm">🔁</span>
                                      <span className="text-[7px] font-black uppercase">Recur.</span>
                                    </button>
                                    <button
                                      onClick={() => deleteTask(selectedDayIndex, tIdx)}
                                      title={t('planner_delete_title')}
                                      className="p-1 sm:p-2 text-[#e74b6c] hover:bg-[#fff0f3] rounded-lg transition-all text-sm"
                                    >
                                      🗑️
                                    </button>
                                  </div>
                                </div>

                                {/* ── NOTA EXPANDIBLE ── */}
                                {openNoteIdx === tIdx && (
                                  <div className="mt-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3">
                                      <span className="text-amber-500 text-base mt-0.5 flex-shrink-0">📝</span>
                                      <div className="flex-1">
                                        <p className="text-[8px] font-black uppercase tracking-widest text-amber-600 mb-1">Nota / Descripción</p>
                                        <textarea
                                          autoFocus
                                          rows={3}
                                          value={task.note || ''}
                                          onChange={e => handleNoteChange(selectedDayIndex, tIdx, e.target.value)}
                                          onBlur={() => saveDay(selectedDayIndex, day)}
                                          placeholder="¿En qué consiste esta tarea? Agrega detalles, links, instrucciones..."
                                          className="w-full bg-white border border-amber-200 focus:border-amber-400 rounded-lg text-[11px] text-[#1a2e1e] font-medium outline-none resize-none p-2 transition-all placeholder:text-amber-300"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                )}
                                {/* NOTE PREVIEW (when closed but has content) */}
                                {openNoteIdx !== tIdx && task.note && (
                                  <div
                                    className="mt-1.5 flex items-start gap-1.5 bg-amber-50/70 border border-amber-100 rounded-lg px-2.5 py-1.5 cursor-pointer hover:bg-amber-50 transition-all"
                                    onClick={() => setOpenNoteIdx(tIdx)}
                                  >
                                    <span className="text-amber-400 text-xs flex-shrink-0">📝</span>
                                    <p className="text-[10px] text-amber-700 font-medium line-clamp-1 flex-1">{task.note}</p>
                                    <span className="text-[8px] text-amber-400 font-black uppercase flex-shrink-0">Editar</span>
                                  </div>
                                )}
                              </div>

                              {/* FULL CALENDAR MODAL */}
                              {movingTaskIdx === tIdx && (() => {
                                const CAL_HEADERS: string[] = t('planner_cal_headers') || ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
                                const firstDay = new Date(calendarYear, calendarMonth, 1).getDay();
                                const daysInCal = new Date(calendarYear, calendarMonth + 1, 0).getDate();
                                const todayNow = new Date();
                                const calCells: (number | null)[] = [
                                  ...Array(firstDay).fill(null),
                                  ...Array.from({ length: daysInCal }, (_, i) => i + 1),
                                ];
                                while (calCells.length % 7 !== 0) calCells.push(null);

                                return (
                                  <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-in fade-in duration-200"
                                    onClick={() => setMovingTaskIdx(null)}>
                                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-[360px] overflow-hidden animate-in zoom-in-95 duration-300"
                                      onClick={e => e.stopPropagation()}>

                                      {/* Calendar Header */}
                                      <div className="bg-[#2d5a3d] px-6 py-5">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-[#8fc99e] mb-1">{t('planner_move_to_day')}</p>
                                        <p className="text-white font-fraunces text-sm font-bold italic truncate opacity-80">&ldquo;{task.text}&rdquo;</p>
                                      </div>

                                      {/* Month Navigator */}
                                      <div className="flex items-center justify-between px-5 pt-5 pb-3">
                                        <button
                                          onClick={() => {
                                            if (calendarMonth === 0) { setCalendarMonth(11); setCalendarYear(y => y - 1); }
                                            else setCalendarMonth(m => m - 1);
                                          }}
                                          className="w-9 h-9 rounded-full bg-[#f4faf6] text-[#2d5a3d] flex items-center justify-center font-black hover:bg-[#2d5a3d] hover:text-white transition-all"
                                        >‹</button>
                                        <span className="font-fraunces font-black text-[#2d5a3d] text-lg capitalize">
                                          {months[calendarMonth]} {calendarYear}
                                        </span>
                                        <button
                                          onClick={() => {
                                            if (calendarMonth === 11) { setCalendarMonth(0); setCalendarYear(y => y + 1); }
                                            else setCalendarMonth(m => m + 1);
                                          }}
                                          className="w-9 h-9 rounded-full bg-[#f4faf6] text-[#2d5a3d] flex items-center justify-center font-black hover:bg-[#2d5a3d] hover:text-white transition-all"
                                        >›</button>
                                      </div>

                                      {/* Day Headers */}
                                      <div className="grid grid-cols-7 px-4 pb-2">
                                        {CAL_HEADERS.map((h, i) => (
                                          <div key={i} className="text-center text-[9px] font-black uppercase text-[#7a9b82] py-1">{h}</div>
                                        ))}
                                      </div>

                                      {/* Calendar Grid */}
                                      <div className="grid grid-cols-7 px-4 pb-5 gap-y-1">
                                        {calCells.map((d, i) => {
                                          if (!d) return <div key={i} />;
                                          const cellDate = new Date(calendarYear, calendarMonth, d);
                                          const isToday2 = cellDate.toDateString() === todayNow.toDateString();
                                          const isPast = cellDate < new Date(todayNow.getFullYear(), todayNow.getMonth(), todayNow.getDate());
                                          return (
                                            <button
                                              key={i}
                                              disabled={isPast}
                                              onClick={async () => {
                                                if (movingTaskIdx === -1) {
                                                  // Move the whole list
                                                  const tasksToMove = localData[selectedDayIndex].tasks;
                                                  for (let i = tasksToMove.length - 1; i >= 0; i--) {
                                                    await moveTaskToDate(selectedDayIndex, i, cellDate);
                                                  }
                                                } else if (movingTaskIdx !== null) {
                                                  await moveTaskToDate(selectedDayIndex, movingTaskIdx, cellDate);
                                                }
                                                setMovingTaskIdx(null);
                                              }}
                                              className={`aspect-square rounded-xl text-sm font-bold transition-all flex items-center justify-center
                                            ${isPast ? 'text-[#c8e6c9] cursor-not-allowed' :
                                                  isToday2 ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200 font-black' :
                                                    'text-[#2d5a3d] hover:bg-[#2d5a3d] hover:text-white hover:scale-110'}`}
                                            >
                                              {d}
                                            </button>
                                          );
                                        })}
                                      </div>

                                      {/* Footer */}
                                      <div className="border-t border-[#d8eadb] px-5 py-3 flex justify-end">
                                        <button
                                          onClick={() => setMovingTaskIdx(null)}
                                          className="text-[10px] font-black uppercase text-[#7a9b82] hover:text-[#2d5a3d] transition-colors px-4 py-2 rounded-lg hover:bg-[#f4faf6]"
                                        >
                                          {t('planner_cancel')}
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })()}
                            {/* RECURRENCE MODAL */}
                            {recurrenceTaskIdx === tIdx && (
                              <div
                                className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-in fade-in duration-200"
                                onClick={() => setRecurrenceTaskIdx(null)}
                              >
                                <div
                                  className="bg-white rounded-3xl shadow-2xl w-full max-w-[380px] overflow-hidden animate-in zoom-in-95 duration-300"
                                  onClick={e => e.stopPropagation()}
                                >
                                  {/* Header */}
                                  <div className="bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-5">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-violet-200 mb-1">🔁 Recurrencia Mensual</p>
                                    <p className="text-white font-fraunces text-sm font-bold italic truncate opacity-90">&ldquo;{task.text}&rdquo;</p>
                                  </div>

                                  <div className="p-6 space-y-5">
                                    {/* Día del mes */}
                                    <div>
                                      <label className="text-[9px] font-black uppercase tracking-widest text-[#7a9b82] mb-2 block">Día del mes a repetir</label>
                                      <div className="flex items-center gap-3">
                                        <input
                                          type="number"
                                          min={1}
                                          max={31}
                                          value={recurDayOfMonth}
                                          onChange={e => setRecurDayOfMonth(Math.min(31, Math.max(1, parseInt(e.target.value) || 1)))}
                                          className="w-20 bg-[#f4faf6] border-2 border-violet-200 focus:border-violet-500 rounded-xl text-2xl font-black text-center text-violet-700 outline-none py-2 transition-all"
                                        />
                                        <div className="text-[10px] text-[#7a9b82] font-medium leading-tight">
                                          <p>Cada mes, en el</p>
                                          <p className="font-black text-violet-700">día {recurDayOfMonth}</p>
                                          <p>se marcará automáticamente</p>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Fecha fin */}
                                    <div>
                                      <label className="text-[9px] font-black uppercase tracking-widest text-[#7a9b82] mb-2 block">Repetir hasta</label>
                                      <div className="flex items-center gap-2">
                                        <select
                                          value={recurEndMonth}
                                          onChange={e => setRecurEndMonth(parseInt(e.target.value))}
                                          className="flex-1 bg-[#f4faf6] border-2 border-violet-200 focus:border-violet-500 rounded-xl text-[11px] font-black text-violet-700 outline-none py-2 px-3 cursor-pointer transition-all"
                                        >
                                          {months.map((m: string, i: number) => (
                                            <option key={i} value={i}>{m}</option>
                                          ))}
                                        </select>
                                        <select
                                          value={recurEndYear}
                                          onChange={e => setRecurEndYear(parseInt(e.target.value))}
                                          className="w-24 bg-[#f4faf6] border-2 border-violet-200 focus:border-violet-500 rounded-xl text-[11px] font-black text-violet-700 outline-none py-2 px-3 cursor-pointer transition-all"
                                        >
                                          {Array.from({ length: 6 }, (_, i) => new Date().getFullYear() + i).map(y => (
                                            <option key={y} value={y}>{y}</option>
                                          ))}
                                        </select>
                                      </div>
                                    </div>

                                    {/* Preview */}
                                    <div className="bg-violet-50 border border-violet-100 rounded-2xl p-3">
                                      <p className="text-[9px] font-black uppercase tracking-widest text-violet-500 mb-1">Vista previa</p>
                                      <p className="text-[11px] font-bold text-violet-800">
                                        🔁 Se repetirá el día <strong>{recurDayOfMonth}</strong> de cada mes
                                      </p>
                                      <p className="text-[10px] text-violet-600 font-medium mt-0.5">
                                        Hasta: <strong>{months[recurEndMonth]} {recurEndYear}</strong>
                                      </p>
                                    </div>

                                    {/* Buttons */}
                                    <div className="flex gap-2 pt-1">
                                      <button
                                        onClick={() => setRecurrenceTaskIdx(null)}
                                        className="flex-1 py-3 bg-[#f4faf6] border border-[#d8eadb] text-[#7a9b82] text-[10px] font-black uppercase rounded-xl hover:bg-gray-50 transition-all"
                                      >
                                        Cancelar
                                      </button>
                                      {task.recurrence && (
                                        <button
                                          onClick={() => removeRecurrence(selectedDayIndex, tIdx).then(() => setRecurrenceTaskIdx(null))}
                                          className="flex-1 py-3 bg-rose-50 border border-rose-200 text-rose-600 text-[10px] font-black uppercase rounded-xl hover:bg-rose-100 transition-all"
                                        >
                                          Quitar 🗑️
                                        </button>
                                      )}
                                      <button
                                        onClick={() => handleSetRecurrence(selectedDayIndex, tIdx)}
                                        className="flex-1 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white text-[10px] font-black uppercase rounded-xl hover:opacity-90 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-violet-200"
                                      >
                                        ✓ Activar
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                            </div>
                          );
                        })}

                        {/* GLOBAL MOVE MODAL (when moving whole list) */}
                        {movingTaskIdx === -1 && (() => {
                          const CAL_HEADERS: string[] = t('planner_cal_headers') || ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
                          const firstDay = new Date(calendarYear, calendarMonth, 1).getDay();
                          const daysInCal = new Date(calendarYear, calendarMonth + 1, 0).getDate();
                          const todayNow = new Date();
                          const calCells: (number | null)[] = [
                            ...Array(firstDay).fill(null),
                            ...Array.from({ length: daysInCal }, (_, i) => i + 1),
                          ];
                          while (calCells.length % 7 !== 0) calCells.push(null);

                          return (
                            <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-in fade-in duration-200"
                              onClick={() => setMovingTaskIdx(null)}>
                              <div className="bg-white rounded-3xl shadow-2xl w-full max-w-[360px] overflow-hidden animate-in zoom-in-95 duration-300"
                                onClick={e => e.stopPropagation()}>
                                <div className="bg-[#2d5a3d] px-6 py-5 text-center">
                                  <p className="text-[10px] font-black uppercase tracking-widest text-[#8fc99e] mb-1">{t('common_move_list')}</p>
                                  <p className="text-white font-fraunces text-base font-bold italic opacity-80">{t('common_select_target_day')}</p>
                                </div>
                                <div className="flex items-center justify-between px-5 pt-5 pb-3">
                                  <button onClick={() => { if (calendarMonth === 0) { setCalendarMonth(11); setCalendarYear(y => y - 1); } else setCalendarMonth(m => m - 1); }} className="w-9 h-9 rounded-full bg-[#f4faf6] text-[#2d5a3d] flex items-center justify-center font-black">‹</button>
                                  <span className="font-fraunces font-black text-[#2d5a3d] text-lg capitalize">{months[calendarMonth]} {calendarYear}</span>
                                  <button onClick={() => { if (calendarMonth === 11) { setCalendarMonth(0); setCalendarYear(y => y + 1); } else setCalendarMonth(m => m + 1); }} className="w-9 h-9 rounded-full bg-[#f4faf6] text-[#2d5a3d] flex items-center justify-center font-black">›</button>
                                </div>
                                <div className="grid grid-cols-7 px-4 pb-2">
                                  {CAL_HEADERS.map((h, i) => (<div key={i} className="text-center text-[9px] font-black uppercase text-[#7a9b82] py-1">{h}</div>))}
                                </div>
                                <div className="grid grid-cols-7 px-4 pb-5 gap-y-1">
                                  {calCells.map((d, i) => {
                                    if (!d) return <div key={i} />;
                                    const cellDate = new Date(calendarYear, calendarMonth, d);
                                    const isToday2 = cellDate.toDateString() === todayNow.toDateString();
                                    const isPast = cellDate < new Date(todayNow.getFullYear(), todayNow.getMonth(), todayNow.getDate());
                                    return (
                                      <button
                                        key={i}
                                        disabled={isPast}
                                        onClick={async () => {
                                          const tasksToMove = localData[selectedDayIndex].tasks;
                                          for (let j = tasksToMove.length - 1; j >= 0; j--) {
                                            await moveTaskToDate(selectedDayIndex, j, cellDate);
                                          }
                                          setMovingTaskIdx(null);
                                        }}
                                        className={`aspect-square rounded-xl text-sm font-bold transition-all flex items-center justify-center ${isPast ? 'text-[#c8e6c9] cursor-not-allowed' : isToday2 ? 'bg-emerald-500 text-white shadow-lg' : 'text-[#2d5a3d] hover:bg-[#2d5a3d] hover:text-white hover:scale-110'}`}
                                      >
                                        {d}
                                      </button>
                                    );
                                  })}
                                </div>
                                <div className="border-t border-[#d8eadb] px-5 py-3 flex justify-end">
                                  <button onClick={() => setMovingTaskIdx(null)} className="text-[10px] font-black uppercase text-[#7a9b82] hover:text-[#2d5a3d] transition-colors px-4 py-2 rounded-lg">{t('planner_cancel')}</button>
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </>
                    );
                  })()}
                </div>
              </div>
            ) : (
              <div className="space-y-8 animate-in fade-in duration-700">
                <section>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <span className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center text-xl shadow-lg shadow-emerald-500/20">🧠</span>
                      <div>
                        <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#2d5a3d]">Vaciado Mental (Brain Dump)</h4>
                        <p className="text-[10px] text-[#7a9b82] font-bold">Libera el ruido: escribe todo lo que tienes en la mente antes de priorizar.</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="w-8 h-8 rounded-full bg-[#f4faf6] flex items-center justify-center text-sm shadow-sm">😊</span>
                    <h4 className="text-[11px] font-black uppercase tracking-widest text-[#7a9b82]">{t('planner_mood_question')}</h4>
                  </div>
                  <div className="flex flex-wrap justify-around bg-[#f4faf6] p-5 rounded-[24px] border border-[#d8eadb] gap-2">
                    {moodLabels.map(m => (
                      <button
                        key={m.v}
                        onClick={() => handleMoodSelect(selectedDayIndex, m.v)}
                        className={`flex flex-col items-center gap-2 group transition-all ${day.mood === m.v ? 'scale-125' : 'grayscale opacity-40 hover:opacity-70 hover:grayscale-0'}`}
                      >
                        <span className="text-3xl drop-shadow-sm">{m.e}</span>
                        <span className={`text-[8px] font-black uppercase tracking-tighter transition-opacity ${day.mood === m.v ? 'opacity-100' : 'opacity-0'}`}>{m.l}</span>
                      </button>
                    ))}
                  </div>
                </section>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center px-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#7a9b82]">{t('planner_notes_label')}</label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            const newData = [...localData];
                            newData[selectedDayIndex].reflections.notes.push('');
                            setLocalData(newData);
                          }}
                          className="text-[9px] font-black uppercase text-[#6aaf7a] hover:underline"
                        >
                          + Añadir
                        </button>
                      </div>
                    </div>
                    <div className="bg-white border border-[#d8eadb] rounded-2xl p-4 shadow-sm space-y-3">
                      {day.reflections.notes.map((txt, i) => (
                        <div key={i} className="flex gap-2 items-center group bg-[#f4faf6]/30 p-1 rounded-xl hover:bg-[#f4faf6] transition-all">
                          <span className="text-[11px] font-black text-[#6aaf7a] min-w-[15px]">{i + 1}.</span>
                          <textarea
                            className="flex-1 bg-transparent border-none outline-none text-sm font-medium resize-none text-[#1a2e1e] py-1"
                            rows={1}
                            placeholder={t('planner_notes_placeholder')}
                            value={txt}
                            onChange={(e) => handleReflectionChange(selectedDayIndex, 'notes', i, e.target.value)}
                            onBlur={() => saveDay(selectedDayIndex, day)}
                            onInput={(e) => {
                              const el = e.target as HTMLTextAreaElement;
                              el.style.height = 'auto';
                              el.style.height = el.scrollHeight + 'px';
                            }}
                          />
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => saveDay(selectedDayIndex, day)}
                              className="p-1.5 text-emerald-600 hover:bg-white rounded-lg shadow-sm"
                              title="Grabar"
                            >
                              <Save size={12} />
                            </button>
                            <button
                              onClick={() => deleteReflectionItem(selectedDayIndex, 'notes', i)}
                              className="p-1.5 text-rose-500 hover:bg-white rounded-lg shadow-sm"
                              title="Eliminar"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center px-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-[#7a9b82]">{t('planner_improve_label')}</label>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              const newData = [...localData];
                              newData[selectedDayIndex].reflections.improve.push('');
                              setLocalData(newData);
                            }}
                            className="text-[9px] font-black uppercase text-[#6aaf7a] hover:underline"
                          >
                            + Añadir
                          </button>
                        </div>
                      </div>
                      <div className="bg-[#fff9f9] border border-[#ead8d8] rounded-2xl p-4 shadow-sm space-y-2">
                        {day.reflections.improve.map((txt, i) => (
                          <div key={i} className="flex gap-2 items-center group bg-white/50 p-1 rounded-xl hover:bg-white transition-all">
                            <input
                              className="flex-1 bg-transparent border-none outline-none text-sm font-medium text-[#7a1a1a] placeholder-[#c49b9b] py-1"
                              placeholder={t('planner_improve_placeholder')}
                              value={txt}
                              onChange={(e) => handleReflectionChange(selectedDayIndex, 'improve', i, e.target.value)}
                              onBlur={() => saveDay(selectedDayIndex, day)}
                            />
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => saveDay(selectedDayIndex, day)}
                                className="p-1.5 text-rose-600 hover:bg-white rounded-lg shadow-sm"
                                title="Grabar"
                              >
                                <Save size={12} />
                              </button>
                              <button
                                onClick={() => deleteReflectionItem(selectedDayIndex, 'improve', i)}
                                className="p-1.5 text-rose-500 hover:bg-white rounded-lg shadow-sm"
                                title="Eliminar"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center px-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-[#7a9b82]">{t('planner_thanks_label')}</label>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              const newData = [...localData];
                              newData[selectedDayIndex].reflections.thanks.push('');
                              setLocalData(newData);
                            }}
                            className="text-[9px] font-black uppercase text-[#6aaf7a] hover:underline"
                          >
                            + Añadir
                          </button>
                        </div>
                      </div>
                      <div className="bg-[#f9fff9] border border-[#d8eadb] rounded-2xl p-4 shadow-sm space-y-2">
                        {day.reflections.thanks.map((txt, i) => (
                          <div key={i} className="flex gap-2 items-center group bg-white/50 p-1 rounded-xl hover:bg-white transition-all">
                            <input
                              className="flex-1 bg-transparent border-none outline-none text-sm font-medium text-[#2d5a3d] placeholder-[#9bc4a5] py-1"
                              placeholder={t('planner_thanks_placeholder')}
                              value={txt}
                              onChange={(e) => handleReflectionChange(selectedDayIndex, 'thanks', i, e.target.value)}
                              onBlur={() => saveDay(selectedDayIndex, day)}
                            />
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => saveDay(selectedDayIndex, day)}
                                className="p-1.5 text-emerald-600 hover:bg-white rounded-lg shadow-sm"
                                title="Grabar"
                              >
                                <Save size={12} />
                              </button>
                              <button
                                onClick={() => deleteReflectionItem(selectedDayIndex, 'thanks', i)}
                                className="p-1.5 text-rose-500 hover:bg-white rounded-lg shadow-sm"
                                title="Eliminar"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center px-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-[#7a9b82]">Rediseño de Sistema (Revisión)</label>
                      </div>
                      <div className="bg-[#fff9ed] border border-[#ead8c8] rounded-2xl p-6 shadow-sm">
                        <p className="text-[11px] font-black text-amber-700 uppercase tracking-widest mb-3 italic">¿Qué sistema falló esta semana y cómo lo rediseñamos?</p>
                        <textarea
                          className="w-full bg-white/50 border border-amber-200 p-4 rounded-xl text-sm font-medium outline-none focus:border-amber-500 transition-all text-amber-900 resize-none"
                          rows={3}
                          placeholder="Analiza el error y describe la mejora técnica..."
                          value={day.reflections.notes[10] || ''}
                          onChange={(e) => handleReflectionChange(selectedDayIndex, 'notes', 10, e.target.value)}
                          onBlur={() => saveDay(selectedDayIndex, day)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* IMPACT DONUT - RIGHT SIDE */}
          <div className={`w-full md:w-[320px] bg-gradient-to-br transition-all duration-500 flex flex-col items-center justify-center p-10 border-t md:border-t-0 md:border-l border-[#d8eadb] relative ${isFull ? 'from-emerald-50 to-emerald-100/50 shadow-[inset_0_0_50px_rgba(16,185,129,0.2)]' : 'from-[#f4faf6] to-[#ebf5ed]'}`}>
            {/* LEAF DECORATIONS (The Harvest) */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {Array.from({ length: dayStats[selectedDayIndex].done }).map((_, i) => (
                <div
                  key={i}
                  className="absolute text-xl animate-bounce"
                  style={{
                    top: `${Math.random() * 80 + 10}%`,
                    left: `${Math.random() * 80 + 10}%`,
                    opacity: 0.4,
                    animationDelay: `${i * 0.2}s`,
                    transform: `rotate(${Math.random() * 360}deg)`
                  }}
                >
                  🌿
                </div>
              ))}
            </div>

            <div className={`relative w-full aspect-square max-w-[220px] transition-all duration-500 ${isFull ? 'drop-shadow-[0_0_25px_rgba(16,185,129,0.5)] scale-110' : ''}`}>
              <Doughnut
                data={{
                  datasets: [{
                    data: [dayStats[selectedDayIndex].done || 0, (dayStats[selectedDayIndex].total - dayStats[selectedDayIndex].done) || (dayStats[selectedDayIndex].total === 0 ? 1 : 0)],
                    backgroundColor: [isFull ? COLORS.emerald : COLORS.g700, dayStats[selectedDayIndex].total === 0 ? '#f0f4f0' : COLORS.g200],
                    borderWidth: 0,
                  }]
                }}
                options={{ responsive: true, maintainAspectRatio: false, cutout: '80%', plugins: { tooltip: { enabled: false }, legend: { display: false } } }}
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <span className={`font-fraunces text-6xl font-black transition-all ${isFull ? 'text-emerald-600 scale-110 drop-shadow-sm' : 'text-[#2d5a3d]'}`}>
                  {pct}<span className="text-2xl font-bold">%</span>
                </span>
                <span className={`text-[10px] font-black uppercase tracking-widest mt-2 ${isFull ? 'text-emerald-500' : 'text-[#7a9b82]'}`}>
                  {isFull ? t('planner_stack_completed') : t('planner_daily_impact')}
                </span>
              </div>
            </div>

            <div className={`mt-12 space-y-4 w-full transition-all duration-700 ${isDeepWork ? 'blur-lg opacity-20' : ''}`}>
              <div className="bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-[#d8eadb] flex items-center justify-between shadow-sm">
                <div className="flex flex-col">
                  <span className="text-[9px] font-black uppercase tracking-widest text-[#7a9b82]">{t('planner_achieved')}</span>
                  <span className="font-fraunces text-2xl font-black text-[#2d5a3d]">{dayStats[selectedDayIndex].done}</span>
                </div>
                <div className="w-10 h-10 bg-[#f4faf6] rounded-xl flex items-center justify-center text-lg shadow-inner">🎯</div>
              </div>
              <div className="bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-[#d8eadb] flex items-center justify-between shadow-sm">
                <div className="flex flex-col">
                  <span className="text-[9px] font-black uppercase tracking-widest text-[#7a9b82]">{t('planner_pending')}</span>
                  <span className="font-fraunces text-2xl font-black text-[#7a9b82]">{dayStats[selectedDayIndex].total - dayStats[selectedDayIndex].done}</span>
                </div>
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-lg shadow-inner">⏳</div>
              </div>
            </div>

            {isProgress75 && (
              <div className="mt-8 px-6 py-3 bg-amber-400 text-[#2d5a3d] rounded-2xl font-fraunces italic font-black text-sm shadow-lg animate-pulse border-2 border-white text-center">
                {t('planner_progress_75')}
              </div>
            )}

            {isFull && (
              <div className="relative mt-8 group">
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 pointer-events-none flex gap-2">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className={`w-2 h-2 rounded-full animate-[confettiRise_1.5s_ease-out_infinite]`} style={{ animationDelay: `${i * 0.2}s`, backgroundColor: ['#10b981', '#fbbf24', '#3b82f6', '#f87171', '#a78bfa'][i - 1] }} />
                  ))}
                </div>
                <div className="px-6 py-3 bg-[#2d5a3d] text-white rounded-2xl font-fraunces italic font-black text-sm shadow-xl flex flex-col items-center gap-1 border-4 border-emerald-400/30 text-center animate-bounce">
                  <span className="text-xl">🏆</span>
                  <span>{t('planner_unstoppable')}</span>
                  <span className="text-[10px] opacity-80 uppercase tracking-widest">{t('planner_excellent')}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className={`mt-12 text-center max-w-[600px] transition-all duration-700 ${isDeepWork ? 'opacity-0 scale-90' : 'opacity-100'}`}>
          <p className="font-fraunces text-2xl italic text-[#2d5a3d] leading-relaxed opacity-80 animate-in slide-in-from-bottom-4 duration-1000">
            {currentQuote}
          </p>
        </div>
      </main>

      {/* MONTH FULL VIEW MODAL */}
      {showMonthModal && (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center p-2 sm:p-10 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowMonthModal(false)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl h-[90vh] sm:h-auto sm:max-h-full overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="bg-[#2d5a3d] px-6 py-5 flex items-center justify-between shrink-0">
              <h2 className="text-white font-fraunces text-2xl font-black">{t('planner_monthly_view') || 'Vista Mensual'}</h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleExportMonthXLS}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-[11px] font-black uppercase tracking-widest transition-all border border-white/20"
                  title={t('planner_export_month_title')}
                >
                  <Download size={14} />
                  <span>XLS</span>
                </button>
                <button onClick={() => setShowMonthModal(false)} className="text-white hover:text-rose-300 text-xl font-bold p-2">✖</button>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 p-3 sm:p-4 border-b border-[#d8eadb] bg-[#f4faf6] shrink-0">
              {/* Flecha anterior */}
              <button
                onClick={() => {
                  if (monthModalMonth === 0) { setMonthModalMonth(11); setMonthModalYear(y => y - 1); }
                  else setMonthModalMonth(m => m - 1);
                }}
                className="w-9 h-9 rounded-full bg-white border border-[#d8eadb] text-[#2d5a3d] flex items-center justify-center font-black text-lg hover:bg-[#2d5a3d] hover:text-white transition-all shadow-sm"
              >‹</button>

              {/* Selector de MES */}
              <select
                value={monthModalMonth}
                onChange={e => setMonthModalMonth(parseInt(e.target.value))}
                className="bg-white border-2 border-[#d8eadb] focus:border-[#2d5a3d] rounded-xl px-3 py-2 text-[13px] font-black text-[#2d5a3d] outline-none cursor-pointer hover:border-[#6aaf7a] transition-all shadow-sm capitalize"
              >
                {months.map((m: string, i: number) => (
                  <option key={i} value={i}>{m}</option>
                ))}
              </select>

              {/* Selector de AÑO */}
              <select
                value={monthModalYear}
                onChange={e => setMonthModalYear(parseInt(e.target.value))}
                className="bg-white border-2 border-[#d8eadb] focus:border-[#2d5a3d] rounded-xl px-3 py-2 text-[13px] font-black text-[#2d5a3d] outline-none cursor-pointer hover:border-[#6aaf7a] transition-all shadow-sm"
              >
                {Array.from({ length: 8 }, (_, i) => new Date().getFullYear() - 1 + i).map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>

              {/* Botón HOY */}
              {(() => {
                const now = new Date();
                const isCurrent = monthModalMonth === now.getMonth() && monthModalYear === now.getFullYear();
                return (
                  <button
                    onClick={() => { setMonthModalMonth(now.getMonth()); setMonthModalYear(now.getFullYear()); }}
                    className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all shadow-sm
                      ${isCurrent
                        ? 'bg-emerald-100 text-emerald-600 border border-emerald-200 cursor-default'
                        : 'bg-[#2d5a3d] text-white hover:scale-105 active:scale-95 animate-pulse hover:animate-none'
                      }`}
                  >
                    📍 HOY
                  </button>
                );
              })()}

              {/* Flecha siguiente */}
              <button
                onClick={() => {
                  if (monthModalMonth === 11) { setMonthModalMonth(0); setMonthModalYear(y => y + 1); }
                  else setMonthModalMonth(m => m + 1);
                }}
                className="w-9 h-9 rounded-full bg-white border border-[#d8eadb] text-[#2d5a3d] flex items-center justify-center font-black text-lg hover:bg-[#2d5a3d] hover:text-white transition-all shadow-sm"
              >›</button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#f9fbf9]">
              {loadingMonth ? (
                <div className="flex justify-center items-center h-full text-[#2d5a3d] font-bold">Cargando...</div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4 pb-10">
                  {(() => {
                    const daysInMonth = new Date(monthModalYear, monthModalMonth + 1, 0).getDate();
                    return Array.from({ length: daysInMonth }, (_, i) => {
                      const d = i + 1;
                      const dateObj = new Date(monthModalYear, monthModalMonth, d);
                      const targetSunday = new Date(dateObj);
                      targetSunday.setDate(dateObj.getDate() - dateObj.getDay());
                      const weekStartStr = toISODate(targetSunday.getFullYear(), targetSunday.getMonth(), targetSunday.getDate());
                      const dayIndex = dateObj.getDay();

                      const row = monthData.find(r => r.week_start_date === weekStartStr && r.day_index === dayIndex);
                      const tasks = row?.tasks || [];
                      const completed = tasks.filter((t: any) => t.done).length;

                      return (
                        <div 
                          key={d} 
                          onClick={() => {
                            setWeekStart(weekStartStr);
                            setSelectedDayIndex(dayIndex);
                            setShowMonthModal(false);
                          }}
                          className="bg-white border border-[#d8eadb] rounded-2xl p-3 shadow-sm flex flex-col hover:border-[#6aaf7a] transition-all min-h-[120px] cursor-pointer hover:shadow-md hover:scale-[1.02] active:scale-95"
                        >
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] font-black uppercase text-[#7a9b82]">{ABBR[dayIndex]}</span>
                            <span className={`text-lg font-fraunces font-black ${dateObj.toDateString() === new Date().toDateString() ? 'text-emerald-500' : 'text-[#2d5a3d]'}`}>{d}</span>
                          </div>

                          <div className="flex-1 flex flex-col gap-1.5 overflow-y-auto max-h-[140px] custom-scrollbar pr-1">
                            {tasks.length === 0 ? (
                              <span className="text-[9px] text-[#c8e6c9] italic text-center mt-2">- Sin tareas -</span>
                            ) : (
                              tasks.map((task: any, tIdx: number) => {
                                const p = task.priority || 'important';
                                const pColor = p === 'critical' ? 'text-rose-500' : p === 'growth' ? 'text-emerald-500' : 'text-amber-500';
                                return (
                                  <div key={tIdx} className="flex gap-1.5 items-start bg-[#f4faf6] p-1.5 rounded-lg border border-[#d8eadb]">
                                    <span className={`text-[8px] mt-0.5 font-bold ${pColor}`}>●</span>
                                    <span className={`text-[9px] leading-tight flex-1 ${task.done ? 'line-through text-[#7a9b82]' : 'text-[#1a2e1e] font-bold'}`}>{task.text}</span>
                                  </div>
                                )
                              })
                            )}
                          </div>

                          {tasks.length > 0 && (
                            <div className="mt-3 pt-2 border-t border-[#f4faf6] flex justify-between items-center shrink-0">
                              <span className="text-[8px] font-black uppercase text-[#8fc99e]">{completed}/{tasks.length}</span>
                              <div className="flex-1 h-1.5 bg-[#ebf5ed] mx-2 rounded-full overflow-hidden">
                                <div className={`h-full ${completed === tasks.length ? 'bg-emerald-400' : 'bg-[#6aaf7a]'}`} style={{ width: `${(completed / tasks.length) * 100}%` }} />
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    });
                  })()}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* MODAL DE MÓDULO BLOQUEADO */}
      {showLockedModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white border border-app-border p-8 sm:p-12 rounded-[40px] w-full max-w-md shadow-2xl text-center animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">🔒</span>
            </div>
            <h2 className="text-2xl font-black text-app-text mb-4 uppercase tracking-tight">Módulo Bloqueado</h2>
            <p className="text-app-text2 text-sm leading-relaxed mb-8">
              Este módulo (**Tareas**) no está incluido en tu plan actual (**Plan HÁBITOS**).
              Pásate al **Plan Dúo** para activarlo y desbloquear todo el potencial del MÉTODO STACK.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  const msg = `Hola Orlando, quiero mi Plan Dúo. Mi correo es: ${userEmail}`;
                  window.open(`https://wa.me/51914587375?text=${encodeURIComponent(msg)}`, '_blank');
                }}
                className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-black uppercase text-xs hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
              >
                <span>🚀 Quiero mi Plan Dúo (Upgrade)</span>
              </button>
              <Link
                href="/tracker"
                className="w-full py-4 bg-app-surface text-app-text3 rounded-2xl font-black uppercase text-xs hover:bg-app-surface2 transition-all text-center"
              >
                Ir a mis Hábitos
              </Link>
            </div>
          </div>
        </div>
      )}
      {/* MODAL DE PRUEBA EXPIRADA (BLOQUEO TOTAL Standalone) */}
      {isExpired && !asEmbedded && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-500">
          <div className="bg-white border border-[#d8eadb] p-8 sm:p-14 rounded-[48px] w-full max-w-xl shadow-2xl text-center animate-in zoom-in-95 duration-500">
            <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
              <span className="text-5xl">⏳</span>
            </div>
            <h2 className="text-4xl font-black text-[#2d5a3d] mb-4 uppercase tracking-tight italic">Prueba Finalizada</h2>
            <p className="text-[#4B4F56] text-sm sm:text-base leading-relaxed mb-10 px-4 font-medium">
              Tu periodo de prueba de 72 horas ha expirado. Esperamos que hayas disfrutado la experiencia del MÉTODO STACK.
              <br/><br/>
              Para continuar dominando tus hábitos y gestionando tu enfoque, activa tu membresía anual ahora.
            </p>
            <div className="flex flex-col gap-4">
              <button 
                onClick={() => {
                  const msg = `Hola Orlando, mi prueba de 3 días expiró y quiero activar mi cuenta. Mi correo es: ${userEmail}`;
                  window.open(`https://wa.me/51914587375?text=${encodeURIComponent(msg)}`, '_blank');
                }}
                className="w-full py-5 bg-emerald-500 text-white rounded-2xl font-black uppercase text-sm hover:bg-emerald-600 hover:scale-[1.02] active:scale-95 transition-all shadow-[0_10px_20px_rgba(16,185,129,0.3)] flex items-center justify-center gap-3"
              >
                <span>🚀 ACTIVAR MI CUENTA AHORA</span>
              </button>
              <button 
                onClick={() => {
                  supabase.auth.signOut().then(() => {
                    window.location.href = '/login';
                  });
                }}
                className="w-full py-4 text-[#7a9b82] font-bold uppercase text-[10px] tracking-widest hover:text-[#2d5a3d] transition-colors"
              >
                Cerrar Sesión
              </button>
            </div>
            <p className="text-[10px] font-bold text-[#8D949E] uppercase tracking-[0.2em] mt-10">MÉTODO STACK · INGENIERÍA CONDUCTUAL</p>
          </div>
        </div>
      )}

      {!asEmbedded && <SignatureFooter />}
      {!asEmbedded && <LegalFooter />}
    </div>
  );
}
