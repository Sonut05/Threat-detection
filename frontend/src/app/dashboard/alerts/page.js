"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { API_BASE_URL } from '@/config/api';

export default function AlertsPage() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    if (!user) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/messages/history?user_id=${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setAlerts(data.filter((msg) => msg.prediction === 'Spam'));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (msgId) => {
    if (!window.confirm("Are you sure you want to delete this alert?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/messages/${msgId}?user_id=${user.id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchAlerts();
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [user]);

  if (loading) {
    return (
      <div style={{ display: 'grid', placeItems: 'center', minHeight: '60vh' }}>
        <div className="db-spin" style={{ width: 28, height: 28, borderColor: 'rgba(255,255,255,0.15)', borderTopColor: 'var(--acc)' }} />
      </div>
    );
  }

  return (
    <>
      <header className="db-header">
        <div>
          <p className="db-eyebrow" style={{ color: 'var(--bad)' }}>Threat Intelligence</p>
          <h1 className="db-title">Threat alerts</h1>
          <p className="db-subtitle">Review critical spam incidents detected on your account.</p>
        </div>
        <div className="db-ratio-pill critical">
          {alerts.length} {alerts.length === 1 ? 'threat' : 'threats'} detected
        </div>
      </header>

      <section className="db-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="db-table-wrap">
          <table className="db-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Content preview</th>
                <th>Verdict</th>
                <th>Confidence</th>
                <th>Date detected</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {alerts.length > 0 ? (
                alerts.map((alert) => (
                  <tr key={alert.id}>
                    <td>
                      <span className="db-chip type">{alert.msg_type}</span>
                    </td>
                    <td style={{ maxWidth: '380px' }}>
                      <p
                        style={{
                          margin: 0,
                          fontSize: '13.5px',
                          color: '#fff',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                        title={alert.content}
                      >
                        {alert.content}
                      </p>
                    </td>
                    <td>
                      <span className="db-chip spam">
                        {alert.prediction}
                      </span>
                    </td>
                    <td>
                      <div className="db-conf-bar">
                        <div className="db-conf-track">
                          <div
                            className="db-conf-fill spam"
                            style={{ width: `${Math.round((alert.confidence || 0) * 100)}%` }}
                          />
                        </div>
                        <span style={{ fontSize: '12px', color: 'var(--dim)', fontVariantNumeric: 'tabular-nums' }}>
                          {Math.round((alert.confidence || 0) * 100)}%
                        </span>
                      </div>
                    </td>
                    <td style={{ fontSize: '12.5px', color: 'var(--dim)', whiteSpace: 'nowrap' }}>
                      {new Date(alert.timestamp).toLocaleString()}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => handleDelete(alert.id)}
                        className="db-icon-btn"
                        title="Delete Alert"
                        type="button"
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="db-empty">
                    No threat alerts detected.
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
