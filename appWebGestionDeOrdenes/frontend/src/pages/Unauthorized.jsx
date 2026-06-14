import { Link } from 'react-router-dom';

export const Unauthorized = () => {
  return (
    <div className="error-page-container">
      <div className="error-card glass-panel text-center animate-fade-in">
        <span className="error-icon text-error">🚫</span>
        <h1>Acceso Denegado</h1>
        <p>No tienes los permisos necesarios para visualizar esta sección del sistema.</p>
        <div className="mt-4">
          <Link to="/" className="btn btn-primary">
            Volver a las Órdenes
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
