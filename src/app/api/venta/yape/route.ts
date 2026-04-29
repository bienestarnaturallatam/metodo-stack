import { NextResponse } from 'next/server';
import { createClient } from '@/lib/server';

/**
 * 4. Análisis de IA (Simulado): Claude analiza el texto de la notificación de Yape.
 * En un entorno real, aquí se llamaría a la API de Anthropic.
 */
async function analyzeNotificationWithClaude(text: string) {
  // Simulación de extracción de datos por IA
  const amountMatch = text.match(/S\/ (\d+(\.\d+)?)/);
  const phoneMatch = text.match(/9\d{8}/); // Formato típico de celular en Perú
  
  return {
    amount: amountMatch ? parseFloat(amountMatch[1]) : 0,
    phone: phoneMatch ? phoneMatch[0] : null,
    isProPlan: text.includes('PRO') || text.includes('STACK')
  };
}

export async function POST(req: Request) {
  try {
    const { notification_text } = await req.json();

    if (!notification_text) {
      return NextResponse.json({ error: 'No se recibió texto de notificación' }, { status: 400 });
    }

    // 4. Análisis de IA (Claude)
    const analysis = await analyzeNotificationWithClaude(notification_text);
    const { amount, phone } = analysis;

    if (!phone) {
      return NextResponse.json({ error: 'No se pudo identificar al usuario' }, { status: 400 });
    }

    const supabase = await createClient();

    // 5. Actualización Supabase (Monto S/ 12.00)
    if (amount === 12.00) {
      const { error } = await supabase
        .from('phone_number')
        .upsert({
          phone_number: phone,
          tier: 'habit_tracker_pro', // O 'planner_pro' según lógica
          updated_at: new Date().toISOString()
        }, { onConflict: 'phone_number' });

      if (error) throw error;

      // 6. Feedback Instantáneo
      return NextResponse.json({
        message: '¡Acceso Activado! Disfruta de tu SaaS PRO por 1 Año x WhatsApp.',
        status: 'success',
        tier: 'habit_tracker_pro'
      });
    }

    return NextResponse.json({ 
      message: 'Notificación recibida, monto insuficiente para PRO.',
      amount_received: amount 
    });

  } catch (error: any) {
    console.error('Error in yape_webhook:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
