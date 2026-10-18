"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthShell, { Arrow } from '../../components/AuthShell';

function strength(p) {
  let s = 0;
  if (p.length >= 6) s++;
  if (p.length >= 10) s++;
  if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s++;
  if (/\d/.test(p) && /[^A-Za-z0-9]/.test(p)) s++;
  return p ? Math.max(1, s) : 0;
}
const HINTS = ['', 'Too easy to guess', 'Getting there', 'Good', 'Strong'];

export default function Register() {
  const { registerUser, googleSignIn, user } = useAuth();
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const [shake, setShake] = useState(0);

  // If already logged in, redirect
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') router.replace('/admin');
      else router.replace('/dashboard');
    }
  }, [user, router]);

  if (user) return null;

  const fail = (msg) => { setError(msg); setShake((s) => s + 1); setLoading(false); };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Basic client-side validation
    if (password !== confirmPassword) return fail('Passwords do not match.');
    if (password.length < 6) return fail('Password must be at least 6 characters long.');

    const res = await registerUser(name, email, password);
    if (!res.success) fail(res.error || 'Failed to create account. Please try again.');
    setLoading(false);
  };

  const handleGoogle = async () => { await googleSignIn(); };
  const s = strength(password);

  return (
    <AuthShell eyebrow="Create account" title="Start scanning." lead="Create an account to scan SMS and email for spam and keep a history of every scan.">
      {error && <p className="au-err" key={shake}>{error}</p>}

      <form onSubmit={handleRegister}>
        <div className="au-f au-rise" style={{ '--i': 3 }}>
          <input id="name" type="text" required placeholder=" " autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
          <label htmlFor="name">Full name</label><span className="au-bar" />
        </div>
        <div className="au-f au-rise" style={{ '--i': 4 }}>
          <input id="email" type="email" required placeholder=" " autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <label htmlFor="email">Email address</label><span className="au-bar" />
        </div>
        <div className="au-f au-rise" style={{ '--i': 5 }}>
          <input id="pw" type={show ? 'text' : 'password'} required placeholder=" " autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <label htmlFor="pw">Password</label><span className="au-bar" />
          <button type="button" className="au-eye" onClick={() => setShow((v) => !v)} aria-label={show ? 'Hide password' : 'Show password'}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" />
              {show && <path d="M3 3l18 18" />}
            </svg>
          </button>
        </div>
        <div className="au-meter" data-s={s} aria-hidden="true"><i /><i /><i /><i /></div>
        <p className="au-hint">{HINTS[s]}</p>
        <div className="au-f au-rise" style={{ '--i': 6 }}>
          <input id="pw2" type={show ? 'text' : 'password'} required placeholder=" " autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          <label htmlFor="pw2">Confirm password</label><span className="au-bar" />
        </div>
        <button type="submit" disabled={loading} className="au-btn au-rise" style={{ '--i': 7 }}>
          {loading ? <span className="au-spin" /> : <>Create account <Arrow /></>}
        </button>
      </form>

      <div className="au-or au-rise" style={{ '--i': 8 }}>or</div>
      <button type="button" onClick={handleGoogle} className="au-ghost au-rise" style={{ '--i': 8 }}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="18" height="18" aria-hidden="true">
          <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
          <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
          <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.117-11.283-7.599l-6.582,5.223C9.467,39.966,16.143,44,24,44z" />
          <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
        </svg>
        Continue with Google
      </button>

      <p className="au-switch au-rise" style={{ '--i': 9 }}>Already have an account? <Link href="/login">Sign in</Link></p>
    </AuthShell>
  );
}
