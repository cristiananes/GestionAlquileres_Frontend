'use client';

import { createContext, useContext, ReactNode, useCallback, useMemo, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
});

// localStorage is external React state: subscribe to changes in this tab and other tabs.
const sessionEvent = 'gestion-alquiler-session';
function subscribeSession(onChange: () => void) {
  window.addEventListener('storage', onChange);
  window.addEventListener(sessionEvent, onChange);
  return () => {
    window.removeEventListener('storage', onChange);
    window.removeEventListener(sessionEvent, onChange);
  };
}
const readToken = () => localStorage.getItem('token');
const serverToken = () => null;
const clientReady = () => true;
const serverReady = () => false;
function storeToken(value: string | null) {
  if (value) localStorage.setItem('token', value);
  else localStorage.removeItem('token');
  window.dispatchEvent(new Event(sessionEvent));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const token = useSyncExternalStore(subscribeSession, readToken, serverToken);
  const ready = useSyncExternalStore(subscribeSession, clientReady, serverReady);
  const loading = !ready;
  const user = useMemo<User | null>(() => {
    if (!token) return null;
    try {
      const encoded = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(encoded), c => c.charCodeAt(0))));
      if (!payload.sub || !payload.userId) return null;
      return { id: payload.userId, name: payload.name, email: payload.sub, role: payload.role };
    } catch {
      return null;
    }
  }, [token]);
  const router = useRouter();

  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    const data = res.data;
    storeToken(data.token);
    router.push('/dashboard');
  }, [router]);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const res = await authApi.register(name, email, password);
    const data = res.data;
    storeToken(data.token);
    router.push('/dashboard');
  }, [router]);

  const logout = useCallback(() => {
    storeToken(null);
    router.push('/login');
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
