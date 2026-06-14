import { Link } from 'react-router-dom';

export const NotFound = () => {
  return (
    <div className="error-page-container">
      <div className="error-card glass-panel text-center animate-fade-in">
        <span className="error-icon text-warning">🔍</span>
        <h1>Página no Encontrada</h1>
        <p>La sección del sistema a la que intentas acceder no existe o ha sido movida.</p>
        <div className="mt-4">
          <Link to="/" className="btn btn-primary">
            Volver al Inicio
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
