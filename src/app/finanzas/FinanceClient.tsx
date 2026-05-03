'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  LayoutDashboard, Receipt, PieChart, Target, BarChart3, 
  Plus, Search, Filter, Download, ChevronLeft, ChevronRight,
  TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight,
  Calendar, Tag, MoreHorizontal, Trash2, Edit3, CheckCircle2, AlertCircle, Menu, X, Globe, LogOut, Printer,
  FileText, ChevronDown
} from 'lucide-react';
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

// --- TYPES ---
interface Transaccion {
  id: number;
  type: 'income' | 'expense';
  amount: number;
  cat: string;
  desc: string;
  date: string;
  note?: string;
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
  Alimentación: 0, Transporte: 0, Vivienda: 0,
  Salud: 0, Entretenimiento: 0, Educación: 0,
  Servicios: 0, Ropa: 0, Otros: 0
};

const INITIAL_GOALS: Meta[] = [];

export default function FinanceClient({ userId, userEmail, onPageChange }: { userId: string, userEmail: string, onPageChange?: (page: any) => void }) {
  const [activeModule, setActiveModule] = useState<'dashboard' | 'transactions' | 'budget' | 'goals' | 'reports'>('dashboard');
  const [selectedMonth, setSelectedMonth] = useState('2026-04');
  const [transacciones, setTransacciones] = useState<Transaccion[]>([]);
  const [presupuesto, setPresupuesto] = useState<Presupuesto>(INITIAL_BUDGET);
  const [metas, setMetas] = useState<Meta[]>(INITIAL_GOALS);
  const [showModalTx, setShowModalTx] = useState(false);
  const [showModalBudget, setShowModalBudget] = useState(false);
  const [showModalGoal, setShowModalGoal] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const router = useRouter();
  const supabase = createClient();
  const { t, lang, setLang } = useTranslation();

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

    if (savedTx) setTransacciones(JSON.parse(savedTx));
    
    if (savedBudget) setPresupuesto(JSON.parse(savedBudget));
    if (savedGoals) setMetas(JSON.parse(savedGoals));
    console.log("FinanceApp SaaS V2 Loaded");
  }, [userId]);

  useEffect(() => {
    if (transacciones.length > 0) localStorage.setItem(`finanzas_tx_${userId}`, JSON.stringify(transacciones));
    localStorage.setItem(`finanzas_budget_${userId}`, JSON.stringify(presupuesto));
    localStorage.setItem(`finanzas_goals_${userId}`, JSON.stringify(metas));
  }, [transacciones, presupuesto, metas, userId]);

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
    return { income, expense, balance, savingsRate };
  }, [filteredTx]);

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
    const headers = ['Fecha', 'Tipo', 'Descripción', 'Categoría', 'Monto', 'Nota'];
    const rows = transacciones.map(t => [
      t.date,
      t.type === 'income' ? 'Ingreso' : 'Gasto',
      t.desc,
      t.cat,
      t.amount.toFixed(2),
      t.note || ''
    ]);
    const [year, month] = selectedMonth.split('-');
    const title = `Reporte de Transacciones - ${MONTHS[parseInt(month)-1]} ${year}`;
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
    const title = `Presupuesto Mensual - ${MONTHS[parseInt(month)-1]} ${year}`;
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
    const title = `Estado de Metas - ${MONTHS[parseInt(month)-1]} ${year}`;
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
      ...metas.map(m => ['', m.name, ((m.current/m.target)*100).toFixed(1) + '%'])
    ];
    const [year, month] = selectedMonth.split('-');
    const title = `Reporte Integral de Finanzas - ${MONTHS[parseInt(month)-1]} ${year}`;
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
    return "S/" + n.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const changeMonth = (delta: number) => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const date = new Date(year, month - 1 + delta, 1);
    setSelectedMonth(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f7f9f7] text-[#1a2e1e] font-dm-sans selection:bg-[#2d5a3d]/10">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=DM+Serif+Display&display=swap');
        .font-dm-serif { font-family: 'DM Serif Display', serif; }
        .font-dm-sans { font-family: 'DM Sans', sans-serif; }
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
          <div className="mb-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-1">
              <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#7a9b82]">{t('finances_header')}</h5>
              {/* Module title removed */}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
              <div className="bg-white/80 backdrop-blur-md border border-[#e8f1e9] rounded-xl p-1.5 w-full sm:w-fit shadow-sm">
                <div className="flex flex-wrap sm:flex-nowrap gap-1 justify-center sm:justify-start">
                  {[
                    { id: 'dashboard', label: 'Dashboard' },
                    { id: 'transactions', label: 'Transacciones' },
                    { id: 'budget', label: 'Presupuesto' },
                    { id: 'goals', label: 'Metas' },
                    { id: 'reports', label: 'Reportes' },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveModule(tab.id as any)}
                      className={`px-3 sm:px-5 py-2 text-[9px] sm:text-[10px] font-black uppercase tracking-widest rounded-lg transition-all duration-300 whitespace-nowrap
                        ${activeModule === tab.id ? 'bg-[#2d5a3d] text-white shadow-md' : 'text-[#7a9b82] hover:text-[#2d5a3d] hover:bg-white/50'}`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ACTIONS & DATE SELECTOR */}
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4 mb-8">
            <div className="flex items-center bg-white border border-[#d8eadb] rounded-xl p-1 shadow-sm">
              <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-[#f4faf6] rounded-lg transition-all text-[#2d5a3d]"><ChevronLeft size={18}/></button>
              <span className="px-4 text-xs font-black uppercase tracking-widest min-w-[140px] text-center text-[#2d5a3d]">
                {MONTHS[parseInt(selectedMonth.split('-')[1]) - 1]} {selectedMonth.split('-')[0]}
              </span>
              <button onClick={() => changeMonth(1)} className="p-2 hover:bg-[#f4faf6] rounded-lg transition-all text-[#2d5a3d]"><ChevronRight size={18}/></button>
            </div>
            
            <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
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
                    if(activeModule === 'budget') setShowModalBudget(true);
                    else if(activeModule === 'goals') setShowModalGoal(true);
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
        {activeModule === 'dashboard' && <DashboardView stats={stats} filteredTx={filteredTx} transacciones={transacciones} formatCurrency={formatCurrency} />}
        {activeModule === 'transactions' && <TransactionsView filteredTx={filteredTx} onDelete={handleDeleteTx} formatCurrency={formatCurrency} />}
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
            {toast.type === 'success' ? <CheckCircle2 className="text-[#2dd4a0]" size={20}/> : <AlertCircle className="text-[#f27059]" size={20}/>}
            <span className="text-sm font-bold tracking-tight">{toast.msg}</span>
          </div>
        </div>
      )}

      {/* MODALS */}
      {showModalTx && <ModalTx onClose={() => setShowModalTx(false)} onSave={handleAddTx} />}
      {showModalBudget && <ModalBudget current={presupuesto} onClose={() => setShowModalBudget(false)} onSave={(b: Presupuesto) => { setPresupuesto(b); setShowModalBudget(false); showToast('Presupuesto actualizado'); }} />}
      {showModalGoal && <ModalGoal onClose={() => setShowModalGoal(false)} onSave={(g: Omit<Meta, 'id'>) => { setMetas([...metas, { ...g, id: Date.now() }]); setShowModalGoal(false); showToast('Meta creada'); }} />}

    </div>
  );
}

