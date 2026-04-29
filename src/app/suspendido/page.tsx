import Link from 'next/link';

export const metadata = {
  title: 'Cuenta Suspendida · MÉTODO STACK',
};

export default function SuspendidoPage() {
  return (
    <div className="min-h-screen bg-app-bg flex items-center justify-center px-4 font-sans">
      <div className="w-full max-w-sm text-center">

        {/* Ícono */}
        <div className="w-16 h-16 rounded-full bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-6">
          <svg className="w-7 h-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>

        {/* Branding */}
        <div className="flex items-center gap-2 justify-center mb-6">
          <div className="w-1.5 h-1.5 bg-brand-green rounded-full" />
          <span className="text-[11px] font-semibold tracking-widest text-app-text3 uppercase">
            Método Stack
          </span>
        </div>

        {/* Mensaje */}
        <h1 className="text-[20px] font-bold text-app-text mb-3 tracking-tight">
          Cuenta Suspendida
        </h1>
        <p className="text-[13px] text-app-text3 leading-relaxed mb-8">
          Tu cuenta ha sido suspendida por incumplimiento de los Términos y Condiciones.
          Si crees que esto es un error, contáctanos.
        </p>

        {/* Acciones */}
        <div className="flex flex-col gap-3">
          <a
            href="https://wa.me/51999999999?text=Hola,%20mi%20cuenta%20fue%20suspendida%20y%20necesito%20ayuda."
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 bg-brand-green text-white text-xs font-medium rounded-sm
                       transition-opacity hover:opacity-90 text-center"
          >
            Contactar Soporte por WhatsApp
          </a>
          <Link
            href="/login"
            className="w-full py-2.5 border border-app-border text-app-text3 text-xs font-medium rounded-sm
                       transition-colors hover:border-brand-green hover:text-brand-green text-center"
          >
            Volver al Inicio de Sesión
          </Link>
        </div>

        <p className="text-[9px] text-app-text3/50 mt-8">
          MÉTODO STACK · Uso Personal e Intransferible
        </p>
      </div>
    </div>
  );
}
