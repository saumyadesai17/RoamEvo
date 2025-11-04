'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Check if user is already logged in
  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // User is logged in, check their role
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

          if (profile && ['admin', 'super_admin', 'content_manager'].includes(profile.role)) {
            // User has admin access, redirect to dashboard
            router.push('/admin/dashboard');
            return;
          }
        }
      } catch (error) {
        console.error('Session check error:', error);
      } finally {
        setCheckingAuth(false);
      }
    };

    checkExistingSession();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // Check if user has admin role
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();

        if (profile?.role === 'admin' || profile?.role === 'super_admin' || profile?.role === 'content_manager') {
          router.push('/admin/dashboard');
        } else {
          setError('Access denied. Admin privileges required.');
          await supabase.auth.signOut();
        }
      }
    } catch (err) {
      const error = err as Error;
      setError(error.message || 'Failed to login. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Show loading spinner while checking existing session
  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1d2952] mx-auto mb-4"></div>
          <p className="text-gray-600" style={{ fontFamily: 'Gideon Roman' }}>
            Checking authentication...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Image
            src="/images/logo.png"
            alt="Roamevo Logo"
            width={180}
            height={60}
            className="mx-auto mb-6"
          />
          <h1 className="text-2xl sm:text-3xl font-light text-[#000000] font-[family-name:var(--font-montserrat)] mb-2">
            Admin Portal
          </h1>
          <p className="text-sm text-[#00000099]">
            Sign in to manage your content
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white border border-[#0000001A] rounded-lg p-8">
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#000000CC] mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2.5 border border-[#0000001A] rounded-md focus:outline-none focus:border-[#4A5B2D] transition-colors text-[#000000] placeholder:text-[#00000066]"
                placeholder="admin@roamevo.com"
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#000000CC] mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2.5 border border-[#0000001A] rounded-md focus:outline-none focus:border-[#4A5B2D] transition-colors text-[#000000] placeholder:text-[#00000066]"
                placeholder="••••••••"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#4A5B2D] text-white py-3 rounded-md font-medium hover:bg-[#3d4a24] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-[#00000066] mt-6">
          © 2025 Roamevo. All rights reserved.
        </p>
      </div>
    </div>
  );
}
