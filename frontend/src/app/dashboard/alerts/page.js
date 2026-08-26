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
        setAlerts(data.filter(msg => msg.prediction === 'Spam')); 
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

  if (loading) return <div className="animate-pulse flex gap-4 h-full"><div className="flex-1 bg-white/5 rounded-2xl"></div></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-danger flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            Threat Alerts
          </h1>
          <p className="text-gray-400 mt-1">Review critical spam incidents detected on your account.</p>
        </div>
        <div className="bg-danger/20 text-danger border border-danger/30 px-4 py-2 rounded-lg text-sm font-bold shadow-[0_0_15px_rgba(255,75,75,0.2)]">
          {alerts.length} Critical Threats
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4">
        {alerts.length > 0 ? (
          alerts.map((alert) => (
            <div key={alert.id} className="glass-panel p-6 border-l-4 border-l-danger bg-danger/5 hover:bg-danger/10 transition-colors relative overflow-hidden group">
              {/* Decorative gradient blur */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-danger/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none transition-opacity group-hover:opacity-100 opacity-50"></div>
              
              <div className="flex items-start justify-between relative z-10">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="bg-danger text-white text-xs font-bold px-3 py-1 rounded shadow-lg shadow-danger/30 uppercase tracking-widest">
                      {alert.prediction} DETECTED
                    </span>
                    <span className="text-sm font-medium uppercase text-gray-400 border border-white/10 px-2 py-0.5 rounded">
                      {alert.msg_type}
                    </span>
                    <span className="text-xs text-danger/80 bg-danger/10 px-2 py-0.5 rounded border border-danger/20 font-mono">
                      CONFIDENCE: {(alert.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                  
                  <div className="mt-4 p-4 rounded-xl border relative transition-all duration-300" style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--glass-border)' }}>
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-danger/50 to-transparent opacity-30"></div>
                    <p className="mt-2 font-mono text-sm leading-relaxed" style={{ color: 'var(--foreground)' }}>
                      "{alert.content}"
                    </p>
                  </div>
                </div>
                
                <div className="text-right flex flex-col items-end gap-2">
                  <div className="text-sm font-medium text-gray-400">
                    {new Date(alert.timestamp).toLocaleDateString()}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleDelete(alert.id)}
                      className="mt-4 text-xs bg-danger/10 hover:bg-danger/20 text-danger px-4 py-2 rounded border border-danger/10 transition-colors flex items-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                      Delete
                    </button>
                    <button className="mt-4 text-xs bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded border border-white/10 transition-colors">
                      Report False Positive
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="glass-panel p-12 text-center flex flex-col items-center justify-center border-dashed">
            <div className="w-16 h-16 rounded-full bg-success/20 text-success flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(0,230,118,0.2)]">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
            <h3 className="text-xl font-medium text-white mb-2">System Secure</h3>
            <p className="text-gray-400">No malicious threats or spam have been detected on your account.</p>
          </div>
        )}
      </div>
    </div>
  );
}
