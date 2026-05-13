'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  LayoutDashboard, Receipt, PieChart, Target, BarChart3,
  Plus, Search, Filter, Download, ChevronLeft, ChevronRight,
  TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight,
  Calendar, Tag, MoreHorizontal, Trash2, Edit3, CheckCircle2, AlertCircle, Menu, X, Globe, LogOut, Printer,
  FileText, ChevronDown, Zap, Heart, ShieldCheck
} from 'lucide-react';
import LegalFooter from '@/components/LegalFooter';
import TourBienvenida from '@/components/TourBienvenida';
import SignatureFooter from '@/components/SignatureFooter';
import { createClient } from '@/lib/client';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

const CAT_ICONS: Record<string, string> = {
  'Alimentación': '🍱',
  'Transporte': '🚗',
  'Entretenimiento': '🎬',
  'Salud': '💊',
  'Servicios': '⚡',
  'Sueldo': '💰',
  'Freelance': '💻',
  'Educación': '📚',
  'Hogar': '🏠',
  'Otros': '📦'
};

const CAT_COLORS: Record<string, string> = {
  'Alimentación': '#2d5a3d',
  'Transporte': '#6aaf7a',
  'Entretenimiento': '#f0b429',
  'Salud': '#e74b6c',
  'Servicios': '#7b8cde',
  'Sueldo': '#2d5a3d',
  'Freelance': '#6aaf7a',
  'Otros': '#d8eadb'
};

const CATEGORIES_INCOME = ['Sueldo', 'Freelance', 'Inversiones', 'Negocio', 'Bono', 'Otros'];
const CATEGORIES_EXPENSE = ['Alimentación', 'Transporte', 'Vivienda', 'Salud', 'Entretenimiento', 'Educación', 'Ropa', 'Servicios', 'Otros'];

const CURRENCIES = [
  { symbol: 'S/', code: 'PEN', name: 'Perú' },
  { symbol: '$', code: 'USD', name: 'Dólar (USA/EC/SV/PA)' },
  { symbol: '$', code: 'MXN', name: 'México' },
  { symbol: '$', code: 'COP', name: 'Colombia' },
  { symbol: '$', code: 'CLP', name: 'Chile' },
  { symbol: 'R$', code: 'BRL', name: 'Brasil' },
  { symbol: '$', code: 'ARS', name: 'Argentina' },
  { symbol: 'Bs', code: 'BOB', name: 'Bolivia' },
  { symbol: '₡', code: 'CRC', name: 'Costa Rica' },
  { symbol: '₲', code: 'PYG', name: 'Paraguay' },
  { symbol: 'Q', code: 'GTQ', name: 'Guatemala' },
  { symbol: 'L', code: 'HNL', name: 'Honduras' },
  { symbol: 'C$', code: 'NIO', name: 'Nicaragua' },
  { symbol: 'RD$', code: 'DOP', name: 'Rep. Dominicana' },
  { symbol: '$', code: 'UYU', name: 'Uruguay' },
];

// --- TYPES ---
interface Transaccion {
  id: number;
  type: 'income' | 'expense';
  amount: number;
  cat: string;
  desc: string;
  date: string;
  note?: string;
  fuga?: boolean;
}

type Presupuesto = {
  [categoria: string]: number;
};

type Meta = {
  id: number;
  name: string;
  icon: string;
  target: number;
  current: number;
};

// --- INITIAL DATA ---
const INITIAL_TX: Transaccion[] = [];

const INITIAL_BUDGET: Presupuesto = {
  Alimentación: 0,
  Transporte: 0,
  Vivienda: 0,
  Salud: 0,
  Entretenimiento: 0,
  Educación: 0,
  Servicios: 0,
  Ropa: 0,
  Otros: 0
};

const INITIAL_GOALS: Meta[] = [];

