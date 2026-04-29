import { redirect } from 'next/navigation';
import { createClient } from '@/lib/server';
import TrackerClient from './TrackerClient';

export default async function TrackerPage() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/login');
  }

  return <TrackerClient userId={user.id} userEmail={user.email!} />;
}
