'use client';

import { useAuth } from '@/context/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

const publicPaths = ['/login', '/register'];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user && !publicPaths.includes(pathname)) {
      router.push('/login');
    }
    if (user && publicPaths.includes(pathname)) {
      router.push('/dashboard');
    }
  }, [user, loading, pathname, router]);

  if (loading) return <div className="flex items-center justify-center h-screen text-gray-500 dark:text-gray-400">Cargando...</div>;

  if (!user && !publicPaths.includes(pathname)) return null;

  if (user && publicPaths.includes(pathname)) return null;

  return <>{children}</>;
}
