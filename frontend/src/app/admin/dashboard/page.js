"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { API_BASE_URL } from '@/config/api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export default function AdminAnalyticsDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [dashStats, setDashStats] = useState(null);

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [user, router]);

  useEffect(() => {
    const fetchDashStats = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/admin/dashboard-stats`);
        if (res.ok) {
          setDashStats(await res.json());
        }
      } catch (e) {
        console.error("Failed to fetch dashboard stats", e);
      }
    };

    if (user?.role === 'admin') {
      fetchDashStats();
    }
  }, [user]);

  if (!dashStats || !user) {
    return (
      <div style={{ display: 'grid', placeItems: 'center', minHeight: '60vh' }}>
        <div className="db-spin" style={{ width: 28, height: 28, borderColor: 'rgba(255,255,255,0.15)', borderTopColor: 'var(--acc)' }} />
      </div>
    );
  }

  const chartData = dashStats.user_activities.slice(0, 5).map((u) => ({
    name: u.name,
    sms: u.total_sms,
    email: u.total_emails,
  }));

  const totalSms = dashStats.user_activities.reduce((sum, u) => sum + u.total_sms, 0);
  const totalEmail = dashStats.user_activities.reduce((sum, u) => sum + u.total_emails, 0);

  const pieData = [
    { name: 'SMS Scans', value: totalSms },
    { name: 'Email Scans', value: totalEmail }
  ];
  const COLORS = ['#a78bfa', '#6ee7a8'];

  return (
    <>
      <header className="db-header">
        <div>
          <p className="db-eyebrow">Analytics</p>
          <h1 className="db-title">User activity analytics</h1>
          <p className="db-subtitle">Visual insights into user scanning behaviors.</p>
        </div>
      </header>

      {/* 3-column Stat Strip */}
      <div className="db-stat-strip" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
        <div className="db-stat-cell">
          <span className="db-stat-label">Total users</span>
          <p className="db-stat-val">{dashStats.total_users}</p>
        </div>
        <div className="db-stat-cell">
          <span className="db-stat-label">Total SMS scanned</span>
          <p className="db-stat-val accent">{totalSms}</p>
        </div>
        <div className="db-stat-cell">
          <span className="db-stat-label">Total email scanned</span>
          <p className="db-stat-val safe">{totalEmail}</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="db-grid" style={{ marginTop: '32px' }}>
        {/* Stacked Bar Chart */}
        <section className="db-card" style={{ display: 'flex', flexDirection: 'column', minHeight: '440px' }}>
          <div className="db-card-header">
            <h2 className="db-card-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--acc)' }}>
                <path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" />
              </svg>
              Top user scan activity
            </h2>
          </div>
          <div style={{ flex: 1, width: '100%', height: '320px', minHeight: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 16, right: 20, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--dim)" tick={{ fill: 'var(--dim)', fontSize: 12 }} />
                <YAxis stroke="var(--dim)" tick={{ fill: 'var(--dim)', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#09090b',
                    borderColor: 'rgba(255,255,255,0.12)',
                    color: '#f4f4f5',
                    borderRadius: '8px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.6)'
                  }}
                  itemStyle={{ color: '#f4f4f5' }}
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                />
                <Legend wrapperStyle={{ paddingTop: '16px', fontSize: '13px', color: 'var(--mute)' }} />
                <Bar dataKey="sms" name="SMS Scans" stackId="a" fill="#a78bfa" radius={[0, 0, 4, 4]} />
                <Bar dataKey="email" name="Email Scans" stackId="a" fill="#6ee7a8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Donut Chart */}
        <section className="db-card" style={{ display: 'flex', flexDirection: 'column', minHeight: '440px' }}>
          <div className="db-card-header">
            <h2 className="db-card-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--ok)' }}>
                <circle cx="12" cy="12" r="10" /><path d="m10 15 5-3-5-3v6Z" />
              </svg>
              Scan channel distribution
            </h2>
          </div>
          <div style={{ flex: 1, width: '100%', height: '320px', minHeight: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="45%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#09090b',
                    borderColor: 'rgba(255,255,255,0.12)',
                    color: '#f4f4f5',
                    borderRadius: '8px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.6)'
                  }}
                  itemStyle={{ color: '#f4f4f5' }}
                />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ paddingTop: '16px', fontSize: '13px', color: 'var(--mute)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
    </>
  );
}
