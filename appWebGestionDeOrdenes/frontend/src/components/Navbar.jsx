import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null; // No mostrar navbar si no hay usuario

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAdminOrMantenimiento = user.rol === 'admin' || user.rol === 'mantenimiento';
  const isSolicitanteOrAdmin = user.rol === 'solicitante' || user.rol === 'admin';

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">🔧</span> MantenimientoApp
        </Link>
        <div className="navbar-links">
          <Link 
            to="/" 
            className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}
          >
            Órdenes
          </Link>
          
          {isSolicitanteOrAdmin && (
            <Link 
              to="/ordenes/nueva" 
              className={`nav-item ${location.pathname === '/ordenes/nueva' ? 'active' : ''}`}
            >
              Nueva Orden
            </Link>
          )}

          {isAdminOrMantenimiento && (
            <Link 
              to="/dashboard" 
              className={`nav-item ${location.pathname === '/dashboard' ? 'active' : ''}`}
            >
              Resumen
            </Link>
          )}
        </div>
        <div className="navbar-user">
          <div className="user-info">
            <span className="user-name">{user.email ? user.email.split('@')[0] : `Usuario #${user.id}`}</span>
            <span className={`user-role-badge role-${user.rol}`}>{user.rol}</span>
          </div>
          <button onClick={handleLogout} className="btn btn-secondary btn-sm">
            Cerrar Sesión
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
