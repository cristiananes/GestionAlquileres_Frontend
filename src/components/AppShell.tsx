'use client';

import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/Sidebar';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  return <>
    {user && <Sidebar />}
    <main className={`min-w-0 flex-1 overflow-y-auto p-4 md:p-6 animate-fade-in ${user ? 'pt-16 lg:pt-6' : ''}`}>{children}</main>
  </>;
}
