import type { Metadata, Viewport } from 'next';
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
        {/* 1. CRITICAL PRELOADS */}
        <link rel="preload" as="image" href="/hero-mobile.webp" media="(max-width: 767px)" fetchPriority="high" />
        <link rel="preload" as="image" href="/hero.webp" media="(min-width: 768px)" fetchPriority="high" />

        {/* 2. MINIFIED CRITICAL CSS */}
        <style dangerouslySetInnerHTML={{ __html: `
          :root{--brand-green:#00C853;--text-dark:#111;--brand-green-light:rgba(0,200,83,.1)}
          html,body{background:#fff;color:var(--text-dark);margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;font-display:swap;-webkit-font-smoothing:antialiased}
          #hero{padding-top:6rem;padding-bottom:3rem;min-height:70vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center}
          .max-w-7xl{max-width:80rem;margin:0 auto}.max-w-5xl{max-width:64rem;margin:0 auto}.px-6{padding-left:1.5rem;padding-right:1.5rem}
          nav{position:fixed;top:0;width:100%;background:rgba(255,255,255,.8);backdrop-filter:blur(12px);border-bottom:1px solid rgba(0,0,0,.05);z-index:50;height:5rem;display:flex;align-items:center}
          .nav-container{width:100%;max-width:80rem;margin:0 auto;padding:0 1.5rem;display:flex;justify-content:space-between;align-items:center}
          .hero-badge{display:inline-flex;align-items:center;gap:.5rem;padding:.5rem 1rem;border-radius:9999px;background:var(--brand-green-light);border:1px solid rgba(0,200,83,.2);color:var(--brand-green);font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:.2em;margin-bottom:1rem}
          .hero-title{font-size:clamp(2.5rem,8vw,7rem);font-weight:900;font-style:italic;letter-spacing:-.05em;text-transform:uppercase;line-height:1.05;margin-bottom:1.5rem;color:#111}
          .hero-p{font-size:1.25rem;color:rgba(17,17,17,.7);font-weight:500;max-width:48rem;margin:0 auto 2.5rem;line-height:1.5}
          .btn-primary{position:relative;display:flex;align-items:center;justify-content:center;padding:1.25rem 2.5rem;background:var(--brand-green);color:#000;border-radius:9999px;font-weight:900;font-style:italic;font-size:1.125rem;letter-spacing:.1em;transition:all .2s;box-shadow:0 25px 50px -12px rgba(0,200,83,.3);text-decoration:none}
          .btn-icon{width:2rem;height:2rem;background:#fff;border-radius:9999px;display:flex;align-items:center;justify-content:center;margin-left:.75rem}
          .hero-img-container{position:relative;width:100%;max-width:1024px;margin:3rem auto;aspect-ratio:3/2;background:var(--brand-green-light);border-radius:1.5rem;border:4px solid #fff;box-shadow:0 25px 50px -12px rgba(0,0,0,.15);overflow:hidden}
          .hero-img-container img{width:100%;height:auto;object-fit:contain;display:block}
          @media (max-width:640px){#hero{padding-top:5rem}.hero-title{font-size:3.5rem}}
        ` }} />
      </head>
      <body className={`${sora.variable} ${dmSans.variable} ${dmMono.variable} bg-app-bg text-app-text font-sora antialiased`}>
          <main>
            {children}
          </main>

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