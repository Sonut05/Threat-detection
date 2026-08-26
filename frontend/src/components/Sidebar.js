"use client";

import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useRouter } from 'next/navigation';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  return (
    <div className="w-64 h-full border-r flex flex-col pt-8 pb-4 transition-colors duration-300" style={{ backgroundColor: 'var(--sidebar-bg)', borderColor: 'var(--glass-border)' }}>
      <div className="px-6 mb-10 flex items-center justify-between">
        <div 
          onClick={() => window.location.reload()}
          className="flex items-center gap-3 font-bold text-xl tracking-wide cursor-pointer group"
        >
          <div className="p-2 rounded-lg bg-success/20 text-success border border-success/50 shadow-[0_0_15px_rgba(34,197,94,0.2)] transition-all duration-300 group-hover:scale-110">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <path d="m9 12 2 2 4-4"/>
            </svg>
          </div>
          <span style={{ color: 'var(--foreground)' }}>SpamShield</span>
        </div>

        <button 
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-primary/10 transition-all duration-300 text-primary border border-transparent hover:border-primary/20"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
          )}
        </button>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        <a href="/dashboard" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${'/dashboard' === typeof window !== 'undefined' && window.location.pathname === '/dashboard' ? 'bg-primary text-white font-medium shadow-lg shadow-primary/20' : 'text-gray-400 hover:text-primary hover:bg-primary/10'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
          Dashboard
        </a>
        <a href="/dashboard/messages" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${'/dashboard/messages' === typeof window !== 'undefined' && window.location.pathname === '/dashboard/messages' ? 'bg-primary/20 text-primary font-medium border border-primary/20 shadow-sm' : 'text-gray-400 hover:text-primary hover:bg-primary/10'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          Messages
        </a>
        <a href="/dashboard/alerts" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${'/dashboard/alerts' === typeof window !== 'undefined' && window.location.pathname === '/dashboard/alerts' ? 'bg-danger/20 text-danger font-medium border border-danger/20 shadow-sm' : 'text-gray-400 hover:text-danger hover:bg-danger/10'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
          Alerts
        </a>
        <a href="/dashboard/about" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${'/dashboard/about' === typeof window !== 'undefined' && window.location.pathname === '/dashboard/about' ? 'bg-primary/20 text-primary font-medium border border-primary/20 shadow-sm' : 'text-gray-400 hover:text-primary hover:bg-primary/10'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
          About
        </a>
        
        {user?.role === 'admin' && (
          <div className="pt-6 mt-6 border-t space-y-2" style={{ borderColor: 'var(--glass-border)' }}>
            <p className="px-4 text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Admin Control</p>
            <a href="/admin" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${'/admin' === typeof window !== 'undefined' && window.location.pathname === '/admin' ? 'bg-primary/20 text-primary font-medium border border-primary/20 shadow-sm' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
              Admin Panel
            </a>
            <a href="/admin/dashboard" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${'/admin/dashboard' === typeof window !== 'undefined' && window.location.pathname === '/admin/dashboard' ? 'bg-accent/20 text-accent font-medium border border-accent/20 shadow-sm' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
              User Activity
            </a>
          </div>
        )}
      </nav>

      <div className="px-4">
        <div className="p-4 rounded-xl border flex items-center gap-3 mb-2 transition-all duration-300" style={{ backgroundColor: 'var(--glass-bg)', borderColor: 'var(--glass-border)', boxShadow: 'var(--card-shadow)' }}>
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center text-sm font-bold text-white shadow-md">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate" style={{ color: 'var(--foreground)' }}>{user?.name || 'User'}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>
        <button 
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 py-2 text-sm text-gray-400 hover:text-red-400 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          Sign Out
        </button>
      </div>
    </div>
  );
}
