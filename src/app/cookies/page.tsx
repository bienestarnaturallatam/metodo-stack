import Link from 'next/link';

export const metadata = {
  title: 'Política de Cookies · MÉTODO STACK',
  description: 'Información sobre el uso de cookies técnicas en MÉTODO STACK.',
};

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-app-bg px-4 py-12 font-sans">
      <div className="max-w-2xl mx-auto">

        {/* Volver */}
        <Link
          href="/register"
          className="inline-flex items-center gap-1.5 text-[11px] text-app-text3 hover:text-app-text transition-colors mb-10"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Volver
        </Link>

        {/* Header */}
        <div className="mb-10 pb-6 border-b border-app-border">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-1.5 bg-brand-green rounded-full" />
            <span className="text-[11px] font-semibold tracking-widest text-app-text3 uppercase">
              Método Stack
            </span>
          </div>
          <h1 className="text-2xl font-bold text-app-text tracking-tight">
            Política de Cookies
          </h1>
          <p className="text-[12px] text-app-text3 mt-1">
            Última actualización: abril 2026
          </p>
        </div>

        {/* Contenido */}
        <div className="flex flex-col gap-8 text-[13px] text-app-text2 leading-relaxed">

          <section>
            <h2 className="text-[11px] font-bold uppercase tracking-widest text-app-text3 mb-3">
              1. ¿Qué son las Cookies?
            </h2>
            <p>
              Las cookies son pequeños archivos de texto que se almacenan en su dispositivo cuando
              visita un sitio web. Permiten que el sitio recuerde información sobre su visita,
              como su sesión iniciada, para hacer su experiencia más eficiente.
            </p>
          </section>

          <section>
            <h2 className="text-[11px] font-bold uppercase tracking-widest text-app-text3 mb-3">
              2. Cookies que Utilizamos
            </h2>
            <p className="mb-4">
              <strong className="text-app-text">MÉTODO STACK utiliza exclusivamente cookies técnicas</strong>,
              estrictamente necesarias para el funcionamiento del servicio. No utilizamos cookies
              de rastreo, publicidad, analítica de terceros ni perfilado de usuario.
            </p>

            <div className="border border-app-border rounded-sm overflow-hidden">
              <div className="grid grid-cols-3 bg-app-surface px-4 py-2.5 border-b border-app-border">
                <span className="text-[10px] font-bold uppercase tracking-wider text-app-text3">Cookie</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-app-text3">Finalidad</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-app-text3">Duración</span>
              </div>
              {[
                { name: 'sb-access-token', purpose: 'Mantiene la sesión de usuario iniciada', duration: '1 hora' },
                { name: 'sb-refresh-token', purpose: 'Renueva la sesión automáticamente', duration: '7 días' },
              ].map((cookie, i) => (
                <div key={i} className="grid grid-cols-3 px-4 py-3 border-b border-app-border last:border-b-0">
                  <code className="text-[11px] text-brand-green font-mono">{cookie.name}</code>
                  <span className="text-[12px] text-app-text2">{cookie.purpose}</span>
                  <span className="text-[12px] text-app-text3">{cookie.duration}</span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-[11px] font-bold uppercase tracking-widest text-app-text3 mb-3">
              3. Cookies de Terceros
            </h2>
            <p>
              No instalamos cookies de terceros. La infraestructura de autenticación está
              provista por <strong className="text-app-text">Supabase</strong>, que puede establecer
              cookies técnicas propias bajo sus propias políticas de privacidad, las cuales
              también son de carácter exclusivamente técnico y de seguridad.
            </p>
          </section>

          <section>
            <h2 className="text-[11px] font-bold uppercase tracking-widest text-app-text3 mb-3">
              4. ¿Puedo Desactivar las Cookies?
            </h2>
            <p>
              Puede configurar su navegador para bloquear o eliminar cookies. Sin embargo, tenga
              en cuenta que las cookies técnicas son <strong className="text-app-text">imprescindibles
              para mantener su sesión iniciada</strong>. Si las desactiva, deberá autenticarse
              manualmente en cada visita y algunas funciones pueden no operar correctamente.
            </p>
          </section>

          <section>
            <h2 className="text-[11px] font-bold uppercase tracking-widest text-app-text3 mb-3">
              5. Sin Cookies de Publicidad
            </h2>
            <p>
              MÉTODO STACK no utiliza Google Analytics, Facebook Pixel, ni ninguna otra herramienta
              de seguimiento publicitario. Su comportamiento dentro de la aplicación no es
              compartido con ninguna red publicitaria.
            </p>
          </section>

          {/* Resumen visual */}
          <div className="p-4 border border-brand-green/20 bg-brand-green/5 rounded-sm">
            <p className="text-[12px] text-app-text">
              <strong>En resumen:</strong> solo usamos las cookies mínimas e indispensables para
              que pueda iniciar sesión y usar el servicio. Nada más.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-app-border flex gap-6">
          <Link href="/privacidad" className="text-[11px] text-app-text3 hover:text-brand-green transition-colors">
            Política de Privacidad
          </Link>
          <Link href="/terminos" className="text-[11px] text-app-text3 hover:text-brand-green transition-colors">
            Términos y Condiciones
          </Link>
        </div>

      </div>
    </div>
  );
}
