import { redirect } from 'next/navigation';
import { createClient } from '@/lib/server';
import FinanceClient from './FinanceClient';

export const metadata = {
  title: 'Finanzas Personales — MindsetStack',
  description: 'Controla tus ingresos y egresos con el Método STACK.',
};

export default async function FinancesPage() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/login');
  }

  return <FinanceClient userId={user.id} userEmail={user.email!} />;
}
