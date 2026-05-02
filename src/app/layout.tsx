import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'STACK — Habit Tracker',
  description: 'Tu sistema personal de hábitos y bienestar.',
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
