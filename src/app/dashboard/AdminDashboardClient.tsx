'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/client';
import Link from 'next/link';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

export default function AdminDashboardClient({ userId, profile }: { userId: string, profile: any }) {
  const supabase = useMemo(() => createClient(), []);
  const [emailToActivate, setEmailToActivate] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [sentMessages, setSentMessages] = useState<Set<string>>(new Set());
  const [prospectSearch, setProspectSearch] = useState('');
  const [clientSearch, setClientSearch] = useState('');
  const [clientSortBy, setClientSortBy] = useState<'plan_starts_at' | 'created_at'>('plan_starts_at');
  const [clientSortOrder, setClientSortOrder] = useState<'asc' | 'desc'>('desc');

  const markAsSent = (id: string) => {
    setSentMessages(prev => {
      const next = new Set(prev).add(id);
      localStorage.setItem('admin_sent_messages', JSON.stringify(Array.from(next)));
      return next;
    });
  };

  useEffect(() => {
    const saved = localStorage.getItem('admin_sent_messages');
    if (saved) {
      try {
        setSentMessages(new Set(JSON.parse(saved)));
      } catch (e) {
        console.error('Error loading sent messages:', e);
      }
    }
  }, []);

  async function fetchUsers() {
    setFetchError(null);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('ERROR AL CARGAR USUARIOS:', error.message);
      setFetchError(error.message);
    }
    
    if (data) {
      setUsers(data);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchUsers();
    const channel = supabase
      .channel('admin_audit')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => fetchUsers())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const getDeviceIcon = (ua: string) => {
    if (!ua) return 'Web';
    const lower = ua.toLowerCase();
    if (lower.includes('iphone') || lower.includes('ipad')) return 'iOS';
    if (lower.includes('android')) return 'Android';
    if (lower.includes('windows')) return 'Windows';
    if (lower.includes('macintosh')) return 'MacOS';
    return 'Web';
  };

  const getTrialDay = (createdAt: string) => {
    if (!createdAt) return 0;
    const start = new Date(createdAt);
    const now = new Date();
    const diffHours = (now.getTime() - start.getTime()) / (1000 * 60 * 60);
    if (diffHours < 24) return 1;
    if (diffHours < 48) return 2;
    if (diffHours < 72) return 3;
    return 4; // Expirado
  };

  const getCountryData = (phone: string) => {
    if (!phone) return { flag: '🌐', name: 'N/A' };
    const p = phone.replace(/\s/g, '');
    if (p.startsWith('+51')) return { flag: '🇵🇪', name: 'Perú' };
    if (p.startsWith('+1')) return { flag: '🇺🇸', name: 'USA/CA' };
    if (p.startsWith('+52')) return { flag: '🇲🇽', name: 'México' };
    if (p.startsWith('+54')) return { flag: '🇦🇷', name: 'Argentina' };
    if (p.startsWith('+55')) return { flag: '🇧🇷', name: 'Brasil' };
    if (p.startsWith('+56')) return { flag: '🇨🇱', name: 'Chile' };
    if (p.startsWith('+57')) return { flag: '🇨🇴', name: 'Colombia' };
    if (p.startsWith('+58')) return { flag: '🇻🇪', name: 'Venezuela' };
    if (p.startsWith('+591')) return { flag: '🇧🇴', name: 'Bolivia' };
    if (p.startsWith('+593')) return { flag: '🇪🇨', name: 'Ecuador' };
    if (p.startsWith('+598')) return { flag: '🇺🇾', name: 'Uruguay' };
    if (p.startsWith('+595')) return { flag: '🇵🇾', name: 'Paraguay' };
    if (p.startsWith('+34')) return { flag: '🇪🇸', name: 'España' };
    if (p.startsWith('+351')) return { flag: '🇵🇹', name: 'Portugal' };
    if (p.startsWith('+506')) return { flag: '🇨🇷', name: 'Costa Rica' };
    if (p.startsWith('+502')) return { flag: '🇬🇹', name: 'Guatemala' };
    if (p.startsWith('+503')) return { flag: '🇸🇻', name: 'El Salvador' };
    if (p.startsWith('+504')) return { flag: '🇭🇳', name: 'Honduras' };
    if (p.startsWith('+505')) return { flag: '🇳🇮', name: 'Nicaragua' };
    if (p.startsWith('+507')) return { flag: '🇵🇦', name: 'Panamá' };
    if (p.startsWith('+53')) return { flag: '🇨🇺', name: 'Cuba' };
    if (p.startsWith('+1809') || p.startsWith('+1829') || p.startsWith('+1849')) return { flag: '🇩🇴', name: 'R. Dom' };
    return { flag: '🌍', name: 'Otro' };
  };

  const activateUser = async (newTier: string, isUSD: boolean) => {
    if (!emailToActivate) { alert('Primero haz clic en el "+" del prospecto o escribe su email'); return; }
    const now = new Date();
    const expiry = new Date();
    expiry.setFullYear(now.getFullYear() + 1);

    console.log('Intentando activar:', emailToActivate, newTier, isUSD);

    // Intento 1: Con is_usd
    const { error: error1 } = await supabase
      .from('profiles')
      .update({
        tier: newTier,
        is_paid: true,
        is_usd: isUSD,
        plan_starts_at: now.toISOString(),
        plan_expires_at: expiry.toISOString(),
        updated_at: now.toISOString()
      })
      .eq('email', emailToActivate);

    if (error1) {
      console.warn('Fallo intento 1 (posible falta columna is_usd):', error1.message);
      // Intento 2: Sin is_usd (fallback)
      const { error: error2 } = await supabase
        .from('profiles')
        .update({
          tier: newTier,
          is_paid: true,
          plan_starts_at: now.toISOString(),
          plan_expires_at: expiry.toISOString(),
          updated_at: now.toISOString()
        })
        .eq('email', emailToActivate);

      if (error2) {
        alert(`Error crítico: ${error2.message}`);
      } else {
        alert(`Activado con éxito (Sin registro de moneda): ${emailToActivate}`);
        setEmailToActivate('');
        fetchUsers();
      }
    } else {
      alert(`Activado con éxito (${isUSD ? '$' : 'S/'}): ${emailToActivate}`);
      setEmailToActivate('');
      fetchUsers();
    }
  };

  const toggleUserStatus = async (u: any) => {
    const currentTier = u.tier || 'trial';
    let newTier: string;
    
    if (currentTier.startsWith('suspended_')) {
      newTier = currentTier.replace('suspended_', '');
    } else {
      newTier = `suspended_${currentTier}`;
    }

    // Actualizamos por EMAIL para afectar a todas las posibles cuentas duplicadas
    const { error } = await supabase
      .from('profiles')
      .update({ tier: newTier, updated_at: new Date().toISOString() })
      .eq('email', u.email);

    if (error) alert(error.message);
    else fetchUsers();
  };

  const [showAddModal, setShowAddModal] = useState(false);
  const [showSalesModal, setShowSalesModal] = useState(false);
  const [selectedSalesDay, setSelectedSalesDay] = useState(new Date().getDate());
  const [viewMonth, setViewMonth] = useState(new Date().getMonth());
  const [viewYear, setViewYear] = useState(new Date().getFullYear());
  const [trendYear, setTrendYear] = useState(new Date().getFullYear());
  const [newP, setNewP] = useState({ email: '', phone: '' });

  const prospects = users.filter(u => 
    u.tier === 'trial' || 
    u.tier === 'free' || 
    u.tier === 'suspended' || 
    u.tier?.startsWith('suspended_trial')
  );

  const activeClients = users
    .filter(u => 
      !['trial', 'free', 'suspended'].includes(u.tier) && 
      !u.tier?.startsWith('suspended_trial')
    )
    .sort((a, b) => {
      const valA = a[clientSortBy];
      const valB = b[clientSortBy];
      if (!valA) return 1;
      if (!valB) return -1;
      const dateA = new Date(valA).getTime();
      const dateB = new Date(valB).getTime();
      return clientSortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

  const getSalesStats = () => {
    const stats: { [key: number]: { soles: number, usd: number, count: number } } = {};
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    for (let i = 1; i <= daysInMonth; i++) {
      stats[i] = { soles: 0, usd: 0, count: 0 };
    }

    activeClients.forEach(u => {
      if (!u.plan_starts_at) return;
      const date = new Date(u.plan_starts_at);
      if (date.getMonth() !== viewMonth || date.getFullYear() !== viewYear) return;
      
      const day = date.getDate();
      const isH = u.tier?.includes('habitos') || u.tier?.includes('enfoque') || u.tier?.includes('tareas');
      const price = u.is_usd 
        ? (isH ? 7.90 : 13.90) 
        : (isH ? 9.90 : 19.90);
      
      if (u.is_usd) stats[day].usd += price;
      else stats[day].soles += price;
      stats[day].count += 1;
    });

    return stats;
  };

  const getSalesByCountry = () => {
    const stats: { [key: string]: { soles: number, usd: number, count: number } } = {};
    activeClients.forEach(u => {
      if (!u.plan_starts_at) return;
      const date = new Date(u.plan_starts_at);
      if (date.getMonth() !== viewMonth || date.getFullYear() !== viewYear) return;
      
      const country = getCountryData(u.phone_number).name;
      if (!stats[country]) stats[country] = { soles: 0, usd: 0, count: 0 };
      
      const isH = u.tier?.includes('habitos') || u.tier?.includes('enfoque') || u.tier?.includes('tareas');
      const price = u.is_usd ? (isH ? 7.90 : 13.90) : (isH ? 9.90 : 19.90);
      
      if (u.is_usd) stats[country].usd += price;
      else stats[country].soles += price;
      stats[country].count += 1;
    });
    return stats;
  };

  const getYearlyTrend = (year: number) => {
    const trend: { [key: string]: { soles: number, usd: number } } = {};
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    months.forEach((mName, idx) => {
      trend[mName] = { soles: 0, usd: 0 };
      activeClients.forEach(u => {
        if (!u.plan_starts_at) return;
        const pDate = new Date(u.plan_starts_at);
        if (pDate.getMonth() === idx && pDate.getFullYear() === year) {
           const isH = u.tier?.includes('habitos') || u.tier?.includes('tareas');
           const price = u.is_usd ? (isH ? 12 : 19.90) : (isH ? 19.90 : 34.90);
           if (u.is_usd) trend[mName].usd += price;
           else trend[mName].soles += price;
        }
      });
    });
    return trend;
  };

  const todaySales = () => {
    let s = 0; let u = 0;
    const today = new Date().toLocaleDateString();
    activeClients.forEach(c => {
      if (!c.plan_starts_at) return;
      if (new Date(c.plan_starts_at).toLocaleDateString() === today) {
        const isH = c.tier?.includes('habitos') || c.tier?.includes('tareas');
        if (c.is_usd) u += (isH ? 12 : 19.90);
        else s += (isH ? 19.90 : 34.90);
      }
    });
    return { s, u };
  };

  const downloadCSV = (data: any[], filename: string) => {
    if (data.length === 0) { alert('No hay datos para exportar'); return; }
    
    // Generar HTML simple para Excel con soporte de acentos (UTF-8)
    const headers = Object.keys(data[0]);
    const html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8">
        <style>
          table { border-collapse: collapse; } 
          td, th { border: 1px solid #000; padding: 5px; text-align: left; }
          th { background-color: #f2f2f2; font-weight: bold; }
        </style>
      </head>
      <body>
        <table>
          <thead>
            <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
          </thead>
          <tbody>
            ${data.map(row => `
              <tr>${headers.map(h => `<td>${row[h] || ''}</td>`).join('')}</tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;

    // Añadimos el BOM (Byte Order Mark) para que Excel reconozca UTF-8 correctamente
    const blob = new Blob(['\uFEFF', html], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    
    // Aseguramos que el nombre termine en .xls
    const finalFilename = filename.toLowerCase().endsWith('.xls') ? filename : `${filename}.xls`;
    link.download = finalFilename;
    
    document.body.appendChild(link);
    link.click();
    
    // Limpieza
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
  };

  const handleAddProspect = async () => {
    if (!newP.email) { alert('Email obligatorio'); return; }
    
    // Generamos un ID manual. NOTA: Si profiles.id tiene una FK a auth.users, 
    // esto fallará a menos que se elimine la restricción en Supabase.
    const manualId = crypto.randomUUID();
    
    const { error } = await supabase.from('profiles').insert([{
      id: manualId,
      email: newP.email,
      phone_number: newP.phone || '',
      tier: 'trial',
      plan_expires_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }]);

    if (error) {
      console.error('Error al añadir prospecto:', error);
      if (error.message.includes('foreign key') || error.code === '23503') {
        alert('ERROR DE PERMISOS: Para añadir prospectos manuales, debes ejecutar este comando en el SQL Editor de Supabase:\n\nALTER TABLE profiles ALTER COLUMN id DROP DEFAULT;\nALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;');
      } else if (error.code === '23505') {
        alert('Error: Este correo ya existe en la base de datos.');
      } else {
        alert('Error al guardar: ' + error.message);
      }
    } else {
      alert('¡Prospecto añadido con éxito!');
      setShowAddModal(false);
      setNewP({ email: '', phone: '' });
      fetchUsers();
    }
  };

  const deleteUser = async (u: any) => {
    if (!confirm(`¿ESTÁS SEGURO? Se borrarán permanentemente todos los hábitos, finanzas, tareas y sesiones para el correo ${u.email}. Esta acción no se puede deshacer.`)) return;
    
    setLoading(true);
    try {
      console.log('Iniciando eliminación total por email:', u.email);
      
      // Lista de tablas a limpiar en orden de dependencia
      const tables = [
        { name: 'user_sessions', col: 'user_id' },
        { name: 'habit_logs', col: 'user_id' },
        { name: 'completions', col: 'user_id' },
        { name: 'habits', col: 'user_id' },
        { name: 'mood_logs', col: 'user_id' },
        { name: 'finances', col: 'user_id' },
        { name: 'tasks', col: 'user_id' },
        { name: 'weekly_planner_data', col: 'user_id' }
      ];

      for (const table of tables) {
        const { error } = await supabase.from(table.name).delete().eq(table.col, u.id);
        if (error) console.warn(`Aviso: No se pudo limpiar la tabla ${table.name}:`, error.message);
      }
      
      // Finalmente borrar el perfil principal por EMAIL (esto borra todos los duplicados)
      const { error: profileError } = await supabase.from('profiles').delete().eq('email', u.email);
      
      if (profileError) {
        console.error('Error final al borrar perfil:', profileError);
        alert('No se pudo eliminar el perfil principal: ' + profileError.message);
      } else {
        alert('¡Usuario y sus posibles duplicados eliminados completamente!');
        fetchUsers();
      }
    } catch (err: any) {
      console.error('Error crítico:', err);
      alert('Error inesperado: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetSessions = async (u: any) => {
    if (!confirm(`¿Restablecer sesiones para ${u.email}? Se cerrarán todos sus dispositivos.`)) return;
    
    // 1. Borrar de user_sessions
    const { error: error1 } = await supabase
      .from('user_sessions')
      .delete()
      .eq('user_id', u.id);

    if (error1) {
      alert('Error al borrar sesiones: ' + error1.message);
      return;
    }

    // 2. Limpiar contador en profiles
    const { error: error2 } = await supabase
      .from('profiles')
      .update({
        session_count: 0,
        is_flagged: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', u.id);

    if (error2) {
      alert('Error al actualizar contador: ' + error2.message);
    } else {
      alert('Sesiones restablecidas con éxito');
      fetchUsers();
    }
  };


  const sendWhatsAppTrialWelcome = (u: any, isUSD: boolean) => {
    const individual = isUSD ? "Plan Individual (Hábitos O Enfoque) - $ 7.90 USD" : "Plan Individual (Hábitos, Enfoque , finanza, o Recursos) -Cada uno  S/ 9.90";
    const planMax = isUSD ? "PlanMax (Hábitos + Enfoque + Finanzas) - $ 13.90 USD" : "Stack completo (Hábitos + Enfoque + Finanzas + Recursos) - S/ 19.90";
    const message = `Hola! Tu acceso de prueba a la Plataforma SaaS METODO STACK ha sido activado por 3 días. \n\nCorreo: ${u.email}\nClave: Usa la que registraste o la universal 123456\nLogin: https://metodostack.com/login\n\nPasados los 3 días puedes activar tu cuenta anual y obtener:\n✅ Acceso completo a la Plataforma SaaS Método Stack.\n✅ Gestión inteligente de hábitos y enfoque desde cualquier dispositivo.\n🎁 INCLUYE DE REGALO: Plantillas Maestras descargables en Google Sheets (Hábitos y Enfoque).\n\nPrecios promocionales para nuestros planes anuales:\n- ${individual}\n- ${planMax}`;
    window.open(`https://wa.me/${u.phone_number || ''}?text=${encodeURIComponent(message)}`, '_blank');
    markAsSent(u.id + (isUSD ? '_welcome_usd' : '_welcome_soles'));
  };

  const sendWhatsAppTrialInvitation = (u: any, isUSD: boolean) => {
    const individual = isUSD ? "$ 7.90 USD" : "Cada uno S/ 9.90";
    const planMax = isUSD ? "$ 13.90 USD" : "S/ 19.90";
    const message = `Hola! ¿Cómo vas con tu prueba de METODO STACK? \n\nRecuerda que puedes activar el acceso completo a nuestra Plataforma SaaS para una gestión inteligente de tus hábitos y enfoque desde cualquier dispositivo.\n\n🎁 INCLUYE DE REGALO: Plantillas Maestras descargables en Google Sheets (Hábitos y Enfoque).\n\nOferta especial de hoy para planes anuales:\n- Plan Individual (Hábitos, Enfoque, Finanzas, o Recursos): ${individual}\n- Stack completo (Hábitos + Enfoque + Finanzas + Recursos): ${planMax}`;
    window.open(`https://wa.me/${u.phone_number || ''}?text=${encodeURIComponent(message)}`, '_blank');
    markAsSent(u.id + (isUSD ? '_trial_usd' : '_trial_soles'));
  };

  const sendWhatsAppOfferReiteration = (u: any, isUSD: boolean) => {
    const individual = isUSD ? "$ 7.90 USD" : "Cada uno S/ 9.90";
    const planMax = isUSD ? "$ 13.90 USD" : "S/ 19.90";
    const message = `Hola! Seguimos mejorando la Plataforma SaaS METODO STACK para ti. \n\nRecuerda que al activar tu cuenta anual obtienes:\n✅ Acceso completo a la Plataforma SaaS.\n✅ Gestión inteligente de hábitos y enfoque multidispositivo.\n🎁 REGALO: Plantillas Maestras descargables en Google Sheets (Hábitos y Enfoque).\n\nPrecio especial del día:\n- Plan Individual (Hábitos, Enfoque, Finanzas, o Recursos): ${individual}\n- Stack completo (Hábitos + Enfoque + Finanzas + Recursos): ${planMax}\n\n¿Alguna duda con los módulos?`;
    window.open(`https://wa.me/${u.phone_number || ''}?text=${encodeURIComponent(message)}`, '_blank');
    markAsSent(u.id + (isUSD ? '_remark_usd' : '_remark_soles'));
  };

  const sendWhatsAppLastOffer = (u: any, isUSD: boolean) => {
    const planMax = isUSD ? "$ 13.90 USD" : "S/ 12.90";
    const message = `⚠️ ÚLTIMA OPORTUNIDAD! Solo por las próximas 24 horas, llévate el Stack completo (Hábitos + Enfoque + Finanzas + Recursos) anual con acceso completo a la Plataforma SaaS por solo ${planMax}.\n\n🎁 INCLUYE DE REGALO: Plantillas Maestras descargables en Google Sheets (Hábitos y Enfoque).\n\nActiva tu cuenta ahora antes de que expire la oferta. ¡Es tu última oportunidad!`;
    window.open(`https://wa.me/${u.phone_number || ''}?text=${encodeURIComponent(message)}`, '_blank');
    markAsSent(u.id + (isUSD ? '_last_usd' : '_last_soles'));
  };

  const sendWhatsAppPaymentDetails = (u: any) => {
    const message = `Aqui tienes los datos para tu activacion de METODO STACK: \n\n- Yape o Plin: 989078285 \n- Titular: Orlando Jose Hurtado Valle \n\nEnviame la captura por aqui e indícame qué plan deseas activar (Plan Individual o Stack completo) para darte acceso inmediato.`;
    window.open(`https://wa.me/${u.phone_number || ''}?text=${encodeURIComponent(message)}`, '_blank');
    markAsSent(u.id + '_pay');
  };

  const sendWhatsAppSessionWarning = (u: any) => {
    const message = `Hola! Veo que tienes el maximo de sesiones activas, recuerda que la cuenta es personal (maximo 3 dispositivos). El incumplimiento hara que se suspenda tu cuenta.`;
    window.open(`https://wa.me/${u.phone_number || ''}?text=${encodeURIComponent(message)}`, '_blank');
    markAsSent(u.id + '_warn');
  };

  const sendWhatsAppActivation = (u: any) => {
    const message = `Hola, tu acceso a METODO STACK ha sido activado para: ${u.email}. Usa la clave con la que te registraste o en su defecto la clave universal 123456. Inicia sesion aqui: https://metodostack.com/login\n\n🎁 ¡REGALO ADICIONAL ACTIVADO! \nComo parte de tu ingreso al MÉTODO STACK, te regalo nuestra Plantilla Maestra descargable en Google Sheets (Hábitos y Enfoque). \n\nDescárgala aquí: https://drive.google.com/drive/folders/1shSQnjScBASMj9cprw24aV23MdHcezjQ?usp=sharing`;
    window.open(`https://wa.me/${u.phone_number || ''}?text=${encodeURIComponent(message)}`, '_blank');
    markAsSent(u.id + '_act');
  };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Cargando...</div>;

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-emerald-500/30">
      <style jsx global>{`
        @keyframes wsp-pulse {
          0%, 100% { transform: scale(1); opacity: 1; filter: brightness(1); }
          50% { transform: scale(1.15); opacity: 0.7; filter: brightness(1.5); }
        }
        .animate-wsp-pulse {
          animation: wsp-pulse 1.5s ease-in-out infinite;
        }
      `}</style>
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        <header className="mb-10 flex flex-col md:flex-row items-center justify-between border-b border-white/5 pb-8">
          <div className="flex items-center gap-4">
            <h1 className="text-4xl font-black italic uppercase">ADMIN <span className="text-white/10">&</span> VENTAS</h1>
            <button onClick={() => fetchUsers()} className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded-full text-[8px] font-black uppercase tracking-tighter transition-all border border-white/10">RECARGAR V2.1</button>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">S/ {todaySales().s.toFixed(2)} HOY</p>
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">$ {todaySales().u.toFixed(2)} USD HOY</p>
            </div>
            <button 
              onClick={() => setShowSalesModal(true)}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase hover:bg-white/10 transition-all"
            >
              Ver Ventas
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-12">
          
          <div className="lg:col-span-3 p-6 bg-white/[0.02] border border-white/5 rounded-[32px]">
             <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                   <h3 className="font-black uppercase italic text-sm">PROSPECTOS</h3>
                   <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500 text-black rounded-lg text-[10px] font-black uppercase hover:scale-105 transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                      <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                      NUEVO PROSPECTO
                   </button>
                   <div className="relative">
                      <input 
                        type="text" 
                        placeholder="BUSCAR EMAIL..." 
                        value={prospectSearch}
                        onChange={(e) => setProspectSearch(e.target.value)}
                        className="bg-black/40 border border-white/10 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase focus:border-emerald-500 outline-none w-48 transition-all"
                      />
                      {prospectSearch && (
                        <button onClick={() => setProspectSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-white/30 hover:text-white text-[8px]">✕</button>
                      )}
                    </div>
                     <button onClick={() => {
                        const data = prospects.map(u => ({
                          'Email': u.email,
                          'Teléfono (WSP)': u.phone_number || '---',
                          'País': getCountryData(u.phone_number).name,
                          'Fecha de Registro': u.created_at ? new Date(u.created_at).toLocaleDateString() : '---',
                          'Vencimiento Trial': u.created_at ? new Date(new Date(u.created_at).getTime() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString() : '---'
                        }));
                        downloadCSV(data, 'prospectos_metodo_stack.xls');
                     }} className="flex items-center gap-2 px-3 py-1.5 bg-white/5 text-white/50 border border-white/10 rounded-lg text-[10px] font-black uppercase hover:bg-white/10 hover:text-white transition-all">
                        <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
                        DESCARGAR EXCEL
                     </button>
                </div>
                <span className="text-[9px] font-black uppercase text-emerald-500">{prospects.length} Registros</span>
             </div>
             
              <div className="space-y-4">
                 {prospects
                   .filter(u => (u.email || '').toLowerCase().includes((prospectSearch || '').toLowerCase()))
                   .map((u) => {
                     const isMatch = prospectSearch && u.email.toLowerCase().includes(prospectSearch.toLowerCase());
                     const now = new Date();
                     return (
                       <div 
                         key={u.id} 
                         className={`p-4 border rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4 transition-all duration-500 ${
                           isMatch 
                             ? 'bg-emerald-500/10 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/50' 
                             : 'bg-white/[0.02] border-white/5'
                         }`}
                       >
                         <div className="flex items-center gap-3">
                            <button onClick={() => setEmailToActivate(u.email)} className="w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 hover:bg-emerald-500 transition-all font-black text-xs">+</button>
                            <div>
                               <div className="flex flex-col md:flex-row md:items-center gap-2">
                                  <p className="text-[11px] font-black">{u.email}</p>
                                  <span className="px-2 py-0.5 bg-white/10 border border-white/20 rounded-md text-[9px] font-black uppercase flex items-center gap-1.5 w-fit shadow-[0_0_10px_rgba(255,255,255,0.05)]">
                                     <span className="text-sm">{getCountryData(u.phone_number).flag}</span>
                                     <span className="text-emerald-400 tracking-widest">{getCountryData(u.phone_number).name}</span>
                                  </span>
                               </div>
                               <p className="text-[9px] text-emerald-500 font-bold uppercase">{u.phone_number || 'SIN WHATSAPP'}</p>
                               <div className="flex items-center gap-2">
                                 <p className="text-[8px] text-gray-500 font-bold">REGISTRO: {u.created_at ? new Date(u.created_at).toLocaleDateString() : '---'}</p>
                                 <p className="text-[8px] text-emerald-500/80 font-bold">VENCE: {u.created_at ? new Date(new Date(u.created_at).getTime() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString() : '---'}</p>
                                 <span className="text-[7px] text-gray-600 uppercase font-bold">{getDeviceIcon(u.user_agent)}</span>
                                 
                                  {/* SEMAFORO DE ACCESO 3 DIAS Y BOTÓN SUSPENDER/REACTIVAR */}
                                  <div className="flex items-center gap-2">
                                    <div className="flex gap-1">
                                      {[1, 2, 3].map(day => {
                                        const trialDay = Math.ceil((now.getTime() - new Date(u.created_at).getTime()) / (1000 * 60 * 60 * 24));
                                        let color = 'bg-gray-800';
                                        if (trialDay >= day) color = 'bg-emerald-500';
                                        if (trialDay > 3) color = 'bg-red-500';
                                        return (
                                          <div 
                                            key={day} 
                                            className={`w-1.5 h-1.5 rounded-full ${color} transition-all duration-700`} 
                                            title={trialDay > 3 ? 'Acceso Expirado' : `Día ${day} ${trialDay >= day ? 'Activo' : 'Pendiente'}`}
                                          />
                                        );
                                      })}
                                    </div>
                                    
                                    {(() => {
                                      const trialDay = Math.ceil((now.getTime() - new Date(u.created_at).getTime()) / (1000 * 60 * 60 * 24));
                                      const isExpired = trialDay > 3;
                                      const isSuspended = u.tier?.startsWith('suspended_');
                                      
                                      return (
                                        <button
                                          onClick={() => toggleUserStatus(u)}
                                          className={`ml-2 px-2 py-0.5 rounded-md text-[8px] font-black uppercase border transition-all duration-300 ${
                                            isSuspended 
                                              ? 'bg-red-500 text-white border-red-400' 
                                              : isExpired 
                                                ? 'bg-red-500/20 text-red-500 border-red-500/40 animate-pulse-red' 
                                                : 'bg-white/5 text-gray-500 border-white/10 hover:bg-white/10'
                                          }`}
                                          title={isSuspended ? 'Reactivar Usuario' : 'Desactivar Usuario'}
                                        >
                                          {isSuspended ? 'SUSPENDIDO' : 'EXPIRADO'}
                                        </button>
                                      );
                                    })()}
                                  </div>
                               </div>
                            </div>
                         </div>
    
                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-black/40 rounded-xl border border-white/5" title="Dispositivos Activos">
                             <span className="text-[8px] text-gray-500 font-black uppercase">PC:</span>
                             <span className={`text-[11px] font-black ${u.session_count >= 3 ? 'text-red-500 animate-pulse' : 'text-blue-400'}`}>{u.session_count || 0}/3</span>
                             <button onClick={() => sendWhatsAppSessionWarning(u)}>
                                <svg className={`w-3.5 h-3.5 ${u.session_count >= 3 ? 'fill-red-500' : 'fill-emerald-500'}`} viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                             </button>
                          </div>
    
                          <div className="flex flex-col gap-2">
                            <div className="flex gap-1.5 items-center">
                              {(() => {
                                const isUSD = u.phone_number ? !u.phone_number.replace(/\s/g, '').startsWith('+51') : true;
                                return (
                                  <>
                                    <span className={`text-[7px] font-black px-1 rounded ${isUSD ? 'bg-blue-500/20 text-blue-400' : 'bg-emerald-500/20 text-emerald-500'}`}>
                                      {isUSD ? 'INT' : 'NAC'}
                                    </span>
                                    <button 
                                      onClick={() => sendWhatsAppTrialWelcome(u, isUSD)} 
                                      className={`w-7 h-7 rounded-lg bg-yellow-500/10 flex items-center justify-center hover:bg-yellow-500 transition-all group border border-yellow-500/10 ${!sentMessages.has(u.id + (isUSD ? '_welcome_usd' : '_welcome_soles')) ? 'animate-wsp-pulse shadow-[0_0_10px_rgba(234,179,8,0.3)]' : 'opacity-40'}`} 
                                      title="Mensaje de Bienvenida"
                                    >
                                       <svg className="w-3.5 h-3.5 fill-yellow-500 group-hover:fill-black" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                                    </button>
                                    <button 
                                      onClick={() => sendWhatsAppTrialInvitation(u, isUSD)} 
                                      className={`w-7 h-7 rounded-lg bg-[#25D366]/10 flex items-center justify-center hover:bg-[#25D366] transition-all group border border-[#25D366]/10 ${!sentMessages.has(u.id + (isUSD ? '_trial_usd' : '_trial_soles')) ? 'animate-wsp-pulse shadow-[0_0_10px_rgba(37,211,102,0.3)]' : 'opacity-40'}`} 
                                      title="Invitación a Plan Anual"
                                    >
                                       <svg className="w-3.5 h-3.5 fill-[#25D366] group-hover:fill-white" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                                    </button>
                                    <button 
                                      onClick={() => sendWhatsAppOfferReiteration(u, isUSD)} 
                                      className={`w-7 h-7 rounded-lg bg-orange-500/10 flex items-center justify-center hover:bg-orange-500 transition-all group border border-orange-500/10 ${!sentMessages.has(u.id + (isUSD ? '_remark_usd' : '_remark_soles')) ? 'animate-wsp-pulse shadow-[0_0_10px_rgba(249,115,22,0.3)]' : 'opacity-40'}`} 
                                      title="Reiteración de Oferta"
                                    >
                                       <svg className="w-3.5 h-3.5 fill-orange-500 group-hover:fill-white" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                                    </button>
                                    <button 
                                      onClick={() => sendWhatsAppLastOffer(u, isUSD)} 
                                      className={`w-7 h-7 rounded-lg bg-purple-500/10 flex items-center justify-center hover:bg-purple-500 transition-all group border border-purple-500/10 ${!sentMessages.has(u.id + (isUSD ? '_last_usd' : '_last_soles')) ? 'animate-wsp-pulse shadow-[0_0_10px_rgba(168,85,247,0.3)]' : 'opacity-40'}`} 
                                      title="Última Oferta (Cierre)"
                                    >
                                       <svg className="w-3.5 h-3.5 fill-purple-500 group-hover:fill-white" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                                    </button>
                                  </>
                                );
                              })()}
                              <button onClick={() => deleteUser(u)} className="w-7 h-7 rounded-lg bg-red-600/10 flex items-center justify-center hover:bg-red-600 transition-all group border border-red-600/10">
                                 <svg className="w-3 h-3 fill-red-500 group-hover:fill-white" viewBox="0 0 24 24"><path d="M3 6h18v2H3V6zm2 3h14v13H5V9zm3 2v9h2v-9H8zm4 0v9h2v-9h-2zm4 0v9h2v-9h-2zM9 4h6v2H9V4z"/></svg>
                              </button>
                             </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
           </div>

          <div className="lg:col-span-1 space-y-4">
             <div className="p-6 bg-white/[0.03] border border-white/5 rounded-[32px] text-center">
                <p className="text-[9px] font-black text-emerald-500 uppercase mb-4">NACIONAL (S/)</p>
                <input type="email" placeholder="email" value={emailToActivate} onChange={(e) => setEmailToActivate(e.target.value)} className="w-full bg-black border border-white/5 p-2 rounded text-[10px] mb-2" />
                <button onClick={() => activateUser('habitos', false)} className="w-full py-2 bg-emerald-500 text-black rounded font-bold text-[10px] mb-1">HABITOS (S/ 9.90)</button>
                <button onClick={() => activateUser('enfoque', false)} className="w-full py-2 bg-emerald-500/20 text-emerald-500 rounded font-bold text-[10px] mb-1">ENFOQUE (S/ 9.90)</button>
                <button onClick={() => activateUser('plan_max', false)} className="w-full py-2 border border-white/10 rounded font-bold text-[10px]">PLAN MAX (S/ 19.90)</button>
             </div>
             <div className="p-6 bg-white/[0.03] border border-blue-500/10 rounded-[32px] text-center">
                <p className="text-[9px] font-black text-blue-500 uppercase mb-4">INTERNACIONAL ($)</p>
                <input type="email" placeholder="email" value={emailToActivate} onChange={(e) => setEmailToActivate(e.target.value)} className="w-full bg-black border border-white/5 p-2 rounded text-[10px] mb-2 focus:border-blue-500 outline-none transition-colors" />
                <button onClick={() => activateUser('habitos', true)} className="w-full py-2 bg-blue-500 text-white rounded font-bold text-[10px] mb-1">HABITOS ($ 7.90)</button>
                <button onClick={() => activateUser('enfoque', true)} className="w-full py-2 bg-blue-500/20 text-blue-400 rounded font-bold text-[10px] mb-1">ENFOQUE ($ 7.90)</button>
                <button onClick={() => activateUser('plan_max', true)} className="w-full py-2 border border-blue-500/20 rounded font-bold text-[10px]">PLAN MAX ($ 13.90)</button>
             </div>
          </div>
        </div>

        <div className="p-8 bg-white/[0.02] border border-emerald-500/10 rounded-[32px]">
           <div className="flex justify-between items-center mb-8">
              <div>
                 <h3 className="font-black italic uppercase text-lg text-emerald-500">CLIENTES ACTIVOS</h3>
                 <div className="flex items-center gap-4 mt-2">
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Gestión de membresías pagas</p>
                    <div className="relative">
                      <input 
                        type="text" 
                        placeholder="BUSCAR CLIENTE..." 
                        value={clientSearch}
                        onChange={(e) => setClientSearch(e.target.value)}
                        className="bg-black/40 border border-white/10 px-4 py-1.5 rounded-full text-[9px] font-black uppercase focus:border-emerald-500 outline-none w-64 transition-all"
                      />
                      {clientSearch && (
                        <button onClick={() => setClientSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white text-[8px]">✕</button>
                      )}
                    </div>
                  </div>
              </div>
              <button onClick={() => {
                const data = activeClients.map(u => ({
                  'Usuario / Email': u.email,
                  'Teléfono': u.phone_number || '---',
                  'País': getCountryData(u.phone_number).name,
                  'Producto / Precio': `${u.tier?.replace('duo', 'PLAN MAX').replace('tareas', 'ENFOQUE').toUpperCase()} (${u.tier?.includes('habitos') || u.tier?.includes('enfoque') || u.tier?.includes('tareas') ? (u.is_usd ? '$ 7.90' : 'S/ 9.90') : (u.is_usd ? '$ 13.90' : 'S/ 19.90')})`,
                  'Sesiones': `${u.session_count || 0}/3`,
                  'Fecha Inicio': u.plan_starts_at ? new Date(u.plan_starts_at).toLocaleDateString() : '---',
                  'Fecha Término': u.plan_expires_at ? new Date(u.plan_expires_at).toLocaleDateString() : '---'
                }));
                downloadCSV(data, 'clientes_activos_metodo_stack.xls');
              }} className="flex items-center gap-2 px-6 py-2 bg-emerald-500 text-black rounded-full text-[11px] font-black uppercase hover:scale-105 transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                 <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
                 EXPORTAR A EXCEL
              </button>
           </div>

           <div className="hidden md:grid grid-cols-9 gap-4 px-6 py-3 bg-white/5 rounded-t-2xl border-b border-white/10 text-[9px] font-black uppercase tracking-widest text-gray-400">
              <div className="col-span-2">Usuario / Email</div>
              <div>Origen / Idioma</div>
              <div>Teléfono</div>
              <div>Producto / Precio</div>
              <div>Sesiones</div>
              <div className="relative">
                <button 
                  onClick={() => setClientSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                  className="flex items-center gap-1 hover:text-white transition-colors uppercase"
                >
                  Inicio
                  <svg className={`w-2 h-2 fill-current transition-transform ${clientSortOrder === 'asc' ? 'rotate-180' : ''}`} viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z"/></svg>
                </button>
              </div>
              <div>Vence</div>
              <div className="text-right">Acciones</div>
           </div>

           <div className="space-y-2">
              {activeClients
                .filter(u => (u.email || '').toLowerCase().includes((clientSearch || '').toLowerCase()))
                .map((u, idx) => {
                  const isMatch = clientSearch && (u.email || '').toLowerCase().includes((clientSearch || '').toLowerCase());
                  return (
                    <div 
                      key={u.id} 
                      className={`grid grid-cols-1 md:grid-cols-9 gap-4 p-4 items-center border rounded-xl transition-all duration-500 hover:bg-white/[0.03] ${
                        isMatch 
                          ? 'bg-emerald-500/10 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/50' 
                          : idx % 2 === 0 ? 'bg-white/[0.01] border-white/5' : 'bg-transparent border-white/5'
                      }`}
                    >
                       <div className="col-span-1 md:col-span-2">
                          <p className="text-[11px] font-black text-white truncate">{u.email}</p>
                          <p className="text-[8px] text-gray-500 uppercase font-bold">UID: {u.id.slice(0,8)}...</p>
                       </div>

                       <div className="text-emerald-500 text-[10px] font-black flex items-center gap-2">
                           <span className="text-sm">{getCountryData(u.phone_number || '').flag}</span>
                           <div className="flex flex-col">
                              <span className="uppercase text-[9px] font-black">{u.country_code || 'PE'}</span>
                              <span className="text-[7px] text-gray-500 font-bold uppercase">{u.detected_lang === 'en' ? 'English' : u.detected_lang === 'pt' ? 'Português' : 'Español'}</span>
                           </div>
                        </div>
                       
                        <div className="text-emerald-500 text-[10px] font-black">
                           <div className="flex flex-col gap-1">
                               <span>{u.phone_number || '---'}</span>
                               <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-md text-[8px] font-black uppercase flex items-center gap-1.5 w-fit">
                                  <span className="text-sm">{getCountryData(u.phone_number).flag}</span>
                                  <span className="text-emerald-500 tracking-widest">{getCountryData(u.phone_number).name}</span>
                               </span>
                           </div>
                        </div>

                        <div className="whitespace-nowrap">
                           {(() => {
                              const t = u.tier?.toLowerCase() || '';
                              const isMax = t.includes('plan_max') || t.includes('duo');
                              const isEnf = t.includes('enfoque') || t.includes('tareas');
                              const isHab = t.includes('habitos');
                              
                              const colorClass = isMax 
                                 ? 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20' 
                                 : isEnf 
                                    ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';

                              const priceColor = u.is_usd ? 'text-amber-400' : 'text-current opacity-60';

                              return (
                                 <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase flex items-center gap-1 w-fit border ${colorClass}`}>
                                    <span>{u.tier?.replace('duo', 'PLAN MAX').replace('tareas', 'ENFOQUE').toUpperCase()}</span>
                                    <span className={`border-l border-current/20 pl-1 ml-0.5 font-bold ${priceColor}`}>
                                      {u.tier?.includes('habitos') || u.tier?.includes('enfoque') || u.tier?.includes('tareas') ? (u.is_usd ? '$ 7.90' : 'S/ 9.90') : (u.is_usd ? '$ 13.90' : 'S/ 19.90')}
                                    </span>
                                 </span>
                              );
                           })()}
                        </div>

                       <div className="flex items-center gap-2">
                          <div className="px-3 py-1 bg-black/40 rounded-lg border border-white/10 flex items-center gap-2">
                             <span className="text-[7px] text-gray-500 font-bold uppercase">PC:</span>
                                                       <span className={`text-[10px] font-black ${u.session_count >= 3 ? 'text-red-500 animate-pulse' : 'text-blue-400'}`}>{u.session_count || 0}/3</span>
                              {(u.session_count > 0) && (
                                <button 
                                  onClick={() => resetSessions(u)}
                                  className="ml-1 p-1 hover:bg-white/10 rounded-full transition-colors text-red-500/50 hover:text-red-500"
                                  title="Restablecer Sesiones"
                                >
                                  <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0112 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg>
                                </button>
                              )}
                          </div>
                       </div>

                       <div className="text-[9px] font-bold text-gray-400">
                          {u.plan_starts_at ? new Date(u.plan_starts_at).toLocaleDateString() : '---'}
                       </div>

                       <div className="text-[9px] font-bold text-emerald-500/80">
                          {u.plan_expires_at ? new Date(u.plan_expires_at).toLocaleDateString() : '---'}
                       </div>

                       <div className="flex justify-end gap-2">
                         <button onClick={() => sendWhatsAppActivation(u)} className="px-3 py-1.5 bg-emerald-500/10 text-emerald-500 rounded-lg text-[9px] font-black uppercase border border-emerald-500/20 hover:bg-emerald-500 hover:text-black transition-all">WSP</button>
                         <button onClick={() => toggleUserStatus(u)} className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all border ${u.tier?.startsWith('suspended') ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-red-500/20 text-red-500 border-red-500/30'}`}>
                            {u.tier?.startsWith('suspended') ? 'ACTIVAR' : 'SUSPENDER'}
                         </button>
                         <button onClick={() => deleteUser(u)} className="w-8 h-8 rounded-lg bg-red-600/10 flex items-center justify-center hover:bg-red-600 transition-all group border border-red-600/10" title="Eliminar Cliente">
                            <svg className="w-3.5 h-3.5 fill-red-500 group-hover:fill-white" viewBox="0 0 24 24"><path d="M3 6h18v2H3V6zm2 3h14v13H5V9zm3 2v9h2v-9H8zm4 0v9h2v-9h-2zm4 0v9h2v-9h-2zM9 4h6v2H9V4z"/></svg>
                         </button>
                       </div>
                    </div>
                  );
                })}
           </div>
        </div>
        {/* MODAL NUEVO PROSPECTO */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#0a0a0a] border border-emerald-500/30 p-8 rounded-[32px] w-full max-w-md shadow-[0_0_50px_rgba(16,185,129,0.1)]">
              <h3 className="text-xl font-black italic uppercase text-emerald-500 mb-6">NUEVO PROSPECTO</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-[9px] font-black uppercase text-gray-500 mb-1 block">Email</label>
                  <input 
                    type="email" 
                    value={newP.email}
                    onChange={(e) => setNewP({...newP, email: e.target.value})}
                    placeholder="ejemplo@correo.com"
                    className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-sm focus:border-emerald-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-black uppercase text-gray-500 mb-1 block">Teléfono (WhatsApp)</label>
                  <input 
                    type="text" 
                    value={newP.phone}
                    onChange={(e) => setNewP({...newP, phone: e.target.value})}
                    placeholder="+51999888777"
                    className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-sm focus:border-emerald-500 outline-none transition-all"
                  />
                </div>
                <div className="flex gap-4 mt-8">
                  <button onClick={() => setShowAddModal(false)} className="flex-1 py-3 bg-white/5 text-white/50 rounded-xl font-black uppercase text-xs hover:bg-white/10 transition-all">CANCELAR</button>
                  <button onClick={handleAddProspect} className="flex-1 py-3 bg-emerald-500 text-black rounded-xl font-black uppercase text-xs hover:scale-105 transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)]">GUARDAR</button>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* MODAL VENTAS CON GRAFICOS AVANZADOS */}
        {showSalesModal && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[60] flex items-center justify-center p-4">
            <div className="bg-[#0a0a0a] border border-white/10 p-8 rounded-[40px] w-full max-w-6xl shadow-[0_0_100px_rgba(0,0,0,1)] max-h-[90vh] overflow-hidden flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-6">
                  <div>
                    <h3 className="text-2xl font-black italic uppercase text-white tracking-tighter">CENTRO ESTRATÉGICO DE VENTAS</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <select 
                        value={viewMonth} 
                        onChange={(e) => setViewMonth(parseInt(e.target.value))}
                        className="bg-transparent text-emerald-500 font-black uppercase text-[10px] outline-none cursor-pointer hover:text-emerald-400 transition-colors"
                      >
                        {['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'].map((m, idx) => (
                          <option key={m} value={idx} className="bg-[#0a0a0a]">{m}</option>
                        ))}
                      </select>
                      <select 
                        value={viewYear} 
                        onChange={(e) => setViewYear(parseInt(e.target.value))}
                        className="bg-transparent text-emerald-500 font-black uppercase text-[10px] outline-none cursor-pointer hover:text-emerald-400 transition-colors"
                      >
                        {[2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033, 2034, 2035, 2036, 2037, 2038, 2039, 2040].map(y => (
                          <option key={y} value={y} className="bg-[#0a0a0a]">{y}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <button onClick={() => setShowSalesModal(false)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all font-black text-xs">✕</button>
              </div>

              <div className="overflow-y-auto pr-2 custom-scrollbar space-y-8">
                {/* FILA 1: TENDENCIA DIARIA Y DISTRIBUCION PAIS */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 bg-white/[0.02] p-6 rounded-[32px] border border-white/5">
                    <h4 className="text-[10px] font-black uppercase text-gray-500 mb-4 tracking-widest flex justify-between">
                       <span>TENDENCIA DIARIA DEL MES</span>
                       <span className="text-emerald-500">Monto Acumulado (S/ + $)</span>
                    </h4>
                    <div className="h-[250px]">
                      <Bar 
                        data={{
                          labels: Object.keys(getSalesStats()),
                          datasets: [
                            {
                              label: 'Soles (S/)',
                              data: Object.values(getSalesStats()).map(d => d.soles),
                              backgroundColor: '#10b981',
                              borderRadius: 4,
                            },
                            {
                              label: 'Dólares ($)',
                              data: Object.values(getSalesStats()).map(d => d.usd),
                              backgroundColor: '#3b82f6',
                              borderRadius: 4,
                            }
                          ]
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: { legend: { display: false } },
                          scales: {
                            y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#444', font: { size: 9 } } },
                            x: { grid: { display: false }, ticks: { color: '#444', font: { size: 9 } } }
                          }
                        }}
                      />
                    </div>
                  </div>

                  <div className="bg-white/[0.02] p-6 rounded-[32px] border border-white/5">
                    <h4 className="text-[10px] font-black uppercase text-gray-500 mb-4 tracking-widest text-center">VENTAS POR PAÍS (TOTAL)</h4>
                    <div className="h-[220px] flex items-center justify-center">
                       <Doughnut 
                         data={{
                            labels: Object.keys(getSalesByCountry()),
                            datasets: [{
                               data: Object.values(getSalesByCountry()).map(v => v.count),
                               backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#ef4444', '#06b6d4'],
                               borderWidth: 0,
                               hoverOffset: 10
                            }]
                         }}
                         options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                               legend: {
                                  position: 'bottom',
                                  labels: { color: '#666', font: { size: 8, weight: 'bold' }, padding: 15, usePointStyle: true }
                               }
                            }
                         }}
                       />
                    </div>
                    <div className="mt-4 space-y-1">
                       {Object.entries(getSalesByCountry()).map(([country, stats], idx) => (
                          <div key={country} className="flex justify-between text-[9px] font-bold uppercase">
                             <span className="text-gray-500">{country}</span>
                             <span className="text-white">{stats.count} vtas | <span className="text-emerald-500">S/ {stats.soles.toFixed(0)}</span> | <span className="text-blue-400">$ {stats.usd.toFixed(0)}</span></span>
                          </div>
                       ))}
                    </div>
                  </div>
                </div>

                {/* FILA 2: TENDENCIA MES A MES (ANUAL) */}
                <div className="bg-white/[0.02] p-6 rounded-[32px] border border-white/5">
                   <div className="flex justify-between items-center mb-4">
                      <h4 className="text-[10px] font-black uppercase text-gray-500 tracking-widest">VISUALIZACIÓN MES A MES (ENE - DIC)</h4>
                      <div className="flex items-center gap-2">
                         <span className="text-[9px] font-black text-gray-500 uppercase">AÑO:</span>
                         <select 
                           value={trendYear} 
                           onChange={(e) => setTrendYear(parseInt(e.target.value))}
                           className="bg-black/50 border border-white/10 rounded px-2 py-1 text-[10px] font-black text-emerald-500 outline-none cursor-pointer"
                         >
                           {[2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033, 2034, 2035, 2036, 2037, 2038, 2039, 2040].map(y => (
                             <option key={y} value={y} className="bg-black">{y}</option>
                           ))}
                         </select>
                      </div>
                   </div>
                   <div className="h-[200px]">
                      <Line 
                        data={{
                           labels: Object.keys(getYearlyTrend(trendYear)),
                           datasets: [
                              {
                                 label: 'Ingresos Soles',
                                 data: Object.values(getYearlyTrend(trendYear)).map(v => v.soles),
                                 borderColor: '#10b981',
                                 backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                 fill: true,
                                 tension: 0.4,
                                 pointRadius: 4,
                                 pointHoverRadius: 6
                              },
                              {
                                 label: 'Ingresos USD',
                                 data: Object.values(getYearlyTrend(trendYear)).map(v => v.usd),
                                 borderColor: '#3b82f6',
                                 backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                 fill: true,
                                 tension: 0.4,
                                 pointRadius: 4,
                                 pointHoverRadius: 6
                              }
                           ]
                        }}
                        options={{
                           responsive: true,
                           maintainAspectRatio: false,
                           plugins: { legend: { display: false } },
                           scales: {
                              y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#444', font: { size: 9 } } },
                              x: { grid: { display: false }, ticks: { color: '#444', font: { size: 9 } } }
                           }
                        }}
                      />
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* CALENDARIO DE SELECCION */}
                  <div className="bg-white/[0.02] p-6 rounded-[32px] border border-white/5">
                    <h4 className="text-[10px] font-black uppercase text-gray-500 mb-4 tracking-tighter">DETALLE POR DÍA</h4>
                    <div className="grid grid-cols-7 gap-2">
                      {Object.keys(getSalesStats()).map((day) => {
                        const d = parseInt(day);
                        const hasSales = getSalesStats()[d].count > 0;
                        return (
                          <button 
                            key={day}
                            onClick={() => setSelectedSalesDay(d)}
                            className={`aspect-square rounded-xl text-[10px] font-black transition-all flex flex-col items-center justify-center border
                              ${selectedSalesDay === d ? 'bg-emerald-500 text-black border-emerald-500 scale-110 z-10 shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 
                                hasSales ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20' : 
                                'bg-white/5 text-gray-600 border-white/5 hover:bg-white/10'}`}
                          >
                            {day}
                            {hasSales && <div className={`w-1 h-1 rounded-full mt-0.5 ${selectedSalesDay === d ? 'bg-black' : 'bg-emerald-500'}`}></div>}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* MOVIMIENTO DEL DIA SELECCIONADO */}
                  <div className="bg-emerald-500/5 p-8 rounded-[32px] border border-emerald-500/10 flex flex-col justify-center">
                    <h4 className="text-[10px] font-black uppercase text-emerald-500 mb-6 tracking-widest text-center">MOVIMIENTO DEL DÍA {selectedSalesDay}</h4>
                    <div className="space-y-6">
                      <div className="text-center">
                        <p className="text-[9px] font-black text-gray-500 uppercase mb-1">Registros de Activación</p>
                        <p className="text-4xl font-black italic">{getSalesStats()[selectedSalesDay].count}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-black/40 p-4 rounded-2xl border border-white/5 text-center">
                          <p className="text-[8px] font-black text-emerald-500 uppercase mb-1">Total Soles</p>
                          <p className="text-xl font-black text-white">S/ {getSalesStats()[selectedSalesDay].soles.toFixed(2)}</p>
                        </div>
                        <div className="bg-black/40 p-4 rounded-2xl border border-white/5 text-center">
                          <p className="text-[8px] font-black text-blue-400 uppercase mb-1">Total Dólares</p>
                          <p className="text-xl font-black text-white">$ {getSalesStats()[selectedSalesDay].usd.toFixed(2)}</p>
                        </div>
                      </div>

                      {/* DESGLOSE POR PAIS DEL DIA */}
                      <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
                         <p className="text-[8px] font-black text-gray-500 uppercase text-center mb-3">Recaudación por País (Hoy)</p>
                         {Object.entries(activeClients.reduce((acc: any, u: any) => {
                            if (!u.plan_starts_at) return acc;
                            const date = new Date(u.plan_starts_at);
                            if (date.getDate() === selectedSalesDay && date.getMonth() === viewMonth && date.getFullYear() === viewYear) {
                              const country = getCountryData(u.phone_number).name;
                              if (!acc[country]) acc[country] = { soles: 0, usd: 0 };
                              const isH = u.tier?.includes('habitos') || u.tier?.includes('tareas');
                              const price = u.is_usd ? (isH ? 7.90 : 11.90) : (isH ? 9.90 : 19.90);
                              if (u.is_usd) acc[country].usd += price; else acc[country].soles += price;
                            }
                            return acc;
                         }, {})).map(([country, stats]: [string, any]) => (
                            <div key={country} className="flex justify-between items-center bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                               <span className="text-[9px] font-black uppercase text-white">{country}</span>
                               <div className="text-right">
                                  {stats.soles > 0 && <p className="text-[9px] font-black text-emerald-500">S/ {stats.soles.toFixed(2)}</p>}
                                  {stats.usd > 0 && <p className="text-[9px] font-black text-blue-400">$ {stats.usd.toFixed(2)}</p>}
                               </div>
                            </div>
                         ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center">
                <div className="flex gap-8">
                   <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                      <span className="text-[9px] font-black uppercase text-gray-500 tracking-wider">TOTAL MES S/ {Object.values(getSalesStats()).reduce((acc, curr) => acc + curr.soles, 0).toFixed(2)}</span>
                   </div>
                   <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <span className="text-[9px] font-black uppercase text-gray-500 tracking-wider">TOTAL MES $ {Object.values(getSalesStats()).reduce((acc, curr) => acc + curr.usd, 0).toFixed(2)}</span>
                   </div>
                </div>
                <button onClick={() => setShowSalesModal(false)} className="px-12 py-3 bg-white text-black rounded-full font-black uppercase text-xs hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]">Cerrar Reporte</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
