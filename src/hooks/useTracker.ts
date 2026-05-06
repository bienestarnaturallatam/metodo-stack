'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/client';
import type { Habit, Completion, MoodLog } from '@/lib/types';
import { toISODate } from '@/lib/dateUtils';

// ── HABITS ───────────────────────────────────────────────────
export function useHabits() {
  const supabase = useMemo(() => createClient(), []);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('habits')
        .select('*')
        .order('position')
        .order('created_at');
      
      if (error) {
        console.error('Error fetching habits:', error);
        setHabits([]);
      } else {
        setHabits(data ?? []);
      }
    } catch (e) {
      console.error('Unexpected error in useHabits:', e);
      setHabits([]);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => { fetch(); }, [fetch]);

  const add = async (name: string, month?: number, year?: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const pos = habits.length;
    // Use first day of the viewed month as created_at so the habit
    // only appears from that month forward, not in previous months.
    const createdAt = (month !== undefined && year !== undefined)
      ? new Date(year, month, 1).toISOString()
      : new Date().toISOString();
    const { data, error } = await supabase
      .from('habits')
      .insert({ name, user_id: user.id, position: pos, created_at: createdAt })
      .select()
      .single();
    if (!error && data) {
      setHabits(prev => [...prev, data]);
      return data;
    }
    return null;
  };

  const remove = async (id: string) => {
    const { data } = await supabase
      .from('habits')
      .update({ archived_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (data) setHabits(prev => prev.map(h => h.id === id ? data : h));
  };

  const unarchive = async (id: string) => {
    const { data } = await supabase
      .from('habits')
      .update({ archived_at: null })
      .eq('id', id)
      .select()
      .single();
    if (data) setHabits(prev => prev.map(h => h.id === id ? data : h));
  };

  // Soft-delete: sets archived_at to the 1st of the viewed month.
  // The habit stays visible in all PRIOR months (their monthEnd < archived_at)
  // and disappears from the current month onward.
  const archiveFromMonth = async (id: string, month: number, year: number) => {
    const archiveDate = new Date(year, month, 1).toISOString(); // e.g. 2026-04-01
    const { data } = await supabase
      .from('habits')
      .update({ archived_at: archiveDate })
      .eq('id', id)
      .select()
      .single();
    if (data) setHabits(prev => prev.map(h => h.id === id ? data : h));
  };

  const hardDelete = async (id: string) => {
    const { error } = await supabase
      .from('habits')
      .delete()
      .eq('id', id);
    if (!error) setHabits(prev => prev.filter(h => h.id !== id));
  };

  const rename = async (id: string, name: string) => {
    const { data } = await supabase
      .from('habits')
      .update({ name })
      .eq('id', id)
      .select()
      .single();
    if (data) setHabits(prev => prev.map(h => h.id === id ? data : h));
  };

  return { habits, loading, add, remove, unarchive, archiveFromMonth, hardDelete, rename, refetch: fetch };
}



// ── COMPLETIONS ──────────────────────────────────────────────
export function useCompletions(year: number, month: number) {
  const supabase = useMemo(() => createClient(), []);
  const [completions, setCompletions] = useState<Completion[]>([]);

  const startDate = useMemo(() => toISODate(year, month, 1), [year, month]);
  const endDate   = useMemo(() => toISODate(year, month, new Date(year, month + 1, 0).getDate()), [year, month]);

  const fetch = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('completions')
        .select('*')
        .gte('date', startDate)
        .lte('date', endDate);
      
      if (error) {
        console.error('Error fetching completions:', error);
        setCompletions([]);
      } else {
        setCompletions(data ?? []);
      }
    } catch (e) {
      console.error('Unexpected error in useCompletions:', e);
      setCompletions([]);
    }
  }, [year, month, startDate, endDate, supabase]);

  useEffect(() => { fetch(); }, [fetch]);

  const toggle = async (habitId: string, date: string, userId: string) => {
    const existing = completions.find(c => c.habit_id === habitId && c.date === date);
    if (existing) {
      await supabase.from('completions').delete().eq('id', existing.id);
      setCompletions(prev => prev.filter(c => c.id !== existing.id));
    } else {
      const { data, error } = await supabase
        .from('completions')
        .insert({ habit_id: habitId, date, user_id: userId })
        .select()
        .single();
      if (!error && data) setCompletions(prev => [...prev, data]);
    }
  };

  return { completions, toggle, refetch: fetch };
}

// ── MOOD LOGS ────────────────────────────────────────────────
export function useMoodLogs(year: number, month: number) {
  const supabase = useMemo(() => createClient(), []);
  const [logs, setLogs] = useState<MoodLog[]>([]);

  const startDate = useMemo(() => toISODate(year, month, 1), [year, month]);
  const endDate   = useMemo(() => toISODate(year, month, new Date(year, month + 1, 0).getDate()), [year, month]);

  const fetch = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('mood_logs')
        .select('*')
        .gte('date', startDate)
        .lte('date', endDate);
      
      if (error) {
        console.error('Error fetching mood logs:', error);
        setLogs([]);
      } else {
        setLogs(data ?? []);
      }
    } catch (e) {
      console.error('Unexpected error in useMoodLogs:', e);
      setLogs([]);
    }
  }, [year, month, startDate, endDate, supabase]);

  useEffect(() => { fetch(); }, [fetch]);

  const upsert = async (date: string, field: 'mood' | 'motivation', value: number | null, userId: string) => {
    const existing = logs.find(l => l.date === date);
    const payload: Partial<MoodLog> = { date, user_id: userId, updated_at: new Date().toISOString(), [field]: value };

    if (existing) {
      const { data } = await supabase
        .from('mood_logs')
        .update({ [field]: value, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
        .select()
        .single();
      if (data) setLogs(prev => prev.map(l => l.id === existing.id ? data : l));
    } else {
      const { data } = await supabase
        .from('mood_logs')
        .insert(payload)
        .select()
        .single();
      if (data) setLogs(prev => [...prev, data]);
    }
  };

  return { logs, upsert };
}

// ── ALL-YEAR COMPLETIONS (for dashboard) ─────────────────────
export function useYearCompletions(year: number, habitIds: string[]) {
  const supabase = useMemo(() => createClient(), []);
  const [completions, setCompletions] = useState<Completion[]>([]);

  useEffect(() => {
    if (!habitIds.length) { setCompletions([]); return; }
    supabase
      .from('completions')
      .select('*')
      .gte('date', `${year}-01-01`)
      .lte('date', `${year}-12-31`)
      .then(({ data }) => setCompletions(data ?? []));
  }, [year, habitIds.length]);

  return completions;
}
// ── ALL-YEAR MOOD LOGS (for dashboard) ────────────────────────
export function useYearMoodLogs(year: number) {
  const supabase = useMemo(() => createClient(), []);
  const [logs, setLogs] = useState<MoodLog[]>([]);

  useEffect(() => {
    supabase
      .from('mood_logs')
      .select('*')
      .gte('date', `${year}-01-01`)
      .lte('date', `${year}-12-31`)
      .then(({ data }) => setLogs(data ?? []));
  }, [year]);

  return logs;
}

// ── PUSH SUBSCRIPTION ──────────────────────────────────────────
export function usePushSubscription() {
  const supabase = useMemo(() => createClient(), []);
  const saveSubscription = async (subscription: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('profiles').update({ push_subscription: subscription }).eq('id', user.id);
  };
  return { saveSubscription };
}
