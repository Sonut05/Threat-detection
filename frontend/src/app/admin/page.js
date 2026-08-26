"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { API_BASE_URL } from '@/config/api';

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [dashStats, setDashStats] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [user, router]);

  const fetchData = async () => {
    try {
      const [statsRes, usersRes, dashStatsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/admin/stats`),
        fetch(`${API_BASE_URL}/api/admin/users`),
        fetch(`${API_BASE_URL}/api/admin/dashboard-stats`)
      ]);
      if (statsRes.ok && usersRes.ok && dashStatsRes.ok) {
        setStats(await statsRes.json());
        setUsers(await usersRes.json());
        setDashStats(await dashStatsRes.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchData();
    }
  }, [user]);

  const toggleUserStatus = async (userId, currentStatus) => {
    const endpoint = currentStatus === 1 ? 'deactivate' : 'activate';
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/${endpoint}`, {
        method: 'POST'
      });
      if (res.ok) {
        fetchData(); // Refresh list
      }
    } catch (e) {
      console.error(e);
    }
  };

  const deleteUserCompletely = async (userId) => {
    if (!confirm(`Are you sure you want to permanently delete user #${userId} and ALL their scan records? This action cannot be undone.`)) return;
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchData(); // Refresh list
      }
    } catch (e) {
      console.error("Failed to delete user", e);
    }
  };

  if (!stats || !user || !dashStats) return <div className="animate-pulse flex gap-4 h-full"><div className="flex-1 bg-white/5 rounded-2xl"></div></div>;

  const filteredActivities = dashStats.user_activities.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.id.toString().includes(searchTerm)
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Console</h1>
          <p className="text-gray-400 mt-1">Platform-wide statistics and system monitoring.</p>
        </div>
        <div className="bg-primary/20 text-primary border border-primary/30 px-4 py-2 rounded-lg text-sm font-semibold shadow-[0_0_15px_rgba(138,43,226,0.2)]">
          System Status: Online
        </div>
      </header>

      {/* Global Stats Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-panel p-6 border-t-4 border-t-blue-500">
          <p className="text-sm text-gray-400 font-medium mb-1">Total Users</p>
          <p className="text-4xl font-bold">{stats.total_users}</p>
        </div>
        <div className="glass-panel p-6 border-t-4 border-t-purple-500">
          <p className="text-sm text-gray-400 font-medium mb-1">Platform Messages</p>
          <p className="text-4xl font-bold">{stats.total_messages}</p>
        </div>
        <div className="glass-panel p-6 border-t-4 border-t-danger">
          <p className="text-sm text-gray-400 font-medium mb-1">Global Spam Detected</p>
          <p className="text-4xl font-bold text-danger">{stats.spam_detected}</p>
        </div>
        <div className="glass-panel p-6 border-t-4 border-t-success">
          <p className="text-sm text-gray-400 font-medium mb-1">System Accuracy</p>
          <p className="text-4xl font-bold text-success">{stats.system_accuracy}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        {/* Recent Detection Logs */}
        <div className="glass-panel p-6 flex flex-col h-[500px]">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>
            Live Global Logs
          </h2>
          <div className="overflow-y-auto flex-1 pr-2 space-y-3">
            {stats.recent_logs.map(log => (
              <div key={log.id} className="flex items-center justify-between p-3 rounded-lg border transition-colors duration-300" style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--glass-border)' }}>
                <div className="flex items-center gap-4">
                  <div className={`w-2 h-2 rounded-full shadow-lg ${log.prediction === 'Spam' ? 'bg-danger shadow-danger/50' : 'bg-success shadow-success/50'}`} />
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>Detection ID #{log.id} <span className="text-xs text-gray-500 ml-2 uppercase">[{log.msg_type}]</span></p>
                    <p className="text-xs text-gray-500">User ID: {log.user_id}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-bold px-2 py-1 rounded border ${log.prediction === 'Spam' ? 'bg-danger/10 border-danger/20 text-danger' : 'bg-success/10 border-success/20 text-success'}`}>
                    {log.prediction}
                  </span>
                  <p className="text-[10px] text-gray-500 mt-1">{new Date(log.timestamp).toLocaleTimeString()}</p>
                </div>
              </div>
            ))}
            {stats.recent_logs.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-8">No logs available.</p>
            )}
          </div>
        </div>

        {/* User Management Real */}
        <div className="glass-panel p-6 flex flex-col h-[500px]">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            Active Users
          </h2>
          <div className="overflow-y-auto flex-1 pr-2 space-y-3">
            {users.map(u => (
              <div key={u.id} className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-300 ${!u.is_active ? 'opacity-70 grayscale-[0.5]' : ''}`} style={{ backgroundColor: u.is_active ? 'var(--input-bg)' : 'rgba(255, 75, 75, 0.05)', borderColor: u.is_active ? 'var(--glass-border)' : 'var(--danger)' }}>
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-sm ${u.is_active ? 'bg-gradient-to-br from-primary to-accent text-white' : 'bg-gray-400 text-gray-700'}`}>
                    {u.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
                      {u.name} 
                      {u.role === 'admin' && <span className="text-[10px] px-1 py-0.5 rounded bg-primary text-white font-bold">ADMIN</span>}
                      {!u.is_active && <span className="text-[10px] px-1 py-0.5 rounded bg-danger text-white font-bold">INACTIVE</span>}
                    </p>
                    <p className="text-xs text-gray-500">ID: {u.id} | {u.email}</p>
                  </div>
                </div>
                {u.role !== 'admin' && (
                  <button 
                    onClick={() => toggleUserStatus(u.id, u.is_active)}
                    className={`text-xs px-3 py-1 rounded border font-bold transition-all ${u.is_active ? 'text-danger border-danger/50 hover:bg-danger hover:text-white' : 'text-success border-success/50 hover:bg-success hover:text-white'}`}
                  >
                    {u.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* User Activity Dashboard Form */}
      <div className="glass-panel p-6 overflow-x-auto mt-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h2 className="text-xl font-semibold flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            User Activity & Scan Counts
          </h2>
          <div className="relative w-full md:w-64">
            <input 
              type="text" 
              placeholder="Search users..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border text-sm transition-colors focus:outline-none"
              style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--glass-border)', color: 'var(--foreground)' }}
            />
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-2.5 text-gray-500"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          </div>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b" style={{ borderColor: 'var(--glass-border)' }}>
              <th className="py-3 px-4 font-semibold text-gray-500 text-sm">USER ID</th>
              <th className="py-3 px-4 font-semibold text-gray-500 text-sm">NAME / EMAIL</th>
              <th className="py-3 px-4 font-semibold text-gray-500 text-sm">ROLE</th>
              <th className="py-3 px-4 font-semibold text-gray-500 text-sm">TOTAL SMS SCANS</th>
              <th className="py-3 px-4 font-semibold text-gray-500 text-sm">TOTAL EMAIL SCANS</th>
              <th className="py-3 px-4 font-semibold text-gray-500 text-sm">STATUS</th>
              <th className="py-3 px-4 font-semibold text-gray-500 text-sm text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredActivities.map(u => (
              <tr key={u.id} className="border-b transition-colors hover:bg-black/5 dark:hover:bg-white/5" style={{ borderColor: 'var(--glass-border)' }}>
                <td className="py-3 px-4 font-medium" style={{ color: 'var(--foreground)' }}>#{u.id}</td>
                <td className="py-3 px-4">
                  <p className="font-semibold" style={{ color: 'var(--foreground)' }}>{u.name}</p>
                  <p className="text-xs text-gray-500">{u.email}</p>
                </td>
                <td className="py-3 px-4">
                  <span className={`text-[10px] px-2 py-1 rounded font-bold ${u.role === 'admin' ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-gray-500/20 text-gray-500 border border-gray-500/30'}`}>
                    {u.role.toUpperCase()}
                  </span>
                </td>
                <td className="py-3 px-4 font-semibold text-accent">{u.total_sms}</td>
                <td className="py-3 px-4 font-semibold text-primary">{u.total_emails}</td>
                <td className="py-3 px-4">
                  <span className={`text-xs px-2 py-1 rounded font-bold ${u.is_active ? 'text-success bg-success/10' : 'text-danger bg-danger/10'}`}>
                    {u.is_active ? 'Active' : 'Deactivated'}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  {u.role !== 'admin' && (
                    <button 
                      onClick={() => deleteUserCompletely(u.id)}
                      className="text-danger hover:bg-danger/10 p-2 rounded transition-colors"
                      title="Permanently Delete User"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {filteredActivities.length === 0 && (
              <tr>
                <td colSpan="7" className="py-8 text-center text-gray-500">
                  {searchTerm ? 'No users match your robust search query.' : 'No user activity data available.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
