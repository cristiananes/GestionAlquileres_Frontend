'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSidebar } from '@/context/SidebarContext';
import { LayoutDashboard, Building2, DollarSign, TrendingDown, Calendar, CheckSquare, Menu, X, Sun, Moon, Mail, ThumbsUp, LogOut } from 'lucide-react';
import { useDarkMode } from '@/context/DarkModeContext';
import { useAuth } from '@/context/AuthContext';

const links = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/properties', label: 'Propiedades', icon: Building2 },
  { href: '/incomes', label: 'Ingresos', icon: DollarSign },
  { href: '/expenses', label: 'Gastos', icon: TrendingDown },
  { href: '/calendar', label: 'Calendario', icon: Calendar },
  { href: '/tasks', label: 'Tareas', icon: CheckSquare },
  { href: '/contact', label: 'Contacto', icon: Mail },
  { href: '/feedback', label: 'Tu opinión', icon: ThumbsUp },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { open, toggle, close } = useSidebar();
  const { dark, toggle: toggleDark } = useDarkMode();
  const { user, logout } = useAuth();

  return (
    <>
      <button
        onClick={toggle}
        className="fixed top-4 left-4 z-50 lg:hidden bg-slate-800 text-white p-2.5 rounded-lg shadow-lg"
        aria-label="Toggle menu"
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={close}
        />
      )}

      <aside className={`fixed top-0 left-0 h-full w-64 bg-slate-800 text-white flex flex-col z-40 transition-transform duration-300 lg:translate-x-0 lg:static lg:h-screen ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-5 border-b border-slate-700">
          <h1 className="text-xl font-bold tracking-tight">GestionAlquiler</h1>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {links.map((link) => {
            const Icon = link.icon;
            const active = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={close}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <Icon size={18} />
                {link.label}
              </Link>
            );
          })}
        </nav>
        {user && (
          <div className="px-3 py-2 border-t border-slate-700">
            <div className="px-3 py-1.5 text-xs text-slate-400 truncate">{user.email}</div>
          </div>
        )}
        <div className="p-3 border-t border-slate-700 space-y-1">
          <button
            onClick={toggleDark}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
          >
            {dark ? <Sun size={18} /> : <Moon size={18} />}
            {dark ? 'Modo claro' : 'Modo oscuro'}
          </button>
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-900/30 hover:text-red-300 transition-colors"
          >
            <LogOut size={18} />
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  );
}
