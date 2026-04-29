'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/client';
import { toISODate } from '@/lib/dateUtils';

interface Habit {
  id: string;
  name: string;
  category: string;
}

interface Log {
  habit_id: string;
  done: boolean;
}

export default function DashboardClient({ user, profile }: { user: any, profile: any }) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const today = toISODate(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());

  const tier = profile?.tier || 'Free';
  const phoneNumber = profile?.phone_number || user?.phone || 'Sin número';

  useEffect(() => {
    async function loadData() {
      if (!user?.id) return;
      setLoading(true);
      // Fetch habits
      const { data: habitsData } = await supabase.from('habits').select('*').eq('user_id', user.id);
      if (habitsData) setHabits(habitsData);

      // Fetch logs for today
      const { data: logsData } = await supabase
        .from('habit_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today);
      
      if (logsData) {
        const logMap: Record<string, boolean> = {};
        logsData.forEach((l: any) => logMap[l.habit_id] = true);
        setLogs(logMap);
      }
      setLoading(false);
    }
    loadData();
  }, [user?.id, today, supabase]);

  const toggleHabit = async (habitId: string) => {
    const isDone = !!logs[habitId];
    if (isDone) {
      const { error } = await supabase
        .from('habit_logs')
        .delete()
        .eq('user_id', user.id)
        .eq('habit_id', habitId)
        .eq('date', today);
      if (!error) {
        setLogs(prev => {
          const next = { ...prev };
          delete next[habitId];
          return next;
        });
      }
    } else {
      const { error } = await supabase
        .from('habit_logs')
        .insert({
          user_id: user.id,
          habit_id: habitId,
          date: today,
          phone_number: phoneNumber
        });
      if (!error) {
        setLogs(prev => ({ ...prev, [habitId]: true }));
      }
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-emerald-500/30 overflow-hidden relative">
      {/* GLOW BACKGROUND ELEMENTS */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-900/20 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/20 blur-[120px] rounded-full"></div>

      <style jsx global>{`
        @keyframes glow-pulse-green {
          0%, 100% { box-shadow: 0 0 15px rgba(16, 185, 129, 0.4); }
          50% { box-shadow: 0 0 30px rgba(16, 185, 129, 0.8); }
        }
        @keyframes glow-pulse-blue {
          0%, 100% { box-shadow: 0 0 15px rgba(59, 130, 246, 0.4); }
          50% { box-shadow: 0 0 30px rgba(59, 130, 246, 0.8); }
        }
        .glow-green { animation: glow-pulse-green 3s infinite; }
        .glow-blue { animation: glow-pulse-blue 3s infinite; }
        .glass-card { 
          background: rgba(255, 255, 255, 0.03); 
          backdrop-filter: blur(20px); 
          border: 1px solid rgba(255, 255, 255, 0.08);
        }
      `}</style>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-12">
        {/* TOP HEADER */}
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-16 gap-8">
          <div className="animate-in fade-in slide-in-from-left-8 duration-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]"></div>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500">Pilar 1: Dashboard</span>
            </div>
            <h1 className="text-6xl font-black tracking-tighter mb-2">
              BIENVENIDO <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500 uppercase">{user?.email?.split('@')[0] || 'Usuario'}</span>
            </h1>
            <p className="text-gray-500 font-mono text-xs">IDENTIDAD TÁCTIL: {phoneNumber}</p>
          </div>

          {/* TIER BADGE / PAYWALL TRIGGER */}
          <div className="animate-in fade-in slide-in-from-right-8 duration-700">
            <div className={`px-8 py-4 rounded-3xl border ${tier === 'Free' ? 'border-amber-500/30 bg-amber-500/5' : 'border-emerald-500/30 bg-emerald-500/5'} flex items-center gap-6 glass-card`}>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-1">Status de Cuenta</p>
                <p className={`text-xl font-black ${tier === 'Free' ? 'text-amber-500' : 'text-emerald-500'}`}>{tier.toUpperCase()}</p>
              </div>
              {tier === 'Free' && (
                <button className="px-6 py-2 bg-amber-500 text-black text-[10px] font-black uppercase rounded-xl hover:scale-105 transition-transform shadow-[0_0_20px_rgba(245,158,11,0.4)]">
                   UPGRADE NOW
                </button>
              )}
            </div>
          </div>
        </header>

        {/* PAYWALL OVERLAY (image_4.png style) */}
        {tier === 'Free' && habits.length > 3 && (
          <div className="mb-12 p-10 rounded-[40px] border border-amber-500/20 bg-gradient-to-br from-amber-950/20 to-transparent relative overflow-hidden group">
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div>
                <h2 className="text-3xl font-black mb-2 text-amber-500">LÍMITE DE ACCESO ALCANZADO</h2>
                <p className="text-gray-400 max-w-md">Como usuario FREE, has alcanzado tu límite de gestión. Desbloquea el potencial total del Método STACK.</p>
              </div>
              <div className="flex gap-4">
                <button className="px-8 py-4 bg-white text-black font-black text-xs uppercase rounded-2xl hover:bg-amber-500 transition-colors">Ver Planes</button>
              </div>
            </div>
            <div className="absolute top-[-50%] right-[-10%] w-[300px] h-[300px] bg-amber-500/10 blur-[80px] rounded-full transition-transform group-hover:scale-125 duration-1000"></div>
          </div>
        )}

        {/* HABIT TRACKER GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-40 rounded-[32px] glass-card animate-pulse"></div>
            ))
          ) : habits.map(habit => {
            const isDone = !!logs[habit.id];
            return (
              <div 
                key={habit.id}
                className={`group p-8 rounded-[36px] transition-all duration-500 relative overflow-hidden glass-card
                  ${isDone ? 'border-emerald-500/50 bg-emerald-950/10' : 'hover:border-white/20'}
                `}
              >
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-500 bg-white/5 px-3 py-1 rounded-full">{habit.category || 'DIARIO'}</span>
                    <button 
                      onClick={() => toggleHabit(habit.id)}
                      className={`w-14 h-14 rounded-full border-2 flex items-center justify-center transition-all duration-700
                        ${isDone ? 'bg-emerald-500 border-emerald-500 text-black shadow-[0_0_25px_#10b981]' : 'border-white/10 text-white/20 hover:border-emerald-500/50 hover:text-emerald-500'}
                      `}
                    >
                      {isDone ? (
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <div className="w-3 h-3 rounded-full bg-current"></div>
                      )}
                    </button>
                  </div>
                  <h3 className={`text-2xl font-bold tracking-tight mb-2 transition-all ${isDone ? 'text-emerald-400' : 'text-white'}`}>
                    {habit.name}
                  </h3>
                  <p className="text-[10px] font-mono text-gray-600">REGISTRO: {today}</p>
                </div>

                {/* ANIMATED GLOW (image_21.png style) */}
                {isDone && (
                  <div className="absolute inset-0 bg-emerald-500/5 animate-pulse"></div>
                )}
              </div>
            );
          })}
        </div>

        {/* BOTTOM METRICS */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="p-8 rounded-3xl glass-card text-center">
             <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Enfoque Diario</p>
             <p className="text-4xl font-black text-blue-500">
               {habits.length ? Math.round((Object.keys(logs).length / habits.length) * 100) : 0}%
             </p>
          </div>
          <div className="p-8 rounded-3xl glass-card text-center border-emerald-500/20">
             <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Logros Hoy</p>
             <p className="text-4xl font-black text-emerald-500">{Object.keys(logs).length}</p>
          </div>
          <div className="p-8 rounded-3xl glass-card text-center">
             <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Racha Actual</p>
             <p className="text-4xl font-black text-white">12</p>
          </div>
          <div className="p-8 rounded-3xl glass-card text-center border-red-500/20">
             <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Fricción OS</p>
             <p className="text-4xl font-black text-red-500">0.0</p>
          </div>
        </div>
      </div>
    </div>
  );
}
