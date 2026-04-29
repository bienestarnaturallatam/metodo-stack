import Link from 'next/link';

export const metadata = {
  title: 'Política de Privacidad · MÉTODO STACK',
  description: 'Tratamiento de datos personales bajo la Ley 29733 de Perú.',
};

export default function PrivacidadPage() {
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
            Política de Privacidad
          </h1>
          <p className="text-[12px] text-app-text3 mt-1">
            Última actualización: abril 2026
          </p>
        </div>

        {/* Contenido */}
        <div className="flex flex-col gap-8 text-[13px] text-app-text2 leading-relaxed">

          <section>
            <h2 className="text-[11px] font-bold uppercase tracking-widest text-app-text3 mb-3">
              1. Responsable del Tratamiento
            </h2>
            <p>
              El responsable del tratamiento de sus datos personales es <strong className="text-app-text">MÉTODO STACK</strong>.
              Para cualquier consulta relacionada con el tratamiento de sus datos, puede contactarnos a través
              de los canales indicados en esta plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-[11px] font-bold uppercase tracking-widest text-app-text3 mb-3">
              2. Base Legal
            </h2>
            <p>
              El tratamiento de sus datos personales se realiza en cumplimiento de la{' '}
              <strong className="text-app-text">Ley N° 29733</strong>, Ley de Protección de Datos
              Personales de Perú, y su Reglamento aprobado mediante Decreto Supremo N° 003-2013-JUS.
              Al registrarse, usted otorga su consentimiento libre, expreso e informado para el
              tratamiento descrito en esta política.
            </p>
          </section>

          <section>
            <h2 className="text-[11px] font-bold uppercase tracking-widest text-app-text3 mb-3">
              3. Datos que Recopilamos
            </h2>
            <ul className="flex flex-col gap-2 list-none">
              {[
                'Correo electrónico: para autenticación y comunicaciones esenciales del servicio.',
                'Datos de uso: hábitos registrados, tareas y preferencias de la aplicación.',
                'Datos de sesión: tokens de autenticación almacenados de forma segura en cookies.',
              ].map((item, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-brand-green mt-0.5">—</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-[11px] font-bold uppercase tracking-widest text-app-text3 mb-3">
              4. Finalidad del Tratamiento
            </h2>
            <p>
              Sus datos se utilizan exclusivamente para: (a) proveer el servicio de seguimiento de
              hábitos y productividad; (b) gestionar su acceso y membresía; (c) comunicaciones
              técnicas relacionadas con el servicio. No vendemos ni cedemos sus datos a terceros
              con fines comerciales.
            </p>
          </section>

          <section>
            <h2 className="text-[11px] font-bold uppercase tracking-widest text-app-text3 mb-3">
              5. Almacenamiento y Seguridad
            </h2>
            <p>
              Sus datos se almacenan en servidores seguros provistos por Supabase, con cifrado
              en tránsito (TLS) y en reposo. Adoptamos medidas técnicas y organizativas adecuadas
              para proteger su información frente a accesos no autorizados.
            </p>
          </section>

          <section>
            <h2 className="text-[11px] font-bold uppercase tracking-widest text-app-text3 mb-3">
              6. Sus Derechos (ARCO)
            </h2>
            <p>
              Conforme a la Ley 29733, usted tiene derecho de <strong className="text-app-text">
              Acceso, Rectificación, Cancelación y Oposición</strong> sobre sus datos personales.
              Puede ejercer estos derechos contactándonos directamente. Atenderemos su solicitud
              en un plazo máximo de 20 días hábiles.
            </p>
          </section>

          <section>
            <h2 className="text-[11px] font-bold uppercase tracking-widest text-app-text3 mb-3">
              7. Retención de Datos
            </h2>
            <p>
              Conservamos sus datos mientras su cuenta permanezca activa. Al eliminar su cuenta,
              sus datos personales serán eliminados en un plazo de 30 días, salvo obligación legal
              de conservación.
            </p>
            <p className="mt-2 text-[#7a9b82] italic">
              Realizamos un mantenimiento mensual automático para procesar datos antiguos y 
              convertirlos en métricas de rendimiento. Este proceso asegura que el sistema sea 
              eficiente y rápido para todos los usuarios, manteniendo la integridad de su 
              historial de progreso.
            </p>
          </section>

        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-app-border flex gap-6">
          <Link href="/terminos" className="text-[11px] text-app-text3 hover:text-brand-green transition-colors">
            Términos y Condiciones
          </Link>
          <Link href="/cookies" className="text-[11px] text-app-text3 hover:text-brand-green transition-colors">
            Política de Cookies
          </Link>
        </div>

      </div>
    </div>
  );
}
