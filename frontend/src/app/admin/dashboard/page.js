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
    // Only allow admins
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
      <div className="animate-pulse flex gap-4 h-full">
        <div className="flex-1 bg-white/5 rounded-2xl"></div>
      </div>
    );
  }

  // Prepare chart data from API stats
  // Limit to top 5 users or just take first 5
  const chartData = dashStats.user_activities.slice(0, 5).map(u => ({
    name: u.name,
    sms: u.total_sms,
    email: u.total_emails,
  }));

  // Prepare Donut chart data
  const totalSms = dashStats.user_activities.reduce((sum, u) => sum + u.total_sms, 0);
  const totalEmail = dashStats.user_activities.reduce((sum, u) => sum + u.total_emails, 0);

  const pieData = [
    { name: 'SMS Scans', value: totalSms },
    { name: 'Email Scans', value: totalEmail }
  ];
  const COLORS = ['#20b2aa', '#8a2be2'];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Activity Analytics</h1>
          <p className="text-gray-400 mt-1">Visual insights into user scanning behaviors.</p>
        </div>
      </header>

      {/* Top Stat Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 border-t-4 border-t-blue-500">
          <p className="text-sm text-gray-400 font-medium mb-1">Total Users</p>
          <p className="text-4xl font-bold" style={{ color: 'var(--foreground)' }}>{dashStats.total_users}</p>
        </div>
        <div className="glass-panel p-6 border-t-4 border-t-accent">
          <p className="text-sm text-gray-400 font-medium mb-1">Total SMS Scanned</p>
          <p className="text-4xl font-bold" style={{ color: 'var(--foreground)' }}>{totalSms}</p>
        </div>
        <div className="glass-panel p-6 border-t-4 border-t-primary">
          <p className="text-sm text-gray-400 font-medium mb-1">Total Emails Scanned</p>
          <p className="text-4xl font-bold" style={{ color: 'var(--foreground)' }}>{totalEmail}</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mt-8">
        {/* Stacked Bar Chart */}
        <div className="glass-panel p-6 xl:col-span-2 flex flex-col min-h-[400px]">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
            User Scan Activity Comparison
          </h2>
          <div className="flex-1 w-full h-full min-h-[300px]" style={{ height: "300px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--foreground)" tick={{ fill: 'var(--foreground)', fontSize: 12 }} />
                <YAxis stroke="var(--foreground)" tick={{ fill: 'var(--foreground)', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--glass-border)', color: 'var(--foreground)', borderRadius: '8px' }}
                  itemStyle={{ color: 'var(--foreground)' }}
                  cursor={{ fill: 'var(--nav-item-hover)' }}
                />
                <Legend wrapperStyle={{ paddingTop: '10px' }} />
                <Bar dataKey="sms" name="SMS Scans" stackId="a" fill="#20b2aa" radius={[0, 0, 4, 4]} />
                <Bar dataKey="email" name="Email Scans" stackId="a" fill="#8a2be2" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Chart */}
        <div className="glass-panel p-6 flex flex-col min-h-[400px]">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>
            Scan Type Ratio
          </h2>
          <div className="flex-1 w-full h-full min-h-[300px]" style={{ height: "300px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--glass-border)', color: 'var(--foreground)', borderRadius: '8px' }}
                  itemStyle={{ color: 'var(--foreground)' }}
                />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ paddingTop: '20px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <footer className="mt-12 text-center border-t pt-8 pb-4" style={{ borderColor: 'var(--glass-border)' }}>
        <p className="text-sm font-medium text-gray-400">
          SpamSheilder Admin Panel - Managed by Sonu Tiwari (Roll No. 37, Enrollment: 2303051240228)
        </p>
      </footer>
    </div>
  );
}
