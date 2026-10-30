import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { authenticateUser, initializeDatabase } from '../utils/db';

interface AuthContextType {
  user: User | null;
  login: (username: string, pin: string) => boolean;
  logout: () => void;
  verifyPin: (pin: string) => boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Inicializace databáze
    initializeDatabase();

    // Obnovení relace
    const savedUser = localStorage.getItem('rozvadec_current_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = (username: string, pin: string): boolean => {
    const authenticatedUser = authenticateUser(username, pin);
    if (authenticatedUser) {
      setUser(authenticatedUser);
      localStorage.setItem('rozvadec_current_user', JSON.stringify(authenticatedUser));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('rozvadec_current_user');
  };

  const verifyPin = (pin: string): boolean => {
    if (!user) return false;
    return user.pin === pin;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, verifyPin, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
