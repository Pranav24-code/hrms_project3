import React, { createContext, useState, ReactNode } from 'react';
import type { AuthUser } from '@/types/auth.types';

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  switchRole: (role: 'hr_manager' | 'employee') => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);

  const login = async (email: string, password: string) => {
    // Mock login logic
    await new Promise(resolve => setTimeout(resolve, 800));
    
    if ((email === 'hr@nexahr.com' && password === 'Admin@123') || (email === 'hr@example.com')) {
      setUser({
        id: '1',
        firstName: 'Admin',
        lastName: 'User',
        email: 'hr@nexahr.com',
        role: 'hr_manager',
        department: 'HR'
      });
      return true;
    } else if (email.includes('employee') || email.includes('john')) {
      setUser({
        id: '2',
        firstName: 'John',
        lastName: 'Doe',
        email: email,
        role: 'employee',
        department: 'Engineering'
      });
      return true;
    }
    return false;
  };

  const logout = () => setUser(null);

  const switchRole = (role: 'hr_manager' | 'employee') => {
    if (user) {
      setUser({ ...user, role });
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
};


