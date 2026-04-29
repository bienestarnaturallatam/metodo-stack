import { NextResponse } from 'next/server';
import { createClient } from '@/lib/server';

export async function POST(req: Request) {
  try {
    const { phone, link_choice } = await req.json();

    if (!phone || !link_choice) {
      return NextResponse.json({ error: 'Faltan parámetros' }, { status: 400 });
    }

    const supabase = await createClient();

    // 2. Manejo de Tiers Free Trial
    if (link_choice === 'PRUEBA PRO') {
      const oneWeekFromNow = new Date();
      oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);

      const { error } = await supabase
        .from('phone_number')
        .upsert({
          phone_number: phone,
          tier: 'trial',
          trial_expires_at: oneWeekFromNow.toISOString(),
          updated_at: new Date().toISOString()
        }, { onConflict: 'phone_number' });

      if (error) throw error;

      return NextResponse.json({
        message: '¡Prueba PRO Activada! Disfruta de 1 semana de acceso táctil.',
        tier: 'trial'
      });
    }

    return NextResponse.json({ message: 'Acceso procesado' });
  } catch (error: any) {
    console.error('Error in phone_delivery:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
