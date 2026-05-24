import LandingPage from '@/components/LandingPage';

// Forzar página estática para que critters (optimizeCss) pueda
// inlinear CSS crítico y convertir el resto a carga asíncrona.
// La detección de geo se hace 100% en el cliente (timezone + APIs).
export default function RootPage() {
  return <LandingPage />;
}
