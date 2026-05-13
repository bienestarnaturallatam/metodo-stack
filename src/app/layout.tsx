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
        {/* CRITICAL CSS: HERO & CORE RESET (First to process) */}
        <style dangerouslySetInnerHTML={{ __html: `
          :root { --brand-green: #00C853; --text-dark: #111111; }
          html, body { background: #fff; color: var(--text-dark); margin: 0; padding: 0; font-family: sans-serif; -webkit-font-smoothing: antialiased; }
          #hero { padding-top: 6rem; padding-bottom: 3rem; min-height: 70vh; display: flex; flex-direction: column; justify-content: center; text-align: center; }
          .hero-title { font-size: clamp(2.5rem, 8vw, 7rem); font-weight: 900; font-style: italic; letter-spacing: -0.05em; text-transform: uppercase; line-height: 1.05; margin-bottom: 1.5rem; color: #111; }
          .hero-img-container { position: relative; width: 100%; max-width: 1024px; margin: 3rem auto; aspect-ratio: 3/2; background: rgba(0,200,83,0.05); border-radius: 1.5rem; border: 4px solid #fff; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.15); overflow: hidden; }
          .hero-img-container img { width: 100%; height: auto; object-fit: contain; }
          @media (max-width: 640px) { #hero { padding-top: 5rem; } .hero-title { font-size: 3.5rem; } }
        ` }} />

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        {/* Supabase Preconnect */}
        <link rel="preconnect" href="https://metodo-stack.supabase.co" />
        <link rel="dns-prefetch" href="https://metodo-stack.supabase.co" />
        
        {/* LCP PRELOAD: ONLY MOBILE HAS FETCHPRIORITY="HIGH" AS REQUESTED */}
        <link rel="preload" as="image" href="/hero-mobile.webp" media="(max-width: 600px)" fetchPriority="high" />
        <link rel="preload" as="image" href="/hero.webp" media="(min-width: 601px)" />
      </head>
      <body className={`${sora.variable} ${dmSans.variable} ${dmMono.variable} bg-app-bg text-app-text font-sora antialiased`}>
        <I18nProvider>
          <main>
            {children}
          </main>
        </I18nProvider>

        {/* 2. REGISTRO DEL MOTOR DE INSTALACIÓN (Service Worker) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(registration) {
                      console.log('ServiceWorker registrado con éxito');
                    },
                    function(err) {
                      console.log('Error al registrar ServiceWorker:', err);
                    }
                  );
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}