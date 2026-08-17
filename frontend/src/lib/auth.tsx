import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { login as apiLogin, api, type User } from './api';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  hasRole: (role: string) => boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  updateToken: (token: string) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredUser(): User | null {
  const raw = localStorage.getItem('umu_user');
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(readStoredUser);
  const [token, setToken] = useState<string | null>(localStorage.getItem('umu_token'));

  async function signIn(email: string, password: string) {
    const data = await apiLogin(email, password);
    localStorage.setItem('umu_token', data.accessToken);
    localStorage.setItem('umu_user', JSON.stringify(data.user));
    setToken(data.accessToken);
    setUser(data.user);
  }

  function signOut() {
    localStorage.removeItem('umu_token');
    localStorage.removeItem('umu_user');
    // Attempt server-side logout (fire and forget)
    api.post('/auth/logout').catch(() => {});
    setToken(null);
    setUser(null);
  }

  const updateToken = useCallback((newToken: string) => {
    localStorage.setItem('umu_token', newToken);
    setToken(newToken);
  }, []);

  const hasRole = useCallback(
    (role: string): boolean => {
      return user?.role === role;
    },
    [user]
  );

  return (
    <AuthContext.Provider
      value={{ user, token, isAuthenticated: !!token && !!user, hasRole, signIn, signOut, updateToken }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
