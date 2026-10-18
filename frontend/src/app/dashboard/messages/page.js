"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { API_BASE_URL } from '@/config/api';

export default function MessagesPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = async () => {
    if (!user) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/messages/history?user_id=${user.id}`);
      if (res.ok) {
        setMessages(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (msgId) => {
    if (!window.confirm("Are you sure you want to delete this message?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/messages/${msgId}?user_id=${user.id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchMessages();
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMessages();
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
          <p className="db-eyebrow">History</p>
          <h1 className="db-title">Message history</h1>
          <p className="db-subtitle">Review all your analyzed messages and their threat levels.</p>
        </div>
        <div className="db-badge-online" style={{ color: 'var(--mute)', borderColor: 'var(--line)', background: 'rgba(255,255,255,0.03)' }}>
          Total messages: {messages.length}
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
                <th>Date analyzed</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {messages.length > 0 ? (
                messages.map((msg) => (
                  <tr key={msg.id}>
                    <td>
                      <span className="db-chip type">{msg.msg_type}</span>
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
                        title={msg.content}
                      >
                        {msg.content}
                      </p>
                    </td>
                    <td>
                      <span className={`db-chip ${msg.prediction === 'Spam' ? 'spam' : 'safe'}`}>
                        {msg.prediction}
                      </span>
                    </td>
                    <td>
                      <div className="db-conf-bar">
                        <div className="db-conf-track">
                          <div
                            className={`db-conf-fill ${msg.prediction === 'Spam' ? 'spam' : 'safe'}`}
                            style={{ width: `${Math.round((msg.confidence || 0) * 100)}%` }}
                          />
                        </div>
                        <span style={{ fontSize: '12px', color: 'var(--dim)', fontVariantNumeric: 'tabular-nums' }}>
                          {Math.round((msg.confidence || 0) * 100)}%
                        </span>
                      </div>
                    </td>
                    <td style={{ fontSize: '12.5px', color: 'var(--dim)', whiteSpace: 'nowrap' }}>
                      {new Date(msg.timestamp).toLocaleString()}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => handleDelete(msg.id)}
                        className="db-icon-btn"
                        title="Delete Message"
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
                    No scans yet.
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