// --- SUB-VIEWS ---

function DashboardView({ stats, filteredTx, transacciones, formatCurrency }: { stats: any, filteredTx: Transaccion[], transacciones: Transaccion[], formatCurrency: (n: number) => string }) {
  const chartScrollRef = useRef<HTMLDivElement>(null);
  const currentYear = new Date().getFullYear();
  const currentMonthIdx = new Date().getMonth();

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
          { label: 'Ingresos Totales', val: formatCurrency(stats.income), color: 'text-[#2d5a3d]', icon: <TrendingUp size={22}/>, bg: 'bg-white' },
          { label: 'Gastos Totales', val: formatCurrency(stats.expense), color: 'text-[#e74b6c]', icon: <TrendingDown size={22}/>, bg: 'bg-white' },
          { label: 'Balance Neto', val: formatCurrency(stats.balance), color: 'text-[#7b8cde]', icon: <Wallet size={22}/>, bg: 'bg-white' },
        ].map(card => (
          <div key={card.label} className={`${card.bg} border border-[#e8f1e9] p-5 sm:p-10 rounded-[28px] shadow-[0_4px_20px_rgba(45,159,108,0.03)] flex flex-row sm:flex-col items-center sm:items-start justify-between sm:justify-center gap-4 group w-full box-border hover:shadow-md transition-all duration-300`}>
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#f7f9f7] flex items-center justify-center shrink-0">
              <div className={`${card.color} opacity-80 group-hover:opacity-100 transition-opacity`}>
                {card.icon}
              </div>
            </div>
            <div className="flex-1 sm:flex-none">
              <p className="text-[9px] font-black uppercase text-[#7a9b82] tracking-[0.2em] mb-1 sm:mb-2">{card.label}</p>
              <h3 className={`font-dm-serif text-xl sm:text-4xl tracking-tight ${card.color} truncate`}>{card.val}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        {/* CHART BAR */}
        <div className="lg:col-span-8 bg-white border border-[#d8eadb] p-5 sm:p-8 rounded-[32px] sm:rounded-[40px] shadow-sm overflow-hidden">
          <h4 className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-[#7a9b82] mb-6 sm:mb-8">Evolución Anual {currentYear} (Ene - Dic)</h4>
          <div ref={chartScrollRef} className="overflow-x-auto custom-scrollbar pb-4 scroll-smooth">
            <div className="h-[250px] sm:h-[320px] min-w-[850px] lg:min-w-0 w-full px-2">
              <Bar 
                data={{
                  labels: yearlyData.map(m => m.label.substring(0, 3)),
                  datasets: [
                    { label: 'Ingresos', data: yearlyData.map(m => m.income), backgroundColor: '#2d5a3d', borderRadius: 6, barThickness: 12 },
                    { label: 'Gastos', data: yearlyData.map(m => m.expense), backgroundColor: '#d8eadb', borderRadius: 6, barThickness: 12 }
                  ]
                }}
                options={{ 
                  responsive: true, 
                  maintainAspectRatio: false,
                  plugins: { 
                    legend: { display: false },
                    tooltip: { backgroundColor: '#1a2e1e', titleFont: { size: 10 }, bodyFont: { size: 10 } }
                  },
                  scales: { 
                    y: { beginAtZero: true, grid: { color: '#f0f4f1' }, ticks: { font: { size: 9 }, color: '#7a9b82' } }, 
                    x: { grid: { display: false }, ticks: { font: { size: 9, weight: 'bold' }, color: '#2d5a3d' } } 
                  }
                }} 
              />
            </div>
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
                    <p className="text-lg font-dm-serif text-[#2d5a3d]">{formatCurrency(Object.values(catDistribution).reduce((a,b)=>a+b, 0))}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-6 w-full px-2 max-h-[100px] overflow-y-auto no-scrollbar">
                  {Object.entries(catDistribution).map(([label, val], idx) => (
                    <div key={label} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: ['#2d5a3d', '#6aaf7a', '#d8eadb', '#f0b429', '#e74b6c', '#7b8cde', '#1a2e1e', '#a8dadc'][idx % 8] }} />
                      <p className="text-[8px] font-black text-[#1a2e1e] uppercase truncate flex-1">{label}</p>
                      <p className="text-[8px] font-bold text-[#7a9b82]">{((val / Object.values(catDistribution).reduce((a,b)=>a+b, 0)) * 100).toFixed(0)}%</p>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-[10px] text-[#7a9b82] font-bold uppercase">Sin datos</p>
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
                  <p className="text-sm font-bold tracking-tight text-[#1a2e1e] truncate">{tx.desc}</p>
                  <p className="text-[9px] sm:text-[10px] font-black uppercase text-[#7a9b82] tracking-widest truncate">{tx.cat} • {tx.date}</p>
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

function TransactionsView({ filteredTx, onDelete, formatCurrency }: { filteredTx: Transaccion[], onDelete: (id: number) => void, formatCurrency: (n: number) => string }) {
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [catFilter, setCatFilter] = useState('Todas');

  const finalTx = useMemo(() => {
    return filteredTx.filter((t: any) => {
      const typeMatch = filter === 'all' || t.type === filter;
      const catMatch = catFilter === 'Todas' || t.cat === catFilter;
      return typeMatch && catMatch;
    });
  }, [filteredTx, filter, catFilter]);

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
          {[...CATEGORIES_INCOME, ...CATEGORIES_EXPENSE].map(c => <option key={c} value={c}>{c}</option>)}
        </select>
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
      <div className="bg-white border border-[#d8eadb] rounded-[40px] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[600px]">
            <thead>
              <tr className="bg-[#f4faf6]/50 border-b border-[#d8eadb]">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-[#7a9b82]">Fecha</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-[#7a9b82]">Descripción</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-[#7a9b82]">Categoría</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-[#7a9b82]">Monto</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-[#7a9b82]">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d8eadb]">
              {finalTx.map((tx: any) => (
                <tr key={tx.id} className="group hover:bg-[#f4faf6] transition-all">
                  <td className="px-8 py-5 text-xs font-bold text-[#7a9b82] font-mono">{tx.date}</td>
                  <td className="px-8 py-5">
                    <p className="text-sm font-bold tracking-tight text-[#1a2e1e]">{tx.desc}</p>
                    {tx.note && <p className="text-[10px] text-[#7a9b82] mt-1 italic">{tx.note}</p>}
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{CAT_ICONS[tx.cat] || '📦'}</span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#7a9b82]">{tx.cat}</span>
                    </div>
                  </td>
                  <td className={`px-8 py-5 text-lg font-dm-serif ${tx.type === 'income' ? 'text-[#2d5a3d]' : 'text-[#e74b6c]'}`}>
                    {tx.type === 'income' ? '+' : '-'} {formatCurrency(tx.amount)}
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button 
                      onClick={() => onDelete(tx.id)}
                      className="p-3 text-[#d8eadb] hover:text-[#e74b6c] hover:bg-[#e74b6c]/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={16} />
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
      {Object.keys(presupuesto).map(cat => {
        const target = presupuesto[cat] || 0;
        const real = filteredTx.filter((t: any) => t.cat === cat && t.type === 'expense').reduce((acc: number, t: any) => acc + t.amount, 0);
        const pct = target > 0 ? (real / target) * 100 : 0;
        const color = pct < 80 ? '#2d5a3d' : pct < 100 ? '#f0b429' : '#e74b6c';

        return (
          <div key={cat} className="bg-white border border-[#d8eadb] p-5 sm:p-8 rounded-[32px] sm:rounded-[40px] flex flex-col transition-all hover:scale-[1.02] group shadow-sm overflow-hidden">
            <div className="flex justify-between items-start mb-6 sm:mb-8">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#f4faf6] rounded-2xl flex items-center justify-center text-xl sm:text-2xl shadow-sm border border-[#d8eadb]">
                {CAT_ICONS[cat] || '💰'}
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black uppercase text-[#7a9b82] tracking-widest mb-1">{cat}</p>
                <p className="text-sm sm:text-base font-bold text-[#1a2e1e]">Límite: {formatCurrency(target)}</p>
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <div className="flex justify-between items-end">
                <p className="text-[9px] sm:text-[11px] font-black text-[#7a9b82] uppercase">Gasto Real</p>
                <p className="text-base sm:text-lg font-dm-serif" style={{ color }}>{formatCurrency(real)}</p>
              </div>
              <div className="h-2 sm:h-2.5 bg-[#f4faf6] rounded-full overflow-hidden p-0.5 border border-[#d8eadb]">
                <div 
                  className="h-full rounded-full transition-all duration-1000" 
                  style={{ width: `${Math.min(100, pct)}%`, backgroundColor: color }} 
                />
              </div>
              <p className="text-center text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-[#7a9b82]">
                {pct.toFixed(0)}% del límite mensual
              </p>
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
                      onChange={(e) => setSavingsInputs({...savingsInputs, [meta.id]: e.target.value})}
                      className="flex-1 bg-transparent border-none outline-none px-3 text-[10px] font-black text-[#2d5a3d] placeholder:text-[#7a9b82]/40"
                    />
                    <button 
                      onClick={() => {
                        const amt = parseFloat(savingsInputs[meta.id]);
                        if (!isNaN(amt) && amt > 0) {
                          onUpdate(meta.id, amt);
                          setSavingsInputs({...savingsInputs, [meta.id]: ''});
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
      <style dangerouslySetInnerHTML={{ __html: `
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
                  <span className="text-xs font-dm-serif text-[#6aaf7a]">{((m.current/m.target)*100).toFixed(0)}%</span>
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

function ModalTx({ onClose, onSave }: { onClose: () => void, onSave: (tx: Omit<Transaccion, 'id'>) => void }) {
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [cat, setCat] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setCat(type === 'income' ? CATEGORIES_INCOME[0] : CATEGORIES_EXPENSE[0]);
  }, [type]);

  const handleSave = () => {
    const err: any = {};
    if (!desc.trim()) err.desc = "La descripción es requerida";
    if (!amount || parseFloat(amount) <= 0) err.amount = "El monto debe ser mayor a 0";
    if (!date) err.date = "Fecha inválida";
    if (!cat) err.cat = "Selecciona una categoría";

    if (Object.keys(err).length > 0) {
      setErrors(err);
      return;
    }

    onSave({ type, desc, amount: parseFloat(amount), cat, date, note });
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/40 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose}>
      <div className="bg-white border border-[#d8eadb] rounded-[24px] w-full max-w-lg shadow-[0_20px_60px_rgba(45,159,108,0.1)] overflow-hidden animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
        <div className="p-10">
          <h2 className="font-dm-serif text-3xl mb-8 text-[#2d5a3d]">Nueva Transacción</h2>
          
          <div className="space-y-6">
            {/* Toggle */}
            <div className="flex p-1.5 bg-[#f4faf6] rounded-xl border border-[#d8eadb]">
              <button onClick={() => setType('income')} className={`flex-1 flex items-center justify-center gap-2 py-3 text-[10px] font-black uppercase rounded-lg transition-all ${type === 'income' ? 'bg-[#2d5a3d] text-white shadow-md' : 'text-[#7a9b82] hover:text-[#2d5a3d]'}`}>▲ Ingreso</button>
              <button onClick={() => setType('expense')} className={`flex-1 flex items-center justify-center gap-2 py-3 text-[10px] font-black uppercase rounded-lg transition-all ${type === 'expense' ? 'bg-[#e74b6c] text-white shadow-md' : 'text-[#7a9b82] hover:text-[#e74b6c]'}`}>▼ Gasto</button>
            </div>

            {/* Desc */}
            <div className="space-y-1.5">
              <input 
                placeholder="ej. Sueldo, Supermercado..." value={desc} onChange={e => setDesc(e.target.value)}
                className={`w-full bg-[#f4faf6] border ${errors.desc ? 'border-[#e74b6c]' : 'border-[#d8eadb]'} p-4 rounded-2xl text-sm font-bold outline-none focus:border-[#2d5a3d] transition-all text-[#1a2e1e]`}
              />
              {errors.desc && <p className="text-[10px] text-[#e74b6c] font-black uppercase ml-2">{errors.desc}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <input 
                  type="number" placeholder="Monto (S/)" value={amount} onChange={e => setAmount(e.target.value)}
                  className={`w-full bg-[#f4faf6] border ${errors.amount ? 'border-[#e74b6c]' : 'border-[#d8eadb]'} p-4 rounded-2xl text-sm font-black outline-none focus:border-[#2d5a3d] transition-all text-[#1a2e1e]`}
                />
              </div>
              <div className="space-y-1.5">
                <input 
                  type="date" value={date} onChange={e => setDate(e.target.value)}
                  className={`w-full bg-[#f4faf6] border ${errors.date ? 'border-[#e74b6c]' : 'border-[#d8eadb]'} p-4 rounded-2xl text-xs font-black outline-none focus:border-[#2d5a3d] transition-all text-[#1a2e1e]`}
                />
              </div>
            </div>

            {/* Cat */}
            <select 
              value={cat} onChange={e => setCat(e.target.value)}
              className="w-full bg-[#f4faf6] border border-[#d8eadb] p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none focus:border-[#2d5a3d] transition-all cursor-pointer text-[#1a2e1e]"
            >
              {(type === 'income' ? CATEGORIES_INCOME : CATEGORIES_EXPENSE).map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            {/* Note */}
            <input 
              placeholder="Descripción adicional..." value={note} onChange={e => setNote(e.target.value)}
              className="w-full bg-[#f4faf6] border border-[#d8eadb] p-4 rounded-2xl text-xs font-medium outline-none focus:border-[#2d5a3d] transition-all text-[#1a2e1e]"
            />
          </div>

          <div className="flex gap-4 mt-12">
            <button onClick={onClose} className="flex-1 py-4 bg-[#f4faf6] text-[#7a9b82] rounded-2xl font-black uppercase text-[10px] tracking-widest hover:text-[#2d5a3d] transition-all border border-[#d8eadb]">Cancelar</button>
            <button onClick={handleSave} className="flex-1 py-4 bg-[#2d5a3d] text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-[#2d5a3d]/20 hover:scale-[1.02] transition-all">Guardar</button>
          </div>
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
                  <button onClick={() => { const n = {...vals}; delete n[cat]; setVals(n); }} className="opacity-0 group-hover:opacity-100 p-1 text-[#e74b6c] hover:bg-[#e74b6c]/10 rounded-md transition-all"><X size={12}/></button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#7a9b82]">S/</span>
                  <input 
                    type="number" value={limit} onChange={e => setVals({...vals, [cat]: parseFloat(e.target.value) || 0})}
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
