import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
import type { User } from '@/types';
import { authService } from '../lib/services/auth.service';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      const response = await authService.getMe();
      if (mountedRef.current) {
        const u = (response as { user?: User })?.user ?? (response as User);
        setUser(u);
      }
    } catch {
      if (mountedRef.current) setUser(null);
    } finally {
      if (mountedRef.current) setIsLoading(false);
    }
  }, []);

  useEffect(() => { checkAuth(); }, [checkAuth]);

  useEffect(() => {
    if (!user) return;
    const refreshInterval = setInterval(async () => {
      try { await authService.refresh(); } catch { if (mountedRef.current) setUser(null); }
    }, 13 * 60 * 1000);
    return () => clearInterval(refreshInterval);
  }, [user]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authService.login(email, password);
      const u = response?.user ?? (response as unknown as User);
      if (mountedRef.current) setUser(u);
      return u;
    } finally {
      if (mountedRef.current) setIsLoading(false);
    }
  };

  const logout = async () => {
    try { await authService.logout(); } finally {
      if (mountedRef.current) setUser(null);
    }
  };

  const refreshUser = async () => {
    try {
      const response = await authService.getMe();
      if (mountedRef.current) {
        const u = (response as { user?: User })?.user ?? (response as User);
        setUser(u);
      }
    } catch {
      if (mountedRef.current) setUser(null);
    }
  };

  const hasRole = (role: string) => user?.role === role;

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, refreshUser, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
