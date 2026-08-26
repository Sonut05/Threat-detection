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

  if (loading) return <div className="animate-pulse flex gap-4 h-full"><div className="flex-1 bg-white/5 rounded-2xl"></div></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Message History</h1>
          <p className="text-gray-400 mt-1">Review all your analyzed messages and their threat levels.</p>
        </div>
      </header>

      <div className="glass-panel p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">All Analyzed Messages</h2>
          <div className="flex gap-2">
            <span className="px-3 py-1 rounded-lg text-sm text-gray-400" style={{ backgroundColor: 'var(--nav-item-hover)' }}>Total: {messages.length}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b text-gray-400 text-sm" style={{ borderColor: 'var(--glass-border)' }}>
                <th className="py-3 px-4 font-medium">Type</th>
                <th className="py-3 px-4 font-medium">Content Preview</th>
                <th className="py-3 px-4 font-medium">Prediction</th>
                <th className="py-3 px-4 font-medium">Confidence</th>
                <th className="py-3 px-4 font-medium">Date Analyzed</th>
                <th className="py-3 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {messages.length > 0 ? (
                messages.map((msg) => (
                  <tr key={msg.id} className="border-b transition-colors" style={{ borderColor: 'var(--glass-border)' }}>
                    <td className="py-4 px-4">
                      <span className="text-xs font-medium uppercase text-gray-400 px-2 py-1 rounded" style={{ backgroundColor: 'var(--nav-item-hover)' }}>
                        {msg.msg_type}
                      </span>
                    </td>
                    <td className="py-4 px-4 max-w-md">
                      <p className="text-sm truncate font-medium" title={msg.content} style={{ color: 'var(--foreground)' }}>
                        {msg.content}
                      </p>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wider ${msg.prediction === 'Spam' ? 'bg-danger/20 text-danger border border-danger/20' : 'bg-success/20 text-success border border-success/20'}`}>
                        {msg.prediction}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--nav-item-hover)' }}>
                          <div 
                            className={`h-full ${msg.prediction === 'Spam' ? 'bg-danger' : 'bg-success'}`} 
                            style={{ width: `${(msg.confidence * 100).toFixed(0)}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">{(msg.confidence * 100).toFixed(0)}%</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-500">
                      {new Date(msg.timestamp).toLocaleString()}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button 
                        onClick={() => handleDelete(msg.id)}
                        className="p-2 rounded-lg hover:bg-danger/10 text-gray-500 hover:text-danger transition-colors"
                        title="Delete Message"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-sm text-gray-500">
                    No messages found in your history.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
