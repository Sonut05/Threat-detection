"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { API_BASE_URL } from '@/config/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check local storage for mocked session
    const storedUser = localStorage.getItem('spamshield_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        localStorage.setItem('spamshield_user', JSON.stringify(data));
        router.push('/dashboard');
        return { success: true };
      }
      const errData = await res.json().catch(() => ({}));
      return { success: false, error: errData.detail || 'Login failed or Account Deactivated' };
    } catch (err) {
      console.error(err);
      return { success: false, error: 'Network error' };
    }
  };

  const registerUser = async (name, email, password) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        // Automatically login the user after successful registration
        return await login(email, password);
      }
      return { success: false, error: data.detail || 'Registration failed' };
    } catch (err) {
      console.error(err);
      return { success: false, error: 'Network error' };
    }
  };

  const adminLogin = async (email, password) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        localStorage.setItem('spamshield_user', JSON.stringify(data));
        router.push('/admin');
        return { success: true };
      }
      return { success: false, error: 'Invalid admin credentials' };
    } catch (err) {
      console.error(err);
      return { success: false, error: 'Network error' };
    }
  };

  const googleSignIn = async () => {
    // Simulate flow
    try {
        const res = await fetch(`${API_BASE_URL}/auth/google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: `user${Math.floor(Math.random()*1000)}@gmail.com`, name: "Google User" })
        });
        if (res.ok) {
            const data = await res.json();
            setUser(data.user);
            localStorage.setItem('spamshield_user', JSON.stringify(data.user));
            router.push('/dashboard');
            return { success: true };
        }
    } catch (e) {
        console.error(e);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('spamshield_user');
    router.push('/');
  };

  const value = { user, login, registerUser, adminLogin, logout, googleSignIn, loading };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
