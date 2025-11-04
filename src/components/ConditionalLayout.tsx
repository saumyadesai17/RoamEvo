'use client';

import { usePathname } from 'next/navigation';
import NavbarWrapper from '@/components/NavbarWrapper';
import Footer from '@/components/Footer';

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <>
      <NavbarWrapper />
      <main className="min-h-screen">
        {children}
      </main>
      <Footer />
    </>
  );
}
