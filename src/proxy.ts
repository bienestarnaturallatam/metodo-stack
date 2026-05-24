import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// ─── Emails de administradores ──────────────────────────────────────────────
const ADMIN_EMAILS = ['ojhv2015@gmail.com', 'metodostack@gmail.com'];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // FAST PATH: Landing page NO necesita auth — retorno inmediato sin Supabase
  if (pathname === '/') {
    return NextResponse.next({ request });
  }

  // Construir la respuesta base UNA sola vez
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options ?? {})
          );
        },
      },
    }
  );

  // Refrescar la sesión
  const { data: { user } } = await supabase.auth.getUser();

  // ─── Bloqueo de cuentas suspendidas ───────────────────────────────────────
  const isPublicPath =
    pathname.startsWith('/suspendido') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/forgot-password') ||
    pathname.startsWith('/reset-password') ||
    pathname.startsWith('/update-password') ||
    pathname.startsWith('/auth/callback') ||
    pathname.startsWith('/privacidad') ||
    pathname.startsWith('/terminos') ||
    pathname.startsWith('/cookies');

  if (user && !isPublicPath) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('tier, is_paid, plan_expires_at, created_at')
      .eq('id', user.id)
      .single();

    if (!profile) return supabaseResponse;

    // --- EXCEPCIÓN PARA EL ADMINISTRADOR ---
    if (user.email && ADMIN_EMAILS.includes(user.email.toLowerCase())) return supabaseResponse;

    const tier = (profile.tier || '').toLowerCase();
    const isTrial = ['trial', 'free', 'gratis'].includes(tier);
    const hasPaidTier = !isTrial && !tier.startsWith('suspended');
    const isPaid = profile.is_paid === true || hasPaidTier;

    // ─── Bloqueo por Expiración de Prueba (72h) o Suspensión ─────────────────
    if (tier.startsWith('suspended')) {
      return NextResponse.redirect(new URL('/suspendido', request.url));
    }

    if (isTrial && profile.created_at) {
      const start = new Date(profile.created_at);
      const now = new Date();
      const diffHours = (now.getTime() - start.getTime()) / (1000 * 60 * 60);
      if (diffHours >= 72) {
        return NextResponse.redirect(new URL('/suspendido', request.url));
      }
    }

    // ─── Bloqueo de Recursos Premium ────────────────────────────────────────
    if (pathname.startsWith('/api/recursos')) {
      if (!isPaid) {
        return new NextResponse(JSON.stringify({ error: 'Acceso denegado. Se requiere plan de pago.' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }
  }

  // ─── Protección de /dashboard (DESACTIVADA TEMPORALMENTE PARA RESCATE) ───
  /*
  if (pathname.startsWith('/dashboard')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (!user.email || !ADMIN_EMAILS.includes(user.email.toLowerCase())) {
      return NextResponse.redirect(new URL('/tracker', request.url));
    }
  }
  */

  return supabaseResponse;
}

export default proxy;

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
