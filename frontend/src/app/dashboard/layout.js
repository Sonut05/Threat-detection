"use client";

import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import Sidebar from '../../components/Sidebar';
import { useEffect } from 'react';
import '../_dashboard/dashboard.css';

export default function DashboardLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="db-root" style={{ display: 'grid', placeItems: 'center', minHeight: '100dvh' }}>
        <div className="db-spin" style={{ width: 32, height: 32, borderColor: 'rgba(255,255,255,0.15)', borderTopColor: 'var(--acc)' }} />
      </div>
    );
  }

  return (
    <div className="db-root">
      <div className="db-shell">
        <Sidebar />
        <main className="db-main">
          <div className="db-container">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
