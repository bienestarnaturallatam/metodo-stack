'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/client';
import { useRouter } from 'next/navigation';
import TopNav from '@/components/TopNav';
import { I18nProvider, useTranslation } from '@/hooks/useTranslation';
import { 
  Wallet, TrendingUp, TrendingDown, Trash2, PieChart, Activity, Plus, 
  ArrowUpRight, ArrowDownRight, Target, CreditCard, LayoutDashboard, 
  Receipt, BarChart3, AlertCircle, Calendar
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
} from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

interface FinanceRecord {
  id: string;
  type: 'ingreso' | 'egreso' | 'ahorro' | 'deuda';
  category: string;
  amount: number;
  date: string;
  note?: string;
  target_amount?: number;
  current_progress?: number;
  is_fixed?: boolean;
  planned_amount?: number;
}


const COLORS = {
  header: '#2d5a3d',
  bg: '#f7f9f7',
  card: '#ffffff',
  border: '#d8eadb',
  text: '#1a2e1e',
  textSecondary: '#7a9b82',
  emerald: '#10b981',
  pink: '#e74b6c'
};

export default function FinanceClient(props: { userId: string, userEmail: string }) {
  return (
    <FinanceContent {...props} />
  );
}

function FinanceContent({ userId, userEmail }: { userId: string, userEmail: string }) {
  const router = useRouter();
  const supabase = createClient();
  const { t, lang } = useTranslation();
  const translations = useTranslation();
  const monthsShort = (translations as any).t('months_short') || [];

  const CATEGORIES = {
    ingreso: [
      t('finances_cat_salary'), t('finances_cat_freelance'), t('finances_cat_investment'), 
      t('finances_cat_sale'), t('finances_cat_gift'), t('finances_cat_others')
    ],
    egreso: [
      t('finances_cat_food'), t('finances_cat_housing'), t('finances_cat_transport'), 
      t('finances_cat_health'), t('finances_cat_education'), t('finances_cat_entertainment'), 
      t('finances_cat_subscriptions'), t('finances_cat_home'), t('finances_cat_clothing'), 
      t('finances_cat_technology'), t('finances_cat_others')
    ]
  };
  
  const [records, setRecords] = useState<FinanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [subTab, setSubTab] = useState<'dashboard' | 'transactions' | 'goals'>('dashboard');
  const [viewMonth, setViewMonth] = useState(new Date().getMonth());
  const [viewYear, setViewYear] = useState(new Date().getFullYear());
  
  // Forms
  const [activeTab, setActiveTab] = useState<'ingreso' | 'egreso' | 'ahorro' | 'deuda'>('ingreso');
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    target_amount: '',
    date: new Date().toISOString().split('T')[0],
    is_fixed: false,
    planned_amount: ''
  });

  async function fetchRecords() {
    setLoading(true);
    const { data, error } = await supabase
      .from('finances')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (data) setRecords(data);
    setLoading(false);
  }

  useEffect(() => {
    fetchRecords();
  }, [userId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(formData.amount) || 0;
    const target = parseFloat(formData.target_amount) || 0;
    const planned = parseFloat(formData.planned_amount) || 0;

    const { error } = await supabase
      .from('finances')
      .insert({
        user_id: userId,
        type: activeTab,
        category: formData.category || t('finances_cat_others'),
        amount: amount,
        target_amount: target,
        current_progress: activeTab === 'ahorro' || activeTab === 'deuda' ? amount : 0,
        date: formData.date,
        is_fixed: formData.is_fixed,
        planned_amount: planned
      });

    if (!error) {
      setFormData({ ...formData, amount: '', target_amount: '', category: '', planned_amount: '' });
      fetchRecords();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('finances_delete_confirm'))) return;
    await supabase.from('finances').delete().eq('id', id);
    fetchRecords();
  };

  // CALCULATIONS
  const now = new Date();
  const currentMonthRecords = records.filter(r => {
    const d = new Date(r.date + 'T00:00:00');
    return d.getMonth() === viewMonth && d.getFullYear() === viewYear;
  });

  const totals = useMemo(() => {
    let ingresos = 0, egresos = 0, ahorros = 0, deudas = 0;
    currentMonthRecords.forEach(r => {
      if (r.type === 'ingreso') ingresos += r.amount;
      else if (r.type === 'egreso') egresos += r.amount;
      else if (r.type === 'ahorro') ahorros += r.amount;
      else if (r.type === 'deuda') deudas += r.amount;
    });
    return { ingresos, egresos, ahorros, deudas, saldo: ingresos - egresos };
  }, [currentMonthRecords]);

  // Annual Totals for Report
  const annualReport = useMemo(() => {
    const monthsData = Array(12).fill(null).map(() => ({ ingresos: 0, egresos: 0 }));
    let totalIng = 0, totalEgr = 0;
    
    records.filter(r => new Date(r.date + 'T00:00:00').getFullYear() === viewYear).forEach(r => {
      const m = new Date(r.date + 'T00:00:00').getMonth();
      if (r.type === 'ingreso') { monthsData[m].ingresos += r.amount; totalIng += r.amount; }
      else if (r.type === 'egreso') { monthsData[m].egresos += r.amount; totalEgr += r.amount; }
    });

    return { months: monthsData, totalIng, totalEgr, saldoAnual: totalIng - totalEgr, avgMensual: totalEgr / 12 };
  }, [records, viewYear]);

  // Psychological Survival Days
  const survivalDays = useMemo(() => {
    const lastDay = new Date(viewYear, viewMonth + 1, 0).getDate();
    const day = (viewMonth === now.getMonth() && viewYear === now.getFullYear()) ? now.getDate() : 1;
    const daysLeft = lastDay - day + 1;
    const perDay = daysLeft > 0 ? totals.saldo / daysLeft : totals.saldo;
    return { daysLeft, perDay };
  }, [totals.saldo, viewMonth, viewYear]);

  const handleShareWhatsApp = () => {
    const monthName = monthsShort[viewMonth];
    const year = viewYear;
    
    let details = "";
    currentMonthRecords.forEach(r => {
      const typeIcon = r.type === 'ingreso' ? '✅' : '❌';
      const amountSign = r.type === 'ingreso' ? '+' : '-';
      details += `${typeIcon} ${r.date} | ${r.category} | ${amountSign} S/ ${r.amount.toFixed(2)}\n`;
    });

    if (currentMonthRecords.length === 0) {
      details = t('finances_no_transactions');
    }

    const message = `📊 *HISTORIAL OPERATIVO - ${monthName} ${year}* 📊\n\n` +
      `💰 *RESUMEN MENSUAL*\n` +
      `- Ingresos: S/ ${totals.ingresos.toFixed(2)}\n` +
      `- Gastos: S/ ${totals.egresos.toFixed(2)}\n` +
      `- Saldo: S/ ${totals.saldo.toFixed(2)}\n\n` +
      `📝 *DETALLE DE TRANSACCIONES*\n` +
      `${details}\n\n` +
      `🚀 *Generado por MÉTODO STACK*`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#f7f9f7] text-[#1a2e1e] font-sans selection:bg-[#2d5a3d]/10">
      <TopNav 
        page="finances" 
        setPage={(p) => {
          if (p === 'tracker') router.push('/tracker');
          else if (p === 'planner') router.push('/planner');
        }} 
        userEmail={userEmail} 
        userTier="trial" 
        isPaid={false} 
      />

      {/* SUB-NAV SECTION */}
      <div className="bg-white border-b border-[#d8eadb] shadow-sm sticky top-[54px] z-[100]">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between px-6">
          <div className="flex gap-2 sm:gap-8">
            {[
              { id: 'transactions', label: t('finances_transactions'), icon: <Receipt className="w-4 h-4" /> },
              { id: 'goals', label: t('finances_savings_debts'), icon: <Target className="w-4 h-4" /> },
              { id: 'dashboard', label: t('finances_dashboard'), icon: <LayoutDashboard className="w-4 h-4" /> }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setSubTab(tab.id as any)}
                className={`flex items-center gap-2 py-4 px-2 text-[11px] font-black uppercase tracking-widest border-b-2 transition-all
                  ${subTab === tab.id ? 'border-[#2d5a3d] text-[#2d5a3d]' : 'border-transparent text-[#7a9b82] hover:text-[#2d5a3d]'}`}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 py-3">
             <div className="flex items-center gap-2 bg-[#f4faf6] border border-[#d8eadb] rounded-lg px-3 py-1.5 shadow-inner">
               <select 
                value={viewMonth} onChange={(e) => setViewMonth(parseInt(e.target.value))}
                className="bg-transparent text-[10px] font-black uppercase outline-none text-[#2d5a3d] cursor-pointer"
               >
                 {monthsShort.map((m: string, i: number) => <option key={m} value={i}>{m}</option>)}
               </select>
               <div className="w-px h-3 bg-[#d8eadb]" />
               <select 
                value={viewYear} onChange={(e) => setViewYear(parseInt(e.target.value))}
                className="bg-transparent text-[10px] font-black uppercase outline-none text-[#2d5a3d] cursor-pointer"
               >
                 {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map(y => <option key={y} value={y}>{y}</option>)}
               </select>
             </div>
          </div>
        </div>
      </div>

      <main className="max-w-[1200px] mx-auto p-4 sm:p-10">

        {subTab === 'dashboard' && (
          <div className="animate-in fade-in duration-500 space-y-8">
            {/* ANNUAL METRICS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { label: t('finances_annual_income'), val: annualReport.totalIng, color: '#2d5a3d', icon: <ArrowUpRight /> },
                { label: t('finances_annual_expenses'), val: annualReport.totalEgr, color: '#e74b6c', icon: <ArrowDownRight /> },
                { label: t('finances_annual_balance'), val: annualReport.saldoAnual, color: '#2d5a3d', icon: <Wallet /> },
                { label: t('finances_monthly_average'), val: annualReport.avgMensual, color: '#7a9b82', icon: <BarChart3 /> }
              ].map(m => (
                <div key={m.label} className="bg-white border border-[#d8eadb] p-6 rounded-[32px] shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <p className="text-[9px] font-black uppercase text-[#7a9b82] tracking-widest">{m.label}</p>
                    <div className="text-[#d8eadb]">{m.icon}</div>
                  </div>
                  <h3 className="text-2xl font-black tracking-tighter" style={{ color: m.color }}>S/ {m.val.toLocaleString(lang === 'es' ? 'es-PE' : lang === 'en' ? 'en-US' : 'pt-BR')}</h3>
                </div>
              ))}
            </div>

            {/* COMPARATIVE CHART */}
            <div className="bg-white border border-[#d8eadb] rounded-[40px] p-8 shadow-sm">
               <h4 className="text-[11px] font-black uppercase text-[#2d5a3d] tracking-[0.3em] mb-10 flex items-center gap-3">
                 <BarChart3 className="w-4 h-4" /> {t('finances_comparative_report')} {viewYear}
               </h4>
               <div className="h-[350px]">
                 <Bar 
                  data={{
                    labels: monthsShort,
                    datasets: [
                      { label: t('finances_income'), data: annualReport.months.map(m => m.ingresos), backgroundColor: '#2d5a3d', borderRadius: 6 },
                      { label: t('finances_expenses'), data: annualReport.months.map(m => m.egresos), backgroundColor: '#d8eadb', borderRadius: 6 }
                    ]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'bottom', labels: { font: { size: 10, weight: 'bold' }, color: '#7a9b82' } } },
                    scales: {
                      y: { grid: { color: '#f4faf6' }, ticks: { font: { size: 9, weight: 'bold' }, color: '#7a9b82' } },
                      x: { grid: { display: false }, ticks: { font: { size: 9, weight: 'bold' }, color: '#7a9b82' } }
                    }
                  }}
                 />
               </div>
            </div>

            {/* SURVIVAL & CATEGORIES GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
               {/* Survival Widget */}
               <div className="bg-[#2d5a3d] text-white rounded-[40px] p-10 relative overflow-hidden group shadow-xl">
                 <div className="relative z-10">
                   <div className="flex items-center gap-3 mb-6 opacity-60">
                     <Calendar className="w-4 h-4" />
                     <p className="text-[10px] font-black uppercase tracking-widest">{t('finances_survival_calc')}</p>
                   </div>
                   <h2 className="text-5xl font-black tracking-tighter mb-4">
                     {survivalDays.daysLeft} <span className="text-white/40 text-2xl">{t('finances_days_remaining')}</span>
                   </h2>
                   <p className="text-white/60 text-xs font-bold mb-8 uppercase tracking-widest">{t('finances_daily_budget')}</p>
                   <div className="flex items-baseline gap-2">
                     <span className="text-4xl font-black tracking-tighter text-[#10b981]">S/ {survivalDays.perDay.toFixed(2)}</span>
                     <span className="text-[10px] font-bold text-white/40">{t('finances_per_day')}</span>
                   </div>
                 </div>
                 <div className="absolute top-[-20%] right-[-10%] w-48 h-48 bg-white/5 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-1000" />
               </div>

               {/* Budget Semaphore */}
               <div className="bg-white border border-[#d8eadb] rounded-[40px] p-10 shadow-sm">
                 <h4 className="text-[10px] font-black uppercase text-[#7a9b82] tracking-widest mb-8">{t('finances_budget_semaphore')}</h4>
                 <div className="space-y-6">
                   {currentMonthRecords.filter(r => r.type === 'egreso' && r.planned_amount).map(r => {
                     const over = r.amount > (r.planned_amount || 0);
                     const pct = Math.min(100, (r.amount / (r.planned_amount || 1)) * 100);
                     return (
                       <div key={r.id}>
                         <div className="flex justify-between items-end mb-2">
                           <p className="text-xs font-black uppercase text-[#2d5a3d]">{r.category}</p>
                           <p className={`text-xs font-black ${over ? 'text-[#e74b6c]' : 'text-[#2d5a3d]'}`}>S/ {r.amount} / S/ {r.planned_amount}</p>
                         </div>
                         <div className="h-2 bg-[#f4faf6] rounded-full overflow-hidden border border-[#d8eadb]">
                           <div className={`h-full transition-all duration-1000 ${over ? 'bg-[#e74b6c]' : 'bg-[#2d5a3d]'}`} style={{ width: `${pct}%` }} />
                         </div>
                       </div>
                     );
                   })}
                   {currentMonthRecords.filter(r => r.type === 'egreso' && r.planned_amount).length === 0 && (
                     <p className="text-xs italic text-[#7a9b82] text-center py-10">{t('finances_no_planned_budgets')}</p>
                   )}
                 </div>
               </div>
            </div>
          </div>
        )}

        {subTab === 'transactions' && (
          <div className="animate-in slide-in-from-right-8 duration-500 grid grid-cols-1 lg:grid-cols-12 gap-8">
             {/* LEFT: Form */}
             <div className="lg:col-span-5">
               <div className="bg-white border border-[#d8eadb] rounded-[40px] p-10 shadow-xl sticky top-40">
                  <div className="flex gap-2 p-1.5 bg-[#f4faf6] border border-[#d8eadb] rounded-2xl shadow-inner mb-8">
                    {['ingreso','egreso'].map(tType => (
                      <button 
                        key={tType} onClick={() => setActiveTab(tType as any)}
                        className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === tType ? 'bg-[#2d5a3d] text-white shadow-md' : 'text-[#7a9b82] hover:text-[#2d5a3d]'}`}
                      >
                        {tType === 'ingreso' ? t('finances_income') : t('finances_expenses')}
                      </button>
                    ))}
                  </div>

                  <form onSubmit={handleAdd} className="space-y-6">
                    <div className="relative">
                      <label className="absolute -top-2 left-4 px-2 bg-white text-[9px] font-black uppercase text-[#7a9b82]">{t('finances_category')}</label>
                      <input 
                        type="text" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}
                        placeholder={lang === 'es' ? 'Ej: Alimentación, Salario...' : lang === 'en' ? 'e.g., Food, Salary...' : 'Ex: Alimentação, Salário...'}
                        className="w-full bg-[#f4faf6]/50 border-2 border-[#d8eadb] p-4 rounded-2xl text-xs font-bold outline-none focus:border-[#2d5a3d]"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="relative">
                        <label className="absolute -top-2 left-4 px-2 bg-white text-[9px] font-black uppercase text-[#7a9b82]">{t('finances_real_amount')}</label>
                        <input 
                          type="number" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})}
                          className="w-full bg-[#f4faf6]/50 border-2 border-[#d8eadb] p-4 rounded-2xl text-lg font-black outline-none focus:border-[#2d5a3d]"
                        />
                      </div>
                      <div className="relative">
                        <label className="absolute -top-2 left-4 px-2 bg-white text-[9px] font-black uppercase text-[#7a9b82]">{t('finances_date')}</label>
                        <input 
                          type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})}
                          className="w-full bg-[#f4faf6]/50 border-2 border-[#d8eadb] p-4 rounded-2xl text-[13px] font-bold outline-none focus:border-[#2d5a3d]"
                        />
                      </div>
                    </div>
                    <div className="relative">
                      <label className="absolute -top-2 left-4 px-2 bg-white text-[9px] font-black uppercase text-[#7a9b82]">{t('finances_planned_amount_opt')}</label>
                      <input 
                        type="number" value={formData.planned_amount} onChange={(e) => setFormData({...formData, planned_amount: e.target.value})}
                        className="w-full bg-[#f4faf6]/50 border-2 border-[#d8eadb] p-4 rounded-2xl text-xs font-black outline-none focus:border-[#2d5a3d]"
                      />
                    </div>
                    <div className="flex items-center gap-3 px-4">
                      <input 
                        type="checkbox" checked={formData.is_fixed} onChange={(e) => setFormData({...formData, is_fixed: e.target.checked})}
                        className="w-4 h-4 rounded border-[#d8eadb] text-[#2d5a3d] focus:ring-[#2d5a3d]"
                      />
                      <span className="text-[10px] font-black uppercase text-[#7a9b82]">{t('finances_fixed_expense_q')}</span>
                    </div>
                    <button type="submit" className="w-full py-5 bg-[#2d5a3d] text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-[#2d5a3d]/20 hover:scale-[1.02] transition-all">
                      {t('finances_register_transaction')}
                    </button>
                  </form>
               </div>
             </div>

             {/* RIGHT: Table */}
             <div className="lg:col-span-7 bg-white border border-[#d8eadb] rounded-[40px] p-8 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="text-[10px] font-black uppercase text-[#7a9b82] tracking-widest">{t('finances_operational_history')}</h4>
                  <button 
                    onClick={handleShareWhatsApp}
                    className="flex items-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white px-3 py-1.5 rounded-full transition-all text-[9px] font-black uppercase tracking-widest shadow-md hover:scale-105 active:scale-95"
                  >
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    Enviar Historial
                  </button>
                </div>
                <div className="divide-y divide-[#f4faf6]">
                  {currentMonthRecords.map(r => (
                    <div key={r.id} className="py-4 flex justify-between items-center group">
                      <div>
                        <p className="text-xs font-black text-[#2d5a3d] uppercase">{r.category}</p>
                        <p className="text-[9px] font-bold text-[#7a9b82] uppercase">{r.is_fixed ? t('finances_fixed') : t('finances_variable')} • {r.date}</p>
                      </div>
                      <div className="flex items-center gap-6">
                        <p className={`text-lg font-black tracking-tighter ${r.type === 'ingreso' ? 'text-[#10b981]' : 'text-[#e74b6c]'}`}>
                          {r.type === 'ingreso' ? '+' : '-'} S/ {r.amount.toFixed(2)}
                        </p>
                        <button onClick={() => handleDelete(r.id)} className="p-2 opacity-0 group-hover:opacity-100 text-[#d8eadb] hover:text-[#e74b6c] transition-all">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {currentMonthRecords.length === 0 && <p className="py-20 text-center text-xs text-[#7a9b82] italic font-bold uppercase tracking-widest">{t('finances_no_transactions')}</p>}
                </div>
              </div>
            </div>
        )}

        {subTab === 'goals' && (
          <div className="animate-in zoom-in-95 duration-500 space-y-8">
            {/* GOALS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Add Goal Form */}
              <div className="bg-white border-2 border-dashed border-[#d8eadb] rounded-[40px] p-10 flex flex-col justify-center items-center text-center group hover:border-[#2d5a3d]/30 transition-all">
                <div className="w-16 h-16 bg-[#f4faf6] rounded-full flex items-center justify-center text-[#2d5a3d] mb-6 group-hover:scale-110 transition-transform">
                  <Plus className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-black text-[#2d5a3d] mb-8">{t('finances_new_goal_debt')}</h4>
                <div className="flex gap-2 p-1.5 bg-[#f4faf6] rounded-2xl mb-6 w-full">
                  <button onClick={() => setActiveTab('ahorro')} className={`flex-1 py-2 text-[9px] font-black uppercase rounded-lg ${activeTab === 'ahorro' ? 'bg-[#2d5a3d] text-white shadow-md' : 'text-[#7a9b82]'}`}>{t('finances_saving')}</button>
                  <button onClick={() => setActiveTab('deuda')} className={`flex-1 py-2 text-[9px] font-black uppercase rounded-lg ${activeTab === 'deuda' ? 'bg-[#2d5a3d] text-white shadow-md' : 'text-[#7a9b82]'}`}>{t('finances_debt')}</button>
                </div>
                <input 
                  type="text" placeholder={t('finances_goal_placeholder')} value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full bg-[#f4faf6] border border-[#d8eadb] p-3 rounded-xl text-xs font-bold mb-3 outline-none"
                />
                <div className="grid grid-cols-2 gap-2 w-full mb-6">
                  <input type="number" placeholder={t('finances_goal_target')} value={formData.target_amount} onChange={(e) => setFormData({...formData, target_amount: e.target.value})} className="bg-[#f4faf6] border border-[#d8eadb] p-3 rounded-xl text-xs font-bold outline-none"/>
                  <input type="number" placeholder={t('finances_current')} value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} className="bg-[#f4faf6] border border-[#d8eadb] p-3 rounded-xl text-xs font-bold outline-none"/>
                </div>
                <button onClick={handleAdd} className="w-full py-4 bg-[#2d5a3d] text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg">{t('finances_create_goal')}</button>
              </div>

              {/* PROGRESS CIRCLES - SAVINGS */}
              {records.filter(r => r.type === 'ahorro').map(r => {
                const pct = Math.min(100, Math.round(((r.current_progress || 0) / (r.target_amount || 1)) * 100));
                return (
                  <div key={r.id} className="bg-white border border-[#d8eadb] rounded-[40px] p-10 flex flex-col items-center text-center relative group">
                    <div className="relative w-40 h-40 mb-8">
                       <Doughnut 
                        data={{
                          datasets: [{ data: [pct, 100-pct], backgroundColor: ['#2d5a3d', '#f4faf6'], borderWidth: 0 }]
                        }}
                        options={{ cutout: '85%', plugins: { tooltip: { enabled: false } } }}
                       />
                       <div className="absolute inset-0 flex flex-col items-center justify-center">
                         <p className="text-3xl font-black tracking-tighter text-[#2d5a3d]">{pct}%</p>
                         <p className="text-[9px] font-black uppercase text-[#7a9b82]">{t('finances_achieved')}</p>
                       </div>
                    </div>
                    <h4 className="text-lg font-black text-[#2d5a3d] uppercase tracking-tighter mb-2">{r.category}</h4>
                    <p className="text-[10px] font-bold text-[#7a9b82] uppercase mb-6">{t('finances_goal_label')}: S/ {r.target_amount}</p>
                    <div className="w-full h-px bg-[#f4faf6] mb-6" />
                    <button onClick={() => handleDelete(r.id)} className="absolute top-6 right-6 p-2 text-[#d8eadb] hover:text-[#e74b6c] transition-all opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4" /></button>
                    <div className="flex items-center gap-2 text-[10px] font-black text-[#10b981] bg-[#f4faf6] px-4 py-1.5 rounded-full border border-[#d8eadb]">
                      <ArrowUpRight className="w-3.5 h-3.5" /> {t('finances_active_progress')}
                    </div>
                  </div>
                )
              })}

              {/* PROGRESS BARS - DEBT */}
              {records.filter(r => r.type === 'deuda').map(r => {
                const pct = Math.min(100, Math.round(((r.current_progress || 0) / (r.target_amount || 1)) * 100));
                return (
                  <div key={r.id} className="bg-white border border-[#d8eadb] rounded-[40px] p-10 flex flex-col group relative">
                    <div className="flex justify-between items-start mb-8">
                      <div className="w-12 h-12 bg-[#fff5f6] border border-[#ffe4e8] rounded-2xl flex items-center justify-center text-[#e74b6c]">
                        <CreditCard className="w-6 h-6" />
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-[#7a9b82] uppercase tracking-widest">{t('finances_debt_liquidation')}</p>
                        <h4 className="text-lg font-black text-[#2d5a3d] uppercase">{r.category}</h4>
                      </div>
                    </div>
                    <div className="space-y-4 mb-8">
                       <div className="flex justify-between items-end text-[10px] font-black uppercase tracking-widest">
                         <span className="text-[#e74b6c]">{t('finances_paid')} S/ {r.current_progress}</span>
                         <span className="text-[#7a9b82]">{t('finances_goal_label')} S/ {r.target_amount}</span>
                       </div>
                       <div className="h-4 bg-[#f4faf6] rounded-full overflow-hidden border border-[#d8eadb] p-1">
                         <div className="h-full bg-[#e74b6c] rounded-full transition-all duration-1000" style={{ width: `${pct}%` }} />
                       </div>
                       <p className="text-center text-[10px] font-black text-[#e74b6c]">{pct}% {t('finances_total_pct')}</p>
                    </div>
                    <button onClick={() => handleDelete(r.id)} className="absolute bottom-10 right-10 p-2 text-[#d8eadb] hover:text-[#e74b6c] opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="w-4 h-4" /></button>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* FOOTER QUOTE */}
        <div className="text-center mt-20 opacity-30">
           <p className="text-[#2d5a3d] font-medium italic text-sm">
             {t('finances_footer_quote')}
           </p>
        </div>

      </main>
    </div>
  );
}
