import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import CryptoJS from 'crypto-js';

interface User {
  id: string;
  username: string;
  name?: string | null;
  phone?: string | null;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
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
      // Generate MD5 hash using crypto-js
      const passwordHash = CryptoJS.MD5(password).toString();

      // Query the database
      const { data: userData, error: queryError } = await supabase
        .from('users')
        .select('id, username, name, phone')
        .eq('username', username)
        .eq('password_hash', passwordHash)
        .maybeSingle();

      if (queryError) {
        // Fallback: Try without name and phone if columns don't exist yet
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('users')
          .select('id, username')
          .eq('username', username)
          .eq('password_hash', passwordHash)
          .maybeSingle();

        if (fallbackError) throw fallbackError;
        
        if (!fallbackData) {
          return { success: false, error: 'Username atau password salah' };
        }

        const userInfo = { 
          id: fallbackData.id, 
          username: fallbackData.username,
          name: null,
          phone: null
        };
        setUser(userInfo);
        localStorage.setItem('finance_user', JSON.stringify(userInfo));
        return { success: true };
      }

      if (!userData) {
        return { success: false, error: 'Username atau password salah' };
      }

      // Store user in state and localStorage
      const userInfo = { 
        id: userData.id, 
        username: userData.username,
        name: userData.name,
        phone: userData.phone
      };
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

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('finance_user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, isLoading }}>
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
