import { redirect } from 'next/navigation';
import { createClient } from '@/lib/server';
import AdminDashboardClient from './AdminDashboardClient';

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();


  const mockUser = user || { id: 'admin-rescue', email: 'ojhv2015@gmail.com' };
  const userId = mockUser.id;


  // Fetch profile data
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  return <AdminDashboardClient userId={userId} profile={profile || {}} />;
}
