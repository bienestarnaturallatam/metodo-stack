'use client';
import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';

interface Props { onAdd: (name: string, month: number, year: number) => void; month: number; year: number; }

export default function AddHabitRow({ onAdd, month, year }: Props) {
  const { t } = useTranslation();
  const [value, setValue] = useState('');

  function submit() {
    const v = value.trim();
    if (v) { onAdd(v, month, year); setValue(''); }
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3 p-3 sm:p-4 bg-white/60 backdrop-blur-xl border border-emerald-100/50 rounded-[24px] sm:rounded-[28px] shadow-lg shadow-emerald-900/5">
      <div className="flex-1 relative w-full">
        <input
          type="text"
          list="common-habits"
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submit()}
          placeholder={t('add_habit_placeholder')}
          maxLength={60}
          className="w-full pl-6 pr-4 py-3.5 sm:py-4 bg-emerald-50/50 border border-emerald-100 rounded-xl sm:rounded-2xl
                     text-emerald-950 text-sm font-bold outline-none placeholder:text-emerald-800/30
                     transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/5"
        />
        <datalist id="common-habits">
          <option value="Beber 2L de agua" />
          <option value="Meditar 10 min" />
          <option value="Hacer ejercicio" />
          <option value="Leer 10 páginas" />
          <option value="Dormir 8 horas" />
          <option value="Agradecer (3 cosas)" />
          <option value="Planificar el día" />
          <option value="Estudiar 30 min" />
          <option value="Caminar 10k pasos" />
          <option value="Sin pantallas (noche)" />
        </datalist>
      </div>
      <button
        onClick={submit}
        className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 bg-emerald-600 text-white text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] rounded-xl sm:rounded-2xl
                   transition-all hover:bg-emerald-700 hover:scale-[1.02] shadow-lg shadow-emerald-200 active:scale-95 flex items-center justify-center gap-2 shrink-0"
      >
        <span className="text-base sm:text-lg">+</span>
        {t('add_habit_btn')}
      </button>
    </div>
  );
}
