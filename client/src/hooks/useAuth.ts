import { useState, useEffect, createContext, useContext } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'clinician' | 'admin' | 'patient';
  hospital?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: Partial<User> & { password: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // Return mock data for development
    return {
      user: null,
      isLoading: false,
      login: async (email: string, password: string) => {
        console.log('Login attempt:', email);
      },
      logout: () => {
        console.log('Logout');
      },
      register: async (userData: any) => {
        console.log('Register attempt:', userData);
      }
    };
  }
  return context;
};

// Mock hook for development - replace with actual auth implementation
export const useAuthProvider = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Mock login - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setUser({
        id: '1',
        email,
        name: 'Dr. Sample User',
        role: 'clinician',
        hospital: 'Korle-Bu Teaching Hospital'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
  };

  const register = async (userData: Partial<User> & { password: string }) => {
    setIsLoading(true);
    try {
      // Mock registration - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      const { password, ...userWithoutPassword } = userData;
      setUser({
        id: Date.now().toString(),
        ...userWithoutPassword,
      } as User);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user,
    isLoading,
    login,
    logout,
    register
  };
};