export default function FinanceClient({ userId, userEmail, onPageChange, isPaid: initialIsPaid = false, userTier: initialUserTier = 'trial', asEmbedded = false }: { userId: string, userEmail: string, onPageChange?: (page: any) => void, isPaid?: boolean, userTier?: string, asEmbedded?: boolean }) {
  const [activeModule, setActiveModule] = useState<'dashboard' | 'transactions' | 'budget' | 'goals' | 'reports'>('dashboard');
  
  // Usar el mes actual real como predeterminado
  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const [selectedMonth, setSelectedMonth] = useState(currentMonthStr);

  const [transacciones, setTransacciones] = useState<Transaccion[]>([]);
  const [presupuesto, setPresupuesto] = useState<Presupuesto>(INITIAL_BUDGET);
  const [metas, setMetas] = useState<Meta[]>(INITIAL_GOALS);
  const [showModalTx, setShowModalTx] = useState(false);
  const [showModalBudget, setShowModalBudget] = useState(false);
  const [showModalGoal, setShowModalGoal] = useState(false);
  const [showModalFuga, setShowModalFuga] = useState(false);
  const [isPaid, setIsPaid] = useState(initialIsPaid);
  const [isExpired, setIsExpired] = useState(false);
  const [userTier, setUserTier] = useState(initialUserTier);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState(CURRENCIES[1]);
  const [showDayPicker, setShowDayPicker] = useState(false);

  const router = useRouter();
  const supabase = createClient();
  const { t, lang } = useTranslation();

  useEffect(() => {
    async function checkExpiration() {
      const { data: profile } = await supabase
        .from('profiles')
        .select('tier, is_paid, created_at')
        .eq('id', userId)
        .single();

      if (profile) {
        setIsPaid(profile.is_paid || false);
        setUserTier(profile.tier || 'trial');

        // Verificación de Expiración (72h)
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
      }
    }
    checkExpiration();
  }, [userId, supabase]);

  async function signOut() {
    await supabase.auth.signOut();
    router.push('/login');
  }

  // Data loading from localStorage

  // Persistence
  useEffect(() => {
    const savedTx = localStorage.getItem(`finanzas_tx_${userId}`);
    const savedBudget = localStorage.getItem(`finanzas_budget_${userId}`);
    const savedGoals = localStorage.getItem(`finanzas_goals_${userId}`);

    if (savedTx) {
      setTransacciones(JSON.parse(savedTx));
    } else {
      setTransacciones(INITIAL_TX);
    }

    if (savedBudget) {
      setPresupuesto(JSON.parse(savedBudget));
    } else {
      setPresupuesto(INITIAL_BUDGET);
    }

    if (savedGoals) {
      setMetas(JSON.parse(savedGoals));
    } else {
      setMetas(INITIAL_GOALS);
    }

    const savedCurrency = localStorage.getItem(`finanzas_currency_${userId}`);
    if (savedCurrency) {
      const found = CURRENCIES.find(c => c.code === savedCurrency);
      if (found) setSelectedCurrency(found);
    }

    console.log("FinanceApp SaaS V2 Loaded");
  }, [userId]);

  useEffect(() => {
    if (transacciones.length > 0) localStorage.setItem(`finanzas_tx_${userId}`, JSON.stringify(transacciones));
    localStorage.setItem(`finanzas_budget_${userId}`, JSON.stringify(presupuesto));
    localStorage.setItem(`finanzas_goals_${userId}`, JSON.stringify(metas));
    localStorage.setItem(`finanzas_currency_${userId}`, selectedCurrency.code);
  }, [transacciones, presupuesto, metas, selectedCurrency, userId]);


  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };

  // --- DERIVED DATA ---
  const filteredTx = useMemo(() => {
    return transacciones.filter(tx => tx.date.startsWith(selectedMonth));
  }, [transacciones, selectedMonth]);

  const stats = useMemo(() => {
    const income = filteredTx.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const expense = filteredTx.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    const balance = income - expense;
    const savingsRate = income > 0 ? Math.round((balance / income) * 100) : 0;

    // Días de Calma = Balance / (Gasto Diario Estimado)
    // Usamos el Presupuesto Total como base para un cálculo más estable y realista (Survival Runway)
    const totalBudget = Object.values(presupuesto).reduce((acc, val) => acc + val, 0);
    const dailyBurn = totalBudget > 0 ? totalBudget / 30 : (expense > 0 ? expense / 30 : 1);

    const diasCalma = balance > 0 ? Math.floor(balance / dailyBurn) : 0;

    return { income, expense, balance, savingsRate, diasCalma, totalBudget };
  }, [filteredTx, presupuesto]);

  const goalStats = useMemo(() => {
    const totalTarget = metas.reduce((acc, m) => acc + m.target, 0);
    const totalCurrent = metas.reduce((acc, m) => acc + m.current, 0);
    const progress = totalTarget > 0 ? (totalCurrent / totalTarget) * 100 : 0;
    return { totalTarget, totalCurrent, progress };
  }, [metas]);

  const topCategories = useMemo(() => {
    const dist: Record<string, number> = {};
    filteredTx.filter((t: any) => t.type === 'expense').forEach((t: any) => {
      dist[t.cat] = (dist[t.cat] || 0) + t.amount;
    });
    const totalExp = Object.values(dist).reduce((acc: number, v: number) => acc + v, 0);
    return Object.entries(dist)
      .sort((a: any, b: any) => b[1] - a[1])
      .slice(0, 5)
      .map(([cat, val]) => ({ cat, val, pct: totalExp > 0 ? (val / totalExp) * 100 : 0 }));
  }, [filteredTx]);

  const topIncomes = useMemo(() => {
    const dist: Record<string, number> = {};
    filteredTx.filter((t: any) => t.type === 'income').forEach((t: any) => {
      dist[t.cat] = (dist[t.cat] || 0) + t.amount;
    });
    const totalInc = Object.values(dist).reduce((acc: number, v: number) => acc + v, 0);
    return Object.entries(dist)
      .sort((a: any, b: any) => b[1] - a[1])
      .slice(0, 5)
      .map(([cat, val]) => ({ cat, val, pct: totalInc > 0 ? (val / totalInc) * 100 : 0 }));
  }, [filteredTx]);

  // --- ACTIONS ---
  const handleAddTx = (tx: Omit<Transaccion, 'id'>) => {
    const newTx = { ...tx, id: Date.now() };
    setTransacciones(prev => [newTx, ...prev]);
    setShowModalTx(false);
    showToast('Transacción registrada');
  };

  const handleDeleteTx = (id: number) => {
    setTransacciones(prev => prev.filter(t => t.id !== id));
    showToast('Transacción eliminada');
  };

  const handleUpdateGoal = (id: number, amount: number) => {
    setMetas(prev => prev.map(m => m.id === id ? { ...m, current: m.current + amount } : m));
    showToast('Ahorro actualizado');
  };

  const handleDeleteGoal = (id: number) => {
    setMetas(prev => prev.filter(m => m.id !== id));
    showToast('Meta eliminada');
  };

  const handleExportCSV = () => {
    const headers = ['Fecha', 'Tipo', 'Descripción', 'Categoría', 'Monto', 'Fuga', 'Nota'];
    const rows = transacciones.map(t => [
      t.date,
      t.type === 'income' ? 'Ingreso' : 'Gasto',
      t.desc,
      t.cat,
      t.amount.toFixed(2),
      t.fuga ? 'SÍ' : 'NO',
      t.note || ''
    ]);
    const [year, month] = selectedMonth.split('-');
    const title = `Reporte de Transacciones - ${MONTHS[parseInt(month) - 1]} ${year}`;
    downloadExcel(headers, rows, `transacciones_${selectedMonth}`, title);
  };

  const handleExportBudget = () => {
    const headers = ['Categoría', 'Límite Mensual', 'Gasto Real', 'Disponible', '% Uso'];
    const rows = Object.entries(presupuesto).map(([cat, limit]) => {
      const real = transacciones.filter(t => t.cat === cat && t.type === 'expense' && t.date.startsWith(selectedMonth)).reduce((acc, t) => acc + t.amount, 0);
      return [
        cat,
        limit.toFixed(2),
        real.toFixed(2),
        (limit - real).toFixed(2),
        limit > 0 ? ((real / limit) * 100).toFixed(1) + '%' : '0%'
      ];
    });
    const [year, month] = selectedMonth.split('-');
    const title = `Presupuesto Mensual - ${MONTHS[parseInt(month) - 1]} ${year}`;
    downloadExcel(headers, rows, `presupuesto_${selectedMonth}`, title);
  };

  const handleExportGoals = () => {
    const headers = ['Meta', 'Objetivo', 'Ahorrado', 'Faltante', '% Progreso'];
    const rows = metas.map(m => [
      m.name,
      m.target.toFixed(2),
      m.current.toFixed(2),
      (m.target - m.current).toFixed(2),
      ((m.current / m.target) * 100).toFixed(1) + '%'
    ]);
    const [year, month] = selectedMonth.split('-');
    const title = `Estado de Metas - ${MONTHS[parseInt(month) - 1]} ${year}`;
    downloadExcel(headers, rows, `metas_${selectedMonth}`, title);
  };

  const handleExportFullReport = () => {
    const headers = ['Sección', 'Dato', 'Valor'];
    const rows = [
      ['RESUMEN MENSUAL', '', ''],
      ['', 'Mes', selectedMonth],
      ['', 'Ingresos Totales', stats.income.toFixed(2)],
      ['', 'Gastos Totales', stats.expense.toFixed(2)],
      ['', 'Balance Neto', stats.balance.toFixed(2)],
      ['', 'Tasa de Ahorro', stats.savingsRate + '%'],
      ['', '', ''],
      ['GASTOS POR CATEGORÍA', '', ''],
      ...topCategories.map(c => ['', c.cat, c.val.toFixed(2)]),
      ['', '', ''],
      ['INGRESOS POR CATEGORÍA', '', ''],
      ...topIncomes.map(c => ['', c.cat, c.val.toFixed(2)]),
      ['', '', ''],
      ['ESTADO DE METAS', '', ''],
      ...metas.map(m => ['', m.name, ((m.current / m.target) * 100).toFixed(1) + '%'])
    ];
    const [year, month] = selectedMonth.split('-');
    const title = `Reporte Integral de Finanzas - ${MONTHS[parseInt(month) - 1]} ${year}`;
    downloadExcel(headers, rows, `reporte_completo_${selectedMonth}`, title);
  };

  const downloadExcel = (headers: string[], rows: string[][], filename: string, reportTitle: string) => {
    // Generate HTML for Excel to handle special characters and formatting better than CSV
    const tableHtml = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8" />
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>Hoja 1</x:Name>
                <x:WorksheetOptions>
                  <x:DisplayGridlines/>
                </x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
        <style>
          table { border-collapse: collapse; }
          th { background-color: #2d5a3d; color: white; font-weight: bold; }
          td, th { border: 1px solid #d8eadb; padding: 5px; text-align: left; font-family: sans-serif; }
        </style>
      </head>
      <body>
        <table>
          <tr>
            <td colspan="${headers.length}" style="font-size: 20px; font-weight: bold; height: 60px; vertical-align: middle; text-align: center; background-color: #f4faf6; color: #2d5a3d; border: 1px solid #d8eadb;">
              ${reportTitle}
            </td>
          </tr>
          <tr><td colspan="${headers.length}" style="height: 20px;"></td></tr>
          <thead>
            <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
          </thead>
          <tbody>
            ${rows.map(r => `<tr>${r.map(c => `<td>${String(c).replace(/</g, '&lt;').replace(/>/g, '&gt;')}</td>`).join('')}</tr>`).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([tableHtml], { type: 'application/vnd.ms-excel' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Archivo Excel (.xls) descargado');
  };

  const formatCurrency = (n: number) => {
    return selectedCurrency.symbol + n.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const changeMonth = (delta: number) => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const date = new Date(year, month - 1 + delta, 1);
    setSelectedMonth(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
  };

  const changeYear = (delta: number) => {
    const [year, month] = selectedMonth.split('-').map(Number);
    setSelectedMonth(`${year + delta}-${String(month).padStart(2, '0')}`);
  };

  const handleGlobalMonthScroll = (val: number) => {
    const newMonthIdx = Math.round((val / 100) * 11);
    const [year] = selectedMonth.split('-');
    setSelectedMonth(`${year}-${String(newMonthIdx + 1).padStart(2, '0')}`);
  };

  const getDaysInMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-').map(Number);
    return new Date(year, month, 0).getDate();
  };

  const getFirstDayOfMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-').map(Number);
    return new Date(year, month - 1, 1).getDay();
  };

  return (
    <div className={`min-h-screen bg-white text-[#1a2e1e] font-sans selection:bg-emerald-100 ${asEmbedded ? 'pt-2' : ''}`}>
      <TourBienvenida />
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Serif+Display&display=swap');
        .font-dm-serif { font-family: 'DM Serif Display', serif; }
        .font-sora { font-family: 'Sora', sans-serif; }
        .vibration { animation: vibration 0.5s infinite; }
        @keyframes vibration {
          0% { transform: translate(0,0); }
          25% { transform: translate(1px, 1px); }
          50% { transform: translate(-1px, -1px); }
          75% { transform: translate(1px, -1px); }
          100% { transform: translate(0,0); }
        }
        .glow-red-sutil { box-shadow: 0 0 15px rgba(231, 75, 108, 0.4); }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #f7f9f7; }
        ::-webkit-scrollbar-thumb { background: #d8eadb; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #c5d6c8; }
      `}</style>

      {/* TOP NAVIGATION (System) */}
      {/* Redundant header removed */}

      {/* MAIN CONTENT */}
      <main className="flex-1 w-full max-w-full overflow-x-hidden min-h-screen bg-[#f7f9f7]">
        {/* TOP HEADER (Universal) */}

        <div className="px-3 sm:px-8 py-6 sm:py-10 max-w-[1400px] mx-auto w-full overflow-x-hidden box-border">
          {/* INTERNAL SUB-NAV (Tracker Pattern) */}
          <div className="mb-6 sm:mb-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="space-y-0.5">
                <h5 className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] text-[#7a9b82]">{t('finances_header')}</h5>
              </div>
              {(!isPaid || userTier === 'trial' || userTier === 'free' || userTier === 'gratis') && (
                <div className="bg-emerald-100 text-emerald-700 px-3 sm:px-6 py-1 sm:py-2 rounded-full text-[8px] sm:text-[10px] font-black uppercase flex items-center gap-2 border border-emerald-200 animate-pulse shadow-sm">
                  <div className="w-1 h-1 bg-emerald-500 rounded-full"></div>
                  Trial 72h
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2 w-full lg:w-auto">
              <div className="bg-white/80 backdrop-blur-md border border-[#e8f1e9] rounded-xl p-1 w-full sm:w-fit shadow-sm">
                <div className="grid grid-cols-3 sm:flex gap-1 items-center">
                  {[
                    { id: 'dashboard', label: 'Dash' },
                    { id: 'transactions', label: 'Transac.' },
                    { id: 'budget', label: 'Presup.' },
                    { id: 'goals', label: 'Metas' },
                    { id: 'reports', label: 'Reportes' },
                  ].map((tab, idx) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveModule(tab.id as any)}
                      className={`px-2 sm:px-5 py-2 text-[7px] sm:text-[10px] font-black uppercase tracking-widest rounded-lg transition-all duration-300 whitespace-nowrap
                        ${activeModule === tab.id ? 'bg-[#2d5a3d] text-white shadow-md' : 'text-[#7a9b82] hover:text-[#2d5a3d] hover:bg-white/50'}
                        ${idx >= 3 ? 'col-span-1.5' : ''}`}
                    >
                      {/* Show short label on ultra-small screens, full label on others */}
                      <span className="xs:hidden">{tab.label}</span>
                      <span className="hidden xs:inline">
                        {tab.id === 'dashboard' ? 'Dashboard' :
                          tab.id === 'transactions' ? 'Transacciones' :
                            tab.id === 'budget' ? 'Presupuesto' :
                              tab.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 mb-12">
            <div className="flex items-center gap-6">
              <div className="flex flex-col text-left">
                <h2 className="text-5xl font-dm-serif text-[#1a2e1e] leading-none lowercase capitalize">
                  {MONTHS[parseInt(selectedMonth.split('-')[1]) - 1]}
                </h2>
                <div className="flex items-center gap-4 mt-2">
                  <p className="text-sm font-bold text-[#7a9b82] tracking-[0.3em]">
                    {selectedMonth.split('-')[0]}
                  </p>
                  <div className="flex items-center gap-1 bg-[#f4faf6] px-2 py-1 rounded-lg border border-[#d8eadb]">
                    <button onClick={() => changeYear(-1)} className="text-[#2d5a3d]/60 hover:text-[#2d5a3d] transition-colors"><ChevronLeft size={14} /></button>
                    <div className="w-[1px] h-3 bg-[#d8eadb] mx-0.5"></div>
                    <button onClick={() => changeYear(1)} className="text-[#2d5a3d]/60 hover:text-[#2d5a3d] transition-colors"><ChevronRight size={14} /></button>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="flex items-center bg-white border border-[#e8f1e9] rounded-3xl p-1.5 shadow-sm">
                  <button onClick={() => { changeMonth(-1); setShowDayPicker(false); }} className="p-2.5 hover:bg-[#f4faf6] rounded-2xl transition-all text-[#2d5a3d]/40 hover:text-[#2d5a3d]"><ChevronLeft size={22} /></button>
                  <button
                    onClick={() => setShowDayPicker(!showDayPicker)}
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all mx-1 shadow-inner border
                      ${showDayPicker ? 'bg-[#2d5a3d] text-white border-[#2d5a3d]' : 'bg-[#f4faf6] text-[#2d5a3d] border-[#d8eadb] hover:bg-[#e8f1e9]'}`}
                  >
                    <Calendar size={28} />
                  </button>
                  <button
                    onClick={() => setShowModalFuga(true)}
                    className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all mx-1 bg-amber-50 text-amber-500 border border-amber-100 hover:bg-amber-100 shadow-inner group"
                    title="REGISTRAR GASTO HORMIGA"
                  >
                    <Zap size={28} className="group-hover:scale-110 transition-transform fill-amber-500" />
                  </button>
                  <button onClick={() => { changeMonth(1); setShowDayPicker(false); }} className="p-2.5 hover:bg-[#f4faf6] rounded-2xl transition-all text-[#2d5a3d]/40 hover:text-[#2d5a3d]"><ChevronRight size={22} /></button>
                </div>

                {/* DAY PICKER POPOVER (CALENDAR MODAL) */}
                {showDayPicker && (
                  <>
                    <div className="fixed inset-0 z-40 bg-black/5 backdrop-blur-sm" onClick={() => setShowDayPicker(false)} />
                    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 sm:absolute sm:top-20 sm:translate-y-0 z-50 bg-white border border-[#e8f1e9] rounded-[32px] sm:rounded-[40px] p-5 sm:p-8 shadow-2xl shadow-green-900/10 animate-in fade-in zoom-in duration-200 w-[92vw] max-w-[380px]">
                      <div className="hidden sm:block absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-t border-l border-[#e8f1e9] rotate-45" />

                      <div className="flex items-center justify-between gap-2 sm:gap-4 mb-6">
                        <h4 className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.1em] sm:tracking-[0.2em] text-[#1a2e1e] whitespace-nowrap">Seleccionar Día</h4>

                        <div className="flex items-center gap-2">
                          {/* MONTH SELECTOR */}
                          <select
                            value={parseInt(selectedMonth.split('-')[1]) - 1}
                            onChange={(e) => {
                              const [year] = selectedMonth.split('-');
                              setSelectedMonth(`${year}-${String(Number(e.target.value) + 1).padStart(2, '0')}`);
                            }}
                            className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-1.5 text-[10px] font-black uppercase text-[#2d5a3d] outline-none cursor-pointer hover:bg-white transition-all"
                          >
                            {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
                          </select>

                          {/* YEAR SELECTOR */}
                          <select
                            value={selectedMonth.split('-')[0]}
                            onChange={(e) => {
                              const [, month] = selectedMonth.split('-');
                              setSelectedMonth(`${e.target.value}-${month}`);
                            }}
                            className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-1.5 text-[10px] font-black uppercase text-[#2d5a3d] outline-none cursor-pointer hover:bg-white transition-all"
                          >
                            {Array.from({ length: 2040 - 2024 + 1 }, (_, i) => 2024 + i).map(y => (
                              <option key={y} value={y}>{y}</option>
                            ))}
                          </select>
                        </div>

                        <button onClick={() => setShowDayPicker(false)} className="text-gray-300 hover:text-gray-500 transition-colors"><X size={18} /></button>
                      </div>

                      <div className="border-t border-gray-50 pt-6">
                        {/* DAY HEADERS */}
                        <div className="grid grid-cols-7 gap-1 mb-4">
                          {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map(d => (
                            <div key={d} className="h-8 flex items-center justify-center text-[10px] font-black text-gray-300">{d}</div>
                          ))}
                        </div>

                        {/* DAYS GRID */}
                        <div className="grid grid-cols-7 gap-1">
                          {/* Spacers for the first day of the week */}
                          {Array.from({ length: getFirstDayOfMonth(selectedMonth) }).map((_, i) => (
                            <div key={`spacer-${i}`} className="h-10" />
                          ))}

                          {Array.from({ length: getDaysInMonth(selectedMonth) }, (_, i) => i + 1).map(day => (
                            <button
                              key={day}
                              onClick={() => {
                                setShowDayPicker(false);
                                showToast(`Día ${day} seleccionado`);
                              }}
                              className="h-10 flex items-center justify-center rounded-xl text-xs font-bold text-[#2d5a3d] hover:bg-[#2d5a3d] hover:text-white hover:scale-110 active:scale-90 transition-all border border-transparent hover:border-[#2d5a3d] bg-[#fbfdfb]"
                            >
                              {day}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-end">
              {/* CURRENCY SELECTOR */}
              <div className="relative group">
                <select
                  value={selectedCurrency.code}
                  onChange={(e) => {
                    const found = CURRENCIES.find(c => c.code === e.target.value);
                    if (found) setSelectedCurrency(found);
                  }}
                  className="appearance-none bg-white border border-[#d8eadb] rounded-2xl px-5 py-3 pr-10 text-xs font-bold text-[#2d5a3d] hover:bg-[#f4faf6] transition-all shadow-sm outline-none cursor-pointer"
                >
                  {CURRENCIES.map(c => (
                    <option key={c.code} value={c.code}>{c.name} ({c.symbol})</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#7a9b82]">
                  <ChevronDown size={14} />
                </div>
              </div>

              {activeModule === 'transactions' && (
                <button onClick={handleExportCSV} className="flex items-center gap-2 px-5 py-3 bg-white border border-[#d8eadb] rounded-2xl text-xs font-bold text-[#2d5a3d] hover:bg-[#f4faf6] transition-all shadow-sm">
                  <Download size={16} /> Exportar Excel
                </button>
              )}
              {activeModule === 'budget' && (
                <button onClick={handleExportBudget} className="flex items-center gap-2 px-5 py-3 bg-white border border-[#d8eadb] rounded-2xl text-xs font-bold text-[#2d5a3d] hover:bg-[#f4faf6] transition-all shadow-sm">
                  <Download size={16} /> Exportar Excel
                </button>
              )}
              {activeModule === 'goals' && (
                <button onClick={handleExportGoals} className="flex items-center gap-2 px-5 py-3 bg-white border border-[#d8eadb] rounded-2xl text-xs font-bold text-[#2d5a3d] hover:bg-[#f4faf6] transition-all shadow-sm">
                  <Download size={16} /> Exportar Excel
                </button>
              )}
              {activeModule === 'reports' ? (
                <button onClick={handleExportFullReport} className="flex items-center gap-2 px-6 py-3.5 bg-[#2d5a3d] text-white rounded-xl text-xs font-black uppercase tracking-[0.15em] shadow-lg shadow-[#2d5a3d]/20 hover:bg-[#244a32] active:scale-95 transition-all">
                  <Download size={18} /> Exportar Excel
                </button>
              ) : activeModule !== 'dashboard' && (
                <button
                  onClick={() => {
                    if (activeModule === 'budget') setShowModalBudget(true);
                    else if (activeModule === 'goals') setShowModalGoal(true);
                    else setShowModalTx(true);
                  }}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-[#2d5a3d] text-white rounded-xl text-xs font-black uppercase tracking-[0.15em] shadow-lg shadow-[#2d5a3d]/20 hover:bg-[#244a32] active:scale-95 transition-all"
                >
                  <Plus size={18} /> Nuevo
                </button>
              )}
            </div>
          </div>

          {/* VIEW MODULES */}
          {activeModule === 'dashboard' && <DashboardView stats={stats} filteredTx={filteredTx} transacciones={transacciones} formatCurrency={formatCurrency} selectedMonth={selectedMonth} onMonthScroll={handleGlobalMonthScroll} totalBudget={stats.totalBudget} />}
          {activeModule === 'transactions' && <TransactionsView filteredTx={filteredTx} onDelete={handleDeleteTx} formatCurrency={formatCurrency} selectedMonth={selectedMonth} onMonthScroll={handleGlobalMonthScroll} />}
          {activeModule === 'budget' && <BudgetView presupuesto={presupuesto} filteredTx={filteredTx} formatCurrency={formatCurrency} />}
          {activeModule === 'goals' && (
            <GoalsView
              metas={metas}
              filteredTx={filteredTx}
              transacciones={transacciones}
              formatCurrency={formatCurrency}
              onUpdate={handleUpdateGoal}
              onDelete={handleDeleteGoal}
            />
          )}
          {activeModule === 'reports' && <ReportsView selectedMonth={selectedMonth} filteredTx={filteredTx} transacciones={transacciones} metas={metas} formatCurrency={formatCurrency} stats={stats} goalStats={goalStats} topCategories={topCategories} topIncomes={topIncomes} />}
        </div>
      </main>

      {/* TOAST */}
      {toast && (
        <div className="fixed bottom-10 right-10 z-[1000] animate-in slide-in-from-right-10 duration-300">
          <div className="bg-[#1e1e23] border border-white/10 rounded-2xl p-4 flex items-center gap-3 shadow-2xl min-w-[240px]">
            {toast.type === 'success' ? <CheckCircle2 className="text-[#2dd4a0]" size={20} /> : <AlertCircle className="text-[#f27059]" size={20} />}
            <span className="text-sm font-bold tracking-tight">{toast.msg}</span>
          </div>
        </div>
      )}

      {/* MODALS */}
      {showModalTx && <ModalTx onClose={() => setShowModalTx(false)} onSave={handleAddTx} />}
      {showModalBudget && <ModalBudget current={presupuesto} onClose={() => setShowModalBudget(false)} onSave={(b: Presupuesto) => { setPresupuesto(b); setShowModalBudget(false); showToast('Presupuesto actualizado'); }} />}
      {showModalGoal && <ModalGoal onClose={() => setShowModalGoal(false)} onSave={(g: Omit<Meta, 'id'>) => { setMetas([...metas, { ...g, id: Date.now() }]); setShowModalGoal(false); showToast('Meta creada'); }} />}
      {showModalFuga && <ModalFuga onClose={() => setShowModalFuga(false)} onSave={handleAddTx} />}

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
              <br /><br />
              Para continuar dominando tus hábitos y gestionando tu enfoque, activa tu membresía anual ahora.
            </p>
            <div className="flex flex-col gap-4">
              <button
                onClick={() => {
                  const msg = `Hola Orlando, mi prueba de 3 días expiró y quiero activar mi cuenta. Mi correo es: ${userEmail}`;
                  window.open(`https://wa.me/51989078285?text=${encodeURIComponent(msg)}`, '_blank');
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

// --- SUB-VIEWS ---

function DashboardView({ stats, filteredTx, transacciones, formatCurrency, selectedMonth, onMonthScroll, totalBudget }: { stats: any, filteredTx: Transaccion[], transacciones: Transaccion[], formatCurrency: (n: number) => string, selectedMonth: string, onMonthScroll: (val: number) => void, totalBudget: number }) {
  const chartScrollRef = useRef<HTMLDivElement>(null);
  const [scrollVal, setScrollVal] = useState(0);

  const currentYear = parseInt(selectedMonth.split('-')[0]);
  const currentMonthIdx = parseInt(selectedMonth.split('-')[1]) - 1;

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const max = target.scrollWidth - target.clientWidth;
    if (max > 0) {
      setScrollVal((target.scrollLeft / max) * 100);
    }
  };

  const handleSliderChange = (val: number) => {
    if (chartScrollRef.current) {
      const max = chartScrollRef.current.scrollWidth - chartScrollRef.current.clientWidth;
      chartScrollRef.current.scrollLeft = (val / 100) * max;
      setScrollVal(val);
    }
  };

  const yearlyData = useMemo(() => {
    const data = [];
    for (let i = 0; i < 12; i++) {
      const key = `${currentYear}-${String(i + 1).padStart(2, '0')}`;
      const mTx = transacciones.filter((t: any) => t.date.startsWith(key));
      data.push({
        label: MONTHS[i],
        income: mTx.filter((t: any) => t.type === 'income').reduce((acc: number, t: any) => acc + t.amount, 0),
        expense: mTx.filter((t: any) => t.type === 'expense').reduce((acc: number, t: any) => acc + t.amount, 0)
      });
    }
    return data;
  }, [transacciones, currentYear]);

  useEffect(() => {
    if (chartScrollRef.current) {
      const container = chartScrollRef.current;
      const scrollWidth = container.scrollWidth;
      const clientWidth = container.clientWidth;
      const monthWidth = scrollWidth / 12;
      // Centrar el mes actual
      const targetScroll = (currentMonthIdx * monthWidth) - (clientWidth / 2) + (monthWidth / 2);
      container.scrollLeft = targetScroll;
    }
  }, [currentMonthIdx]);

  const catDistribution = useMemo(() => {
    const dist: Record<string, number> = {};
    filteredTx.filter((t: any) => t.type === 'expense').forEach((t: any) => {
      dist[t.cat] = (dist[t.cat] || 0) + t.amount;
    });
    return dist;
  }, [filteredTx]);

  return (
    <div className="space-y-6 sm:space-y-10 animate-in fade-in duration-500">
      {/* METRIC CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8 w-full">
        {[
          { label: 'Ingresos Totales', val: formatCurrency(stats.income), color: 'text-[#2d5a3d]', icon: <TrendingUp size={22} />, bg: 'bg-white' },
          {
            label: 'Gastos Totales',
            val: formatCurrency(stats.expense),
            color: stats.expense > totalBudget * 0.85 ? 'text-[#e74b6c]' : 'text-[#e74b6c]',
            icon: <TrendingDown size={22} />,
            bg: 'bg-white',
            isAlert: stats.expense > totalBudget * 0.85,
            sub: stats.expense > totalBudget ? '🚨 Superaste el presupuesto' : stats.expense > totalBudget * 0.85 ? '⚠️ Fuga Crítica detectada' : null
          },
          { label: 'DÍAS de Calma Total', val: `${stats.diasCalma} DÍAS`, color: 'text-[#7b8cde]', icon: <Heart size={22} />, bg: 'bg-white', sub: 'Supervivencia acumulada' },
        ].map((card, idx) => (
          <div
            key={`${card.label}-${idx}`}
            className={`${card.bg} border ${card.isAlert ? 'border-[#e74b6c] glow-red-sutil vibration' : 'border-[#e8f1e9]'} p-5 sm:p-10 rounded-[40px] shadow-[0_4px_20px_rgba(45,159,108,0.03)] flex flex-row sm:flex-col items-center sm:items-start justify-between sm:justify-center gap-4 group w-full box-border hover:shadow-md transition-all duration-300`}
          >
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#f7f9f7] flex items-center justify-center shrink-0">
              <div className={`${card.color} opacity-80 group-hover:opacity-100 transition-opacity`}>
                {card.icon}
              </div>
            </div>
            <div className="flex-1 sm:flex-none">
              <p className="text-[9px] font-black uppercase text-[#7a9b82] tracking-[0.2em] mb-1 sm:mb-2">{card.label}</p>
              <h3 className={`font-dm-serif text-xl sm:text-4xl tracking-tight ${card.color} truncate`}>{card.val}</h3>
              {card.sub && <p className={`text-[8px] font-bold uppercase tracking-widest mt-1 ${card.isAlert ? 'text-[#e74b6c]' : 'text-[#7a9b82]'}`}>{card.sub}</p>}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        {/* CHART BAR */}
        <div className="lg:col-span-8 bg-white border border-[#d8eadb] p-4 sm:p-8 rounded-[32px] sm:rounded-[40px] shadow-sm overflow-hidden">
          <h4 className="text-[9px] sm:text-[11px] font-black uppercase tracking-widest text-[#7a9b82] mb-4 sm:mb-8 text-center sm:text-left">Evolución Anual {currentYear} (Ene - Dic)</h4>
          <div className="h-[250px] sm:h-[320px] w-full px-0 sm:px-2">
            <Bar
              data={{
                labels: yearlyData.map(m => {
                  // On small screens, use 1 letter. On larger, use 3.
                  return typeof window !== 'undefined' && window.innerWidth < 640
                    ? m.label.substring(0, 1)
                    : m.label.substring(0, 3);
                }),
                datasets: [
                  {
                    label: 'Ingresos',
                    data: yearlyData.map(m => m.income),
                    backgroundColor: '#2d5a3d',
                    borderRadius: 4,
                    barPercentage: 0.8,
                    categoryPercentage: 0.8
                  },
                  {
                    label: 'Gastos',
                    data: yearlyData.map(m => m.expense),
                    backgroundColor: '#d8eadb',
                    borderRadius: 4,
                    barPercentage: 0.8,
                    categoryPercentage: 0.8
                  }
                ]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    backgroundColor: '#1a2e1e',
                    titleFont: { size: 10 },
                    bodyFont: { size: 10 },
                    callbacks: {
                      title: (items) => {
                        const idx = items[0].dataIndex;
                        return MONTHS[idx];
                      }
                    }
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: { color: '#f0f4f1' },
                    ticks: {
                      font: { size: 8 },
                      color: '#7a9b82',
                      callback: (val) => val.toLocaleString()
                    }
                  },
                  x: {
                    grid: { display: false },
                    ticks: {
                      font: { size: 8, weight: 'bold' },
                      color: '#2d5a3d',
                      autoSkip: false,
                      maxRotation: 0
                    }
                  }
                }
              }}
            />
          </div>
        </div>

        {/* CHART DONUT */}
        <div className="lg:col-span-4 bg-white border border-[#d8eadb] p-5 sm:p-8 rounded-[32px] sm:rounded-[40px] flex flex-col shadow-sm overflow-hidden">
          <h4 className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-[#7a9b82] mb-6 sm:mb-8">Distribución de Gastos</h4>
          <div className="flex-1 flex flex-col items-center justify-center min-h-[280px] w-full">
            {Object.keys(catDistribution).length > 0 ? (
              <>
                <div className="relative w-full h-[200px]">
                  <Doughnut
                    data={{
                      labels: Object.keys(catDistribution),
                      datasets: [{
                        data: Object.values(catDistribution),
                        backgroundColor: ['#2d5a3d', '#6aaf7a', '#d8eadb', '#f0b429', '#e74b6c', '#7b8cde', '#1a2e1e', '#a8dadc'],
                        borderWidth: 0,
                        hoverOffset: 15
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { display: false },
                        tooltip: { backgroundColor: '#1a2e1e', titleFont: { size: 12 }, bodyFont: { size: 12 }, padding: 12, cornerRadius: 10 }
                      },
                      cutout: '70%'
                    }}
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <p className="text-[9px] font-black text-[#7a9b82] uppercase tracking-[0.2em]">Total</p>
                    <p className="text-lg font-dm-serif text-[#2d5a3d]">{formatCurrency(Object.values(catDistribution).reduce((a, b) => a + b, 0))}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-6 w-full px-2 max-h-[100px] overflow-y-auto no-scrollbar mb-4">
                  {Object.entries(catDistribution).map(([label, val], idx) => (
                    <div key={label} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: ['#2d5a3d', '#6aaf7a', '#d8eadb', '#f0b429', '#e74b6c', '#7b8cde', '#1a2e1e', '#a8dadc'][idx % 8] }} />
                      <p className="text-[8px] font-black text-[#1a2e1e] uppercase truncate flex-1">{label}</p>
                      <p className="text-[8px] font-bold text-[#7a9b82]">{((val / Object.values(catDistribution).reduce((a, b) => a + b, 0)) * 100).toFixed(0)}%</p>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-xs text-[#7a9b82] italic">No hay gastos para mostrar.</p>
            )}
          </div>
        </div>
      </div>

      {/* RECENT TRANSACTIONS */}
      <div className="bg-white border border-[#d8eadb] p-5 sm:p-8 rounded-[40px] shadow-sm overflow-hidden">
        <h4 className="text-[11px] font-black uppercase tracking-widest text-[#7a9b82] mb-8">Últimas Transacciones</h4>
        <div className="space-y-1">
          {filteredTx.slice(0, 5).map((tx: any) => (
            <div key={tx.id} className="flex items-center justify-between p-3 sm:p-4 rounded-2xl hover:bg-[#f4faf6] transition-all group gap-4 w-full">
              <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                <div className="w-10 h-10 sm:w-11 sm:h-11 bg-[#f4faf6] rounded-2xl flex items-center justify-center text-xl shadow-sm border border-[#d8eadb] group-hover:scale-110 transition-transform shrink-0">
                  {CAT_ICONS[tx.cat] || '📦'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold tracking-tight text-[#1a2e1e]">{tx.desc}</p>
                  <p className="text-[9px] sm:text-[10px] font-black uppercase text-[#7a9b82] tracking-widest">{tx.cat} • {tx.date}</p>
                </div>
              </div>
              <p className={`text-sm sm:text-lg font-dm-serif shrink-0 min-w-[80px] text-right ${tx.type === 'income' ? 'text-[#2d5a3d]' : 'text-[#e74b6c]'}`}>
                {tx.type === 'income' ? '+' : '-'} {formatCurrency(tx.amount)}
              </p>
            </div>
          ))}
          {filteredTx.length === 0 && <p className="py-20 text-center text-xs text-[#7a9b82] italic">No hay transacciones registradas este mes.</p>}
        </div>
      </div>
    </div>
  );
}

function TransactionsView({ filteredTx, onDelete, formatCurrency, selectedMonth, onMonthScroll }: { filteredTx: Transaccion[], onDelete: (id: number) => void, formatCurrency: (n: number) => string, selectedMonth: string, onMonthScroll: (val: number) => void }) {
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [catFilter, setCatFilter] = useState('Todas');
  const [search, setSearch] = useState('');

  const finalTx = useMemo(() => {
    return filteredTx.filter((t: any) => {
      const typeMatch = filter === 'all' || t.type === filter;
      const catMatch = catFilter === 'Todas' || t.cat === catFilter;
      const searchMatch = t.desc.toLowerCase().includes(search.toLowerCase()) || t.cat.toLowerCase().includes(search.toLowerCase());
      return typeMatch && catMatch && searchMatch;
    });
  }, [filteredTx, filter, catFilter, search]);

  const totalFiltered = useMemo(() => {
    return finalTx.reduce((acc, t) => acc + t.amount, 0);
  }, [finalTx]);

  return (
    <div className="animate-in slide-in-from-bottom-8 duration-500">
      {/* FILTERS */}
      <div className="flex flex-wrap items-center justify-between gap-6 mb-10">
        <div className="flex bg-white p-1.5 rounded-2xl border border-[#d8eadb] shadow-inner w-full sm:w-auto">
          {[
            { id: 'all', label: 'Todas' },
            { id: 'income', label: 'Ingresos' },
            { id: 'expense', label: 'Gastos' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id as any)}
              className={`flex-1 sm:flex-none px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${filter === f.id ? 'bg-[#2d5a3d] text-white shadow-lg' : 'text-[#7a9b82] hover:text-[#2d5a3d]'}`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <select
          value={catFilter}
          onChange={(e) => setCatFilter(e.target.value)}
          className="bg-white border border-[#d8eadb] rounded-2xl px-6 py-3 text-[10px] font-black uppercase tracking-widest text-[#7a9b82] outline-none hover:bg-[#f4faf6] transition-all cursor-pointer shadow-sm w-full sm:w-auto"
        >
          <option value="Todas">Categorías: Todas</option>
          {Array.from(new Set([...CATEGORIES_INCOME, ...CATEGORIES_EXPENSE])).map((c, i) => (
            <option key={`${c}-${i}`} value={c}>{c}</option>
          ))}
        </select>

        <div className="relative w-full sm:w-auto flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7a9b82]" size={16} />
          <input
            type="text"
            placeholder="Buscar por descripción o categoría..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-[#d8eadb] rounded-2xl pl-12 pr-6 py-3 text-[10px] font-black uppercase tracking-widest text-[#1a2e1e] outline-none hover:bg-[#f4faf6] focus:border-[#2d5a3d] transition-all shadow-sm"
          />
        </div>
      </div>

      {/* CATEGORY SUMMARY */}
      {(catFilter !== 'Todas' || filter !== 'all') && (
        <div className="mb-8 p-6 bg-white border border-[#d8eadb] rounded-[28px] shadow-sm flex items-center justify-between animate-in fade-in zoom-in duration-500">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#f4faf6] rounded-2xl flex items-center justify-center text-xl shadow-inner border border-[#d8eadb]">
              {catFilter !== 'Todas' ? (CAT_ICONS[catFilter] || '📊') : (filter === 'income' ? '💰' : '💸')}
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#7a9b82]">Total {catFilter !== 'Todas' ? catFilter : (filter === 'income' ? 'Ingresos' : 'Gastos')}</p>
              <h3 className="text-2xl font-dm-serif text-[#2d5a3d] mt-0.5">{formatCurrency(totalFiltered)}</h3>
            </div>
          </div>
          <div className="hidden sm:block px-4 py-2 bg-[#f4faf6] border border-[#d8eadb] rounded-xl">
            <p className="text-[9px] font-black uppercase tracking-widest text-[#7a9b82]">{finalTx.length} Transacciones</p>
          </div>
        </div>
      )}

      {/* TABLE */}
      <div className="bg-white border border-[#d8eadb] rounded-[24px] sm:rounded-[40px] overflow-hidden shadow-sm relative">
        <div className="sm:hidden absolute top-0 right-0 bg-emerald-500 text-white text-[7px] font-black px-2 py-0.5 rounded-bl-lg z-20 animate-pulse uppercase tracking-tighter">Desliza →</div>
        <div className="overflow-x-auto custom-scrollbar scrollbar-thin scrollbar-thumb-emerald-100 scrollbar-track-transparent">
          <table className="w-full text-left min-w-[550px] sm:min-w-[800px]">
            <thead>
              <tr className="bg-[#f4faf6]/50 border-b border-[#d8eadb]">
                <th className="px-3 sm:px-8 py-3 sm:py-5 text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-[#7a9b82]">Fecha</th>
                <th className="px-3 sm:px-8 py-3 sm:py-5 text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-[#7a9b82]">Descripción</th>
                <th className="px-3 sm:px-8 py-3 sm:py-5 text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-[#7a9b82]">Categoría</th>
                <th className="px-3 sm:px-8 py-3 sm:py-5 text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-[#7a9b82]">Monto</th>
                <th className="px-3 sm:px-8 py-3 sm:py-5 text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-[#7a9b82]">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d8eadb]">
              {finalTx.map((tx: any) => (
                <tr key={tx.id} className="group hover:bg-[#f4faf6] transition-all">
                  <td className="px-3 sm:px-8 py-3 sm:py-5 text-[9px] sm:text-xs font-bold text-[#7a9b82] font-mono whitespace-nowrap">{tx.date}</td>
                  <td className="px-3 sm:px-8 py-3 sm:py-5">
                    <div className="flex items-center gap-2">
                      <p className="text-[10px] sm:text-sm font-bold tracking-tight text-[#1a2e1e] line-clamp-1">{tx.desc}</p>
                      {tx.fuga && <span title="Fuga de Energía"><Zap size={14} className="text-amber-500 fill-amber-500 animate-pulse" /></span>}
                    </div>
                    {tx.note && <p className="text-[7px] sm:text-[10px] text-[#7a9b82] mt-0.5 italic line-clamp-1">{tx.note}</p>}
                  </td>
                  <td className="px-3 sm:px-8 py-3 sm:py-5">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <span className="text-xs sm:text-lg">{CAT_ICONS[tx.cat] || '📦'}</span>
                      <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-[#7a9b82] whitespace-nowrap">{tx.cat}</span>
                    </div>
                  </td>
                  <td className={`px-3 sm:px-8 py-3 sm:py-5 text-xs sm:text-lg font-dm-serif whitespace-nowrap ${tx.type === 'income' ? 'text-[#2d5a3d]' : 'text-[#e74b6c]'}`}>
                    <span className={tx.fuga ? 'animate-fuga-blink' : ''}>
                      {tx.type === 'income' ? '+' : '-'} {formatCurrency(tx.amount)}
                    </span>
                  </td>
                  <td className="px-3 sm:px-8 py-3 sm:py-5 text-right">
                    <button
                      onClick={() => onDelete(tx.id)}
                      className="p-2 sm:p-3 text-[#d8eadb] hover:text-[#e74b6c] hover:bg-[#e74b6c]/10 rounded-lg sm:rounded-xl transition-all opacity-40 sm:opacity-0 sm:group-hover:opacity-100"
                    >
                      <Trash2 size={14} className="sm:w-4 sm:h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {finalTx.length === 0 && <p className="py-12 text-center text-[10px] text-[#7a9b82] font-bold uppercase tracking-widest">Sin resultados</p>}
        </div>
      </div>
    </div>
  );
}

function BudgetView({ presupuesto, filteredTx, formatCurrency }: { presupuesto: Record<string, number>, filteredTx: Transaccion[], formatCurrency: (n: number) => string }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8 animate-in zoom-in-95 duration-500">
      {Object.keys(presupuesto).map((cat, idx) => {
        const target = presupuesto[cat] || 0;
        const real = filteredTx.filter((t: any) => t.cat === cat && t.type === 'expense').reduce((acc: number, t: any) => acc + t.amount, 0);
        const pct = target > 0 ? (real / target) * 100 : 0;

        // Semáforo de Paz Mental
        const isAlert = pct >= 85;
        const isWarning = pct >= 60 && pct < 85;
        const color = isAlert ? '#e74b6c' : isWarning ? '#f0b429' : '#2d5a3d';
        const bgBadge = isAlert ? 'bg-[#e74b6c]/10' : isWarning ? 'bg-[#f0b429]/10' : 'bg-[#2d5a3d]/10';

        return (
          <div key={`${cat}-${idx}`} className={`bg-white border border-[#d8eadb] p-5 sm:p-8 rounded-[40px] flex flex-col transition-all hover:scale-[1.02] group shadow-sm overflow-hidden ${isAlert ? 'vibration glow-red-sutil' : ''}`}>
            <div className="flex justify-between items-start mb-6 sm:mb-8">
              <div className={`w-12 h-12 sm:w-14 sm:h-14 ${bgBadge} rounded-2xl flex items-center justify-center text-xl sm:text-2xl shadow-sm border border-[#d8eadb]`}>
                {isAlert ? <Zap className="text-[#e74b6c] fill-[#e74b6c]" size={24} /> : isWarning ? <AlertCircle className="text-[#f0b429]" size={24} /> : <ShieldCheck className="text-[#2d5a3d]" size={24} />}
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black uppercase text-[#7a9b82] tracking-widest mb-1">{cat}</p>
                <p className="text-sm sm:text-base font-bold text-[#1a2e1e]">Límite: {formatCurrency(target)}</p>
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <div className="flex justify-between items-end">
                <p className="text-[9px] sm:text-[11px] font-black text-[#7a9b82] uppercase">Gasto Real</p>
                <p className="text-base sm:text-lg font-sora font-extrabold" style={{ color }}>{formatCurrency(real)}</p>
              </div>
              <div className="h-3 sm:h-3.5 bg-[#f4faf6] rounded-full overflow-hidden p-0.5 border border-[#d8eadb]">
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min(100, pct)}%`, backgroundColor: color }}
                />
              </div>
              <div className="flex items-center justify-center gap-2">
                <p className="text-center text-[9px] sm:text-[10px] font-black uppercase tracking-widest" style={{ color }}>
                  {pct.toFixed(0)}% DEL LÍMITE
                </p>
                {isAlert && <Zap size={10} className="text-[#e74b6c] fill-[#e74b6c] animate-pulse" />}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function GoalsView({ metas, filteredTx, transacciones, formatCurrency, onUpdate, onDelete }: { metas: Meta[], filteredTx: Transaccion[], transacciones: Transaccion[], formatCurrency: (n: number) => string, onUpdate: (id: number, amount: number) => void, onDelete: (id: number) => void }) {
  const [savingsInputs, setSavingsInputs] = useState<Record<number, string>>({});

  const ahorroPromedio = useMemo(() => {
    const months = new Set(transacciones.map((t: any) => t.date.slice(0, 7)));
    if (months.size === 0) return 0;

    let totalBalance = 0;
    months.forEach(m => {
      const mTx = transacciones.filter((t: any) => t.date.startsWith(m));
      const inc = mTx.filter((t: any) => t.type === 'income').reduce((acc: number, t: any) => acc + t.amount, 0);
      const exp = mTx.filter((t: any) => t.type === 'expense').reduce((acc: number, t: any) => acc + t.amount, 0);
      totalBalance += (inc - exp);
    });
    return totalBalance / months.size;
  }, [transacciones]);

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
        {metas.map((meta: any) => {
          const pct = Math.min(100, (meta.current / meta.target) * 100);
          const falta = Math.max(0, meta.target - meta.current);

          return (
            <div key={meta.id} className="bg-white border border-[#d8eadb] p-6 sm:p-8 rounded-[32px] sm:rounded-[40px] relative overflow-hidden group shadow-sm">
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6 sm:mb-8 gap-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#f4faf6] rounded-2xl flex items-center justify-center text-2xl sm:text-3xl shadow-sm border border-[#d8eadb] shrink-0">
                      {meta.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-lg sm:text-xl font-dm-serif text-[#1a2e1e] truncate">{meta.name}</p>
                      <p className="text-[9px] sm:text-[10px] font-black uppercase text-[#7a9b82] tracking-widest mt-0.5">Objetivo: {formatCurrency(meta.target)}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => onDelete(meta.id)}
                    className="p-2 text-[#7a9b82] hover:text-[#e74b6c] hover:bg-[#e74b6c]/10 rounded-xl transition-all shrink-0"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="space-y-3 sm:space-y-4 mb-8">
                  <div className="flex justify-between items-baseline">
                    <p className="text-[10px] sm:text-[11px] font-black text-[#7a9b82] uppercase">Ahorrado</p>
                    <p className="text-2xl sm:text-3xl font-dm-serif text-[#2d5a3d]">{formatCurrency(meta.current)}</p>
                  </div>
                  <div className="h-3 sm:h-4 bg-[#f4faf6] rounded-full overflow-hidden p-1 border border-[#d8eadb]">
                    <div
                      className="h-full bg-[#2d5a3d] rounded-full transition-all duration-1000 shadow-[0_0_12px_rgba(45,159,108,0.3)]"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-[9px] sm:text-[10px] font-black text-[#2d5a3d] uppercase tracking-widest">{pct.toFixed(1)}% COMPLETADO</p>
                    {falta > 0 && (
                      <p className="text-[9px] sm:text-[10px] font-black text-[#7a9b82] uppercase tracking-widest">Falta: <span className="text-[#e74b6c]">{formatCurrency(falta)}</span></p>
                    )}
                  </div>
                </div>

                {/* ABONAR INPUT */}
                <div className="flex items-center gap-2 bg-[#f4faf6] p-1.5 rounded-2xl border border-[#d8eadb] focus-within:border-[#2d5a3d] transition-all">
                  <input
                    type="number"
                    placeholder="SUMAR AHORRO..."
                    value={savingsInputs[meta.id] || ''}
                    onChange={(e) => setSavingsInputs({ ...savingsInputs, [meta.id]: e.target.value })}
                    className="flex-1 bg-transparent border-none outline-none px-3 text-[10px] font-black text-[#2d5a3d] placeholder:text-[#7a9b82]/40"
                  />
                  <button
                    onClick={() => {
                      const amt = parseFloat(savingsInputs[meta.id]);
                      if (!isNaN(amt) && amt > 0) {
                        onUpdate(meta.id, amt);
                        setSavingsInputs({ ...savingsInputs, [meta.id]: '' });
                      }
                    }}
                    className="w-8 h-8 bg-[#2d5a3d] text-white rounded-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-md shadow-[#2d5a3d]/20"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
              <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-[#2d5a3d]/5 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-1000 pointer-events-none" />
            </div>
          );
        })}
      </div>

      <div className={`p-10 rounded-[40px] border flex flex-col sm:flex-row items-center gap-8 ${ahorroPromedio > 0 ? 'bg-white border-[#2d5a3d]/10' : 'bg-[#e74b6c]/5 border-[#e74b6c]/20'}`}>
        <div className={`w-20 h-20 rounded-3xl flex items-center justify-center text-4xl shadow-xl border ${ahorroPromedio > 0 ? 'bg-[#f4faf6] text-[#2d5a3d] border-[#d8eadb]' : 'bg-[#e74b6c]/10 text-[#e74b6c] border-[#e74b6c]/20'}`}>
          {ahorroPromedio > 0 ? '📈' : '⚠️'}
        </div>
        <div className="flex-1 text-center sm:text-left">
          <h4 className="text-xl font-black mb-2 uppercase tracking-tight text-[#1a2e1e]">Proyección de Ahorro</h4>
          {ahorroPromedio > 0 ? (
            <p className="text-[#7a9b82] text-sm font-medium leading-relaxed">
              Basado en tu historial, tu ahorro promedio mensual es de <span className="text-[#2d5a3d] font-black">{formatCurrency(ahorroPromedio)}</span>.
              En 6 meses podrías tener <span className="text-[#1a2e1e] font-black">{formatCurrency(ahorroPromedio * 6)}</span> y en 12 meses <span className="text-[#1a2e1e] font-black">{formatCurrency(ahorroPromedio * 12)}</span> adicionales.
            </p>
          ) : (
            <p className="text-[#e74b6c] text-sm font-black uppercase tracking-widest leading-relaxed animate-pulse">
              Tu ahorro promedio es negativo ({formatCurrency(ahorroPromedio)}). Revisa tu presupuesto para evitar deudas.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function ReportsView({ selectedMonth, filteredTx, transacciones, metas, formatCurrency, stats, goalStats, topCategories, topIncomes }: { selectedMonth: string, filteredTx: Transaccion[], transacciones: Transaccion[], metas: Meta[], formatCurrency: (n: number) => string, stats: any, goalStats: any, topCategories: any[], topIncomes: any[] }) {

  const history = useMemo(() => {
    const months = new Set(transacciones.map((t: any) => t.date.slice(0, 7)));
    return Array.from(months)
      .sort((a, b) => b.localeCompare(a))
      .slice(0, 6)
      .map(m => {
        const mTx = transacciones.filter((t: any) => t.date.startsWith(m));
        const inc = mTx.filter((t: any) => t.type === 'income').reduce((acc: number, t: any) => acc + t.amount, 0);
        const exp = mTx.filter((t: any) => t.type === 'expense').reduce((acc: number, t: any) => acc + t.amount, 0);
        return {
          month: `${MONTHS[parseInt(m.split('-')[1]) - 1]} ${m.split('-')[0]}`,
          inc, exp, bal: inc - exp, rate: inc > 0 ? Math.round(((inc - exp) / inc) * 100) : 0
        };
      });
  }, [transacciones]);

  return (
    <div className="space-y-10 animate-in slide-in-from-right-10 duration-700 printable-area">
      <style dangerouslySetInnerHTML={{
        __html: `
        @media print {
          body * { visibility: hidden; background: white !important; }
          .printable-area, .printable-area * { visibility: visible; }
          .printable-area { 
            position: absolute; 
            left: 0; 
            top: 0; 
            width: 100%; 
            padding: 40px !important; 
            margin: 0 !important;
            background: white !important;
          }
          .printable-area .bg-white { border: 1px solid #eee !important; box-shadow: none !important; }
          .no-print { display: none !important; }
          @page { margin: 1cm; }
        }
      `}} />

      <div className="flex justify-between items-start border-b border-[#f4faf6] pb-8 mb-8 hidden print:flex">
        <div>
          <h2 className="font-dm-serif text-3xl text-[#2d5a3d]">Reporte Financiero</h2>
          <p className="text-[10px] font-black uppercase tracking-widest text-[#7a9b82] mt-1">{MONTHS[parseInt(selectedMonth.split('-')[1]) - 1]} {selectedMonth.split('-')[0]}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black uppercase tracking-widest text-[#2d5a3d]">FinanzasApp — MÉTODO STACK</p>
          <p className="text-[9px] text-[#7a9b82] mt-1 italic">Generado el {new Date().toLocaleDateString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* RESUMEN MES */}
        <div className="bg-white border border-[#d8eadb] p-10 rounded-[40px] shadow-sm">
          <h4 className="text-[11px] font-black uppercase tracking-widest text-[#7a9b82] mb-8">Resumen Operativo del Mes</h4>
          <div className="space-y-6">
            {[
              { label: 'Ingresos Totales', val: formatCurrency(stats.income), color: 'text-[#2d5a3d]' },
              { label: 'Gastos Totales', val: formatCurrency(stats.expense), color: 'text-[#e74b6c]' },
              { label: 'Balance Neto', val: formatCurrency(stats.balance), color: 'text-[#7b8cde]' },
              { label: 'Tasa de Ahorro', val: `${stats.savingsRate}%`, color: 'text-[#f0b429]' },
            ].map(row => (
              <div key={row.label} className="flex justify-between items-center py-4 border-b border-[#f4faf6] last:border-0">
                <span className="text-[11px] font-black text-[#7a9b82] uppercase tracking-widest">{row.label}</span>
                <span className={`text-2xl font-dm-serif ${row.color}`}>{row.val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* TOP CATEGORIAS GASTOS */}
        <div className="bg-white border border-[#d8eadb] p-10 rounded-[40px] shadow-sm">
          <h4 className="text-[11px] font-black uppercase tracking-widest text-[#7a9b82] mb-8">Mayores Gastos por Categoría</h4>
          <div className="space-y-8">
            {topCategories.map(item => (
              <div key={item.cat} className="space-y-2">
                <div className="flex justify-between items-end">
                  <p className="text-[11px] font-black text-[#1a2e1e] uppercase tracking-widest flex items-center gap-2">
                    <span className="text-lg">{CAT_ICONS[item.cat]}</span> {item.cat}
                  </p>
                  <p className="text-sm font-bold text-[#7a9b82]">{formatCurrency(item.val)} ({item.pct.toFixed(1)}%)</p>
                </div>
                <div className="h-2 bg-[#f4faf6] rounded-full overflow-hidden p-0.5 border border-[#d8eadb]">
                  <div className="h-full bg-[#e74b6c] rounded-full transition-all duration-1000" style={{ width: `${item.pct}%` }} />
                </div>
              </div>
            ))}
            {topCategories.length === 0 && <p className="py-20 text-center text-xs text-[#7a9b82] italic">Sin gastos registrados este mes.</p>}
          </div>
          <div className="mt-8 pt-6 border-t border-[#f4faf6] flex justify-between items-baseline">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#7a9b82]">Total Gastos</p>
            <p className="text-2xl font-dm-serif text-[#e74b6c]">{formatCurrency(stats.expense)}</p>
          </div>
        </div>

        {/* TOP CATEGORIAS INGRESOS */}
        <div className="bg-white border border-[#d8eadb] p-10 rounded-[40px] shadow-sm">
          <h4 className="text-[11px] font-black uppercase tracking-widest text-[#7a9b82] mb-8">Distribución de Ingresos</h4>
          <div className="space-y-8">
            {topIncomes.map(item => (
              <div key={item.cat} className="space-y-2">
                <div className="flex justify-between items-end">
                  <p className="text-[11px] font-black text-[#1a2e1e] uppercase tracking-widest flex items-center gap-2">
                    <span className="text-lg">{CAT_ICONS[item.cat]}</span> {item.cat}
                  </p>
                  <p className="text-sm font-bold text-[#7a9b82]">{formatCurrency(item.val)} ({item.pct.toFixed(1)}%)</p>
                </div>
                <div className="h-2 bg-[#f4faf6] rounded-full overflow-hidden p-0.5 border border-[#d8eadb]">
                  <div className="h-full bg-[#2d5a3d] rounded-full transition-all duration-1000" style={{ width: `${item.pct}%` }} />
                </div>
              </div>
            ))}
            {topIncomes.length === 0 && <p className="py-20 text-center text-xs text-[#7a9b82] italic">Sin ingresos registrados este mes.</p>}
          </div>
          <div className="mt-8 pt-6 border-t border-[#f4faf6] flex justify-between items-baseline">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#7a9b82]">Total Ingresos</p>
            <p className="text-2xl font-dm-serif text-[#2d5a3d]">{formatCurrency(stats.income)}</p>
          </div>
        </div>
      </div>

      {/* REPORTE DE METAS GLOBAL */}
      <div className="bg-[#2d5a3d] p-10 rounded-[40px] shadow-xl text-white relative overflow-hidden mb-10">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/40 mb-8">Reporte Consolidado de Metas</h4>
            <div className="space-y-8">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/60">Ahorro Total Acumulado</p>
                  <p className="text-4xl font-dm-serif text-white mt-1">{formatCurrency(goalStats.totalCurrent)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/60">Objetivo Global</p>
                  <p className="text-xl font-dm-serif text-white/80">{formatCurrency(goalStats.totalTarget)}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                  <span className="text-white/60">Progreso General</span>
                  <span className="text-[#6aaf7a]">{goalStats.progress.toFixed(1)}% Completado</span>
                </div>
                <div className="h-4 bg-white/10 rounded-full overflow-hidden p-1 border border-white/5">
                  <div
                    className="h-full bg-[#6aaf7a] rounded-full transition-all duration-1000 shadow-[0_0_20px_rgba(106,175,122,0.4)]"
                    style={{ width: `${goalStats.progress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10 space-y-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-4">Estado por Meta ({metas.length})</p>
            <div className="max-h-[180px] overflow-y-auto no-scrollbar space-y-1">
              {metas.map(m => (
                <div key={m.id} className="flex justify-between items-center py-3 border-b border-white/5 last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{m.icon}</span>
                    <span className="text-xs font-bold text-white/90 truncate max-w-[150px]">{m.name}</span>
                  </div>
                  <span className="text-xs font-dm-serif text-[#6aaf7a]">{((m.current / m.target) * 100).toFixed(0)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="absolute top-[-20%] right-[-10%] w-96 h-96 bg-white/5 rounded-full blur-[100px] pointer-events-none" />
      </div>

      {/* HISTORIAL */}
      <div className="bg-white border border-[#d8eadb] p-5 sm:p-10 rounded-[40px] shadow-sm">
        <h4 className="text-[11px] font-black uppercase tracking-widest text-[#7a9b82] mb-8">Historial Comparativo (Últimos 6 meses)</h4>
        <div className="overflow-x-auto -mx-2 sm:mx-0">
          <table className="w-full text-left min-w-[450px]">
            <thead>
              <tr className="border-b border-[#f4faf6] text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-[#7a9b82]">
                <th className="pb-4 sm:pb-6 px-2">Mes</th>
                <th className="pb-4 sm:pb-6 px-2">Ingresos</th>
                <th className="pb-4 sm:pb-6 px-2">Gastos</th>
                <th className="pb-4 sm:pb-6 px-2">Balance</th>
                <th className="pb-4 sm:pb-6 px-2 text-center">Tasa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f4faf6]">
              {history.map(m => (
                <tr key={m.month} className="group hover:bg-[#f4faf6] transition-all">
                  <td className="py-4 sm:py-6 px-2 text-[10px] sm:text-sm font-black uppercase tracking-tighter text-[#7a9b82]">{m.month}</td>
                  <td className="py-4 sm:py-6 px-2 text-[10px] sm:text-sm font-bold text-[#2d5a3d]">{formatCurrency(m.inc)}</td>
                  <td className="py-4 sm:py-6 px-2 text-[10px] sm:text-sm font-bold text-[#e74b6c]">{formatCurrency(m.exp)}</td>
                  <td className={`py-4 sm:py-6 px-2 text-[10px] sm:text-sm font-bold ${m.bal >= 0 ? 'text-[#7b8cde]' : 'text-[#e74b6c]'}`}>{formatCurrency(m.bal)}</td>
                  <td className="py-4 sm:py-6 px-2 text-center">
                    <span className={`px-3 sm:px-4 py-1.5 rounded-full text-[8px] sm:text-[10px] font-black uppercase tracking-widest ${m.rate >= 20 ? 'bg-[#2d5a3d]/10 text-[#2d5a3d]' : m.rate > 0 ? 'bg-[#f0b429]/10 text-[#f0b429]' : 'bg-[#e74b6c]/10 text-[#e74b6c]'}`}>
                      {m.rate}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// --- MODALS ---

function ModalFuga({ onClose, onSave }: { onClose: () => void, onSave: (tx: Omit<Transaccion, 'id'>) => void }) {
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');

  const handleSave = () => {
    if (!desc.trim() || !amount || parseFloat(amount) <= 0) return;
    onSave({
      type: 'expense',
      desc: desc.trim(),
      amount: parseFloat(amount),
      cat: 'Otros',
      date: new Date().toISOString().split('T')[0],
      fuga: true,
      note: 'Fuga de energía detectada'
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/20 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose}>
      <div className="bg-white border border-[#d8eadb] rounded-[40px] w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-amber-100">
            <Zap className="text-amber-500 fill-amber-500" size={32} />
          </div>
          <h2 className="text-2xl font-black mb-2 text-[#1a2e1e] uppercase tracking-tight">Registrar Gasto Hormiga</h2>
          <p className="text-[10px] font-bold text-[#7a9b82] uppercase tracking-widest mb-8">Pérdida de dinero o energía</p>

          <div className="space-y-4">
            <input
              placeholder="¿En qué se fugó?" value={desc} onChange={e => setDesc(e.target.value)}
              className="w-full bg-[#f4faf6] border border-[#d8eadb] p-4 rounded-2xl text-sm font-bold outline-none focus:border-amber-500 transition-all text-[#1a2e1e]"
              autoFocus
            />
            <p className="text-[9px] text-[#7a9b82] font-medium mt-1 text-left px-2">
              Ejemplos: Café, Snacks, Suscripciones, Transporte, Antojos...
            </p>
            <input
              type="number" placeholder="Monto" value={amount} onChange={e => setAmount(e.target.value)}
              className="w-full bg-[#f4faf6] border border-[#d8eadb] p-4 rounded-2xl text-lg font-black outline-none focus:border-amber-500 transition-all text-[#1a2e1e] text-center"
            />
          </div>

          <div className="flex flex-col gap-3 mt-8">
            <button onClick={handleSave} className="w-full py-4 bg-amber-500 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-95 transition-all">
              Guardar Gasto Hormiga
            </button>
            <button onClick={onClose} className="w-full py-3 text-[#7a9b82] font-bold uppercase text-[9px] tracking-widest hover:text-[#1a2e1e]">
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ModalTx({ onClose, onSave }: { onClose: () => void, onSave: (tx: Omit<Transaccion, 'id'>) => void }) {
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [cat, setCat] = useState('');
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const _today = new Date();
  const [dateDay, setDateDay]     = useState(_today.getDate());
  const [dateMonth, setDateMonth] = useState(_today.getMonth() + 1);
  const [dateYear, setDateYear]   = useState(_today.getFullYear());
  const dateString = `${dateYear}-${String(dateMonth).padStart(2,'0')}-${String(dateDay).padStart(2,'0')}`;

  useEffect(() => {
    setCat(type === 'income' ? CATEGORIES_INCOME[0] : CATEGORIES_EXPENSE[0]);
  }, [type]);

  const handleSave = () => {
    const err: any = {};
    if (!desc.trim()) err.desc = 'La descripción es requerida';
    if (!amount || parseFloat(amount) <= 0) err.amount = 'El monto debe ser mayor a 0';
    if (!cat) err.cat = 'Selecciona una categoría';
    if (Object.keys(err).length > 0) { setErrors(err); return; }
    onSave({ type, desc, amount: parseFloat(amount), cat, date: dateString, note });
  };

  const MONTH_NAMES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const DAY_HEADERS = ['D','L','M','M','J','V','S'];
  const firstDay   = new Date(dateYear, dateMonth - 1, 1).getDay();
  const daysInMonth = new Date(dateYear, dateMonth, 0).getDate();
  const todayObj   = new Date();

  const calCells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (calCells.length % 7 !== 0) calCells.push(null);

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-[28px] sm:rounded-[28px] w-full max-w-sm flex flex-col max-h-[95vh] shadow-2xl animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-300"
        onClick={e => e.stopPropagation()}
      >
        {/* ── STICKY HEADER ── */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100 shrink-0">
          <h2 className="font-black text-[15px] text-[#1a2e1e] uppercase tracking-tight">Nueva Transacción</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center hover:bg-rose-100 hover:text-rose-500 transition-all text-lg font-bold">×</button>
        </div>

        {/* ── SCROLLABLE BODY ── */}
        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">

          {/* Toggle */}
          <div className="flex p-1 bg-gray-100 rounded-xl">
            <button onClick={() => setType('income')}
              className={`flex-1 py-2.5 text-[11px] font-black uppercase rounded-lg transition-all ${type === 'income' ? 'bg-[#2d5a3d] text-white shadow' : 'text-gray-400 hover:text-[#2d5a3d]'}`}>
              ▲ Ingreso
            </button>
            <button onClick={() => setType('expense')}
              className={`flex-1 py-2.5 text-[11px] font-black uppercase rounded-lg transition-all ${type === 'expense' ? 'bg-[#e74b6c] text-white shadow' : 'text-gray-400 hover:text-[#e74b6c]'}`}>
              ▼ Gasto
            </button>
          </div>

          {/* Description */}
          <input
            placeholder="ej. Sueldo, Supermercado..."
            value={desc} onChange={e => setDesc(e.target.value)}
            className={`w-full bg-gray-50 border ${errors.desc ? 'border-rose-400' : 'border-gray-200'} px-4 py-3 rounded-2xl text-sm font-medium outline-none focus:border-[#2d5a3d] transition-all text-[#1a2e1e] placeholder:text-gray-300`}
          />

          {/* Amount */}
          <input
            type="number" placeholder="Monto (S/)"
            value={amount} onChange={e => setAmount(e.target.value)}
            className={`w-full bg-gray-50 border ${errors.amount ? 'border-rose-400' : 'border-gray-200'} px-4 py-3 rounded-2xl text-sm font-black outline-none focus:border-[#2d5a3d] transition-all text-[#1a2e1e] placeholder:text-gray-300`}
          />

          {/* ── CALENDAR ── */}
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">

            {/* Calendar header: SELECCIONAR DÍA + month/year selects */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
              <span className="text-[9px] font-black uppercase tracking-[0.15em] text-gray-400 flex-1 whitespace-nowrap">Seleccionar Día</span>
              {/* Month select */}
              <select
                value={dateMonth}
                onChange={e => { setDateMonth(parseInt(e.target.value)); setDateDay(1); }}
                className="bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-[11px] font-black text-[#1a2e1e] uppercase outline-none cursor-pointer hover:border-[#2d5a3d] transition-all appearance-none pr-6 relative"
                style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'10\' height=\'6\'%3E%3Cpath d=\'M0 0l5 6 5-6z\' fill=\'%23999\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center' }}
              >
                {MONTH_NAMES.map((m, i) => <option key={i} value={i + 1}>{m.substring(0,4).toUpperCase()}</option>)}
              </select>
              {/* Year select */}
              <select
                value={dateYear}
                onChange={e => { setDateYear(parseInt(e.target.value)); setDateDay(1); }}
                className="bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-[11px] font-black text-[#1a2e1e] outline-none cursor-pointer hover:border-[#2d5a3d] transition-all appearance-none pr-6"
                style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'10\' height=\'6\'%3E%3Cpath d=\'M0 0l5 6 5-6z\' fill=\'%23999\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center' }}
              >
                {Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - 1 + i).map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>

            {/* Day name headers */}
            <div className="grid grid-cols-7 px-3 pt-3 pb-1">
              {DAY_HEADERS.map((d, i) => (
                <div key={i} className="text-center text-[10px] font-black uppercase text-gray-300">{d}</div>
              ))}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7 px-3 pb-3 gap-y-1">
              {calCells.map((d, i) => {
                if (!d) return <div key={i} />;
                const isSel   = d === dateDay;
                const isToday = d === todayObj.getDate() && dateMonth === todayObj.getMonth() + 1 && dateYear === todayObj.getFullYear();
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setDateDay(d)}
                    className={`h-9 w-full rounded-xl text-[13px] font-bold transition-all
                      ${isSel   ? 'bg-[#2d5a3d] text-white font-black shadow-md scale-105'
                      : isToday ? 'text-[#2d5a3d] font-black underline underline-offset-2'
                                : 'text-[#1a2e1e] hover:bg-gray-100 hover:font-black'}`}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Category */}
          <select
            value={cat} onChange={e => setCat(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest outline-none focus:border-[#2d5a3d] transition-all cursor-pointer text-[#1a2e1e]"
          >
            {(type === 'income' ? CATEGORIES_INCOME : CATEGORIES_EXPENSE).map((c, i) => (
              <option key={`${c}-${i}`} value={c}>{c}</option>
            ))}
          </select>

          {/* Note */}
          <input
            placeholder="Descripción adicional (opcional)..."
            value={note} onChange={e => setNote(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-2xl text-xs font-medium outline-none focus:border-[#2d5a3d] transition-all text-[#1a2e1e] placeholder:text-gray-300"
          />

          {/* Stack tip */}
          {type === 'expense' && amount && parseFloat(amount) > 0 && parseFloat(amount) < 50 && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
              <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest mb-0.5">✨ Stack Tip</p>
              <p className="text-[11px] text-amber-700 font-medium italic">&ldquo;¿Este gasto alimenta tu sistema o lo debilita?&rdquo;</p>
            </div>
          )}
        </div>

        {/* ── STICKY BUTTONS ── */}
        <div className="flex gap-3 px-5 py-4 border-t border-gray-100 bg-white shrink-0">
          <button onClick={onClose}
            className="flex-1 py-3.5 bg-gray-100 text-gray-500 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:text-[#2d5a3d] transition-all">
            Cancelar
          </button>
          <button onClick={handleSave}
            className="flex-1 py-3.5 bg-[#2d5a3d] text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-[#2d5a3d]/20 hover:scale-[1.02] transition-all">
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}



function ModalBudget({ current, onClose, onSave }: { current: Record<string, number>, onClose: () => void, onSave: (b: Record<string, number>) => void }) {
  const [vals, setVals] = useState<Record<string, number>>(current);
  const [newCat, setNewCat] = useState('');
  const [newLimit, setNewLimit] = useState('');

  const handleAddCat = () => {
    if (!newCat.trim() || !newLimit || parseFloat(newLimit) < 0) return;
    setVals({ ...vals, [newCat.trim()]: parseFloat(newLimit) });
    setNewCat('');
    setNewLimit('');
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/40 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose}>
      <div className="bg-white border border-[#d8eadb] rounded-[40px] w-full max-w-2xl shadow-[0_20px_60px_rgba(45,159,108,0.1)] animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
        <div className="p-10">
          <h2 className="font-dm-serif text-3xl mb-8 text-[#2d5a3d]">Editar Presupuesto</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2 no-scrollbar pb-4">
            {Object.entries(vals).map(([cat, limit]) => (
              <div key={cat} className="space-y-1.5 p-5 bg-[#f4faf6] rounded-[24px] border border-[#d8eadb] group focus-within:border-[#2d5a3d] transition-all relative">
                <div className="flex justify-between items-center">
                  <label className="text-[9px] font-black text-[#7a9b82] uppercase tracking-[0.2em]">{CAT_ICONS[cat] || '💰'} {cat}</label>
                  <button onClick={() => { const n = { ...vals }; delete n[cat]; setVals(n); }} className="opacity-0 group-hover:opacity-100 p-1 text-[#e74b6c] hover:bg-[#e74b6c]/10 rounded-md transition-all"><X size={12} /></button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#7a9b82]">S/</span>
                  <input
                    type="number" value={limit} onChange={e => setVals({ ...vals, [cat]: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-transparent border-none outline-none text-base font-black text-[#2d5a3d]"
                  />
                </div>
              </div>
            ))}

            {/* ADD NEW CARD */}
            <div className="p-5 bg-white border-2 border-dashed border-[#d8eadb] rounded-[24px] hover:border-[#2d5a3d]/30 transition-all flex flex-col justify-between group">
              <div className="flex justify-between items-center gap-2 mb-2">
                <input
                  placeholder="NUEVA CATEGORÍA..."
                  value={newCat} onChange={e => setNewCat(e.target.value)}
                  className="w-full bg-transparent border-none outline-none text-[9px] font-black uppercase text-[#2d5a3d] placeholder:text-[#7a9b82]/40"
                />
                <div className="text-[10px] opacity-20 group-focus-within:opacity-100 transition-opacity">✨</div>
              </div>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#7a9b82]">S/</span>
                  <input
                    type="number" placeholder="LÍMITE"
                    value={newLimit} onChange={e => setNewLimit(e.target.value)}
                    className="w-20 bg-transparent border-none outline-none text-base font-black text-[#2d5a3d] placeholder:text-[#7a9b82]/20"
                  />
                </div>
                <button
                  onClick={handleAddCat}
                  className="bg-[#2d5a3d] text-white w-8 h-8 rounded-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-md shadow-[#2d5a3d]/20"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-4 mt-12">
            <button onClick={onClose} className="flex-1 py-4 bg-[#f4faf6] text-[#7a9b82] rounded-2xl font-black uppercase text-[10px] tracking-widest hover:text-[#2d5a3d] border border-[#d8eadb] transition-all">Cancelar</button>
            <button onClick={() => onSave(vals)} className="flex-1 py-4 bg-[#2d5a3d] text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-[#2d5a3d]/20 hover:scale-[1.02] transition-all">Actualizar</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ModalGoal({ onClose, onSave }: { onClose: () => void, onSave: (g: Omit<Meta, 'id'>) => void }) {
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [current, setCurrent] = useState('');
  const [icon, setIcon] = useState('🏦');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSave = () => {
    if (!name.trim()) { setErrors({ name: 'Requerido' }); return; }
    if (!target || parseFloat(target) <= 0) { setErrors({ target: 'Invalido' }); return; }
    onSave({ name, target: parseFloat(target), current: parseFloat(current) || 0, icon });
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/40 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose}>
      <div className="bg-white border border-[#d8eadb] rounded-[40px] w-full max-w-md shadow-[0_20px_60px_rgba(45,159,108,0.1)] animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
        <div className="p-10">
          <h2 className="font-dm-serif text-3xl mb-8 text-[#2d5a3d]">Nueva Meta</h2>
          <div className="space-y-6">
            <input
              placeholder="Nombre de la meta" value={name} onChange={e => setName(e.target.value)}
              className="w-full bg-[#f4faf6] border border-[#d8eadb] p-4 rounded-2xl text-sm font-bold outline-none focus:border-[#2d5a3d] transition-all text-[#1a2e1e]"
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                type="number" placeholder="Objetivo (S/)" value={target} onChange={e => setTarget(e.target.value)}
                className="w-full bg-[#f4faf6] border border-[#d8eadb] p-4 rounded-2xl text-sm font-black outline-none focus:border-[#2d5a3d] transition-all text-[#1a2e1e]"
              />
              <input
                type="number" placeholder="Ya ahorrado (S/)" value={current} onChange={e => setCurrent(e.target.value)}
                className="w-full bg-[#f4faf6] border border-[#d8eadb] p-4 rounded-2xl text-sm font-black outline-none focus:border-[#2d5a3d] transition-all text-[#1a2e1e]"
              />
            </div>
            <div className="grid grid-cols-4 gap-3 max-h-[220px] overflow-y-auto no-scrollbar p-1">
              {[
                { i: '🏦', n: 'Ahorro' }, { i: '✈️', n: 'Viaje' }, { i: '💻', n: 'Tecno' }, { i: '🏠', n: 'Hogar' },
                { i: '🚗', n: 'Auto' }, { i: '💍', n: 'Boda' }, { i: '🎓', n: 'Estudio' }, { i: '🏥', n: 'Salud' },
                { i: '🎨', n: 'Hobby' }, { i: '🎁', n: 'Regalo' }, { i: '🛒', n: 'Compra' }, { i: '📦', n: 'Otros' }
              ].map(item => (
                <button
                  key={item.i} onClick={() => setIcon(item.i)}
                  className={`p-3 rounded-2xl flex flex-col items-center gap-1 transition-all border ${icon === item.i ? 'bg-[#2d5a3d] border-[#2d5a3d] text-white scale-105 shadow-md' : 'bg-[#f4faf6] border-[#d8eadb] hover:border-[#2d5a3d]/30'}`}
                >
                  <span className={`text-xl ${icon === item.i ? '' : 'grayscale opacity-60'}`}>{item.i}</span>
                  <span className={`text-[8px] font-black uppercase tracking-tighter ${icon === item.i ? 'text-white' : 'text-[#7a9b82]'}`}>{item.n}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-4 mt-12">
            <button onClick={onClose} className="flex-1 py-4 bg-[#f4faf6] text-[#7a9b82] rounded-2xl font-black uppercase text-[10px] tracking-widest hover:text-[#2d5a3d] border border-[#d8eadb] transition-all">Cancelar</button>
            <button onClick={handleSave} className="flex-1 py-4 bg-[#2d5a3d] text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-[#2d5a3d]/20 hover:scale-[1.02] transition-all">Crear Meta</button>
          </div>
        </div>
      </div>
    </div>
  );
}
