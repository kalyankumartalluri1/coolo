import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { MobileActionBar } from '@/components/layout/MobileActionBar';

// All public-facing pages (home, services, areas, about, contact, etc.)
// use this layout which includes the site Header, Footer, and MobileActionBar.
// Portal pages have their own layout at /portal/layout.tsx and are excluded.
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <MobileActionBar />
    </>
  );
}
