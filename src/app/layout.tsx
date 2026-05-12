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
        <link rel="preload" as="image" href="/hero.webp" type="image/webp" fetchPriority="high" />
      </head>
      <body className={`${sora.variable} ${dmSans.variable} ${dmMono.variable} bg-app-bg text-app-text font-sora antialiased`}>
        <I18nProvider>
          {children}
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