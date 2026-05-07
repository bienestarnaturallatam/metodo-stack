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
    <div className="flex gap-2">
      <input
        type="text"
        list="common-habits"
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && submit()}
        placeholder={t('add_habit_placeholder')}
        maxLength={60}
        className="flex-1 max-w-[280px] px-3 py-2 border border-app-border rounded-lg bg-app-bg
                   text-app-text text-xs font-sans outline-none placeholder:text-app-text3
                   transition-colors focus:border-brand-green"
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
      <button
        onClick={submit}
        className="px-4 py-2 bg-brand-green/90 text-white text-xs font-bold rounded-lg
                   transition-all hover:bg-brand-green shadow-sm active:scale-95"
      >
        + {t('add_habit_btn')}
      </button>
    </div>
  );
}
