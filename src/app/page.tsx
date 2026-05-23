import LandingPage from '@/components/LandingPage';

export default function RootPage({ searchParams }: { searchParams: { geo?: string } }) {
  return (
    <>
      <LandingPage initialGeo={searchParams.geo} />
    </>
  );
}
