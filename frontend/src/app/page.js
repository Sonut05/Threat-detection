"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Home() {
  const { login, adminLogin, googleSignIn, user } = useAuth();
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginType, setLoginType] = useState('user'); // 'user' or 'admin'

  // If already logged in, redirect
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') router.replace('/admin');
      else router.replace('/dashboard');
    }
  }, [user, router]);

  if (user) {
    return null; 
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    let res;
    if (loginType === 'admin') {
      res = await adminLogin(email, password);
    } else {
      res = await login(email, password || "default");
    }
    
    if (!res.success) {
      setError(res.error || "Failed to login. Please try again.");
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    await googleSignIn();
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 relative z-10">
      <div className="w-full max-w-md">
        
        {/* Header */}
        <div className="text-center mb-10">
          <div 
            onClick={() => window.location.reload()}
            className="inline-block p-3 rounded-2xl border mb-4 shadow-lg transition-all duration-500 cursor-pointer group hover:scale-110 bg-success/20 border-success/50 text-success" 
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <path d="m9 12 2 2 4-4"/>
            </svg>
          </div>
          <h1 className="text-4xl font-bold mb-2">
            Spam <span className="text-gradient">Shield</span>
          </h1>
          <p className="text-gray-400">AI-Powered Threat Detection</p>
        </div>

        {/* Login Card */}
        <div className="glass-panel p-8">
          <h2 className="text-2xl font-semibold mb-6 flex justify-between items-center">
            Welcome Back
            <div className="flex rounded-lg p-1 border transition-all duration-500" style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--glass-border)' }}>
              <button 
                onClick={() => setLoginType('user')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all duration-300 ${loginType === 'user' ? 'bg-primary text-white shadow-sm' : 'text-gray-400 hover:text-primary'}`}
              >
                User
              </button>
              <button 
                onClick={() => setLoginType('admin')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all duration-300 ${loginType === 'admin' ? 'bg-primary text-white shadow-sm' : 'text-gray-400 hover:text-primary'}`}
              >
                Admin
              </button>
            </div>
          </h2>
          
          {error && (
            <div className="mb-6 p-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>Email Address</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="you@example.com"
              />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium" style={{ color: 'var(--foreground)' }}>Password</label>
                <a href="#" className="text-xs text-primary hover:underline transition-colors">Forgot password?</a>
              </div>
              <input 
                type="password"
                required={loginType === 'admin'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="••••••••"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="btn-primary w-full mt-2"
            >
              {loading ? "Authenticating..." : `Sign In as ${loginType === 'admin' ? 'Admin' : 'User'}`}
            </button>
          </form>

          {loginType === 'user' && (
            <div className="mt-8 text-center text-sm text-gray-400">
              Don't have an account?{' '}
              <Link href="/register" className="text-primary hover:text-white font-semibold transition-colors">
                Sign up
              </Link>
            </div>
          )}

          <div className="mt-6 mb-6 flex items-center">
            <div className="flex-1 border-t" style={{ borderColor: 'var(--glass-border)' }}></div>
            <span className="px-4 text-xs text-gray-500 uppercase tracking-wider">Or</span>
            <div className="flex-1 border-t" style={{ borderColor: 'var(--glass-border)' }}></div>
          </div>

          <button 
            type="button" 
            onClick={handleGoogle}
            className="btn-secondary w-full flex items-center justify-center gap-3 shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px">
              <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
              <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
              <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.117-11.283-7.599l-6.582,5.223C9.467,39.966,16.143,44,24,44z"/>
              <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
            </svg>
            Google
          </button>
        </div>
        
        <p className="text-center text-sm text-gray-500 mt-8">
          By signing in, you agree to our <a href="#" className="text-purple-400 hover:text-purple-300">Terms of Service</a> and <a href="#" className="text-purple-400 hover:text-purple-300">Privacy Policy</a>.
        </p>

      </div>
    </main>
  );
}
