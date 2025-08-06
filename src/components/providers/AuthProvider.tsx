"use client";

import type { AuthenticatedUser } from '../../lib/types';
import { createContext, useContext, useState, type ReactNode, useEffect } from 'react';

interface AuthContextType {
  user: AuthenticatedUser | null;
  login: (name: string, phoneNumber: string) => Promise<AuthenticatedUser | false>;
  register: (name: string, phoneNumber: string, email: string) => Promise<AuthenticatedUser | false>;
  logout: () => void;
  updateUserFromStorage: () => void;
  refreshUserData: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Try to load user from localStorage on initial mount
    try {
      const storedUser = localStorage.getItem('hem-story-user');
      const token = localStorage.getItem('hem-story-token');
      if (storedUser && token) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to load user from localStorage", error);
      localStorage.removeItem('hem-story-user');
      localStorage.removeItem('hem-story-token');
    }
    setIsLoading(false);
  }, []);

  const login = async (name: string, phoneNumber: string): Promise<AuthenticatedUser | false> => {
    setIsLoading(true);
    try {
      const response = await fetch('https://stories-be.onrender.com/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, phoneNumber }),
      });

      if (response.ok) {
        const data = await response.json();
        const foundUser: AuthenticatedUser = {
          token: data.token,
          user: data.user,
        };
        
        setUser(foundUser);
        try {
          localStorage.setItem('hem-story-user', JSON.stringify(foundUser));
          localStorage.setItem('hem-story-token', data.token);
        } catch (error) {
          console.error("Failed to save user to localStorage", error);
        }
        setIsLoading(false);
        return foundUser;
      } else {
        console.error('Login failed with status:', response.status);
      }
    } catch (error) {
      console.error('Login failed due to network or other error:', error);
    }

    setIsLoading(false);
    return false;
  };

  const register = async (name: string, phoneNumber: string, email: string): Promise<AuthenticatedUser | false> => {
    setIsLoading(true);
    try {
      const response = await fetch('https://stories-be.onrender.com/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, phoneNumber, email }),
      });

      if (response.ok) {
        const data = await response.json();
        const foundUser: AuthenticatedUser = {
          token: data.token,
          user: data.user,
        };
        
        setUser(foundUser);
        try {
          localStorage.setItem('hem-story-user', JSON.stringify(foundUser));
          localStorage.setItem('hem-story-token', data.token);
        } catch (error) {
          console.error("Failed to save user to localStorage", error);
        }
        setIsLoading(false);
        return foundUser;
      } else {
        console.error('Register failed with status:', response.status);
      }
    } catch (error) {
      console.error('Register failed due to network or other error:', error);
    }

    setIsLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem('hem-story-user');
      localStorage.removeItem('hem-story-token');
    } catch (error) {
      console.error("Failed to remove user from localStorage", error);
    }
  };

  const updateUserFromStorage = () => {
    try {
      const storedUser = localStorage.getItem('hem-story-user');
      const token = localStorage.getItem('hem-story-token');
      if (storedUser && token) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to update user from localStorage", error);
    }
  };

  const refreshUserData = () => {
    try {
      const storedUser = localStorage.getItem('hem-story-user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to refresh user data", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUserFromStorage, refreshUserData, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
