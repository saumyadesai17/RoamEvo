'use client';

import './admin-contrast.css';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';

interface User {
  email: string;
  role: string;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        
        if (!authUser) {
          router.push('/admin');
          return;
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('role, email')
          .eq('id', authUser.id)
          .single();

        if (!profile || !['admin', 'super_admin', 'content_manager'].includes(profile.role)) {
          router.push('/admin');
          return;
        }

        setUser({
          email: profile.email,
          role: profile.role,
        });
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/admin');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          router.push('/admin');
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          // Re-check auth when session is refreshed
          checkAuth();
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/admin');
  };

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard' },
    { name: 'Tours', href: '/admin/dashboard/tours' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#4A5B2D]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-[#0000001A] transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-[#0000001A]">
          <Link href="/admin/dashboard">
            <Image
              src="/images/logo.png"
              alt="Roamevo"
              width={140}
              height={45}
              className="h-10 w-auto"
            />
          </Link>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/admin/dashboard' && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`block px-4 py-2.5 text-sm rounded-md transition-colors ${
                  isActive
                    ? 'bg-[#4A5B2D]/10 text-[#4A5B2D] font-medium'
                    : 'text-[#000000CC] hover:bg-[#00000008]'
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[#0000001A]">
          <div className="mb-3 px-2">
            <p className="text-sm font-medium text-[#000000] truncate">
              {user?.email}
            </p>
            <p className="text-xs text-[#00000066] capitalize">
              {user?.role?.replace('_', ' ')}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 text-sm text-[#e7000b] hover:bg-[#00000008] rounded-md transition-colors text-left"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Bar */}
        <header className="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 border-b border-[#0000001A] bg-white sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-[#000000CC]"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-lg font-light text-[#000000] font-(family-name:--font-montserrat)">
            {navigation.find(item => pathname === item.href || (item.href !== '/admin/dashboard' && pathname?.startsWith(item.href)))?.name || 'Dashboard'}
          </h1>
          <div className="hidden sm:block text-sm text-[#00000066]">
            Welcome back
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
