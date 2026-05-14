import type { Metadata, Viewport } from 'next';
import './globals.css';
import { I18nProvider } from '@/hooks/useTranslation';
import { Sora, DM_Sans, DM_Mono } from 'next/font/google';

// 1. CONFIGURACIÓN DE METADATOS Y PWA
// Esto conecta tu archivo public/manifest.json con el navegador
export const metadata: Metadata = {
  metadataBase: new URL('https://metodo-stack.vercel.app'),
  title: {
    default: 'Método STACK — Tracker de Hábitos, Enfoque y Finanzas',
    template: '%s | Método STACK',
  },
  description: 'Sistema integral para convertir intenciones en rutinas reales.',
  manifest: '/manifest.json', // <-- Esta línea es la que activa el icono en el celular
  icons: {
    icon: '/icon.png',
    apple: '/icon.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Método STACK',
  },
};

// Configuración del color de la barra superior en móviles (Verde Stack)
export const viewport: Viewport = {
  themeColor: '#2d5a3d',
};

const sora = Sora({
  subsets: ['latin'],
  variable: '--font-sora',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
});

const dmMono = DM_Mono({
  weight: ['400', '500'],
  subsets: ['latin'],
  variable: '--font-dm-mono',
  display: 'swap',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        {/* 1. LCP PRELOAD: CRITICAL FOR 2.5s TARGET */}
        <link rel="preload" as="image" href="/hero-mobile.webp" media="(max-width: 767px)" fetchPriority="high" />
        <link rel="preload" as="image" href="/hero.webp" media="(min-width: 768px)" fetchPriority="high" />

        {/* 2. CRITICAL CSS INLINED (ZERO EXTERNAL DEPENDENCIES FOR HERO) */}
        <style dangerouslySetInnerHTML={{ __html: `
          :root { --brand-green: #00C853; --text-dark: #111111; --brand-green-light: rgba(0, 200, 83, 0.1); }
          html, body { background: #fff; color: var(--text-dark); margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; }
          #hero { padding-top: 6rem; padding-bottom: 3rem; min-height: 70vh; display: flex; flex-direction: column; justify-content: center; text-align: center; }
          .hero-title { font-size: clamp(2.5rem, 8vw, 7rem); font-weight: 900; font-style: italic; letter-spacing: -0.05em; text-transform: uppercase; line-height: 1.05; margin-bottom: 1.5rem; color: #111; }
          .hero-img-container { position: relative; width: 100%; max-width: 1024px; margin: 3rem auto; aspect-ratio: 3/2; background: var(--brand-green-light); border-radius: 1.5rem; border: 4px solid #fff; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.15); overflow: hidden; }
          .hero-img-container img { width: 100%; height: auto; object-fit: contain; }
          @media (max-width: 640px) { #hero { padding-top: 5rem; } .hero-title { font-size: 3.5rem; } }
          
          /* Utility classes used in Hero to prevent layout jump before Tailwind loads */
          .max-w-5xl { max-width: 64rem; margin-left: auto; margin-right: auto; }
          .mx-auto { margin-left: auto; margin-right: auto; }
          .text-center { text-align: center; }
          .px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
        ` }} />

        {/* 3. NON-CRITICAL CSS DEFERRAL */}
        {/* We rely on the inlined CSS above to prevent FCP/LCP delay while globals.css loads */}
      </head>
      <body className={`${sora.variable} ${dmSans.variable} ${dmMono.variable} bg-app-bg text-app-text font-sora antialiased`}>
        <I18nProvider>
          <main>
            {children}
          </main>
        </I18nProvider>

        {/* 4. THIRD-PARTY SCRIPTS: LAZY ONLOAD */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.addEventListener('load', () => {
                // Defer non-critical trackers and geo-tools
                if ('requestIdleCallback' in window) {
                  requestIdleCallback(() => {
                    if ('serviceWorker' in navigator) {
                      navigator.serviceWorker.register('/sw.js');
                    }
                  });
                }
              });
            `,
          }}
        />
      </body>
    </html>
  );
}