"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '@/config/api';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [msgInput, setMsgInput] = useState("");
  const [msgType, setMsgType] = useState("sms");
  const [loadingMsg, setLoadingMsg] = useState(false);
  const [popup, setPopup] = useState(null);

  const fetchStats = async () => {
    if (!user) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/dashboard/stats?user_id=${user.id}`);
      if (res.ok) {
        setStats(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [user]);

  const handleTestMessage = async (e) => {
    e.preventDefault();
    if (!msgInput.trim()) return;

    // Heuristic Validation Checks
    const lowerInput = msgInput.toLowerCase();
    if (msgType === 'sms') {
      if (msgInput.length > 250 || lowerInput.includes('subject:') || lowerInput.includes('forwarded message')) {
        window.alert("Validation Error: This message is too long or contains headers consistent with an Email. Please select the 'Email' tab before scanning!");
        return;
      }
    } else if (msgType === 'email') {
      if (msgInput.length < 50 && !lowerInput.includes('subject:') && !lowerInput.includes('@') && !lowerInput.includes('dear ')) {
        window.alert("Validation Error: This message is very short and lacks standard Email formatting. Please select the 'SMS' tab before scanning!");
        return;
      }
    }

    setLoadingMsg(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/messages/analyze?user_id=${user.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: msgInput,
          msg_type: msgType
        })
      });
      if (res.ok) {
        const data = await res.json();
        setMsgInput('');
        fetchStats();

        // Trigger popup if Spam is detected
        if (data.prediction === 'Spam') {
          setPopup({
            prediction: data.prediction,
            confidence: data.confidence,
            msg_type: data.msg_type
          });
          setTimeout(() => setPopup(null), 6000);
        }
      }
    } catch (err) {
      console.error(err);
    }
    setLoadingMsg(false);
  };

  const handleDeleteMessage = async (msgId) => {
    if (!window.confirm("Are you sure you want to delete this message from history?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/messages/${msgId}?user_id=${user.id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchStats();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!stats) {
    return (
      <div style={{ display: 'grid', placeItems: 'center', minHeight: '60vh' }}>
        <div className="db-spin" style={{ width: 28, height: 28, borderColor: 'rgba(255,255,255,0.15)', borderTopColor: 'var(--acc)' }} />
      </div>
    );
  }

  const threatRate = stats.total_analyzed > 0
    ? (stats.spam_detected / stats.total_analyzed) * 100
    : 0;

  const getThreatLevel = (rate) => {
    if (rate === 0) return 'safe';
    if (rate < 15) return 'low';
    if (rate < 40) return 'moderate';
    return 'critical';
  };

  const threatLevel = getThreatLevel(threatRate);

  return (
    <>
      <header className="db-header">
        <div>
          <p className="db-eyebrow">Overview</p>
          <h1 className="db-title">Security overview</h1>
          <p className="db-subtitle">Monitor and analyze message threats in real-time.</p>
        </div>
      </header>

      {/* Threat Detected Popup */}
      {popup && (
        <div className="db-popup-wrap" role="alert">
          <div className="db-popup">
            <div className="db-popup-header">
              <h4 className="db-popup-title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                Threat Detected
              </h4>
              <button onClick={() => setPopup(null)} className="db-popup-close" aria-label="Close notification" type="button">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="db-popup-body">
              <div className="db-popup-row">
                <span>Prediction</span>
                <span className="db-chip spam">{popup.prediction}</span>
              </div>
              <div className="db-popup-row">
                <span>Confidence</span>
                <span style={{ color: '#fff', fontWeight: 600 }}>{(popup.confidence * 100).toFixed(1)}%</span>
              </div>
              <div className="db-popup-row">
                <span>Message Type</span>
                <span className="db-chip type">{popup.msg_type}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4-column Stat Strip */}
      <div className="db-stat-strip">
        <div className="db-stat-cell">
          <span className="db-stat-label">Total analyzed</span>
          <p className="db-stat-val">{stats.total_analyzed}</p>
        </div>
        <div className="db-stat-cell">
          <span className="db-stat-label">Spam detected</span>
          <p className="db-stat-val spam">{stats.spam_detected}</p>
        </div>
        <div className="db-stat-cell">
          <span className="db-stat-label">Safe messages</span>
          <p className="db-stat-val safe">{stats.safe_messages}</p>
        </div>
        <div className="db-stat-cell">
          <span className="db-stat-label">Accuracy rate</span>
          <p className="db-stat-val accent">{stats.accuracy_rate}%</p>
        </div>
      </div>

      {/* Two-Column Grid */}
      <div className="db-grid">
        {/* Left Column: Form & Distribution */}
        <div className="db-col">
          {/* Analyze a message */}
          <section className="db-card">
            <div className="db-card-header">
              <h2 className="db-card-title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--acc)' }}>
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                Analyze a message
              </h2>
            </div>

            <form onSubmit={handleTestMessage}>
              <div className="db-toggle-group">
                <button
                  type="button"
                  onClick={() => setMsgType('sms')}
                  className={`db-toggle-btn ${msgType === 'sms' ? 'on' : ''}`}
                >
                  SMS
                </button>
                <button
                  type="button"
                  onClick={() => setMsgType('email')}
                  className={`db-toggle-btn ${msgType === 'email' ? 'on' : ''}`}
                >
                  Email
                </button>
              </div>

              <textarea
                value={msgInput}
                onChange={(e) => setMsgInput(e.target.value)}
                placeholder="Paste the message content here to scan for threats..."
                className="db-textarea"
                rows={4}
              />

              <button
                type="submit"
                disabled={loadingMsg || !msgInput.trim()}
                className="db-btn-primary"
              >
                {loadingMsg ? (
                  <>
                    <span className="db-spin" />
                    <span>Analyzing message...</span>
                  </>
                ) : (
                  <>
                    <span>Run AI Threat Detection</span>
                    <svg width="14" height="12" viewBox="0 0 12 10" fill="none" aria-hidden="true">
                      <path d="M0.8 5h10M7.1 1.4 10.9 5l-3.8 3.6" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </>
                )}
              </button>
            </form>
          </section>

          {/* Threat distribution */}
          <section className="db-card">
            <div className="db-card-header">
              <h2 className="db-card-title">Threat distribution</h2>
              <Link href="/dashboard/alerts" className="db-card-link">
                View alerts
                <svg width="12" height="10" viewBox="0 0 12 10" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M0.8 5h10M7.1 1.4 10.9 5l-3.8 3.6" />
                </svg>
              </Link>
            </div>

            {stats.total_analyzed > 0 ? (
              <>
                <div className="db-threat-strip">
                  {Array.from({ length: 20 }).map((_, i) => {
                    const step = (i + 1) * 5;
                    const isFilled = step <= threatRate;

                    let segClass = '';
                    if (isFilled) {
                      if (step <= 25) segClass = 'safe';
                      else if (step <= 50) segClass = 'low';
                      else if (step <= 75) segClass = 'moderate';
                      else segClass = 'critical';
                    }

                    return (
                      <div
                        key={i}
                        className={`db-threat-seg ${segClass}`}
                        title={`${step}%`}
                      />
                    );
                  })}
                </div>

                <div className="db-threat-legend">
                  <div className="db-legend-items">
                    <span className="db-legend-item">
                      <i className="db-legend-dot" style={{ background: 'var(--ok)' }} />
                      Safe
                    </span>
                    <span className="db-legend-item">
                      <i className="db-legend-dot" style={{ background: 'var(--warn)' }} />
                      Low
                    </span>
                    <span className="db-legend-item">
                      <i className="db-legend-dot" style={{ background: '#f97316' }} />
                      Moderate
                    </span>
                    <span className="db-legend-item">
                      <i className="db-legend-dot" style={{ background: 'var(--bad)' }} />
                      Critical
                    </span>
                  </div>

                  <span className={`db-ratio-pill ${threatLevel}`}>
                    Spam Ratio: {threatRate.toFixed(0)}%
                  </span>
                </div>
              </>
            ) : (
              <p className="db-empty" style={{ padding: '24px 0 8px' }}>No scans yet.</p>
            )}
          </section>
        </div>

        {/* Right Column: Recent activity */}
        <div className="db-col">
          <section className="db-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div className="db-card-header">
              <h2 className="db-card-title">Recent activity</h2>
              <Link href="/dashboard/messages" className="db-card-link">
                View all
                <svg width="12" height="10" viewBox="0 0 12 10" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M0.8 5h10M7.1 1.4 10.9 5l-3.8 3.6" />
                </svg>
              </Link>
            </div>

            <div className="db-list" style={{ flex: 1 }}>
              {stats.recent_messages && stats.recent_messages.length > 0 ? (
                stats.recent_messages.map((msg) => (
                  <div key={msg.id} className="db-row">
                    <div className="db-row-top">
                      <div className="db-row-meta">
                        <span className={`db-chip ${msg.prediction === 'Spam' ? 'spam' : 'safe'}`}>
                          {msg.prediction}
                        </span>
                        <span className="db-chip type">{msg.msg_type}</span>
                      </div>
                      <button
                        onClick={() => handleDeleteMessage(msg.id)}
                        className="db-icon-btn"
                        title="Delete from history"
                        type="button"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                        </svg>
                      </button>
                    </div>

                    <p className="db-row-content">
                      "{msg.content}"
                    </p>

                    <div className="db-row-bottom">
                      <span>{new Date(msg.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="db-empty">No scans yet.</p>
              )}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
