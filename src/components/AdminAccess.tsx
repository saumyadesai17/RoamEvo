'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminAccess() {
  const router = useRouter();

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ctrl+Shift+A to access admin
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        router.push('/admin');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [router]);

  return (
    /* Hidden Admin Access - Triple click the period */
    <button
      onClick={() => router.push('/admin')}
      className="ml-0.5 opacity-0 hover:opacity-5 transition-opacity cursor-default w-1 h-1"
      aria-hidden="true"
      tabIndex={-1}
      title=""
    >
      .
    </button>
  );
}
