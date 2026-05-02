'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/client';
import { toISODate } from '@/lib/dateUtils';
import { useTranslation } from '@/hooks/useTranslation';

interface Task {
  id: string;
  text: string;
  done: boolean;
  priority: 'critical' | 'important' | 'growth';
  date: string;
  user_id: string;
  created_at: string;
}

export default function PlannerPanel({ userId }: { userId: string }) {
  const { t } = useTranslation();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTaskText, setNewTaskText] = useState('');
  const supabase = createClient();
  
  const todayStr = toISODate(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());

  // 1. Lógica Server Component (Simulada en montaje para obtener fecha y tareas de HOY)
  useEffect(() => {
    async function fetchTodayTasks() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('user_id', userId)
          .eq('date', todayStr)
          .eq('priority', 'critical')
          .order('created_at', { ascending: false });

        if (!error && data) {
          setTasks(data);
        }
      } catch (err) {
        console.error('Error fetching today tasks:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchTodayTasks();
  }, [userId, supabase, todayStr]);

  // 2. Registro de Tarea Crítica Dinámica (Lógica Client Component)
  const addCriticalTask = async () => {
    if (!newTaskText.trim()) return;

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        user_id: userId,
        text: newTaskText,
        priority: 'critical',
        done: false,
        date: todayStr,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (!error && data) {
      setTasks([data, ...tasks]);
      setNewTaskText('');
    }
  };

  const toggleTask = async (task: Task) => {
    const { error } = await supabase
      .from('tasks')
      .update({ done: !task.done })
      .eq('id', task.id);

    if (!error) {
      setTasks(tasks.map(t => t.id === task.id ? { ...t, done: !t.done } : t));
    }
  };

  const shareToWhatsApp = () => {
    const criticalTasks = tasks
      .filter(t => !t.done)
      .map((t, i) => `${i + 1}. ${t.text}`)
      .join('\n');
    
    const message = `${t('planner_whatsapp_critical')}\n\n${criticalTasks || t('planner_whatsapp_no_tasks')}\n\n${t('planner_whatsapp_touch_format')}\n${t('planner_whatsapp_zero_friction')}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-black text-red-500 font-mono animate-pulse">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-red-500 border-t-transparent animate-spin"></div>
          <span>Sincronizando OS Personal - HOY</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-gray-100 p-4 sm:p-10 font-sans selection:bg-red-500/30">
      <style jsx global>{`
        @keyframes glow-red {
          0%, 100% { box-shadow: 0 0 10px #ef4444, 0 0 20px #ef4444; }
          50% { box-shadow: 0 0 30px #ef4444, 0 0 40px #ef4444; }
        }
        @keyframes glow-green {
          0%, 100% { box-shadow: 0 0 10px #10b981; }
          50% { box-shadow: 0 0 25px #10b981; }
        }
        @keyframes glow-blue {
          0%, 100% { box-shadow: 0 0 10px #3b82f6; }
          50% { box-shadow: 0 0 25px #3b82f6; }
        }
        .glow-red { animation: glow-red 2s infinite; }
        .glow-green { animation: glow-green 2s infinite; }
        .glow-blue { animation: glow-blue 2s infinite; }
        .neon-border { border: 1px solid rgba(255, 255, 255, 0.1); }
      `}</style>

      <div className="max-w-4xl mx-auto">
        {/* HEADER */}
        <header className="mb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div>
            <h1 className="text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-white to-blue-500 mb-2">
              {t('planner_strategic_center')}
            </h1>
            <div className="flex items-center gap-4">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-red-500">{t('planner_pilar_dynamics')}</p>
              <span className="w-1 h-1 rounded-full bg-gray-800"></span>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">{todayStr}</p>
            </div>
          </div>
          
          <button 
            onClick={shareToWhatsApp}
            className="flex items-center gap-2 px-6 py-2 bg-emerald-600/10 border border-emerald-500/30 text-emerald-500 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all glow-green"
          >
            <span>📱 {t('planner_send_whatsapp')}</span>
          </button>
        </header>

        {/* INPUT AREA */}
        <div className="mb-12 relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-blue-600 rounded-[28px] blur opacity-20 group-focus-within:opacity-40 transition-opacity"></div>
          <div className="relative flex flex-col sm:flex-row gap-4 p-6 bg-gray-900/90 rounded-[24px] border border-gray-800 backdrop-blur-xl">
            <div className="flex-1 flex items-center gap-4">
              <div className="w-8 h-8 rounded-full border-2 border-red-500/50 flex items-center justify-center text-red-500 text-xl font-black glow-red bg-red-950/20">
                +
              </div>
              <input 
                type="text"
                placeholder={t('planner_add_critical_placeholder')}
                className="flex-1 bg-transparent border-none outline-none text-lg font-bold placeholder:text-gray-700"
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addCriticalTask()}
              />
            </div>
            <button 
              onClick={addCriticalTask}
              className="px-10 py-3 bg-red-600 text-white rounded-xl font-black text-xs uppercase tracking-[0.2em] hover:bg-red-500 transition-all active:scale-95 shadow-[0_0_20px_rgba(239,68,68,0.4)]"
            >
              {t('planner_add_btn')}
            </button>
          </div>
        </div>

        {/* TASK LIST */}
        <div className="space-y-6">
          {tasks.length === 0 ? (
            <div className="py-24 text-center rounded-[40px] border-2 border-dashed border-gray-900 bg-gray-950/50">
              <div className="w-20 h-20 rounded-full bg-red-950/30 border border-red-500/20 flex items-center justify-center mx-auto mb-8 glow-red">
                <span className="text-3xl">🔴</span>
              </div>
              <h2 className="text-3xl font-black text-gray-300 mb-2">{t('planner_os_start_title')}</h2>
              <p className="text-red-500 font-bold uppercase tracking-widest animate-pulse">{t('planner_os_start_subtitle')} 🔴</p>
            </div>
          ) : (
            tasks.map(task => (
              <div 
                key={task.id}
                className={`group relative p-6 rounded-[24px] border-2 transition-all duration-700 flex items-center gap-6
                  ${task.done ? 'bg-emerald-950/10 border-emerald-900/30 opacity-40' : 'bg-gray-900/60 border-gray-800 hover:border-red-500/50 hover:bg-gray-900'}
                `}
              >
                <button 
                  onClick={() => toggleTask(task)}
                  className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-500
                    ${task.done ? 'bg-emerald-500 border-emerald-500 text-black glow-green' : 'border-red-500/50 text-red-500 hover:scale-110 glow-red bg-red-950/20'}
                  `}
                >
                  {task.done ? <span className="text-xl font-black">✓</span> : <span className="text-xs">🔴</span>}
                </button>

                <div className="flex-1">
                  <p className={`text-xl font-bold transition-all ${task.done ? 'line-through text-gray-600' : 'text-white'}`}>
                    {task.text}
                  </p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-[9px] font-black uppercase tracking-widest text-red-500 px-2 py-0.5 rounded bg-red-500/10">{t('planner_tasks')}</span>
                    <span className="text-[9px] font-mono text-gray-600">{new Date(task.created_at).toLocaleTimeString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                   <div className="w-10 h-10 rounded-xl bg-blue-900/20 border border-blue-500/30 flex items-center justify-center text-blue-400 glow-blue text-xs font-black">
                      {t('planner_finish')}
                   </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* BOTTOM STATS */}
        {tasks.length > 0 && (
          <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-6 bg-gray-900/50 rounded-2xl border border-gray-800 text-center">
              <p className="text-[9px] font-black text-gray-500 uppercase mb-1">{t('planner_daily_impact')}</p>
              <p className="text-2xl font-black text-red-500">{Math.round((tasks.filter(t => t.done).length / tasks.length) * 100)}%</p>
            </div>
            <div className="p-6 bg-gray-900/50 rounded-2xl border border-gray-800 text-center">
              <p className="text-[9px] font-black text-gray-500 uppercase mb-1">{t('planner_completed')}</p>
              <p className="text-2xl font-black text-emerald-500">{tasks.filter(t => t.done).length}</p>
            </div>
            <div className="p-6 bg-gray-900/50 rounded-2xl border border-gray-800 text-center">
              <p className="text-[9px] font-black text-gray-500 uppercase mb-1">{t('planner_pending')}</p>
              <p className="text-2xl font-black text-blue-500">{tasks.filter(t => !t.done).length}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
