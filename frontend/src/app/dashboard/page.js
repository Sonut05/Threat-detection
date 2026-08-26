"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '@/config/api';

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
        fetchStats(); // Refresh dashboard
        
        // Trigger popup if Spam is detected
        if (data.prediction === 'Spam') {
          setPopup({
            prediction: data.prediction,
            confidence: data.confidence,
            msg_type: data.msg_type
          });
          // Auto clear after 6 seconds
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

  if (!stats) return <div className="animate-pulse flex gap-4 h-full"><div className="flex-1 bg-white/5 rounded-2xl"></div></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Security Overview</h1>
          <p className="text-gray-400 mt-1">Monitor and analyze message threats in real-time.</p>
        </div>
      </header>

      {/* Alert Popup Notification */}
      {popup && (
        <div className="fixed top-8 right-8 z-50 animate-in slide-in-from-right-8 fade-in duration-300">
          <div className="bg-danger/90 border border-red-500/50 p-5 rounded-xl shadow-[0_0_40px_rgba(255,75,75,0.4)] backdrop-blur-md flex items-start gap-4 min-w-[300px]">
            <div className="w-10 h-10 rounded-full bg-white/20 flex flex-shrink-0 items-center justify-center text-white font-bold text-xl shadow-inner">
              !
            </div>
            <div className="flex-1">
              <h4 className="text-white font-bold text-lg mb-2 tracking-wide">Threat Detected!</h4>
              <div className="space-y-1">
                <p className="text-white/90 text-sm flex justify-between">
                  <span>Prediction:</span> 
                  <span className="font-bold uppercase text-white bg-black/20 px-2 py-0.5 rounded">{popup.prediction}</span>
                </p>
                <p className="text-white/90 text-sm flex justify-between">
                  <span>Confidence:</span> 
                  <span className="font-bold text-white bg-black/20 px-2 py-0.5 rounded">{(popup.confidence * 100).toFixed(1)}%</span>
                </p>
                 <p className="text-white/90 text-sm flex justify-between">
                  <span>Message Type:</span> 
                  <span className="font-bold uppercase text-white bg-black/20 px-2 py-0.5 rounded">{popup.msg_type}</span>
                </p>
              </div>
            </div>
            <button onClick={() => setPopup(null)} className="text-white/60 hover:text-white transition-colors p-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Total Analyzed" value={stats.total_analyzed} icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" color="text-blue-400" bg="bg-blue-400/10" />
        <StatCard title="Spam Detected" value={stats.spam_detected} icon="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" color="text-danger" bg="bg-danger/10" />
        <StatCard title="Safe Messages" value={stats.safe_messages} icon="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" color="text-success" bg="bg-success/10" />
        <StatCard title="Accuracy Rate" value={`${stats.accuracy_rate}%`} icon="M13 10V3L4 14h7v7l9-11h-7z" color="text-primary" bg="bg-primary/10" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Form & Chart */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Analyze Form */}
          <div className="glass-panel p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              Analyze New Message
            </h2>
            <form onSubmit={handleTestMessage} className="space-y-4">
              <div className="flex gap-4">
                <button type="button" onClick={() => setMsgType('sms')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${msgType === 'sms' ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>SMS</button>
                <button type="button" onClick={() => setMsgType('email')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${msgType === 'email' ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>Email</button>
              </div>
              <textarea 
                value={msgInput}
                onChange={e => setMsgInput(e.target.value)}
                placeholder="Paste the message content here to scan for threats..."
                className="w-full h-32 px-4 py-3 rounded-xl bg-black/40 border border-white/10 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 text-white placeholder-gray-500 resize-none transition-all"
              />
              <button 
                type="submit" 
                disabled={loadingMsg || !msgInput.trim()}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingMsg ? "Scanning via AI..." : "Run AI Threat Detection"}
              </button>
            </form>
          </div>

          {/* Cellular Segmented Indicator */}
          <div className="glass-panel p-6">
            <h2 className="text-xl font-semibold mb-6 flex justify-between items-center">
              <span>
                Threat Distribution 
                {stats.total_analyzed > 0 && (() => {
                  const threatRate = (stats.spam_detected / stats.total_analyzed) * 100;
                  let colorClasses = "text-danger bg-danger/10 border-danger/20";
                  if (threatRate === 0) colorClasses = "text-success bg-success/10 border-success/20";
                  else if (threatRate < 15) colorClasses = "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
                  else if (threatRate < 40) colorClasses = "text-orange-500 bg-orange-500/10 border-orange-500/20";
                  
                  return (
                    <span className={`ml-3 text-sm font-bold px-3 py-1 rounded-md border shadow-lg transition-all duration-500 ${colorClasses}`}>
                      ({threatRate.toFixed(0)}% / 100%) Threat
                    </span>
                  );
                })()}
              </span>
              <a href="/dashboard/alerts" className="text-xs font-medium text-danger hover:text-white transition-colors bg-danger/10 hover:bg-danger/20 px-3 py-1.5 rounded-lg border border-danger/20">
                View Alerts
              </a>
            </h2>
            
            <div className="flex gap-1.5 h-12 w-full items-end">
              {stats.total_analyzed > 0 ? (
                Array.from({ length: 20 }).map((_, i) => {
                  const step = (i + 1) * 5; // 5% per cell
                  const threatRate = (stats.spam_detected / stats.total_analyzed) * 100;
                  // Fill ONLY if animate is true AND the step is within threatRate
                  const isFilled = step <= threatRate;
                  
                  // Color logic for each segment level
                  let baseColor = "bg-foreground/5";
                  let activeColor = "";
                  
                  if (step <= 25) activeColor = "bg-success shadow-[0_0_15px_rgba(0,230,118,0.4)]";
                  else if (step <= 50) activeColor = "bg-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.4)]";
                  else if (step <= 75) activeColor = "bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.4)]";
                  else activeColor = "bg-danger shadow-[0_0_15px_rgba(255,75,75,0.4)]";

                  return (
                    <div 
                      key={i} 
                      className={`flex-1 transition-all duration-1000 ease-out rounded-t-sm ${isFilled ? `${activeColor} h-full` : `${baseColor} h-1/3 hover:bg-foreground/10`}`}
                      style={{ transitionDelay: isFilled ? `${i * 30}ms` : '0ms' }}
                    />
                  );
                })
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-gray-500 italic rounded-xl border border-dashed" style={{ backgroundColor: 'var(--glass-bg)', borderColor: 'var(--glass-border)' }}>
                  Waiting for message analysis to map threat levels...
                </div>
              )}
            </div>

            <div className="flex justify-between mt-6 text-sm font-medium">
              <div className="flex gap-4 flex-wrap">
                <span className="flex items-center gap-2 text-success">
                  <div className="w-2 h-2 rounded-full bg-success"></div> 
                  Safe
                </span>
                <span className="flex items-center gap-2 text-yellow-400">
                  <div className="w-2 h-2 rounded-full bg-yellow-400"></div> 
                  Low
                </span>
                <span className="flex items-center gap-2 text-orange-500">
                  <div className="w-2 h-2 rounded-full bg-orange-500"></div> 
                  Moderate
                </span>
                <span className="flex items-center gap-2 text-danger">
                  <div className="w-2 h-2 rounded-full bg-danger"></div> 
                  Critical
                </span>
              </div>
              
              {(() => {
                const threatRate = stats.total_analyzed > 0 ? ((stats.spam_detected / stats.total_analyzed) * 100) : 0;
                let textColor = "text-danger";
                if (threatRate === 0 && stats.total_analyzed > 0) textColor = "text-success";
                else if (threatRate < 15 && stats.total_analyzed > 0) textColor = "text-yellow-400";
                else if (threatRate < 40 && stats.total_analyzed > 0) textColor = "text-orange-500";
                
                return (
                  <span className={`${textColor} font-bold animate-pulse`}>
                    Ratio: {threatRate.toFixed(0)}%
                  </span>
                );
              })()}
            </div>
          </div>

        </div>

        {/* Right Column: History */}
        <div className="glass-panel p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              Recent Activity
            </span>
            <a href="/dashboard/messages" className="text-xs font-medium text-primary hover:text-white transition-colors bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-lg border border-primary/20">
              View All History
            </a>
          </h2>
          <div className="space-y-4">
            {stats.recent_messages.length > 0 ? (
              stats.recent_messages.map(msg => (
                <div key={msg.id} className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors group relative">
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wider ${msg.prediction === 'Spam' ? 'bg-danger/20 text-danger border border-danger/20' : 'bg-success/20 text-success border border-success/20'}`}>
                      {msg.prediction}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 uppercase">{msg.msg_type}</span>
                      <button 
                        onClick={() => handleDeleteMessage(msg.id)}
                        className="p-1.5 rounded-md hover:bg-danger/10 text-gray-500 hover:text-danger transition-colors opacity-0 group-hover:opacity-100"
                        title="Delete from history"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-300 line-clamp-2 leading-relaxed bg-black/20 p-2 rounded border border-white/5">
                    "{msg.content}"
                  </p>
                  <p className="text-xs text-gray-500 mt-3 text-right">
                    {new Date(msg.timestamp).toLocaleString()}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-8">No messages analyzed yet.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color, bg }) {
  return (
    <div className="glass-panel p-6 group">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-gray-400 font-medium">{title}</h3>
        <div className={`p-2 rounded-lg ${bg} ${color}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
          </svg>
        </div>
      </div>
      <div className="text-3xl font-bold">{value}</div>
    </div>
  );
}
