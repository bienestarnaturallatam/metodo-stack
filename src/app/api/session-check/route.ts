import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const MAX_SESSIONS = 3;

export async function POST(request: NextRequest) {
  const { userId, userAgent } = await request.json();

  if (!userId) {
    return NextResponse.json({ error: 'userId requerido' }, { status: 400 });
  }

  // Construir cliente Supabase con cookies
  const cookieStore = request.cookies;
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {},
      },
    }
  );

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? request.headers.get('x-real-ip')
    ?? 'unknown';

  // 1. Limpiar sesiones expiradas (más de 7 días)
  const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  await supabase
    .from('user_sessions')
    .delete()
    .eq('user_id', userId)
    .lt('last_seen_at', cutoff);

  // 2. Contar sesiones activas
  const { data: sessions, error: fetchError } = await supabase
    .from('user_sessions')
    .select('id, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  // 3. Verificar límite de 3 dispositivos
  if (sessions && sessions.length >= MAX_SESSIONS) {
    // Eliminar la sesión más antigua para dar espacio
    const oldest = sessions[0];
    await supabase.from('user_sessions').delete().eq('id', oldest.id);
  }

  // 4. Registrar nueva sesión
  const sessionToken = crypto.randomUUID();
  const { error: insertError } = await supabase
    .from('user_sessions')
    .insert({
      user_id:       userId,
      session_token: sessionToken,
      user_agent:    userAgent,
      ip_address:    ip,
      last_seen_at:  new Date().toISOString(),
    });

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  // 5. Contar total real después de las operaciones
  const { count: realCount } = await supabase
    .from('user_sessions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  const now = new Date().toISOString();
  const isFlagged = (realCount ?? 0) >= MAX_SESSIONS;
  
  await supabase
    .from('profiles')
    .update({
      last_sign_in_at: now,
      user_agent:      userAgent,
      session_count:   realCount ?? 0,
      is_flagged:      isFlagged, 
    })
    .eq('id', userId);


  return NextResponse.json({ ok: true, sessionToken });
}
