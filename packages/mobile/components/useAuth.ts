import React, { createContext, useContext, useState, useEffect } from 'react';
// If you see a type error for expo-secure-store, run:
// npm install expo-secure-store
// npm install --save-dev @types/expo-secure-store
import * as SecureStore from 'expo-secure-store';

interface User {
  token: string;
  role: string;
  [key: string]: any;
}

interface AuthContextProps {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  loading: false,
  login: async () => {},
  logout: () => {},
});

const API_URL = process.env.FHIR_BACKEND_URL || 'http://localhost:3000';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // On mount, try to load JWT from SecureStore
    (async () => {
      setLoading(true);
      const token = await SecureStore.getItemAsync('jwt');
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          setUser({ token, ...payload });
        } catch {
          setUser(null);
        }
      }
      setLoading(false);
    })();
  }, []);

  const login = async (username: string, password: string) => {
    setLoading(true);
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) {
      setLoading(false);
      throw new Error('Invalid credentials');
    }
    const { token } = await res.json();
    await SecureStore.setItemAsync('jwt', token);
    const payload = JSON.parse(atob(token.split('.')[1]));
    setUser({ token, ...payload });
    setLoading(false);
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync('jwt');
    setUser(null);
  };

  return React.createElement(
    AuthContext.Provider,
    { value: { user, loading, login, logout } },
    children
  );
}

export default function useAuth() {
  return useContext(AuthContext);
}

// For advanced usage/testing
export { AuthContext };
// End of file. No extra code or expressions should follow.
