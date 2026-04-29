import { createClient } from '@/lib/server';
import LandingPage from '@/components/LandingPage';
import { redirect } from 'next/navigation';

export default async function RootPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect('/tracker');
  }

  return <LandingPage />;
}
