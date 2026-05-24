import LandingPage from '@/components/LandingPage';

export default async function RootPage({ searchParams }: { searchParams: Promise<{ geo?: string }> }) {
  const resolvedParams = await searchParams;
  return (
    <>
      <LandingPage initialGeo={resolvedParams?.geo} />
    </>
  );
}
