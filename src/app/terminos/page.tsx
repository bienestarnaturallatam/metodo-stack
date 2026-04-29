import Link from 'next/link';

export const metadata = {
  title: 'Términos y Condiciones · MÉTODO STACK',
  description: 'Condiciones de uso, precios y restricciones del servicio MÉTODO STACK.',
};

export default function TerminosPage() {
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
            Términos y Condiciones
          </h1>
          <p className="text-[12px] text-app-text3 mt-1">
            Última actualización: abril 2026
          </p>
        </div>

        {/* Contenido */}
        <div className="flex flex-col gap-8 text-[13px] text-app-text2 leading-relaxed">

          <section>
            <h2 className="text-[11px] font-bold uppercase tracking-widest text-app-text3 mb-3">
              1. Descripción del Servicio
            </h2>
            <p>
              <strong className="text-app-text">MÉTODO STACK</strong> es una plataforma digital de
              seguimiento de hábitos, gestión de tareas y productividad personal. El acceso al
              servicio está condicionado a la aceptación de estos términos en su totalidad.
            </p>
          </section>

          <section>
            <h2 className="text-[11px] font-bold uppercase tracking-widest text-app-text3 mb-3">
              2. Prueba Gratuita
            </h2>
            <p>
              Todo usuario nuevo tiene acceso a una <strong className="text-app-text">prueba gratuita
              de 3 días</strong> con todas las funcionalidades del plan activo. Al finalizar el
              período de prueba, el acceso quedará restringido hasta que se realice el pago
              correspondiente. No se requiere tarjeta de crédito para iniciar la prueba.
            </p>
          </section>

          <section>
            <h2 className="text-[11px] font-bold uppercase tracking-widest text-app-text3 mb-3">
              3. Planes y Precios
            </h2>
            <p className="mb-4">
              El servicio se ofrece bajo un modelo de <strong className="text-app-text">pago único anual</strong>.
              No existen cargos recurrentes automáticos. Los planes disponibles son:
            </p>
            <div className="flex flex-col gap-3">
              {[
                { 
                  plan: 'Plan Individual (Hábitos O Tareas)', 
                  desc: 'Acceso completo a la Plataforma SaaS Método Stack (un módulo). Gestión inteligente desde cualquier dispositivo.' 
                },
                { 
                  plan: 'Plan Dúo (Hábitos + Tareas)', 
                  desc: 'Acceso completo a la Plataforma SaaS Método Stack (ambos módulos). Gestión inteligente multidispositivo.' 
                },
              ].map((item) => (
                <div key={item.plan} className="flex items-start gap-4 p-4 border border-app-border rounded-sm bg-app-surface">
                  <div className="flex-1">
                    <p className="text-[12px] font-semibold text-app-text">{item.plan}</p>
                    <p className="text-[11px] text-app-text3 mt-1 leading-tight">{item.desc}</p>
                  </div>
                  <span className="text-[10px] font-bold text-brand-green uppercase tracking-widest bg-brand-green/5 px-2 py-1 rounded">Pago Único Anual</span>
                </div>
              ))}
            </div>
            <p className="mt-4 p-3 bg-brand-green/10 border border-brand-green/20 rounded-sm text-[12px] text-app-text font-medium flex items-center gap-2">
              🎁 <span className="uppercase font-bold tracking-tight">Incluye de Regalo:</span> Plantillas Maestras descargables de Excel y Google Sheets.
            </p>
            <p className="mt-2 text-[11px] text-app-text3 italic">
              * El servicio se ofrece bajo suscripción anual. Consulte los precios vigentes y promociones con nuestro equipo de ventas.
            </p>
          </section>

          <section>
            <h2 className="text-[11px] font-bold uppercase tracking-widest text-app-text3 mb-3">
              4. Uso Personal e Intransferible
            </h2>
            <p>
              Cada cuenta es estrictamente <strong className="text-app-text">personal e intransferible</strong>.
              Queda limitado a un máximo de <strong className="text-app-text">3 dispositivos personales</strong>. 📱🔒 
              Queda <strong className="text-app-text">expresamente prohibido</strong>:
            </p>
            <ul className="flex flex-col gap-2 list-none mt-3">
              {[
                'Compartir credenciales de acceso con terceros no autorizados por el plan.',
                'Revender o ceder el acceso a la plataforma a cambio de cualquier contraprestación.',
                'Usar una misma cuenta en más de 3 dispositivos.',
              ].map((item, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-brand-green mt-0.5">—</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 p-3 bg-red-600/10 border border-red-500/20 rounded-sm text-red-500 font-semibold">
              ⚠️ El incumplimiento de estas condiciones, especialmente el exceso de dispositivos permitidos, 
              faculta a MÉTODO STACK a realizar la SUSPENSIÓN AUTOMÁTICA de la cuenta sin derecho a reembolso 
              ni previo aviso.
            </p>
          </section>

          <section>
            <h2 className="text-[11px] font-bold uppercase tracking-widest text-app-text3 mb-3">
              5. Política de Reembolsos
            </h2>
            <p>
              Dado que el servicio ofrece un período de prueba gratuito previo al pago, no se
              realizan reembolsos una vez efectuado el pago anual. En caso de falla técnica
              grave imputable a MÉTODO STACK, se evaluará cada caso de forma individual.
            </p>
          </section>

          <section>
            <h2 className="text-[11px] font-bold uppercase tracking-widest text-app-text3 mb-3">
              6. Optimización de Datos Históricos
            </h2>
            <p>
              Para garantizar el alto rendimiento de la plataforma, los registros de hábitos y
              tareas con una antigüedad superior a <strong className="text-app-text">6 meses</strong> serán compactados en resúmenes
              estadísticos mensuales. El usuario mantendrá la visibilidad de su progreso
              histórico a través de estos promedios.
            </p>
          </section>

          <section>
            <h2 className="text-[11px] font-bold uppercase tracking-widest text-app-text3 mb-3">
              7. Modificaciones del Servicio
            </h2>
            <p>
              MÉTODO STACK se reserva el derecho de modificar, suspender o descontinuar cualquier
              aspecto del servicio con un aviso previo de al menos 15 días mediante notificación
              al correo electrónico registrado.
            </p>
          </section>

          <section>
            <h2 className="text-[11px] font-bold uppercase tracking-widest text-app-text3 mb-3">
              8. Ley Aplicable
            </h2>
            <p>
              Estos términos se rigen por las leyes de la República del Perú. Cualquier
              controversia se someterá a la jurisdicción de los tribunales competentes de Lima,
              Perú.
            </p>
          </section>

        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-app-border flex gap-6">
          <Link href="/privacidad" className="text-[11px] text-app-text3 hover:text-brand-green transition-colors">
            Política de Privacidad
          </Link>
          <Link href="/cookies" className="text-[11px] text-app-text3 hover:text-brand-green transition-colors">
            Política de Cookies
          </Link>
        </div>

      </div>
    </div>
  );
}
