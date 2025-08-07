import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('jwt');
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return { token, ...payload };
    } catch {
      return null;
    }
  });

  const login = async (username, password) => {
    const res = await fetch('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) throw new Error('Invalid credentials');
    const { token } = await res.json();
    localStorage.setItem('jwt', token);
    const payload = JSON.parse(atob(token.split('.')[1]));
    setUser({ token, ...payload });
  };

  const logout = () => {
    localStorage.removeItem('jwt');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export default function useAuth() {
  return useContext(AuthContext);
}
