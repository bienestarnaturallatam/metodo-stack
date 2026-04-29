import { redirect } from 'next/navigation';
import { createClient } from '@/lib/server';
import AdminDashboardClient from './AdminDashboardClient';

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  // Blindaje de seguridad: solo el administrador puede entrar
  if (error || !user) {
    redirect('/login');
  }

  if (user.email !== 'ojhv2015@gmail.com') {
    redirect('/tracker');
  }


  // Fetch profile data
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return <AdminDashboardClient userId={user.id} profile={profile} />;
}
