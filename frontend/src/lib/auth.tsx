import { createContext, useContext, useState, type ReactNode } from 'react';
import { login as apiLogin, type User } from './api';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
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
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, token, isAuthenticated: !!token && !!user, signIn, signOut }}
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
