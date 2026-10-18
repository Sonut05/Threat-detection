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
        fetchData();
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
        fetchData();
      }
    } catch (e) {
      console.error("Failed to delete user", e);
    }
  };

  if (!stats || !user || !dashStats) {
    return (
      <div style={{ display: 'grid', placeItems: 'center', minHeight: '60vh' }}>
        <div className="db-spin" style={{ width: 28, height: 28, borderColor: 'rgba(255,255,255,0.15)', borderTopColor: 'var(--acc)' }} />
      </div>
    );
  }

  const filteredActivities = dashStats.user_activities.filter((u) =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.id.toString().includes(searchTerm)
  );

  return (
    <>
      <header className="db-header">
        <div>
          <p className="db-eyebrow">Administration</p>
          <h1 className="db-title">Admin console</h1>
          <p className="db-subtitle">Platform-wide statistics and system monitoring.</p>
        </div>
        <div className="db-badge-online">
          <i />
          <span>System status: Online</span>
        </div>
      </header>

      {/* 4-column Stat Strip */}
      <div className="db-stat-strip">
        <div className="db-stat-cell">
          <span className="db-stat-label">Total users</span>
          <p className="db-stat-val">{stats.total_users}</p>
        </div>
        <div className="db-stat-cell">
          <span className="db-stat-label">Platform messages</span>
          <p className="db-stat-val">{stats.total_messages}</p>
        </div>
        <div className="db-stat-cell">
          <span className="db-stat-label">Global spam detected</span>
          <p className="db-stat-val spam">{stats.spam_detected}</p>
        </div>
        <div className="db-stat-cell">
          <span className="db-stat-label">System accuracy</span>
          <p className="db-stat-val safe">{stats.system_accuracy}%</p>
        </div>
      </div>

      {/* Grid: Global Logs & User Management */}
      <div className="db-grid" style={{ marginBottom: '32px' }}>
        {/* Recent Detection Logs */}
        <section className="db-card" style={{ display: 'flex', flexDirection: 'column', height: '480px' }}>
          <div className="db-card-header">
            <h2 className="db-card-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--acc)' }}>
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
              </svg>
              Live global logs
            </h2>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
            <div className="db-list">
              {stats.recent_logs && stats.recent_logs.length > 0 ? (
                stats.recent_logs.map((log) => (
                  <div key={log.id} className="db-row" style={{ padding: '12px 0' }}>
                    <div className="db-row-top">
                      <div className="db-row-meta">
                        <span className={`db-chip ${log.prediction === 'Spam' ? 'spam' : 'safe'}`}>
                          {log.prediction}
                        </span>
                        <span className="db-chip type">{log.msg_type}</span>
                        <span style={{ fontSize: '13px', color: '#fff', fontWeight: 500 }}>
                          #{log.id}
                        </span>
                      </div>
                      <span style={{ fontSize: '12px', color: 'var(--dim)' }}>
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="db-row-bottom">
                      <span>User ID: {log.user_id}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="db-empty">No logs available.</p>
              )}
            </div>
          </div>
        </section>

        {/* Active Users */}
        <section className="db-card" style={{ display: 'flex', flexDirection: 'column', height: '480px' }}>
          <div className="db-card-header">
            <h2 className="db-card-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--acc)' }}>
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              Registered users
            </h2>
            <span style={{ fontSize: '12.5px', color: 'var(--dim)' }}>
              Total: {users.length}
            </span>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
            <div className="db-list">
              {users.map((u) => (
                <div key={u.id} className="db-row" style={{ padding: '12px 0', opacity: u.is_active ? 1 : 0.65 }}>
                  <div className="db-row-top">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                      <div className="db-avatar" style={{ width: 28, height: 28, fontSize: 12 }}>
                        {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: '13.5px', fontWeight: 500, color: '#fff' }}>
                          {u.name}
                        </p>
                        <p style={{ margin: 0, fontSize: '11.5px', color: 'var(--dim)' }}>
                          ID: {u.id} · {u.email}
                        </p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {u.role === 'admin' ? (
                        <span className="db-chip" style={{ background: 'rgba(167,139,250,0.15)', color: 'var(--acc)', border: '1px solid rgba(167,139,250,0.3)' }}>
                          ADMIN
                        </span>
                      ) : (
                        <button
                          onClick={() => toggleUserStatus(u.id, u.is_active)}
                          className="db-btn-ghost db-btn-sm"
                          style={{
                            height: '28px',
                            padding: '0 10px',
                            fontSize: '11.5px',
                            borderColor: u.is_active ? 'rgba(255, 122, 122, 0.3)' : 'rgba(110, 231, 168, 0.3)',
                            color: u.is_active ? 'var(--bad)' : 'var(--ok)'
                          }}
                          type="button"
                        >
                          {u.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* User Activity & Scan Counts Table */}
      <section className="db-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '22px 28px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 className="db-card-title" style={{ margin: 0 }}>
              User scan activity
            </h2>
            <p className="db-subtitle" style={{ margin: '4px 0 0' }}>
              Individual scan volume and account status across all users.
            </p>
          </div>

          <div className="db-search">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="db-table-wrap">
          <table className="db-table">
            <thead>
              <tr>
                <th>User ID</th>
                <th>Name / Email</th>
                <th>Role</th>
                <th>Total SMS</th>
                <th>Total Email</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredActivities.length > 0 ? (
                filteredActivities.map((u) => (
                  <tr key={u.id}>
                    <td style={{ color: 'var(--dim)', fontVariantNumeric: 'tabular-nums' }}>
                      #{u.id}
                    </td>
                    <td>
                      <p style={{ margin: 0, fontWeight: 500, color: '#fff' }}>{u.name}</p>
                      <p style={{ margin: 0, fontSize: '12px', color: 'var(--dim)' }}>{u.email}</p>
                    </td>
                    <td>
                      <span className="db-chip" style={{ background: u.role === 'admin' ? 'rgba(167,139,250,0.15)' : 'rgba(255,255,255,0.04)', color: u.role === 'admin' ? 'var(--acc)' : 'var(--mute)' }}>
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 500, color: '#fff' }}>
                      {u.total_sms}
                    </td>
                    <td style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 500, color: '#fff' }}>
                      {u.total_emails}
                    </td>
                    <td>
                      <span className={`db-chip ${u.is_active ? 'safe' : 'spam'}`}>
                        {u.is_active ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => deleteUserCompletely(u.id)}
                          className="db-icon-btn"
                          title="Permanently Delete User"
                          type="button"
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                          </svg>
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="db-empty">
                    {searchTerm ? 'No users match your search.' : 'No user activity data available.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
