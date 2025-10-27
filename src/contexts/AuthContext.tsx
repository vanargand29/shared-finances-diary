import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface User {
  id: string;
  username: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const storedUser = localStorage.getItem('finance_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    try {
      // Simple hash function for MD5 simulation
      const simpleHash = (str: string): string => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
          const char = str.charCodeAt(i);
          hash = ((hash << 5) - hash) + char;
          hash = hash & hash;
        }
        return Math.abs(hash).toString(16).padStart(32, '0');
      };

      // Use a simple hash since crypto.subtle.digest doesn't support MD5
      // In production, use a proper MD5 library
      const passwordHash = simpleHash(password);

      // Query the database
      const { data: userData, error: queryError } = await supabase
        .from('users')
        .select('id, username')
        .eq('username', username)
        .eq('password_hash', passwordHash)
        .maybeSingle();

      if (queryError) throw queryError;

      if (!userData) {
        return { success: false, error: 'Username atau password salah' };
      }

      // Store user in state and localStorage
      const userInfo = { id: userData.id, username: userData.username };
      setUser(userInfo);
      localStorage.setItem('finance_user', JSON.stringify(userInfo));
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Terjadi kesalahan saat login' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('finance_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
