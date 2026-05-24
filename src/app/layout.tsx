import type { Metadata, Viewport } from 'next';
import { Sora, DM_Sans } from 'next/font/google';
import './globals.css';

// 1. CONFIGURACIÓN DE METADATOS Y PWA
export const metadata: Metadata = {
  metadataBase: new URL('https://metodo-stack.vercel.app'),
  title: {
    default: 'Método STACK — Tracker de Hábitos, Enfoque y Finanzas',
    template: '%s | Método STACK',
  },
  description: 'Sistema integral para convertir intenciones en rutinas reales.',
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.webp',
    apple: '/icon.webp',
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
  preload: true,
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
  preload: true,
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        {/* 1. CRITICAL IMAGE PRELOADS — máxima prioridad para el LCP */}
        <link rel="preload" as="image" href="/hero-mobile.webp" media="(max-width: 767px)" fetchPriority="high" type="image/webp" />
        <link rel="preload" as="image" href="/hero.webp" media="(min-width: 768px)" fetchPriority="high" type="image/webp" />

        {/* 2. MINIFIED CRITICAL CSS — renderiza el hero SIN esperar CSS externo */}
        <style dangerouslySetInnerHTML={{ __html: `
          :root{--brand-green:#00C853;--text-dark:#111;--brand-green-light:rgba(0,200,83,.1)}
          *{box-sizing:border-box}
          html,body{background:#fff;color:var(--text-dark);margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;-webkit-text-size-adjust:100%}
          .min-h-screen{min-height:100vh}.bg-white{background:#fff}.font-sans{font-family:inherit}
          .flex{display:flex}.items-center{align-items:center}.justify-center{justify-content:center}.gap-2{gap:.5rem}
          .w-10{width:2.5rem}.h-10{height:2.5rem}.w-6{width:1.5rem}.h-6{height:1.5rem}.w-3{width:.75rem}.h-3{height:.75rem}.w-4{width:1rem}.h-4{height:1rem}
          .rounded-full{border-radius:9999px}.fill-current{fill:currentColor}
          .text-xl{font-size:1.25rem}.text-sm{font-size:.875rem}.font-black{font-weight:900}.font-bold{font-weight:700}.italic{font-style:italic}
          .tracking-tighter{letter-spacing:-.05em}.uppercase{text-transform:uppercase}.text-white{color:#fff}
          .hidden{display:none}
          #hero{padding-top:6rem;padding-bottom:2rem;min-height:auto;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center}
          .max-w-5xl{max-width:64rem;margin:0 auto}.px-6{padding-left:1.5rem;padding-right:1.5rem}
          nav{position:fixed;top:0;width:100%;background:rgba(255,255,255,.95);border-bottom:1px solid rgba(0,0,0,.05);z-index:50;height:5rem;display:flex;align-items:center}
          .nav-container{width:100%;max-width:80rem;margin:0 auto;padding:0 1.5rem;display:flex;justify-content:space-between;align-items:center}
          .hero-badge{display:inline-flex;align-items:center;gap:.5rem;padding:.5rem 1rem;border-radius:9999px;background:var(--brand-green-light);border:1px solid rgba(0,200,83,.2);color:var(--brand-green);font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:.2em;margin-bottom:.75rem}
          .hero-title{font-size:clamp(2.5rem,8vw,7rem);font-weight:900;font-style:italic;letter-spacing:-.05em;text-transform:uppercase;line-height:1.05;margin-bottom:1rem;color:#111}
          .hero-p{font-size:1.125rem;color:rgba(17,17,17,.7);font-weight:500;max-width:48rem;margin:0 auto 1.5rem;line-height:1.5}
          .btn-primary{position:relative;display:flex;align-items:center;justify-content:center;padding:1rem 2rem;background:var(--brand-green);color:#000;border-radius:9999px;font-weight:900;font-style:italic;font-size:1rem;letter-spacing:.1em;box-shadow:0 20px 40px -12px rgba(0,200,83,.3);text-decoration:none}
          .btn-icon{width:2rem;height:2rem;background:#fff;border-radius:9999px;display:flex;align-items:center;justify-content:center;margin-left:.75rem}
          .hero-img-container{position:relative;width:100%;max-width:1024px;margin:1.5rem auto 0;background:#fff;border-radius:1rem;border:3px solid #fff;box-shadow:0 20px 40px -12px rgba(0,0,0,.12);overflow:hidden}
          .hero-img-container img{width:100%;height:auto;display:block}
          @media(max-width:640px){#hero{padding-top:4.5rem;padding-bottom:1rem}.hero-title{font-size:2.8rem;margin-bottom:.75rem}.hero-p{font-size:1rem;margin-bottom:1rem}.hero-badge{font-size:9px;margin-bottom:.5rem}.btn-primary{padding:.875rem 1.5rem;font-size:.875rem}.hero-img-container{margin:1rem auto 0;border-radius:.75rem;border-width:2px}}
          @media(min-width:641px){nav{backdrop-filter:blur(12px);background:rgba(255,255,255,.8)}}
          @media(min-width:768px){.hidden{display:flex}.md\\:flex{display:flex}}
        ` }} />
      </head>
      <body className={`${sora.variable} ${dmSans.variable} bg-app-bg text-app-text font-sora antialiased`}>
          <main>
            {children}
          </main>

        {/* THIRD-PARTY SCRIPTS: LAZY ONLOAD */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.addEventListener('load', () => {
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
