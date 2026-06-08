import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { ToastProvider } from './components/ToastContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { GenerosPage } from './pages/generos/GenerosPage';
import { SalasPage } from './pages/salas/SalasPage';
import { LanchesPage } from './pages/lanches/LanchesPage';
import { IngressosPage } from './pages/ingressos/IngressosPage';
import { FilmesPage } from './pages/filmes/FilmesPage';
import { SessoesPage } from './pages/sessoes/SessoesPage';
import { PDVPage } from './pages/pdv/PDVPage';
import { LoginPage } from './pages/login/LoginPage';
import { PedidosPage } from './pages/pedidos/PedidosPage';

function AppRoutes() {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="spinner-border text-light"></div>
      </div>
    );
  }

  if (!token) {
    return <LoginPage />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/pedidos" replace />} />
          <Route path="pedidos" element={<PedidosPage />} />
          <Route path="pdv" element={<PDVPage />} />
          <Route path="sessoes" element={<SessoesPage />} />
          <Route path="filmes" element={<FilmesPage />} />
          <Route path="salas" element={<SalasPage />} />
          <Route path="generos" element={<GenerosPage />} />
          <Route path="lanches" element={<LanchesPage />} />
          <Route path="ingressos" element={<IngressosPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
