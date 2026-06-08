import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { api, setAuthToken } from '../services/api';
import { clearSession, loadSession, saveSession } from '../services/authStorage';
import { initLocalDb } from '../services/localTickets';
import type { AuthResponse, AuthUser } from '../types';

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, senha: string) => Promise<void>;
  register: (nome: string, email: string, senha: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<string | undefined>;
  resetPassword: (token: string, novaSenha: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      await initLocalDb();
      const session = await loadSession();

      if (session.token && session.user) {
        setAuthToken(session.token);
        setToken(session.token);
        setUser(session.user);
      }

      setLoading(false);
    };

    bootstrap();
  }, []);

  const persist = async (response: AuthResponse) => {
    await saveSession(response.accessToken, response.usuario);
    setAuthToken(response.accessToken);
    setToken(response.accessToken);
    setUser(response.usuario);
  };

  const login = async (email: string, senha: string) => {
    const response = await api.post<AuthResponse>('/auth/login', { email, senha });
    await persist(response.data);
  };

  const register = async (nome: string, email: string, senha: string) => {
    const response = await api.post<AuthResponse>('/auth/register', { nome, email, senha });
    await persist(response.data);
  };

  const forgotPassword = async (email: string) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data.resetToken as string | undefined;
  };

  const resetPassword = async (resetToken: string, novaSenha: string) => {
    await api.post('/auth/reset-password', { token: resetToken, novaSenha });
  };

  const logout = async () => {
    await clearSession();
    setAuthToken(null);
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, token, loading, login, register, forgotPassword, resetPassword, logout }),
    [user, token, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return context;
}
