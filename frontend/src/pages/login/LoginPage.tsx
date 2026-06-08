import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export function LoginPage() {
  const { login, bootstrapAdmin } = useAuth();
  const [mode, setMode] = useState<'login' | 'bootstrap'>('login');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'bootstrap') {
        await bootstrapAdmin(nome, email, senha);
      } else {
        await login(email, senha);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Falha na autenticacao');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <div className="mb-4">
          <h1 className="fw-bold mb-1"><i className="bi bi-camera-reels-fill me-2 text-accent"></i>CineWeb</h1>
          <p className="text-muted mb-0">Painel administrativo integrado ao app mobile</p>
        </div>

        <div className="btn-group w-100 mb-4">
          <button
            type="button"
            className={`btn ${mode === 'login' ? 'btn-primary' : 'btn-outline-light'}`}
            onClick={() => setMode('login')}
          >
            Entrar
          </button>
          <button
            type="button"
            className={`btn ${mode === 'bootstrap' ? 'btn-primary' : 'btn-outline-light'}`}
            onClick={() => setMode('bootstrap')}
          >
            Primeiro admin
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {mode === 'bootstrap' && (
            <div className="mb-3">
              <label className="form-label text-muted">Nome</label>
              <input className="form-control" value={nome} onChange={(event) => setNome(event.target.value)} />
            </div>
          )}

          <div className="mb-3">
            <label className="form-label text-muted">E-mail</label>
            <input
              className="form-control"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          <div className="mb-4">
            <label className="form-label text-muted">Senha</label>
            <input
              className="form-control"
              type="password"
              value={senha}
              onChange={(event) => setSenha(event.target.value)}
            />
          </div>

          {error && <div className="alert alert-danger py-2">{error}</div>}

          <button type="submit" className="btn btn-primary w-100" disabled={loading}>
            {loading ? 'Validando...' : mode === 'bootstrap' ? 'Criar admin' : 'Entrar'}
          </button>
        </form>
      </section>
    </main>
  );
}
