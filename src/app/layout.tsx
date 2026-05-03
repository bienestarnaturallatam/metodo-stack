import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://metodo-stack.vercel.app'),
  title: {
    default: 'Método STACK — Tracker de Hábitos, Enfoque y Finanzas para Latinoamérica',
    template: '%s | Método STACK',
  },
  description: 'Método STACK es el sistema que convierte tus intenciones en rutinas reales. Control de hábitos, planeador semanal y motor financiero en un solo lugar. Empieza gratis hoy.',
  keywords: ['tracker de hábitos', 'productividad personal', 'control financiero', 'planeador semanal', 'Perú', 'Latinoamérica', 'método STACK', 'alto rendimiento'],
  openGraph: {
    title: 'Método STACK — Domina tus hábitos con un sistema',
    description: 'Tracker de hábitos + planeador semanal + control financiero. Empieza gratis.',
    url: 'https://metodo-stack.vercel.app',
    siteName: 'Método STACK',
    locale: 'es_PE',
    type: 'website',
    images: [{
      url: '/og-image.png',
      width: 1200,
      height: 630,
      alt: 'Método STACK — Tracker de hábitos y finanzas',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Método STACK — Domina tus hábitos',
    description: 'Sistema completo: hábitos + enfoque + finanzas. Empieza gratis hoy.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/icon.png',
    apple: '/icon.png',
  },
  alternates: {
    canonical: 'https://metodo-stack.vercel.app',
  },
};

import { I18nProvider } from '@/hooks/useTranslation';

import { DM_Sans, DM_Mono } from 'next/font/google';

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
      <body className={`${dmSans.variable} ${dmMono.variable} bg-app-bg text-app-text font-sans antialiased`}>
        <I18nProvider>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
