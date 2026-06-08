import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../services/api';

export interface AuthUser {
  id: number;
  nome: string;
  email: string;
  role: 'ADMIN' | 'USER';
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, senha: string) => Promise<void>;
  bootstrapAdmin: (nome: string, email: string, senha: string) => Promise<void>;
  logout: () => void;
}

const TOKEN_KEY = 'cineweb_admin_token';
const USER_KEY = 'cineweb_admin_user';

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedUser = localStorage.getItem(USER_KEY);

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }

    setLoading(false);
  }, []);

  const persistSession = (accessToken: string, usuario: AuthUser) => {
    if (usuario.role !== 'ADMIN') {
      throw new Error('Apenas administradores podem acessar o painel web.');
    }

    localStorage.setItem(TOKEN_KEY, accessToken);
    localStorage.setItem(USER_KEY, JSON.stringify(usuario));
    setToken(accessToken);
    setUser(usuario);
  };

  const login = async (email: string, senha: string) => {
    const response = await api.post('/auth/login', { email, senha });
    persistSession(response.data.accessToken, response.data.usuario);
  };

  const bootstrapAdmin = async (nome: string, email: string, senha: string) => {
    const response = await api.post('/auth/admin/bootstrap', { nome, email, senha });
    persistSession(response.data.accessToken, response.data.usuario);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, token, loading, login, bootstrapAdmin, logout }),
    [user, token, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return context;
}
