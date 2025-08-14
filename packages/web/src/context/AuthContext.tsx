import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate, Navigate, useLocation } from 'react-router-dom';
import { api } from '../services/api.ts';

export type User = { id: string; email: string; name?: string; role?: string } | null;

type AuthContextType = {
  token: string | null;
  user: User;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // bootstrap from localStorage and validate token
    const boot = async () => {
      const stored = localStorage.getItem('medflect.token');
      const u = localStorage.getItem('medflect.user');
      if (stored) setToken(stored);
      if (u) try { setUser(JSON.parse(u)); } catch {}
      if (stored) {
        try {
          const { data } = await api.get('/auth/me');
          if (!data?.id) throw new Error('invalid');
        } catch {
          localStorage.removeItem('medflect.token');
          localStorage.removeItem('medflect.user');
          setToken(null); setUser(null);
        }
      }
      setLoading(false);
    };
    boot();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const base = (import.meta as any).env.VITE_API_BASE || 'http://localhost:3001';
      const res = await fetch(`${base}/api/auth/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) throw new Error(`Login failed (${res.status})`);
      const { token, user } = await res.json();
      setToken(token); setUser(user || null);
      localStorage.setItem('medflect.token', token);
      localStorage.setItem('medflect.user', JSON.stringify(user || null));
      navigate('/');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const register = useCallback(async (email: string, password: string, name?: string) => {
    setLoading(true);
    try {
      const base = (import.meta as any).env.VITE_API_BASE || 'http://localhost:3001';
      const res = await fetch(`${base}/api/auth/register`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name })
      });
      if (!res.ok) throw new Error(`Registration failed (${res.status})`);
      const { token, user } = await res.json();
      setToken(token); setUser(user || null);
      localStorage.setItem('medflect.token', token);
      localStorage.setItem('medflect.user', JSON.stringify(user || null));
      navigate('/');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const logout = useCallback(() => {
    setToken(null); setUser(null);
    localStorage.removeItem('medflect.token');
    localStorage.removeItem('medflect.user');
    navigate('/login');
  }, [navigate]);

  const value = useMemo(() => ({ token, user, loading, login, register, logout }), [token, user, loading, login, register, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const Private: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div className="p-6 text-sm text-slate-500">Loading...</div>;
  if (!token) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <>{children}</>;
};
