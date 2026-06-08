import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <aside className="sidebar">
      <div className="px-4 mb-4">
        <h3 style={{ color: 'var(--cw-accent)' }} className="fw-bold m-0">
          <i className="bi bi-camera-reels-fill me-2"></i>CineWeb
        </h3>
        <small className="text-muted">{user?.nome || 'Control Panel'}</small>
      </div>

      <nav className="d-flex flex-column gap-1">
        <NavLink to="/pedidos" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <i className="bi bi-receipt-cutoff"></i> Pedidos Sync
        </NavLink>
        <NavLink to="/pdv" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <i className="bi bi-cart3"></i> PDV / Pedidos
        </NavLink>
        <NavLink to="/ingressos" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <i className="bi bi-ticket-perforated"></i> Ingressos Emitidos
        </NavLink>
        <hr className="border-secondary mx-3 my-2" />
        <NavLink to="/sessoes" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <i className="bi bi-calendar-event"></i> Sessoes
        </NavLink>
        <NavLink to="/filmes" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <i className="bi bi-film"></i> Filmes
        </NavLink>
        <NavLink to="/salas" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <i className="bi bi-door-open"></i> Salas
        </NavLink>
        <NavLink to="/generos" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <i className="bi bi-tags"></i> Generos
        </NavLink>
        <NavLink to="/lanches" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <i className="bi bi-cup-straw"></i> Lanches e Combos
        </NavLink>
      </nav>

      <div className="mt-auto p-3">
        <button className="btn btn-outline-light w-100" onClick={logout}>
          <i className="bi bi-box-arrow-right me-2"></i>Sair
        </button>
      </div>
    </aside>
  );
}
