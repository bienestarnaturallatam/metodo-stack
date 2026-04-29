import { redirect } from 'next/navigation';
import { createClient } from '@/lib/server';
import PlannerClient from './PlannerClient';

export const metadata = {
  title: 'Weekly Planner — MindsetStack',
  description: 'Planifica tu semana con enfoque y claridad.',
};

export default async function PlannerPage() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/login');
  }

  return <PlannerClient userId={user.id} userEmail={user.email!} />;
}
